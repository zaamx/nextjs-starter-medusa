import { HttpTypes } from "@medusajs/types"

/**
 * Check if a cart item is a bundle parent
 */
export const isBundleParent = (item: HttpTypes.StoreCartLineItem): boolean => {
  return item.metadata?.bundle_id !== undefined
}

/**
 * Check if a cart item is a bundle child
 */
export const isBundleChild = (item: HttpTypes.StoreCartLineItem): boolean => {
  return item.metadata?.bundled_by !== undefined
}

/**
 * Get all bundle children for a given parent
 */
export const getBundleChildren = (
  parentItem: HttpTypes.StoreCartLineItem,
  allItems: HttpTypes.StoreCartLineItem[]
): HttpTypes.StoreCartLineItem[] => {
  const bundleId = parentItem.metadata?.bundle_id
  if (!bundleId) return []
  
  return allItems.filter(item => 
    item.metadata?.bundled_by === bundleId
  )
}

/**
 * Group cart items into bundles and regular items
 */
export const groupCartItems = (items: HttpTypes.StoreCartLineItem[]) => {
  const bundleParents: HttpTypes.StoreCartLineItem[] = []
  const bundleChildren: HttpTypes.StoreCartLineItem[] = []
  const regularItems: HttpTypes.StoreCartLineItem[] = []

  items.forEach(item => {
    if (isBundleParent(item)) {
      bundleParents.push(item)
    } else if (isBundleChild(item)) {
      bundleChildren.push(item)
    } else {
      regularItems.push(item)
    }
  })

  return {
    bundleParents,
    bundleChildren,
    regularItems
  }
}

/**
 * Create bundle groups with parent and children
 */
export const createBundleGroups = (items: HttpTypes.StoreCartLineItem[]) => {
  const { bundleParents, bundleChildren } = groupCartItems(items)
  
  return bundleParents.map(parent => ({
    parent,
    children: getBundleChildren(parent, bundleChildren)
  }))
}

/**
 * Calculate total bundle price
 */
export const calculateBundlePrice = (
  parentItem: HttpTypes.StoreCartLineItem,
  childItems: HttpTypes.StoreCartLineItem[]
): number => {
  const parentPrice = parentItem.unit_price * parentItem.quantity
  const childrenPrice = childItems.reduce((total, child) => {
    return total + (child.unit_price * child.quantity)
  }, 0)
  
  return parentPrice + childrenPrice
}

/**
 * Check if bundle is complete (has parent and children)
 */
export const isBundleComplete = (
  parentItem: HttpTypes.StoreCartLineItem,
  childItems: HttpTypes.StoreCartLineItem[]
): boolean => {
  return parentItem && childItems.length > 0
} 