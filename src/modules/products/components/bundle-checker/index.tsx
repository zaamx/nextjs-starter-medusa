"use client"

import { useEffect, useState, useRef } from "react"
import { fetchBundleProduct } from "@lib/data/products"

type BundleCheckerProps = {
  productId: string
  onBundleStateChange?: (isBundle: boolean, bundleData?: any) => void
  showDebugInfo?: boolean
}

const BundleChecker: React.FC<BundleCheckerProps> = ({ 
  productId, 
  onBundleStateChange,
  showDebugInfo = false 
}) => {
  const [bundleData, setBundleData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasChecked, setHasChecked] = useState(false)
  
  // Use ref to store the callback to avoid dependency issues
  const callbackRef = useRef(onBundleStateChange)
  callbackRef.current = onBundleStateChange

  useEffect(() => {
    const checkBundle = async () => {
      if (hasChecked) return // Prevent multiple checks
      
      try {
        setLoading(true)
        setError(null)
        const data = await fetchBundleProduct(productId)
        setBundleData(data)
        setHasChecked(true)
        callbackRef.current?.(true, data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bundle data')
        setBundleData(null)
        setHasChecked(true)
        callbackRef.current?.(false)
      } finally {
        setLoading(false)
      }
    }

    if (productId && !hasChecked) {
      checkBundle()
    }
  }, [productId, hasChecked])

  // Don't render anything if debug info is not needed
  if (!showDebugInfo) {
    return null
  }

  if (loading) {
    return <div>Checking bundle status...</div>
  }

  if (error) {
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Bundle Check</h3>
        <pre className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          Error: {error}
        </pre>
      </div>
    )
  }

  if (!bundleData) {
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Bundle Check</h3>
        <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-700">
          Product is not a bundle
        </pre>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Bundle Data</h3>
      <pre className="bg-green-50 border border-green-200 rounded p-3 text-sm overflow-auto max-h-96">
        {JSON.stringify(bundleData, null, 2)}
      </pre>
    </div>
  )
}

export default BundleChecker 