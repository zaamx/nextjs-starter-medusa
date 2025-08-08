"use client"
import dynamic from "next/dynamic"
import { HttpTypes } from "@medusajs/types"

// Dynamically import the Overview component with SSR disabled
const Overview = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando oficina virtual...</p>
      </div>
    </div>
  )
})

type OverviewWrapperProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const OverviewWrapper: React.FC<OverviewWrapperProps> = ({ customer, orders }) => {
  return <Overview customer={customer} orders={orders} />
}

export default OverviewWrapper
