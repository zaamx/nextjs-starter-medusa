"use client"
import React, { useState } from "react"
import { Table } from "@medusajs/ui"

interface NetworkOrder {
  profiles_id: number
  periods_id: number
  order_display: number
  buyer_profile: number
  unilevel_sponsor_id: number
  is_first_sale: boolean
  is_subscription: boolean | null
  cv: number
  qv: number;
  profile_id: string;
  sponsor_id: string;
  transaction_date: string
  depth: number
  position: number
}

interface NetworkActivity {
  period_id: number
  period_name: string
  new_orders: number
  reorders: number
  autoship_orders: number
  autoship_pct: string
  avg_ticket_cv: string
}

interface OrdersTableProps {
  networkOrdersData: NetworkOrder[]
  networkActivityData?: NetworkActivity
  error: string | null
}

const OrdersTable: React.FC<OrdersTableProps> = ({ networkOrdersData, networkActivityData, error }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const isDark = false

  // Lógica de paginación
  const totalPages = Math.ceil(networkOrdersData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = networkOrdersData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const PaginationControls = () => {
    if (totalPages <= 1) return null
    return (
      <div className={`flex items-center border-t ${isDark ? 'border-stone-800' : ''} pt-3 mt-2 text-sm ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>
        {/* Left: page info + rows selector */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs">Página {currentPage} de {totalPages}</span>
          <span className={`${isDark ? 'text-stone-700' : 'text-gray-300'} select-none`}>|</span>
          <span className="text-xs">Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
            className={`text-xs border ${isDark ? 'border-stone-700 bg-stone-900 text-stone-300' : 'border-gray-200 bg-white'} rounded px-1.5 py-0.5 focus:outline-none cursor-pointer`}
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Right: Anterior / Siguiente */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`text-xs flex items-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed ${isDark ? 'hover:text-stone-200' : 'hover:text-gray-900'}`}
          >
            ‹ Anterior
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`text-xs flex items-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed ${isDark ? 'hover:text-stone-200' : 'hover:text-gray-900'}`}
          >
            Siguiente ›
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isDark ? 'bg-stone-800/40 border-stone-800/50 border' : 'bg-white'} rounded-2xl shadow p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'}`}>Órdenes del Periodo</div>
        <span className={`text-xs ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>{networkOrdersData.length} órdenes</span>
      </div>

      {/* Summary Cards */}
      {networkActivityData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#181C2B]' : 'bg-blue-50'}`}>
            <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#4F8DDB]' : 'text-blue-500'}`}>Nuevas<br />Inscripciones</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>{networkActivityData.new_orders}</div>
          </div>
          <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#132219]' : 'bg-green-50'}`}>
            <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#27B151]' : 'text-green-500'}`}>Re-órdenes<br />&nbsp;</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-green-800'}`}>{networkActivityData.reorders}</div>
          </div>
          <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#28183A]' : 'bg-purple-50'}`}>
            <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#B66BD8]' : 'text-purple-500'}`}>Autoenvío<br />({networkActivityData.autoship_pct}%)</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-purple-800'}`}>{networkActivityData.autoship_orders}</div>
          </div>
          <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#311E15]' : 'bg-orange-50'}`}>
            <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#E78229]' : 'text-orange-500'}`}>Ticket<br />Promedio</div>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-orange-800'}`}>
              {networkActivityData.avg_ticket_cv}
              <span className={`text-sm font-normal ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>CV</span>
            </div>
          </div>
        </div>
      )}
      {error ? (
        <div className={`text-center py-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <div className="font-medium">Error cargando órdenes</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      ) : networkOrdersData.length === 0 ? (
        <div className={`text-center py-6 text-sm ${isDark ? 'text-stone-500' : 'text-gray-500'}`}>
          No hay órdenes para este periodo
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Desktop/Mobile Table View */}
          <div className="min-w-max">
            <Table>
              <Table.Header>
                <Table.Row className={isDark ? 'border-stone-800' : ''}>
                  <Table.HeaderCell className={`text-xs ${isDark ? 'text-stone-400' : ''}`}>Orden</Table.HeaderCell>
                  <Table.HeaderCell className={`text-xs ${isDark ? 'text-stone-400' : ''}`}>ID</Table.HeaderCell>
                  <Table.HeaderCell className={`text-xs ${isDark ? 'text-stone-400' : ''}`}>Patrocinador</Table.HeaderCell>
                  <Table.HeaderCell className={`text-xs ${isDark ? 'text-stone-400' : ''}`}>Profundidad</Table.HeaderCell>
                  <Table.HeaderCell className={`text-xs ${isDark ? 'text-stone-400' : ''}`}>Posición</Table.HeaderCell>
                  <Table.HeaderCell className={`text-xs ${isDark ? 'text-stone-400' : ''}`}>Primera Venta</Table.HeaderCell>
                  <Table.HeaderCell className={`text-xs ${isDark ? 'text-stone-400' : ''}`}>Autoenvío</Table.HeaderCell>
                  <Table.HeaderCell className={`text-xs ${isDark ? 'text-stone-400' : ''}`}>CV</Table.HeaderCell>
                  <Table.HeaderCell className={`text-xs ${isDark ? 'text-stone-400' : ''}`}>QV</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {currentOrders.map((order, idx) => (
                  <Table.Row key={idx} className={`${isDark ? 'hover:bg-stone-800/30 border-stone-800/50' : 'hover:bg-gray-50'}`}>
                    <Table.Cell className={`text-xs font-medium ${isDark ? 'text-stone-300' : ''}`}>#{order.order_display}</Table.Cell>
                    <Table.Cell className={`text-xs ${isDark ? 'text-stone-300' : ''}`}>{order.buyer_profile}</Table.Cell>
                    <Table.Cell className={`text-xs ${isDark ? 'text-stone-300' : ''}`}>{order.unilevel_sponsor_id}</Table.Cell>
                    <Table.Cell className={`text-xs ${isDark ? 'text-stone-300' : ''}`}>{order.depth}</Table.Cell>
                    <Table.Cell className="text-xs">
                      <span className={`px-2 py-1 rounded-full text-xs ${order.position === 0 ? (isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' : 'bg-blue-100 text-blue-800') : (isDark ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' : 'bg-orange-100 text-orange-800')}`}>
                        {order.position === 0 ? 'Izquierda' : 'Derecha'}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      <span className={`px-2 py-1 rounded-full text-xs ${order.is_first_sale ? (isDark ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 'bg-green-100 text-green-800') : (isDark ? 'bg-stone-800 border-stone-700 text-stone-300 border' : 'bg-gray-100 text-gray-800')}`}>
                        {order.is_first_sale ? 'Sí' : 'No'}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      <span className={`px-2 py-1 rounded-full text-xs ${order.is_subscription ? (isDark ? 'bg-purple-900/30 text-purple-400 border border-purple-900/50' : 'bg-purple-100 text-purple-800') : (isDark ? 'bg-stone-800 border-stone-700 text-stone-300 border' : 'bg-gray-100 text-gray-800')}`}>
                        {order.is_subscription ? 'Sí' : 'No'}
                      </span>
                    </Table.Cell>
                    <Table.Cell className={`text-xs font-bold ${isDark ? 'text-stone-200' : ''}`}>{(order.cv || 0).toLocaleString()}</Table.Cell>
                    <Table.Cell className={`text-xs font-bold ${isDark ? 'text-stone-200' : ''}`}>{(order.qv || 0).toLocaleString()}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          <PaginationControls />
        </div>
      )}
    </div>
  )
}

export default OrdersTable