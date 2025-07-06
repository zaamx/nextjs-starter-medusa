import { HttpTypes } from "@medusajs/types"

/**
 * Checks if the cart contains the required "Paquete de Inscripción" product
 * @param cart - The cart object to check
 * @returns true if the cart contains the required product, false otherwise
 */
export function hasRequiredRegistrationProduct(cart: HttpTypes.StoreCart | null): boolean {
  if (!cart || !cart.items || cart.items.length === 0) {
    return false
  }

  return cart.items.some(item => 
    item.variant?.sku === "WNSTART" || 
    item.variant_sku === "WNSTART"
  )
}

/**
 * Gets the product URL for the required registration product
 * @param countryCode - The country code for the URL (optional, LocalizedClientLink handles it)
 * @returns The product URL
 */
export function getRequiredProductUrl(countryCode?: string): string {
  // LocalizedClientLink will automatically add the country code prefix
  // so we just return the relative path
  return "/products/paquete-de-lanzamiento"
} 