"use client"

import React, { useState, useEffect } from "react"
import { useOffice } from "@lib/context/office-context"
import { fetchMemberOwnOrders } from "@lib/data/netme_network"
import OrderOverview from "@modules/account/components/order-overview"
import { FaShoppingCart, FaCoins, FaUserPlus, FaSyncAlt } from "react-icons/fa"

interface NetworkOrder {
  profiles_id: number
  periods_id: number
  order_display: number
  buyer_profile: number
  unilevel_sponsor_id: number
  is_first_sale: boolean
  is_subscription: boolean | null
  cv: number
  qv: number
  transaction_date: string
  depth: number
  position: number
}

interface CustomerOwnOrdersProps {
  customer: any
  storeOrders: any[]
}

export default function CustomerOwnOrders({ customer, storeOrders }: CustomerOwnOrdersProps) {
  const { periods } = useOffice()
  const [orders, setOrders] = useState<NetworkOrder[]>([])
  const [loading, setLoading] = useState(true)

  const netmeProfileId = (customer?.metadata as any)?.netme_profile_id

  useEffect(() => {
    const loadOrders = async () => {
      if (!netmeProfileId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await fetchMemberOwnOrders(Number(netmeProfileId))
        if (result.success) {
          setOrders(result.data || [])
        }
      } catch (err) {
        console.error("Error loading own orders:", err)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [netmeProfileId])

  const totalCV = orders.reduce((sum, order) => sum + (order.cv || 0), 0)
  const totalQV = orders.reduce((sum, order) => sum + (order.qv || 0), 0)
  const firstSales = orders.filter(o => o.is_first_sale).length
  const reorders = orders.filter(o => !o.is_first_sale).length

  const getPeriodName = (periodId: number) => {
    const period = periods.find(p => p.id === periodId)
    return period ? period.name : `Período ${periodId}`
  }

  // Create lookup map mapping friendly order_display to the full network record enriched with period_name
  const networkOrdersMap: Record<number, any> = {}
  orders.forEach(o => {
    networkOrdersMap[o.order_display] = {
      ...o,
      period_name: getPeriodName(o.periods_id)
    }
  })

  if (!netmeProfileId) {
    return (
      <div className="space-y-4">
        <OrderOverview orders={storeOrders} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
            <FaShoppingCart className="text-xs" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Propias</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {loading ? <span className="text-sm font-normal text-gray-300">...</span> : orders.length}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
            <FaCoins className="text-xs text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">CV Acumulado</span>
          </div>
          <div className="text-2xl font-extrabold text-blue-600">
            {loading ? <span className="text-sm font-normal text-gray-300">...</span> : `${totalCV.toLocaleString()} CV`}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
            <FaCoins className="text-xs text-purple-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">QV Acumulado</span>
          </div>
          <div className="text-2xl font-extrabold text-purple-600">
            {loading ? <span className="text-sm font-normal text-gray-300">...</span> : `${totalQV.toLocaleString()} QV`}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
            <FaUserPlus className="text-xs text-green-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Inscripciones</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {loading ? <span className="text-sm font-normal text-gray-300">...</span> : firstSales}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
            <FaSyncAlt className="text-xs text-orange-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Re-órdenes</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {loading ? <span className="text-sm font-normal text-gray-300">...</span> : reorders}
          </div>
        </div>
      </div>

      {/* Main Single Combined List View */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-gray-900">Historial de Compras & Despachos</h2>
          <p className="text-xs text-gray-500">
            Seguimiento de tus compras despachadas con sus respectivas métricas de red y volumen comisionable.
          </p>
        </div>
        
        <OrderOverview orders={storeOrders} networkOrdersMap={networkOrdersMap} />
      </div>
    </div>
  )
}
