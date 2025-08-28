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
    <div className="flex flex-col py-6 content-container" data-testid="category-container">
      
      <div className="flex justify-between items-center mb-6 w-full">
        <h1 className="text-2xl-semi" data-testid="store-page-title">
          Todos los productos
        </h1>

        <RefinementList sortBy={sort} />
      </div>

      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts sortBy={sort} page={pageNumber} countryCode={countryCode} />
      </Suspense>
    </div>
  )
}

export default StoreTemplate