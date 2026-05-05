import { HttpTypes } from "@medusajs/types"

const ENROLLMENT_SKUS = ["WNSTART", "WNSTARTSAPPHIRE", "WNSTARTEMERALD"]

export function hasRequiredRegistrationProduct(cart: HttpTypes.StoreCart | null): boolean {
  if (!cart || !cart.items || cart.items.length === 0) {
    return false
  }

  return cart.items.some(item =>
    ENROLLMENT_SKUS.includes(item.variant?.sku ?? "") ||
    ENROLLMENT_SKUS.includes(item.variant_sku ?? "")
  )
}

export function getRequiredProductUrl(): string {
  return "/categories/enrollment"
} 