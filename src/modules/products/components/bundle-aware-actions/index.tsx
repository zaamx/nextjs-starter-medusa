"use client"

import { useEffect, useState, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

type BundleAwareActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

const BundleAwareActions: React.FC<BundleAwareActionsProps> = ({
  product,
  region,
}) => {
  const [isBundle, setIsBundle] = useState(false)
  const [bundleData, setBundleData] = useState<any>(null)

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

  // Only show the bundle message if the API response confirms it is a bundle
  const isActuallyBundle =
    isBundle &&
    bundleData &&
    bundleData.bundle &&
    bundleData.bundle.is_bundle === true &&
    Array.isArray(bundleData.bundle.child_products?.data)

  if (isActuallyBundle) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Bundle Product
        </h3>
        <p className="text-blue-700">
          This is a bundle product with {bundleData.bundle.child_products.data.length} items.
        </p>
      </div>
    )
  }

  return (
    <ProductActions product={product} region={region} />
  )
}

export default BundleAwareActions 