# Cache Revalidation System

This document explains how to use the cache revalidation system implemented in the Next.js storefront.

## Overview

The cache revalidation system provides two main functionalities:

1. **Webhook-based revalidation**: Medusa backend can trigger cache revalidation via webhooks
2. **User login revalidation**: Cache is automatically revalidated when users log in to ensure correct pricing based on customer groups

## API Endpoints

### 1. General Revalidation Endpoint

**URL**: `/api/revalidate`

**Methods**:
- `GET`: Revalidate by query parameters
- `POST`: Revalidate by request body

#### GET Request
```
GET /api/revalidate?tags=products,collections
```

**Query Parameters**:
- `tags`: Comma-separated list of cache tags to revalidate

**Supported Tags**:
- `products`: Revalidates all product-related pages
- `collections`: Revalidates collection pages
- `categories`: Revalidates category pages
- `customers`: Revalidates customer account pages
- `carts`: Revalidates cart pages
- `orders`: Revalidates order pages
- `product-{id}`: Revalidates specific product
- `collection-{id}`: Revalidates specific collection
- `category-{id}`: Revalidates specific category

#### POST Request
```json
{
  "tags": ["products", "collections"],
  "paths": ["/[countryCode]/(main)/store"]
}
```

### 2. Medusa Webhook Endpoint

**URL**: `/api/webhooks/medusa`

**Method**: `POST`

This endpoint is specifically designed to handle Medusa webhook events and automatically revalidate the appropriate cache.

**Supported Events**:
- `product.updated`, `product.created`, `product.deleted`
- `product_variant.updated`, `product_variant.created`, `product_variant.deleted`
- `collection.updated`, `collection.created`, `collection.deleted`
- `product_collection.updated`, `product_collection.created`, `product_collection.deleted`
- `product_category.updated`, `product_category.created`, `product_category.deleted`
- `price_list.updated`, `price_list.created`, `price_list.deleted`
- `customer.updated`, `customer.created`, `customer.deleted`

## Helper Functions

The system provides helper functions in `src/lib/util/revalidate-cache.ts`:

```typescript
import { 
  revalidateProductsCache,
  revalidateCollectionsCache,
  revalidateCategoriesCache,
  revalidateProductCache,
  revalidateCollectionCache,
  revalidateCategoryCache,
  revalidateCustomerCache,
  revalidateCartCache,
  revalidateOrdersCache,
  revalidateAllCache
} from "@lib/util/revalidate-cache"

// Revalidate specific cache types
await revalidateProductsCache()
await revalidateCollectionsCache()
await revalidateCategoriesCache()

// Revalidate specific items
await revalidateProductCache("product-id")
await revalidateCollectionCache("collection-id")
await revalidateCategoryCache("category-id")

// Revalidate all cache (use with caution)
await revalidateAllCache()
```

## Configuration

### Environment Variables

Add the following environment variable to enable webhook signature verification:

```env
MEDUSA_WEBHOOK_SECRET=your-webhook-secret-here
```

### Medusa Backend Configuration

In your Medusa backend, create subscribers to send webhooks to the storefront. Here's an example for product updates:

```typescript
// src/subscribers/product-updated.ts
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import crypto from "crypto"

// Generate signature for webhook security
function generateSignature(data: any, secret: string): string {
  const payload = JSON.stringify(data)
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
}

// Send webhook to storefront
async function sendWebhook(event: string, data: any) {
  const storefrontUrl = process.env.STOREFRONT_URL
  const webhookSecret = process.env.MEDUSA_WEBHOOK_SECRET

  if (!storefrontUrl) {
    console.warn("STOREFRONT_URL not configured, skipping webhook")
    return
  }

  const payload = {
    event,
    data,
    timestamp: new Date().toISOString()
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  }

  // Add signature if secret is configured
  if (webhookSecret) {
    headers["x-medusa-signature"] = generateSignature(payload, webhookSecret)
  }

  try {
    const response = await fetch(`${storefrontUrl}/api/webhooks/medusa`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error(`Webhook failed: ${response.status} ${response.statusText}`)
    } else {
      console.log(`Webhook sent successfully for event: ${event}`)
    }
  } catch (error) {
    console.error("Failed to send webhook:", error)
  }
}

export default async function productUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendWebhook("product.updated", { id: data.id })
}

export const config: SubscriberConfig = {
  event: "product.updated",
}
```

You can create similar subscribers for other events like:
- `product_variant.updated`
- `collection.updated`
- `price_list.updated`
- `customer.updated`
- `product_collection.updated`
- `product_category.updated`

Make sure to set the `STOREFRONT_URL` environment variable in your Medusa backend to point to your Next.js storefront.

## User Login Revalidation

When a user logs in, the system automatically revalidates the products cache to ensure they see the correct pricing based on their customer group. This is handled in the `login` and `signup` functions in `src/lib/data/customer.ts`.

## Cache Tags

The system uses cache tags to organize and manage cache invalidation:

- **Product tags**: `products-{cacheId}`, `product-{id}-{cacheId}`
- **Collection tags**: `collections-{cacheId}`, `collection-{id}-{cacheId}`
- **Category tags**: `categories-{cacheId}`, `category-{id}-{cacheId}`
- **Customer tags**: `customers-{cacheId}`
- **Cart tags**: `carts-{cacheId}`
- **Order tags**: `orders-{cacheId}`

The `cacheId` is generated based on user authentication and helps ensure that different users see appropriate cached content.

## Testing

### Test Webhook Endpoint

```bash
curl -X GET http://localhost:3000/api/webhooks/medusa
```

### Test Revalidation Endpoint

```bash
curl -X GET "http://localhost:3000/api/revalidate?tags=products"
```

### Test with Medusa Event

1. Update a product in your Medusa admin
2. Check the Next.js storefront logs for webhook processing
3. Verify that the product page shows updated information

## Best Practices

1. **Use specific tags**: Instead of revalidating all cache, use specific tags for better performance
2. **Monitor webhook failures**: Implement logging and monitoring for webhook failures
3. **Rate limiting**: Consider implementing rate limiting for webhook endpoints
4. **Error handling**: Always handle errors gracefully in webhook handlers
5. **Security**: Use webhook signature verification in production

## Troubleshooting

### Webhook Not Working

1. Check if the webhook URL is correct in Medusa
2. Verify the webhook secret is set correctly
3. Check Next.js logs for webhook processing errors
4. Ensure the Medusa backend can reach the storefront URL

### Cache Not Updating

1. Verify the cache tags are being set correctly
2. Check if the revalidation functions are being called
3. Ensure the correct paths are being revalidated
4. Check Next.js cache configuration

### Performance Issues

1. Avoid revalidating all cache unnecessarily
2. Use specific product/collection/category revalidation when possible
3. Monitor cache hit rates and adjust cache strategies accordingly 