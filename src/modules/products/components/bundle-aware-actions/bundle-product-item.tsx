"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchProduct } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import Thumbnail from "@modules/products/components/thumbnail"

export type BundleModel = "category" | "product"

type ProductConstraints = {
  min_quantity: number
  max_quantity: number
  default_quantity: number
}

type BundleProductItemProps = {
  productId: string
  constraints: ProductConstraints
  bundleModel: BundleModel
  // Modelo A
  categoryLimits: Record<string, number>
  categoryQuantities: Record<string, number>
  // Modelo B
  totalMaxQuantity: number
  totalSelectedQuantity: number
  onSelectionChange: (
    productId: string,
    selections: Array<{ variantId: string; quantity: number }>,
    categoryHandle: string | null
  ) => void
  regionId: string
  countryCode: string
}

const BundleProductItem: React.FC<BundleProductItemProps> = ({
  productId,
  constraints,
  bundleModel,
  categoryLimits,
  categoryQuantities,
  totalMaxQuantity,
  totalSelectedQuantity,
  onSelectionChange,
  regionId,
  countryCode,
}) => {
  const [product, setProduct] = useState<HttpTypes.StoreProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await fetchProduct(productId, countryCode, regionId)
        setProduct(data as any)
      } catch {
        // product stays null
      } finally {
        setLoading(false)
      }
    }
    if (productId && regionId && countryCode) load()
  }, [productId, regionId, countryCode])

  // Detect which category this product belongs to (Modelo A)
  const categoryHandle = useMemo((): string | null => {
    if (bundleModel !== "category" || !product?.categories) return null
    const handles = Object.keys(categoryLimits)
    return product.categories.find((c) => handles.includes(c.handle ?? ""))?.handle ?? null
  }, [product, bundleModel, categoryLimits])

  // Initialize default_quantity on first product load (Modelo B only)
  useEffect(() => {
    if (!product || bundleModel !== "product") return
    if (constraints.default_quantity <= 0) return

    const variants = (product.variants ?? []).filter(
      (v) => (v.calculated_price?.calculated_amount ?? 0) > 0
    )
    if (variants.length === 0) return

    // Apply default only to first variant, capped by constraints
    const defaultQty = Math.min(constraints.default_quantity, constraints.max_quantity)
    const initial: Record<string, number> = { [variants[0].id]: defaultQty }
    setVariantQuantities(initial)

    const selections = [{ variantId: variants[0].id, quantity: defaultQty }]
    onSelectionChange(productId, selections, null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  const variantOptions = useMemo(() => {
    if (!product?.variants) return []
    return product.variants
      .filter((v) => (v.calculated_price?.calculated_amount ?? 0) > 0)
      .map((v) => ({ id: v.id, label: v.title ?? "Variante", sku: v.sku }))
  }, [product])

  // Total selected for THIS product (all variants combined)
  const productTotal = useMemo(
    () => Object.values(variantQuantities).reduce((s, q) => s + q, 0),
    [variantQuantities]
  )

  const getMaxForVariant = (variantId: string): number => {
    const current = variantQuantities[variantId] ?? 0

    if (bundleModel === "category") {
      if (!categoryHandle) return 0
      const limit = categoryLimits[categoryHandle] ?? 0
      const used = categoryQuantities[categoryHandle] ?? 0
      return limit - used + current
    }

    // Modelo B: doble techo
    const productCeiling = constraints.max_quantity - productTotal + current
    const globalCeiling = totalMaxQuantity - totalSelectedQuantity + current
    return Math.max(0, Math.min(productCeiling, globalCeiling))
  }

  const updateVariant = (variantId: string, delta: number) => {
    const current = variantQuantities[variantId] ?? 0
    const next = current + delta
    const max = getMaxForVariant(variantId)

    // Modelo B: enforce min_quantity when reducing to zero is below min
    if (bundleModel === "product" && next > 0 && next < constraints.min_quantity) return
    if (next < 0 || next > max) return

    const updated = { ...variantQuantities, [variantId]: next }
    setVariantQuantities(updated)

    const selections = Object.entries(updated)
      .filter(([, q]) => q > 0)
      .map(([vid, q]) => ({ variantId: vid, quantity: q }))

    onSelectionChange(productId, selections, categoryHandle)
  }

  // Progress pill
  const pillMax =
    bundleModel === "category" && categoryHandle
      ? categoryLimits[categoryHandle] ?? constraints.max_quantity
      : constraints.max_quantity
  const pillFull = productTotal >= pillMax

  if (loading) {
    return (
      <div className="border border-grey-20 p-4 animate-pulse">
        <div className="flex gap-3">
          <div className="w-12 h-12 bg-grey-10 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 bg-grey-10 rounded w-2/3" />
            <div className="h-3 bg-grey-10 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="border border-red-200 bg-red-50 p-4">
        <p className="text-red-700 text-xs">No se pudo cargar el producto.</p>
      </div>
    )
  }

  return (
    <div className="border border-grey-20 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 flex-shrink-0 bg-grey-5">
          <Thumbnail thumbnail={product.thumbnail} size="square" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h5 className="text-sm font-medium text-grey-90 leading-tight">
              {product.title}
            </h5>
            {/* Progress pill */}
            <span
              className={`flex-shrink-0 text-[10px] font-display tracking-widest px-2 py-0.5 ${
                pillFull
                  ? "bg-green-100 text-green-800"
                  : "bg-grey-10 text-grey-50"
              }`}
            >
              {productTotal} / {pillMax}
              {pillFull && " ✓"}
            </span>
          </div>
          {/* Category badge (Modelo A) */}
          {bundleModel === "category" && categoryHandle && (
            <span className="text-[10px] tracking-widest uppercase text-brand-magenta">
              {categoryHandle}
            </span>
          )}
        </div>
      </div>

      {/* Variants */}
      {variantOptions.length > 0 ? (
        <div className="flex flex-col gap-2">
          {variantOptions.map((v) => {
            const qty = variantQuantities[v.id] ?? 0
            const max = getMaxForVariant(v.id)
            return (
              <div
                key={v.id}
                className="flex items-center justify-between px-3 py-2 bg-grey-5"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-grey-90">{v.label}</span>
                  {v.sku && (
                    <p className="text-[10px] text-grey-40 mt-0.5">SKU: {v.sku}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => updateVariant(v.id, -1)}
                    disabled={qty <= 0}
                    className="w-7 h-7 flex items-center justify-center border border-grey-20 text-grey-70 hover:border-grey-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-grey-90">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateVariant(v.id, 1)}
                    disabled={qty >= max}
                    className="w-7 h-7 flex items-center justify-center border border-grey-20 text-grey-70 hover:border-grey-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-grey-40 text-center py-2">
          Sin variantes disponibles.
        </p>
      )}
    </div>
  )
}

export default BundleProductItem
