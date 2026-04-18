import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import FeaturedProducts from "@modules/home/components/featured-products"
import QuoteBand from "@modules/home/components/quote-band"
import IngredientsShowcase from "@modules/home/components/ingredients-showcase"
import ComparisonTable from "@modules/home/components/comparison-table"
import Testimonials from "@modules/home/components/testimonials"
import FaqSection from "@modules/home/components/faq-section"
import CtaBand from "@modules/home/components/cta-band"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "We Now",
  description: "Bienestar que sí te cumple",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)
  const { collections } = await listCollections({ fields: "id, handle, title" })

  if (!region) return null

  return (
    <>
      <Hero />
      <QuoteBand />
      <FeaturedProducts collections={collections ?? []} region={region} />
      <IngredientsShowcase />
      <ComparisonTable />
      <Testimonials />
      <FaqSection />
      <CtaBand />
    </>
  )
}
