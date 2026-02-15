import { connect, request, isConnected, disconnect, getLocalStorage } from '@stacks/connect'

// Payment requirements type from 402 response
interface PaymentRequirements {
  amount: string
  payTo: string
  network: string
  facilitatorUrl: string
  asset?: string
  description?: string
}

// Get wallet connection status
function getIsConnected(): boolean {
  return isConnected()
}

// Disconnect wallet
function getDisconnect(): void {
  disconnect()
}

// Get stored wallet address (from @stacks/connect localStorage)
function getStoredAddress(): string | null {
  try {
    const data = getLocalStorage()
    const stxAddresses = data?.addresses?.stx
    if (stxAddresses && stxAddresses.length > 0) {
      return stxAddresses[0].address
    }
    return null
  } catch {
    return null
  }
}

// Connect to wallet and get address
async function getWalletAddress(): Promise<string> {
  const response = await connect()
  const addresses = response?.addresses
  if (!addresses || addresses.length === 0) {
    throw new Error('No addresses returned from wallet')
  }

  // Find STX address
  const stxAddress = addresses.find((addr: any) => addr.address.startsWith('SP') || addr.address.startsWith('ST'))
  if (!stxAddress) {
    throw new Error('No STX address found in wallet')
  }

  return stxAddress.address
}

// Pay with STX transfer
async function payWithStacks(
  file: File,
  paymentRequirements: PaymentRequirements,
  walletAddress: string
): Promise<{ reviewId: string; filename: string; review: unknown }> {
  const { amount, payTo } = paymentRequirements
  const amountMicroSTX = amount

  // Transfer STX to the payment receiver
  const transferResponse = await request('stx_transferStx', {
    amount: amountMicroSTX,
    recipient: payTo,
    network: paymentRequirements.network === 'testnet' ? 'testnet' : 'mainnet',
  })

  // If transfer failed
  if (!transferResponse.txid) {
    throw new Error('Payment failed')
  }

  // Now make the API call with the transaction ID
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/review-cv', {
    method: 'POST',
    body: formData,
    headers: {
      'x-payment-txid': transferResponse.txid,
      'x-payer-address': walletAddress,
    },
  })

  if (!response.ok) {
    if (response.status === 402) {
      const data = await response.json()
      throw new Error(data.paymentRequired?.description || 'Payment required')
    }
    throw new Error('Request failed after payment')
  }

  const data = await response.json()

  const reviewId = crypto.randomUUID()
  const reviewData = {
    id: reviewId,
    filename: data.filename,
    review: data.review,
    payment: {
      txId: transferResponse.txid,
      amount: amountMicroSTX,
      recipient: payTo,
    },
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(`cv-review-${reviewId}`, JSON.stringify(reviewData))

  return { reviewId, filename: data.filename, review: data.review }
}

// Upload CV without payment
async function uploadCVNoPayment(file: File): Promise<{ reviewId: string; filename: string; review: unknown }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/review-cv', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    if (response.status === 402) {
      const data = await response.json()
      throw {
        isPaymentRequired: true,
        paymentRequirements: data.paymentRequired,
        message: data.paymentRequired?.description || 'Payment required',
      }
    }
    throw new Error('Upload failed')
  }

  const data = await response.json()

  const reviewId = crypto.randomUUID()
  const reviewData = {
    id: reviewId,
    filename: data.filename,
    review: data.review,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(`cv-review-${reviewId}`, JSON.stringify(reviewData))

  return { reviewId, filename: data.filename, review: data.review }
}

// Main upload function that handles payment
export async function uploadCV(
  file: File,
  options?: {
    walletAddress?: string
    paymentRequirements?: PaymentRequirements
  }
): Promise<{ reviewId: string; filename: string; review: unknown }> {
  const { walletAddress, paymentRequirements } = options || {}

  if (paymentRequirements && walletAddress) {
    return payWithStacks(file, paymentRequirements, walletAddress)
  }

  return uploadCVNoPayment(file)
}

export { getWalletAddress, getIsConnected, getDisconnect, getStoredAddress }
