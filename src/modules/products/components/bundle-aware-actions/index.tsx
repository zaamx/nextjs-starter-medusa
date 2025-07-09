"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { v4 as uuidv4 } from "uuid"
import { addBundleToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import BundleProductItem from "@modules/products/components/bundle-aware-actions/bundle-product-item"
import ProductActions from "@modules/products/components/product-actions"
import ProductPrice from "@modules/products/components/product-price"

type BundleAwareActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

type ProductSelection = {
  productId: string
  selections: Array<{
    variantId: string
    quantity: number
  }>
  isPremium: boolean
}

type BundleMeta = {
  key: string
  value: string
}

const BundleAwareActions: React.FC<BundleAwareActionsProps> = ({
  product,
  region,
  countryCode
}) => {
  const [isBundle, setIsBundle] = useState(false)
  const [bundleData, setBundleData] = useState<any>(null)
  const [productSelections, setProductSelections] = useState<Record<string, ProductSelection>>({})
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const checkBundleState = useCallback(() => {
    // Find the parent wrapper element that contains bundle state
    const wrapperElement = document.querySelector('[data-is-bundle]')
    if (wrapperElement) {
      const bundleState = wrapperElement.getAttribute('data-is-bundle')
      const bundleDataAttr = wrapperElement.getAttribute('data-bundle-data')
      
      const newIsBundle = bundleState === 'true'
      setIsBundle(newIsBundle)
      
      if (bundleDataAttr && bundleDataAttr !== '') {
        try {
          const parsedData = JSON.parse(bundleDataAttr)
          setBundleData(parsedData)
        } catch (e) {
          console.error('Failed to parse bundle data:', e)
          setBundleData(null)
        }
      } else {
        setBundleData(null)
      }
    }
  }, [])

  useEffect(() => {
    checkBundleState()
    
    // Set up a mutation observer to watch for changes
    const observer = new MutationObserver(checkBundleState)
    const wrapperElement = document.querySelector('[data-is-bundle]')
    
    if (wrapperElement) {
      observer.observe(wrapperElement, {
        attributes: true,
        attributeFilter: ['data-is-bundle', 'data-bundle-data']
      })
    }

    return () => observer.disconnect()
  }, [checkBundleState])

  // Parse bundle metadata
  const bundleMeta = useMemo(() => {
    if (!bundleData?.bundle?.bundle_meta?.data) return {}
    
    return bundleData.bundle.bundle_meta.data.reduce((acc: Record<string, string>, meta: BundleMeta) => {
      acc[meta.key] = meta.value
      return acc
    }, {})
  }, [bundleData])

  // Use a single total max quantity for the bundle
  const totalMaxQuantity = parseInt(bundleMeta.total_max_quantity || '0')

  // Calculate total selected quantity across all child products/variants
  const totalSelectedQuantity = useMemo(() => {
    let total = 0;
    Object.values(productSelections).forEach(selection => {
      selection.selections.forEach(item => {
        total += item.quantity;
      });
    });
    return total;
  }, [productSelections]);

  // Validate bundle completeness
  const isValidSelection = useMemo(() => {
    if (!bundleData?.bundle?.child_products?.data?.length) return false;
    if (Object.keys(productSelections).length === 0) return false;
    if (totalSelectedQuantity !== totalMaxQuantity) return false;
    return true;
  }, [bundleData, productSelections, totalSelectedQuantity, totalMaxQuantity]);

  // Handle product selection changes
  const handleProductSelectionChange = useCallback((productId: string, selections: Array<{variantId: string, quantity: number}>, isPremium: boolean) => {
    setProductSelections(prev => ({
      ...prev,
      [productId]: {
        productId,
        selections,
        isPremium
      }
    }))
  }, [])

  // Always use the only variant for the bundle parent
  const bundleVariant = product.variants?.[0];

  // Add bundle to cart
  const handleAddBundleToCart = async () => {
    if (!isValidSelection || !bundleData) return

    setIsAdding(true)
    
    try {
      const bundleId = uuidv4()
      
      // Add parent product with bundle metadata
      await addBundleToCart({
        items: [{
          variant_id: bundleVariant?.id || '',
          quantity,
          metadata: {
            bundle_id: bundleId,
            bundle_type: 'parent',
            bundle_meta: JSON.stringify(bundleMeta)
          }
        }],
        countryCode
      })

      // Add child products with bundle reference
      for (const productData of Object.values(productSelections)) {
        for (const selection of productData.selections) {
          if (selection.quantity > 0) {
            await addBundleToCart({
              items: [{
                variant_id: selection.variantId,
                quantity: selection.quantity * quantity,
                metadata: {
                  bundled_by: bundleId,
                  bundle_type: 'child'
                }
              }],
              countryCode
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to add bundle to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Only show the bundle interface if the API response confirms it is a bundle
  const isActuallyBundle =
    isBundle &&
    bundleData &&
    bundleData.bundle &&
    bundleData.bundle.is_bundle === true &&
    Array.isArray(bundleData.bundle.child_products?.data)

  if (isActuallyBundle) {
    return (
      <div className="space-y-6">
        {/* Bundle Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Bundle Product
          </h3>
          <p className="text-blue-700 text-sm">
            {bundleMeta.bundle_description || `Create your custom bundle with ${bundleData.bundle.child_products.data.length} available products.`}
          </p>
          <ProductPrice product={product} variant={bundleVariant} />
        </div>

        {/* Bundle Validation Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Bundle Requirements</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              isValidSelection 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isValidSelection ? "Complete" : "Incomplete"}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Total Products Selected</span>
              <span className="font-medium">
                {totalSelectedQuantity} / {totalMaxQuantity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  totalSelectedQuantity === totalMaxQuantity 
                    ? 'bg-green-500' 
                    : totalSelectedQuantity > totalMaxQuantity 
                      ? 'bg-red-500' 
                      : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((totalSelectedQuantity / totalMaxQuantity) * 100, 100)}%` }}
              />
            </div>
          </div>
          {!isValidSelection && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              {totalSelectedQuantity < totalMaxQuantity && (
                <p>• Select {totalMaxQuantity - totalSelectedQuantity} more product(s)</p>
              )}
              {totalSelectedQuantity > totalMaxQuantity && (
                <p>• Remove {totalSelectedQuantity - totalMaxQuantity} product(s)</p>
              )}
            </div>
          )}
        </div>

        {/* Bundle Quantity Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Bundle Quantity
          </label>
          <div className="flex items-center space-x-2">
            {/* <Button
              variant="secondary"
              size="small"
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button> */}
            <span className="w-12 text-center font-medium">{quantity}</span>
            {/* <Button
              variant="secondary"
              size="small"
              onClick={() => setQuantity(prev => prev + 1)}
              disabled={quantity >= parseInt(bundleMeta.total_max_quantity || '5')}
            >
              +
            </Button> */}
          </div>
        </div>

        {/* Bundle Products */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Select Products</h4>
          {bundleData.bundle.child_products.data.map((childProduct: any) => (
            <BundleProductItem
              key={childProduct.id}
              productId={childProduct.id}
              maxQuantity={childProduct.max_quantity || 10}
              onSelectionChange={handleProductSelectionChange}
              totalMaxQuantity={totalMaxQuantity}
              totalSelectedQuantity={totalSelectedQuantity}
              regionId={region.id}
              countryCode={countryCode}
            />
          ))}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddBundleToCart}
          disabled={!isValidSelection || isAdding}
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
        >
          {!isValidSelection ? "Complete your bundle selection" : "Add Bundle to Cart"}
        </Button>
      </div>
    )
  }

  // Fallback to regular product actions
  return (
    <ProductActions product={product} region={region} />
  )
}

export default BundleAwareActions 