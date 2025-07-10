import { Metadata } from "next"
import { notFound } from "next/navigation";
import { retrieveCustomer } from "@lib/data/customer";
import UnilevelNetworkWidget from "@modules/office/components/unilevel/UnilevelNetworkWidget";

export const metadata: Metadata = {
  title: "Oficina Virtual - Genealogía Unilevel",
  description: "Información de tu genealogía unilevel",
}

export default async function UnilevelGenealogyPage() {
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) notFound()

  const netmeProfileId = customer?.metadata?.netme_profile_id

  return (
    <div>
      {netmeProfileId ? (
        <UnilevelNetworkWidget netmeProfileId={Number(netmeProfileId)} />
      ) : (
        <p>No se encontró el netme_profile_id.</p>
      )}
    </div>
  )
} 