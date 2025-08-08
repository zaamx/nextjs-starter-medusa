import { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import OverviewWrapper from "@modules/office/components/overview/OverviewWrapper"

export const metadata: Metadata = {
  title: "Oficina Virtual",
  description: "Información de tu cuenta y actividades",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null

  if (!customer) {
    notFound()
  }

  return <OverviewWrapper customer={customer} orders={orders} />
}
