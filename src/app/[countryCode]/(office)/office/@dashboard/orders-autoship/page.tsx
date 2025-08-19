import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Órdenes",
  description: "Resumen de tus órdenes anteriores.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full p-8" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ordenes
        </h1>
        <p className="text-base-regular">
          Consulta tus órdenes anteriores y su estado. También puedes hacer
          devoluciones o cambios si es necesario.
        </p>
      </div>
      <div>
        <OrderOverview orders={orders} />
        <Divider className="my-16" />
        <TransferRequestForm />
      </div>
    </div>
  )
}
