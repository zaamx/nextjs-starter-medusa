import { NextRequest } from "next/server"
import crypto from "crypto"

/**
 * Verify webhook signature from Medusa
 * This helps ensure the webhook is actually coming from your Medusa backend
 */
export function verifyWebhookSignature(
  request: NextRequest,
  body: string,
  secret: string
): boolean {
  const signature = request.headers.get("x-medusa-signature")
  
  if (!signature) {
    return false
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")

  return signature === expectedSignature
}

/**
 * Extract webhook event and data from request body
 */
export function parseWebhookBody(body: any): {
  event: string
  data: any
  timestamp?: string
} {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid webhook body")
  }

  const { event, data, timestamp } = body

  if (!event) {
    throw new Error("No event provided in webhook body")
  }

  return {
    event,
    data: data || {},
    timestamp
  }
}

/**
 * Get webhook secret from environment variables
 */
export function getWebhookSecret(): string {
  const secret = process.env.MEDUSA_WEBHOOK_SECRET
  
  if (!secret) {
    console.warn("MEDUSA_WEBHOOK_SECRET not set. Webhook signature verification will be skipped.")
    return ""
  }

  return secret
}

/**
 * Validate webhook request
 */
export async function validateWebhookRequest(request: NextRequest): Promise<{
  isValid: boolean
  body?: any
  error?: string
}> {
  try {
    const body = await request.text()
    const parsedBody = JSON.parse(body)
    
    // Verify signature if secret is configured
    const secret = getWebhookSecret()
    if (secret) {
      const isValidSignature = verifyWebhookSignature(request, body, secret)
      if (!isValidSignature) {
        return {
          isValid: false,
          error: "Invalid webhook signature"
        }
      }
    }

    // Parse and validate webhook data
    const { event } = parseWebhookBody(parsedBody)

    return {
      isValid: true,
      body: parsedBody
    }

  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid webhook request"
    }
  }
} 