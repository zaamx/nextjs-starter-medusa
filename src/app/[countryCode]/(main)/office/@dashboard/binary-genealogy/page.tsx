
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import BinaryNetworkWidget from "@modules/office/components/binary/BinaryNetworkWidget"

export const metadata: Metadata = {
  title: "Oficina Virtual - Genealogía Binaria",
  description: "Información de tu genealogía binaria",
}

export default async function BinaryGenealogyPage() {
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) notFound()

  const netmeProfileId = customer?.metadata?.netme_profile_id

  return (
    <div>
      {netmeProfileId ? (
        <BinaryNetworkWidget netmeProfileId={Number(netmeProfileId)} />
      ) : (
        <p>No se encontró el netme_profile_id.</p>
      )}
    </div>
  )
}


