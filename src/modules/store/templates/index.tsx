import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "./paginated-products"

const DEFAULT_SORT: SortOptions = "default"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy ?? DEFAULT_SORT

  return (
    <div className="min-h-screen bg-grey-5" data-testid="category-container">
      {/* Page header */}
      <div className="bg-white border-b border-grey-20">
        <div className="content-container py-20 text-center">
          <p className="text-xs tracking-[0.3em] text-grey-50 uppercase mb-4">
            Todos los Productos
          </p>
          <h1
            className="font-display text-grey-90"
            style={{ fontSize: "clamp(48px, 6vw, 96px)" }}
            data-testid="store-page-title"
          >
            NUESTRAS FÓRMULAS
          </h1>
          <p className="mt-4 text-grey-50 max-w-lg mx-auto text-sm leading-relaxed">
            Cada fórmula está diseñada para una etapa específica de vida. Encuentra la tuya.
          </p>
        </div>
      </div>

      {/* Filter bar — sticky below nav (nav is static, so top-0) */}
      <div className="sticky top-0 z-40 bg-white border-b border-grey-20">
        <div className="content-container">
          <div className="flex items-center justify-end py-3">
            <RefinementList sortBy={sort} />
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="content-container py-16">
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts sortBy={sort} page={pageNumber} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
