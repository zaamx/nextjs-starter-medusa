"use server"

import { revalidatePath, revalidateTag } from "next/cache"

export type RevalidationTarget = 
  | "products" 
  | "collections" 
  | "categories" 
  | "customers" 
  | "carts" 
  | "orders"
  | `product-${string}`
  | `collection-${string}`
  | `category-${string}`

export interface RevalidationOptions {
  tags?: RevalidationTarget[]
  paths?: string[]
  cacheId?: string
}

/**
 * Helper function to revalidate cache by tags and paths
 */
export async function revalidateCache(options: RevalidationOptions): Promise<void> {
  const { tags = [], paths = [], cacheId } = options

  try {
    // Revalidate by tags
    if (tags.length > 0) {
      await Promise.all(
        tags.map(async (tag) => {
          // If cacheId is provided, append it to the tag
          const fullTag = cacheId ? `${tag}-${cacheId}` : tag
          revalidateTag(fullTag)
        })
      )
    }

    // Revalidate by paths
    if (paths.length > 0) {
      await Promise.all(
        paths.map((path) => revalidatePath(path, "page"))
      )
    }
  } catch (error) {
    console.error("Cache revalidation error:", error)
    throw new Error("Failed to revalidate cache")
  }
}

/**
 * Revalidate products cache
 */
export async function revalidateProductsCache(cacheId?: string): Promise<void> {
  await revalidateCache({
    tags: ["products"],
    paths: [
      "/[countryCode]/(main)/store",
      "/[countryCode]/(main)/products/[handle]",
      "/[countryCode]/(main)/collections/[handle]",
      "/[countryCode]/(main)/categories/[...category]",
      "/[countryCode]/(main)/page"
    ],
    cacheId
  })
}

/**
 * Revalidate collections cache
 */
export async function revalidateCollectionsCache(cacheId?: string): Promise<void> {
  await revalidateCache({
    tags: ["collections"],
    paths: [
      "/[countryCode]/(main)/collections/[handle]",
      "/[countryCode]/(main)/store"
    ],
    cacheId
  })
}

/**
 * Revalidate categories cache
 */
export async function revalidateCategoriesCache(cacheId?: string): Promise<void> {
  await revalidateCache({
    tags: ["categories"],
    paths: [
      "/[countryCode]/(main)/categories/[...category]",
      "/[countryCode]/(main)/store"
    ],
    cacheId
  })
}

/**
 * Revalidate customer cache
 */
export async function revalidateCustomerCache(cacheId?: string): Promise<void> {
  await revalidateCache({
    tags: ["customers"],
    paths: [
      "/[countryCode]/(main)/account",
      "/[countryCode]/(main)/account/@dashboard"
    ],
    cacheId
  })
}

/**
 * Revalidate cart cache
 */
export async function revalidateCartCache(cacheId?: string): Promise<void> {
  await revalidateCache({
    tags: ["carts"],
    paths: ["/[countryCode]/(main)/cart"],
    cacheId
  })
}

/**
 * Revalidate orders cache
 */
export async function revalidateOrdersCache(cacheId?: string): Promise<void> {
  await revalidateCache({
    tags: ["orders"],
    paths: [
      "/[countryCode]/(main)/account/@dashboard/orders",
      "/[countryCode]/(main)/account/@dashboard/orders/details/[id]"
    ],
    cacheId
  })
}

/**
 * Revalidate specific product cache
 */
export async function revalidateProductCache(productId: string, cacheId?: string): Promise<void> {
  await revalidateCache({
    tags: [`product-${productId}`],
    paths: ["/[countryCode]/(main)/products/[handle]"],
    cacheId
  })
}

/**
 * Revalidate specific collection cache
 */
export async function revalidateCollectionCache(collectionId: string, cacheId?: string): Promise<void> {
  await revalidateCache({
    tags: [`collection-${collectionId}`],
    paths: ["/[countryCode]/(main)/collections/[handle]"],
    cacheId
  })
}

/**
 * Revalidate specific category cache
 */
export async function revalidateCategoryCache(categoryId: string, cacheId?: string): Promise<void> {
  await revalidateCache({
    tags: [`category-${categoryId}`],
    paths: ["/[countryCode]/(main)/categories/[...category]"],
    cacheId
  })
}

/**
 * Revalidate all cache (use with caution)
 */
export async function revalidateAllCache(cacheId?: string): Promise<void> {
  await revalidateCache({
    tags: ["products", "collections", "categories", "customers", "carts", "orders"],
    paths: [
      "/[countryCode]/(main)/store",
      "/[countryCode]/(main)/products/[handle]",
      "/[countryCode]/(main)/collections/[handle]",
      "/[countryCode]/(main)/categories/[...category]",
      "/[countryCode]/(main)/account",
      "/[countryCode]/(main)/account/@dashboard",
      "/[countryCode]/(main)/cart",
      "/[countryCode]/(main)/page"
    ],
    cacheId
  })
} 