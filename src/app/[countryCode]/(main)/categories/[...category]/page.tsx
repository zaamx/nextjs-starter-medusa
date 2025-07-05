import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories()

    if (!product_categories) {
      return []
    }

    const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    const categoryHandles = product_categories.map(
      (category: any) => category.handle
    )

    const staticParams = countryCodes
      ?.map((countryCode: string | undefined) =>
        categoryHandles.map((handle: any) => ({
          countryCode,
          category: [handle],
        }))
      )
      .flat()

    return staticParams || []
  } catch (error) {
    console.error('Error generating static params for categories:', error)
    // Return fallback params to prevent build failure
    return [
      { countryCode: 'us', category: ['default'] },
      { countryCode: 'ca', category: ['default'] },
      { countryCode: 'mx', category: ['default'] }
    ]
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    if (!productCategory) {
      notFound()
    }

    const title = productCategory.name + " | We Now"

    const description = productCategory.description ?? `${title} category.`

    return {
      title: `${title} | We Now`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  try {
    const searchParams = await props.searchParams
    const params = await props.params
    const { sortBy, page } = searchParams

    const productCategory = await getCategoryByHandle(params.category)

    if (!productCategory) {
      notFound()
    }

    return (
      <CategoryTemplate
        category={productCategory}
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
      />
    )
  } catch (error) {
    console.error('Error in CategoryPage:', error)
    notFound()
  }
}
