import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import MarketingMaterialsClient from "./MarketingMaterialsClient"

export const metadata: Metadata = {
  title: "Oficina Virtual - Materiales de Marketing",
  description: "Herramientas para duplicación y crecimiento de tu negocio",
}

export default async function MarketingMaterialsPage() {
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) notFound()

  const netmeProfileId = customer?.metadata?.netme_profile_id

  return (
    <div id="marketing-materials-page">
      {netmeProfileId ? (
        <MarketingMaterialsClient netmeProfileId={Number(netmeProfileId)} />
      ) : (
        <div className="relative p-8">
          <h1 className="text-2xl font-bold mb-2">Materiales de Marketing</h1>
          <p className="text-sm text-gray-500 mb-8">
            Herramientas para duplicación y crecimiento de tu negocio.
          </p>
          <p>No se encontró el netme_profile_id.</p>
        </div>
      )}
    </div>
  )
} 