import { NextRequest, NextResponse } from "next/server"
import { revalidateProductsCache, revalidateCollectionsCache, revalidateCategoriesCache, revalidateProductCache, revalidateCollectionCache, revalidateCategoryCache } from "@lib/util/revalidate-cache"
import { validateWebhookRequest } from "@lib/util/webhook-utils"

export async function POST(req: NextRequest) {
  try {
    // Validate webhook request
    const validation = await validateWebhookRequest(req)
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: validation.error || "Invalid webhook request" 
      }, { status: 400 })
    }

    const { event, data } = validation.body!

    // Handle different Medusa events
    switch (event) {
      case "product.updated":
      case "product.created":
      case "product.deleted":
        if (data?.id) {
          await revalidateProductCache(data.id)
        }
        await revalidateProductsCache()
        break

      case "product_variant.updated":
      case "product_variant.created":
      case "product_variant.deleted":
        if (data?.product_id) {
          await revalidateProductCache(data.product_id)
        }
        await revalidateProductsCache()
        break

      case "collection.updated":
      case "collection.created":
      case "collection.deleted":
        if (data?.id) {
          await revalidateCollectionCache(data.id)
        }
        await revalidateCollectionsCache()
        break

      case "product_collection.updated":
      case "product_collection.created":
      case "product_collection.deleted":
        if (data?.collection_id) {
          await revalidateCollectionCache(data.collection_id)
        }
        if (data?.product_id) {
          await revalidateProductCache(data.product_id)
        }
        await revalidateCollectionsCache()
        await revalidateProductsCache()
        break

      case "product_category.updated":
      case "product_category.created":
      case "product_category.deleted":
        if (data?.category_id) {
          await revalidateCategoryCache(data.category_id)
        }
        if (data?.product_id) {
          await revalidateProductCache(data.product_id)
        }
        await revalidateCategoriesCache()
        await revalidateProductsCache()
        break

      case "price_list.updated":
      case "price_list.created":
      case "price_list.deleted":
        // Price list changes affect all products
        await revalidateProductsCache()
        break

      case "customer.updated":
      case "customer.created":
      case "customer.deleted":
        // Customer changes might affect pricing, so revalidate products
        await revalidateProductsCache()
        break

      case "order.updated":
      case "order.created":
      case "order.deleted":
        // Order changes don't typically affect product display
        break

      default:
        // For unknown events, revalidate all product-related cache
        await revalidateProductsCache()
        await revalidateCollectionsCache()
        await revalidateCategoriesCache()
        break
    }

    return NextResponse.json({ 
      message: "Webhook processed successfully",
      event,
      revalidated: true
    }, { status: 200 })

  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ 
      error: "Failed to process webhook" 
    }, { status: 500 })
  }
}

// Optional: Add GET method for webhook verification
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: "We Now webhook endpoint is active",
    status: "ok"
  }, { status: 200 })
} 