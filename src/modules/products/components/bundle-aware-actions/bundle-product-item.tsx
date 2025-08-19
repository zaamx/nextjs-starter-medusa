"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@medusajs/ui"
import { fetchProduct } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import Thumbnail from "@modules/products/components/thumbnail"

type BundleProductItemProps = {
  productId: string
  maxQuantity: number
  onSelectionChange: (productId: string, selections: Array<{variantId: string, quantity: number}>, isPremium: boolean) => void
  totalMaxQuantity: number
  totalSelectedQuantity: number
  regionId: string
  countryCode: string
}

const BundleProductItem: React.FC<BundleProductItemProps> = ({
  productId,
  maxQuantity,
  onSelectionChange,
  totalMaxQuantity,
  totalSelectedQuantity,
  regionId,
  countryCode
}) => {
  const [product, setProduct] = useState<HttpTypes.StoreProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({})

  // Fetch product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const productData = await fetchProduct(productId, countryCode, regionId)
        setProduct(productData as any)
      } catch (error) {
        console.error('Failed to load product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (productId && regionId && countryCode) {
      loadProduct()
    }
  }, [productId, regionId, countryCode])

  // Determine if product is premium (not used, but kept for compatibility)
  const isPremiumProduct = useMemo(() => {
    return product?.categories?.some(category => category.handle === 'premium')
  }, [product])

  // Get available variants
  const variantOptions = useMemo(() => {
    if (!product?.variants) return []
    
    return product.variants
      .filter(variant => variant.calculated_price?.calculated_amount && variant.calculated_price.calculated_amount > 0)
      .map(variant => ({
        label: variant.title || 'Unknown Variant',
        value: variant.id,
        price: variant.calculated_price?.calculated_amount || 0,
        sku: variant.sku
      }))
  }, [product])

  // Calculate max quantity for a variant (global bundle limit)
  const getMaxQuantityForVariant = (variantId: string) => {
    const currentVariantQuantity = variantQuantities[variantId] || 0;
    return Math.min(
      maxQuantity,
      totalMaxQuantity,
      (totalMaxQuantity - totalSelectedQuantity) + currentVariantQuantity
    );
  }

  // Update variant quantity
  const updateVariantQuantity = (variantId: string, change: number) => {
    const currentQty = variantQuantities[variantId] || 0
    const newQty = currentQty + change
    const maxQty = getMaxQuantityForVariant(variantId)

    if (newQty >= 0 && newQty <= maxQty) {
      const newQuantities = {
        ...variantQuantities,
        [variantId]: newQty
      }
      
      setVariantQuantities(newQuantities)
      
      // Emit updated selections
      const selections = Object.entries(newQuantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([variantId, quantity]) => ({
          variantId,
          quantity
        }))

      onSelectionChange(productId, selections, isPremiumProduct || false)
    }
  }

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="flex space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <p className="text-red-700 text-sm">Failed to load product</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Product Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 flex-shrink-0">
          <Thumbnail thumbnail={product.thumbnail} size="square" />
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-medium text-gray-900 truncate">
            {product.title}
          </h5>
          <p className="text-xs text-gray-500">
            {isPremiumProduct ? 'Premium' : 'Select'} Category
          </p>
          {product.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Variant Selection */}
      {variantOptions.length > 0 && (
        <div className="space-y-3">
          {variantOptions.map((variant) => {
            const currentQty = variantQuantities[variant.value] || 0
            const maxQty = getMaxQuantityForVariant(variant.value)
            const canIncrease = currentQty < maxQty
            const canDecrease = currentQty > 0

            return (
              <div key={variant.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {variant.label}
                    </span>
                    {/* <span className="text-sm text-gray-600">
                      ${(variant.price / 100).toFixed(2)}
                    </span> */}
                  </div>
                  {variant.sku && (
                    <p className="text-xs text-gray-500 mt-1">SKU: {variant.sku}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => updateVariantQuantity(variant.value, -1)}
                    disabled={!canDecrease}
                    className="w-8 h-8 p-0"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {currentQty}
                  </span>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => updateVariantQuantity(variant.value, 1)}
                    disabled={!canIncrease}
                    className="w-8 h-8 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No variants message */}
      {variantOptions.length === 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          No hay variantes disponibles para este producto.
        </div>
      )}
    </div>
  )
}

export default BundleProductItem 