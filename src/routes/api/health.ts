import { createFileRoute } from '@tanstack/react-router'

const NETWORK = (process.env.NETWORK as 'mainnet' | 'testnet') || 'testnet'
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.stacksx402.com'

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: () => {
        return Response.json({
          status: 'ok',
          network: NETWORK,
          facilitator: FACILITATOR_URL,
          payment: 'required for /api/review-cv',
        })
      },
    },
  },
})
