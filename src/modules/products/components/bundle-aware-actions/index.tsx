"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { v4 as uuidv4 } from "uuid"
import { addBundleToCart, retrieveCart } from "@lib/data/cart"
import BundleProductItem, { BundleModel } from "@modules/products/components/bundle-aware-actions/bundle-product-item"
import ProductActions from "@modules/products/components/product-actions"
import ProductPrice from "@modules/products/components/product-price"

type BundleAwareActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

type ProductSelection = {
  productId: string
  selections: Array<{ variantId: string; quantity: number }>
  categoryHandle: string | null
}

type BundleMetaMap = Record<string, string>

// ─── helpers ────────────────────────────────────────────────────────────────

const parseBundleMeta = (data: Array<{ key: string; value: string }>): BundleMetaMap =>
  data.reduce<BundleMetaMap>((acc, { key, value }) => { acc[key] = value; return acc }, {})

const detectModel = (meta: BundleMetaMap): BundleModel =>
  Object.keys(meta).some((k) => k.startsWith("max_category_")) ? "category" : "product"

const parseCategoryLimits = (meta: BundleMetaMap): Record<string, number> =>
  Object.entries(meta).reduce<Record<string, number>>((acc, [k, v]) => {
    if (k.startsWith("max_category_")) acc[k.replace("max_category_", "")] = parseInt(v)
    return acc
  }, {})

// ─── component ──────────────────────────────────────────────────────────────

