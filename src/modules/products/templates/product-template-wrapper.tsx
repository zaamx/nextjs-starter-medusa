"use client"

import { useState, useMemo, useCallback } from "react"
import BundleChecker from "@modules/products/components/bundle-checker"
import { HttpTypes } from "@medusajs/types"

type ProductTemplateWrapperProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  children: React.ReactNode
}

const ProductTemplateWrapper: React.FC<ProductTemplateWrapperProps> = ({
  product,
  region,
  countryCode,
  children,
}) => {
  const [isBundle, setIsBundle] = useState(false)
  const [bundleData, setBundleData] = useState<any>(null)

  const handleBundleStateChange = useCallback((bundle: boolean, data?: any) => {
    setIsBundle(bundle)
    setBundleData(data)
  }, [])

  // Memoize the bundle data string to prevent unnecessary re-renders
  const bundleDataString = useMemo(() => {
    return bundleData ? JSON.stringify(bundleData) : ""
  }, [bundleData])

  return (
    <>
      <BundleChecker 
        productId={product.id} 
        onBundleStateChange={handleBundleStateChange}
        showDebugInfo={false}
      />
      <div 
        data-is-bundle={isBundle}
        data-bundle-data={bundleDataString}
      >
        {children}
      </div>
    </>
  )
}

export default ProductTemplateWrapper 