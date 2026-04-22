import React, { useState } from "react"
import { Table, Select, Button, clx } from "@medusajs/ui"

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
  profile_id: string
  sponsor_id: string
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
  networkActivity?: NetworkActivity | undefined
  error: string | null
  activityError?: string | null
}

const OrdersTable: React.FC<OrdersTableProps> = ({ 
  networkOrdersData, 
  networkActivity,
  error,
  activityError 
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Calculate pagination
  const totalItems = networkOrdersData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = networkOrdersData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (val: string) => {
    setItemsPerPage(Number(val))
    setCurrentPage(1)
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-gray-900 text-lg">Órdenes del Periodo</h2>
        <span className="text-xs font-medium text-gray-400">{totalItems} órdenes</span>
      </div>

      {/* Activity Summary Cards */}
      {(networkActivity || activityError) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-blue-50/50 rounded-2xl p-4 text-center border border-blue-50">
            <div className="text-xs font-bold text-blue-500 uppercase mb-1">Nuevas Inscripciones</div>
            <div className="text-lg font-bold text-blue-700 leading-none">
              {networkActivity?.new_orders ?? '0'}
            </div>
          </div>
          <div className="bg-green-50/50 rounded-2xl p-4 text-center border border-green-50">
            <div className="text-xs font-bold text-green-500 uppercase mb-1">Re-órdenes</div>
            <div className="text-lg font-bold text-green-700 leading-none">
              {networkActivity?.reorders ?? '0'}
            </div>
          </div>
          <div className="bg-purple-50/50 rounded-2xl p-4 text-center border border-purple-50">
            <div className="text-xs font-bold text-purple-500 uppercase mb-1">
              Autoenvío ({networkActivity?.autoship_pct ?? '0'}%)
            </div>
            <div className="text-lg font-bold text-purple-700 leading-none">
              {networkActivity?.autoship_orders ?? '0'}
            </div>
          </div>
          <div className="bg-orange-50/50 rounded-2xl p-4 text-center border border-orange-50">
            <div className="text-xs font-bold text-orange-500 uppercase mb-1">Ticket Promedio</div>
            <div className="text-lg font-bold text-orange-700 leading-none">
              {networkActivity?.avg_ticket_cv ?? '0'} <span className="text-sm font-bold text-gray-400 ml-0.5">CV</span>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="text-center py-10 text-red-500">
          <div className="font-bold mb-1">Error cargando órdenes</div>
          <div className="text-sm opacity-75">{error}</div>
        </div>
      ) : totalItems > 0 ? (
        <div className="overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto -mx-1 px-1">
            <Table className="min-w-full">
              <Table.Header className="bg-gray-50/50 rounded-lg">
                <Table.Row className="border-none">
                  <Table.HeaderCell className="text-xs font-bold text-gray-900 uppercase py-4 pl-4">Orden</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-bold text-gray-900 uppercase py-4">ID</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-bold text-gray-900 uppercase py-4">Patrocinador</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-bold text-gray-900 uppercase py-4">Profundidad</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-bold text-gray-900 uppercase py-4">Posición</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-bold text-gray-900 uppercase py-4">Primera Venta</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-bold text-gray-900 uppercase py-4 pr-4">Autoenvío</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {currentOrders.map((order, idx) => (
                  <Table.Row key={idx} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                    <Table.Cell className="text-xs font-bold text-gray-900 py-4 pl-4">#{order.order_display}</Table.Cell>
                    <Table.Cell className="text-xs font-medium text-gray-600 py-4">{order.buyer_profile}</Table.Cell>
                    <Table.Cell className="text-xs font-medium text-gray-600 py-4">{order.unilevel_sponsor_id}</Table.Cell>
                    <Table.Cell className="text-xs font-medium text-gray-600 py-4">{order.depth}</Table.Cell>
                    <Table.Cell className="py-4">
                      <span className={clx(
                        "inline-flex px-3 py-1 rounded-xl text-xs font-semibold",
                        order.position === 0 ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {order.position === 0 ? 'Izquierda' : 'Derecha'}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="py-4">
                      <span className={clx(
                        "inline-flex px-3 py-1 rounded-xl text-xs font-semibold",
                        order.is_first_sale ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                      )}>
                        {order.is_first_sale ? 'Sí' : 'No'}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="py-4 pr-4">
                      <span className={clx(
                        "inline-flex px-3 py-1 rounded-xl text-xs font-semibold",
                        order.is_subscription ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-400"
                      )}>
                        {order.is_subscription ? 'Sí' : 'No'}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {/* New Pagination */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-gray-600 px-1">
            <div className="flex items-center gap-6">
              <div className="font-medium text-gray-400">
                Página <span className="text-gray-900 font-bold">{currentPage}</span> de <span className="text-gray-900 font-bold">{totalPages}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-400">Mostrar:</span>
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                  <Select.Trigger className="w-20 h-8 rounded-lg border-gray-100 font-bold text-gray-900">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {[10, 25, 50].map((val) => (
                      <Select.Item key={val} value={String(val)}>
                        {val}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 font-bold text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ‹ Anterior
              </button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 font-bold text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente ›
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          No hay órdenes en este periodo
        </div>
      )}
    </div>
  )
}

export default OrdersTable