const BundleAwareActions: React.FC<BundleAwareActionsProps> = ({
  product,
  region,
  countryCode,
}) => {
  const [isBundle, setIsBundle] = useState(false)
  const [bundleData, setBundleData] = useState<any>(null)
  const [productSelections, setProductSelections] = useState<Record<string, ProductSelection>>({})
  const [isAdding, setIsAdding] = useState(false)

  // ── read bundle state from DOM data-attributes (set by ProductTemplateWrapper) ──
  const checkBundleState = useCallback(() => {
    const el = document.querySelector("[data-is-bundle]")
    if (!el) return
    setIsBundle(el.getAttribute("data-is-bundle") === "true")
    const raw = el.getAttribute("data-bundle-data")
    if (raw) {
      try { setBundleData(JSON.parse(raw)) } catch { setBundleData(null) }
    } else {
      setBundleData(null)
    }
  }, [])

  useEffect(() => {
    checkBundleState()
    const el = document.querySelector("[data-is-bundle]")
    if (!el) return
    const obs = new MutationObserver(checkBundleState)
    obs.observe(el, { attributes: true, attributeFilter: ["data-is-bundle", "data-bundle-data"] })
    return () => obs.disconnect()
  }, [checkBundleState])

  // ── derived bundle metadata ──────────────────────────────────────────────
  const bundleMeta = useMemo<BundleMetaMap>(() => {
    if (!bundleData?.bundle?.bundle_meta?.data) return {}
    return parseBundleMeta(bundleData.bundle.bundle_meta.data)
  }, [bundleData])

  const bundleModel = useMemo<BundleModel>(() => detectModel(bundleMeta), [bundleMeta])

  // Modelo A: per-category limits   Modelo B: single global total
  const categoryLimits = useMemo(() => parseCategoryLimits(bundleMeta), [bundleMeta])

  const totalBundleMax = useMemo(() => {
    if (bundleModel === "category") {
      return Object.values(categoryLimits).reduce((s, v) => s + v, 0)
    }
    return parseInt(bundleMeta.total_max_quantity ?? "0")
  }, [bundleModel, categoryLimits, bundleMeta])

  // ── aggregate quantities ─────────────────────────────────────────────────
  const totalSelectedQuantity = useMemo(
    () =>
      Object.values(productSelections).reduce(
        (s, p) => s + p.selections.reduce((ps, v) => ps + v.quantity, 0),
        0
      ),
    [productSelections]
  )

  // Per-category totals (Modelo A)
  const categoryQuantities = useMemo<Record<string, number>>(() => {
    if (bundleModel !== "category") return {}
    const result: Record<string, number> = {}
    for (const ps of Object.values(productSelections)) {
      if (!ps.categoryHandle) continue
      const qty = ps.selections.reduce((s, v) => s + v.quantity, 0)
      result[ps.categoryHandle] = (result[ps.categoryHandle] ?? 0) + qty
    }
    return result
  }, [productSelections, bundleModel])

  // ── validation ───────────────────────────────────────────────────────────
  const isValidSelection = useMemo(() => {
    if (!bundleData?.bundle?.child_products?.data?.length) return false
    if (Object.keys(productSelections).length === 0) return false

    if (bundleModel === "category") {
      return Object.entries(categoryLimits).every(
        ([handle, limit]) => (categoryQuantities[handle] ?? 0) === limit
      )
    }

    // Modelo B
    return totalSelectedQuantity === totalBundleMax
  }, [bundleData, productSelections, bundleModel, categoryLimits, categoryQuantities, totalSelectedQuantity, totalBundleMax])

  // ── child product callbacks ──────────────────────────────────────────────
  const handleProductSelectionChange = useCallback(
    (
      productId: string,
      selections: Array<{ variantId: string; quantity: number }>,
      categoryHandle: string | null
    ) => {
      setProductSelections((prev) => ({
        ...prev,
        [productId]: { productId, selections, categoryHandle },
      }))
    },
    []
  )

  // ── cart submission ──────────────────────────────────────────────────────
  const bundleVariant = product.variants?.[0]

  const handleAddBundleToCart = async () => {
    if (!isValidSelection || !bundleData) return
    setIsAdding(true)

    try {
      const bundleId = uuidv4()

      await addBundleToCart({
        items: [{
          variant_id: bundleVariant?.id ?? "",
          quantity: 1,
          metadata: {
            bundle_id: bundleId,
            bundle_type: "parent",
            bundle_meta: JSON.stringify(bundleMeta),
          },
        }],
        countryCode,
      })

      const childItems = Object.values(productSelections)
        .flatMap((p) => p.selections)
        .filter((s) => s.quantity > 0)

      await Promise.all(
        childItems.map((s) =>
          addBundleToCart({
            items: [{
              variant_id: s.variantId,
              quantity: s.quantity,
              metadata: { bundled_by: bundleId, bundle_type: "child" },
            }],
            countryCode,
          })
        )
      )

      await checkAndFixMissingItems(bundleId)
    } catch (err) {
      console.error("Failed to add bundle to cart:", err)
    } finally {
      setIsAdding(false)
    }
  }

  const checkAndFixMissingItems = async (bundleId: string) => {
    try {
      await new Promise((r) => setTimeout(r, 1000))
      const cart = await retrieveCart()
      if (!cart?.items) return

      const children = cart.items.filter(
        (i: HttpTypes.StoreCartLineItem) => i.metadata?.bundled_by === bundleId
      )

      const expected = new Map<string, number>()
      Object.values(productSelections).forEach((p) =>
        p.selections.forEach((s) => {
          if (s.quantity > 0) expected.set(s.variantId, s.quantity)
        })
      )

      const actual = new Map<string, number>()
      children.forEach((c: HttpTypes.StoreCartLineItem) => {
        if (c.variant_id)
          actual.set(c.variant_id, (actual.get(c.variant_id) ?? 0) + c.quantity)
      })

      for (const [variantId, expectedQty] of expected) {
        const missing = expectedQty - (actual.get(variantId) ?? 0)
        if (missing > 0) {
          await addBundleToCart({
            items: [{
              variant_id: variantId,
              quantity: missing,
              metadata: { bundled_by: bundleId, bundle_type: "child" },
            }],
            countryCode,
          })
        }
      }
    } catch (err) {
      console.error("Failed to check and fix missing items:", err)
    }
  }

  // ── guard ────────────────────────────────────────────────────────────────
  const isActuallyBundle =
    isBundle &&
    bundleData?.bundle?.is_bundle === true &&
    Array.isArray(bundleData?.bundle?.child_products?.data)

  if (!isActuallyBundle) {
    return <ProductActions product={product} region={region} />
  }

  const progressPct = Math.min((totalSelectedQuantity / totalBundleMax) * 100, 100)
  const childProducts: any[] = bundleData.bundle.child_products.data

  return (
    <div className="flex flex-col gap-y-6">

      {/* Price + description */}
      <div className="border-l-2 border-brand-magenta pl-4">
        <ProductPrice product={product} variant={bundleVariant} />
        <p className="text-xs text-grey-50 mt-1">
          {bundleMeta.bundle_description ??
            (bundleModel === "category"
              ? "Elige tus productos por categoría para completar el paquete."
              : `Elige ${totalBundleMax} productos de los disponibles en el paquete.`)}
        </p>
      </div>

      {/* Progress section */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-widest uppercase text-grey-50">
            Selección del paquete
          </span>
          <span className={`text-xs font-display tracking-widest px-2 py-0.5 ${
            isValidSelection ? "bg-green-100 text-green-800" : "bg-grey-10 text-grey-50"
          }`}>
            {totalSelectedQuantity} / {totalBundleMax}
          </span>
        </div>

        {/* Global progress bar */}
        <div className="w-full bg-grey-20 h-1">
          <div
            className="h-1 transition-all duration-300"
            style={{
              width: `${progressPct}%`,
              backgroundColor:
                totalSelectedQuantity > totalBundleMax
                  ? "#ef4444"
                  : isValidSelection
                  ? "#22c55e"
                  : "#A31C5A",
            }}
          />
        </div>

        {/* Per-category badges (Modelo A only) */}
        {bundleModel === "category" && Object.keys(categoryLimits).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.entries(categoryLimits).map(([handle, limit]) => {
              const used = categoryQuantities[handle] ?? 0
              const full = used === limit
              return (
                <span
                  key={handle}
                  className={`text-[10px] font-display tracking-widest px-2 py-0.5 border ${
                    full
                      ? "bg-green-50 border-green-300 text-green-800"
                      : "bg-grey-5 border-grey-20 text-grey-50"
                  }`}
                >
                  {handle}: {used} / {limit}{full ? " ✓" : ""}
                </span>
              )
            })}
          </div>
        )}

        {/* Hint */}
        {!isValidSelection && (
          <p className="text-xs text-grey-50 border-l border-grey-20 pl-3">
            {bundleModel === "category"
              ? Object.entries(categoryLimits)
                  .filter(([h, l]) => (categoryQuantities[h] ?? 0) < l)
                  .map(([h, l]) => `${h}: ${l - (categoryQuantities[h] ?? 0)} restante(s)`)
                  .join(" · ")
              : totalSelectedQuantity < totalBundleMax
              ? `Selecciona ${totalBundleMax - totalSelectedQuantity} producto(s) más`
              : `Elimina ${totalSelectedQuantity - totalBundleMax} producto(s)`}
          </p>
        )}
      </div>

      {/* Child products */}
      <div className="flex flex-col gap-y-3">
        <span className="text-xs tracking-widest uppercase text-grey-50">
          Selecciona tus productos
        </span>
        {childProducts.map((child: any) => (
          <BundleProductItem
            key={child.id}
            productId={child.id}
            constraints={{
              min_quantity: child.min_quantity ?? 0,
              max_quantity: child.max_quantity ?? 10,
              default_quantity: child.default_quantity ?? 0,
            }}
            bundleModel={bundleModel}
            categoryLimits={categoryLimits}
            categoryQuantities={categoryQuantities}
            totalMaxQuantity={totalBundleMax}
            totalSelectedQuantity={totalSelectedQuantity}
            onSelectionChange={handleProductSelectionChange}
            regionId={region.id}
            countryCode={countryCode}
          />
        ))}
      </div>

      {/* CTA */}
      <Button
        onClick={handleAddBundleToCart}
        disabled={!isValidSelection || isAdding}
        variant="primary"
        className="w-full h-12 !bg-brand-magenta hover:!bg-brand-magenta/90 !border-brand-magenta font-display tracking-widest !text-sm !rounded-none"
        isLoading={isAdding}
      >
        {isValidSelection ? "AGREGAR PAQUETE AL CARRITO" : "COMPLETA LA SELECCIÓN"}
      </Button>

      <p className="text-center text-xs text-grey-40 tracking-wide">
        Garantía de satisfacción 30 días · Envío gratis
      </p>
    </div>
  )
}

export default BundleAwareActions
