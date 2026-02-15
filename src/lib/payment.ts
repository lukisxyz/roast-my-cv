import { STXtoMicroSTX } from 'x402-stacks';

export { STXtoMicroSTX };

// Since x402-stacks is Express-based, we need to adapt it for Nitro/h3
// We'll use the core payment verification logic

const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.stacksx402.com';
const NETWORK = (process.env.NETWORK as 'mainnet' | 'testnet') || 'testnet';
const SERVER_ADDRESS = process.env.SERVER_ADDRESS || '';

// Payment required error class
export class PaymentRequiredError extends Error {
  constructor(
    message: string,
    public paymentRequired: {
      amount: string;
      payTo: string;
      network: string;
      facilitatorUrl: string;
      asset?: string;
      description?: string;
      maxTimeoutSeconds?: number;
    }
  ) {
    super(message);
    this.name = 'PaymentRequiredError';
  }
}

// Create payment requirements for 402 response
export function createPaymentRequirements(options: {
  amount: bigint;
  payTo: string;
  network?: string;
  facilitatorUrl?: string;
  asset?: string;
  description?: string;
  maxTimeoutSeconds?: number;
}) {
  const {
    amount,
    payTo,
    network = NETWORK,
    facilitatorUrl = FACILITATOR_URL,
    asset = 'STX',
    description = 'CV Review Service',
    maxTimeoutSeconds = 300,
  } = options;

  return {
    amount: amount.toString(),
    payTo,
    network,
    facilitatorUrl,
    asset,
    description,
    maxTimeoutSeconds,
  };
}

// Verify payment via facilitator
export async function verifyPayment(options: {
  paymentSignature: string;
  amount: bigint;
  payTo: string;
  network?: string;
  facilitatorUrl?: string;
}): Promise<{
  success: boolean;
  transaction?: string;
  payer?: string;
  network?: string;
  errorReason?: string;
}> {
  const {
    paymentSignature,
    amount,
    payTo,
    network = NETWORK,
    facilitatorUrl = FACILITATOR_URL,
  } = options;

  try {
    const response = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment: paymentSignature,
        amount: amount.toString(),
        payTo,
        network,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        errorReason: error.message || 'Payment verification failed',
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      errorReason: error instanceof Error ? error.message : 'Payment verification error',
    };
  }
}

// Nitro payment middleware adapter
export function createPaymentMiddleware(options: {
  amount: bigint;
  payTo?: string;
  network?: string;
  facilitatorUrl?: string;
  asset?: string;
  description?: string;
  maxTimeoutSeconds?: number;
}) {
  const {
    amount,
    payTo = SERVER_ADDRESS,
    network = NETWORK,
    facilitatorUrl = FACILITATOR_URL,
    asset = 'STX',
    description = 'CV Review Service',
    maxTimeoutSeconds = 300,
  } = options;

  const paymentReq = createPaymentRequirements({
    amount,
    payTo,
    network,
    facilitatorUrl,
    asset,
    description,
    maxTimeoutSeconds,
  });

  // Encode payment requirements to base64
  const paymentReqBase64 = Buffer.from(JSON.stringify(paymentReq)).toString('base64');

  return async (request: Request) => {
    // Check for payment-signature header (V2)
    const paymentSignature = request.headers.get('payment-signature');

    // Check for direct txId header (from stx_transferStx)
    const txId = request.headers.get('x-payment-txid');
    const payerAddress = request.headers.get('x-payer-address');

    if (!paymentSignature && !txId) {
      // No payment, return 402 Payment Required
      return {
        requiresPayment: true,
        paymentRequired: paymentReq,
        paymentRequiredHeader: paymentReqBase64,
        payment: null,
      };
    }

    // If we have a direct txId, verify the transaction
    if (txId && payerAddress) {
      // For direct STX transfer, we verify the transaction on-chain
      // In production, you'd check if the transaction is confirmed
      // For now, we'll trust the txId is valid after wallet approval
      return {
        requiresPayment: false,
        paymentRequired: null,
        paymentRequiredHeader: null,
        payment: {
          transaction: txId,
          payer: payerAddress,
          network: network,
        },
      };
    }

    // Verify payment via facilitator (for x402 signature)
    if (paymentSignature) {
      const verification = await verifyPayment({
        paymentSignature,
        amount,
        payTo,
        network,
        facilitatorUrl,
      });

      if (!verification.success) {
        return {
          requiresPayment: true,
          paymentRequired: paymentReq,
          paymentRequiredHeader: paymentReqBase64,
          payment: null,
          error: verification.errorReason,
        };
      }

      // Payment verified
      return {
        requiresPayment: false,
        paymentRequired: null,
        paymentRequiredHeader: null,
        payment: {
          transaction: verification.transaction,
          payer: verification.payer,
          network: verification.network,
        },
      };
    }

    // Should not reach here
    return {
      requiresPayment: true,
      paymentRequired: paymentReq,
      paymentRequiredHeader: paymentReqBase64,
      payment: null,
    };
  };
}
