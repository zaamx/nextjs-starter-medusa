import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import InteractiveLink from "@modules/common/components/interactive-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="min-h-screen bg-grey-5" data-testid="category-container">
      {/* Page header */}
      <div className="bg-white border-b border-grey-20">
        <div className="content-container py-20 text-center">
          {parents.length > 0 && (
            <p className="text-xs tracking-[0.3em] text-grey-50 uppercase mb-4">
              {parents.map((parent, i) => (
                <span key={parent.id}>
                  <LocalizedClientLink
                    href={`/categories/${parent.handle}`}
                    className="hover:text-grey-90 transition-colors"
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  {i < parents.length - 1 && " / "}
                </span>
              ))}
            </p>
          )}
          <h1
            className="font-display text-grey-90"
            style={{ fontSize: "clamp(48px, 6vw, 96px)" }}
            data-testid="category-page-title"
          >
            {category.name.toUpperCase()}
          </h1>
          {category.description && (
            <p className="mt-4 text-grey-50 max-w-lg mx-auto text-sm leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-grey-20">
        <div className="content-container">
          <div className="flex items-center justify-end py-3">
            <RefinementList sortBy={sort} />
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {category.category_children && category.category_children.length > 0 && (
        <div className="content-container pt-8">
          <ul className="flex flex-wrap gap-3">
            {category.category_children.map((c) => (
              <li key={c.id}>
                <InteractiveLink href={`/categories/${c.handle}`}>
                  {c.name}
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Product grid */}
      <div className="content-container py-16">
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
