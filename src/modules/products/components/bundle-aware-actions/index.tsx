"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { v4 as uuidv4 } from "uuid"
import { addBundleToCart, retrieveCart } from "@lib/data/cart"
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

      // Create promises for all child products
      const cartPromises = Object.values(productSelections)
        // 1. Flatten all 'selections' arrays into one
        .flatMap(productData => productData.selections)
        
        // 2. Filter to keep only selections with quantity > 0
        .filter(selection => selection.quantity > 0)
        
        // 3. Create a promise for each valid selection
        .map(selection => addBundleToCart({
          items: [{
            variant_id: selection.variantId,
            quantity: selection.quantity * quantity,
            metadata: {
              bundled_by: bundleId,
              bundle_type: 'child'
            }
          }],
          countryCode
        }))

      // 4. Wait for all promises to resolve
      await Promise.all(cartPromises)

      // 5. Check if all items were added successfully
      await checkAndFixMissingItems(bundleId)
      
    } catch (error) {
      console.error('Failed to add bundle to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Check for missing items and add them
  const checkAndFixMissingItems = async (bundleId: string) => {
    try {
      // Wait a moment for cart to update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get current cart
      const cart = await retrieveCart()
      if (!cart?.items) return

      // Find bundle parent
      const bundleParent = cart.items.find((item: HttpTypes.StoreCartLineItem) => 
        item.metadata?.bundle_id === bundleId
      )
      
      if (!bundleParent) return

      // Get bundle children
      const bundleChildren = cart.items.filter((item: HttpTypes.StoreCartLineItem) => 
        item.metadata?.bundled_by === bundleId
      )

      // Create expected items map from productSelections
      const expectedItems = new Map<string, number>()
      Object.values(productSelections).forEach(productData => {
        productData.selections.forEach(selection => {
          if (selection.quantity > 0) {
            const key = selection.variantId
            const expectedQty = selection.quantity * quantity
            expectedItems.set(key, expectedQty)
          }
        })
      })

      // Create actual items map from cart
      const actualItems = new Map<string, number>()
      bundleChildren.forEach((child: HttpTypes.StoreCartLineItem) => {
        const variantId = child.variant_id
        if (variantId) {
          const currentQty = actualItems.get(variantId) || 0
          actualItems.set(variantId, currentQty + child.quantity)
        }
      })

      // Find missing items
      const missingItems: Array<{ variant_id: string, quantity: number }> = []
      expectedItems.forEach((expectedQty, variantId) => {
        const actualQty = actualItems.get(variantId) || 0
        const missingQty = expectedQty - actualQty
        
        if (missingQty > 0) {
          missingItems.push({
            variant_id: variantId,
            quantity: missingQty
          })
        }
      })

      // Add missing items if any
      if (missingItems.length > 0) {
        console.log('Adding missing bundle items:', missingItems)
        
        for (const item of missingItems) {
          await addBundleToCart({
            items: [{
              variant_id: item.variant_id,
              quantity: item.quantity,
              metadata: {
                bundled_by: bundleId,
                bundle_type: 'child'
              }
            }],
            countryCode
          })
        }
      }
    } catch (error) {
      console.error('Failed to check and fix missing items:', error)
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
    const progressPct = Math.min((totalSelectedQuantity / totalMaxQuantity) * 100, 100)

    return (
      <div className="flex flex-col gap-y-6">

        {/* Price + description */}
        <div className="border-l-2 border-brand-magenta pl-4">
          <ProductPrice product={product} variant={bundleVariant} />
          <p className="text-xs text-grey-50 mt-1">
            {bundleMeta.bundle_description ||
              `Elige ${totalMaxQuantity} productos de los disponibles en el paquete.`}
          </p>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-widest uppercase text-grey-50">
              Selección del paquete
            </span>
            <span className={`text-xs font-display tracking-widest px-2 py-0.5 ${
              isValidSelection
                ? "bg-green-100 text-green-800"
                : "bg-grey-10 text-grey-50"
            }`}>
              {totalSelectedQuantity} / {totalMaxQuantity}
            </span>
          </div>

          {/* Bar */}
          <div className="w-full bg-grey-20 h-1">
            <div
              className="h-1 transition-all duration-300"
              style={{
                width: `${progressPct}%`,
                backgroundColor: totalSelectedQuantity > totalMaxQuantity
                  ? "#ef4444"
                  : totalSelectedQuantity === totalMaxQuantity
                  ? "#22c55e"
                  : "#A31C5A",
              }}
            />
          </div>

          {!isValidSelection && (
            <p className="text-xs text-grey-50 border-l border-grey-20 pl-3">
              {totalSelectedQuantity < totalMaxQuantity
                ? `Selecciona ${totalMaxQuantity - totalSelectedQuantity} producto(s) más`
                : `Elimina ${totalSelectedQuantity - totalMaxQuantity} producto(s)`}
            </p>
          )}
        </div>

        {/* Quantity display */}
        <div className="flex items-center justify-between border-b border-grey-20 pb-4">
          <span className="text-xs tracking-widest uppercase text-grey-50">
            Cantidad de paquetes
          </span>
          <span className="font-display text-lg text-grey-90">{quantity}</span>
        </div>

        {/* Child products */}
        <div className="flex flex-col gap-y-3">
          <span className="text-xs tracking-widest uppercase text-grey-50">
            Selecciona tus productos
          </span>
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

        {/* Add to cart */}
        <Button
          onClick={handleAddBundleToCart}
          disabled={!isValidSelection || isAdding}
          variant="primary"
          className="w-full h-12 !bg-brand-magenta hover:!bg-brand-magenta/90 !border-brand-magenta font-display tracking-widest !text-sm !rounded-none"
          isLoading={isAdding}
        >
          {!isValidSelection
            ? "COMPLETA LA SELECCIÓN"
            : "AGREGAR PAQUETE AL CARRITO"}
        </Button>

        <p className="text-center text-xs text-grey-40 tracking-wide">
          Garantía de satisfacción 30 días · Envío gratis
        </p>
      </div>
    )
  }

  // Fallback to regular product actions
  return (
    <ProductActions product={product} region={region} />
  )
}

export default BundleAwareActions 