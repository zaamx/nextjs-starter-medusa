"use client"
import React, { useState } from "react"
import { Table } from "@medusajs/ui"

interface NetworkOrder {
  profiles_id: number
  periods_id: number
  order_display: number
  buyer_profile: number
  is_first_sale: boolean
  is_subscription: boolean | null
  cv: number
  qv: number; // ADDED: Se agregó la propiedad qv.
  profile_id: string; // ADDED: Se agregó la propiedad profile_id.
  sponsor_id: string; // ADDED: Se agregó la propiedad sponsor_id.
  transaction_date: string
  depth: number
  position: number
}

interface OrdersTableProps {
  networkOrdersData: NetworkOrder[]
  error: string | null
}

const OrdersTable: React.FC<OrdersTableProps> = ({ networkOrdersData, error }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Calculate pagination
  const totalPages = Math.ceil(networkOrdersData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = networkOrdersData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const PaginationControls = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        }
      }
      
      return pages
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Mostrando {startIndex + 1} a {Math.min(endIndex, networkOrdersData.length)} de {networkOrdersData.length} órdenes
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-1 text-sm border rounded-md ${
                page === currentPage
                  ? 'bg-blue-500 text-white border-blue-500'
                  : page === '...'
                  ? 'border-transparent cursor-default'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-gray-900">Órdenes del Periodo</div>
        <span className="text-xs text-gray-500">{networkOrdersData.length} órdenes</span>
      </div>
      {error ? (
        <div className="text-center py-4 text-red-600">
          <div className="font-medium">Error cargando órdenes</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      ) : networkOrdersData.length > 0 ? (
        <div className="overflow-x-auto">
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-2">
            {currentOrders.map((order, idx) => (
              <div key={startIndex + idx} className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">#{order.order_display}</span>
                  <span className="text-xs font-bold">{(order.cv || 0).toLocaleString()} CV / {(order.qv || 0).toLocaleString()} QV</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  <span className="mr-2">Profundidad: {order.depth}</span>
                  <span>Posición: {order.position === 0 ? 'Izquierda' : 'Derecha'}</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  <span className="mr-2">Profile ID: {order.profile_id}</span>
                  <span>Patrocinador: {order.sponsor_id}</span>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${order.is_first_sale ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {order.is_first_sale ? 'Primera Venta' : 'Re-orden'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${order.is_subscription ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {order.is_subscription ? 'Autoenvío' : 'Manual'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell className="text-xs">Orden</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">ID</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Patrocinador</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Profundidad</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Posición</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Primera Venta</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Autoenvío</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">CV</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">QV</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {currentOrders.map((order, idx) => (
                  <Table.Row key={startIndex + idx} className="hover:bg-gray-50">
                    <Table.Cell className="text-xs font-medium">#{order.order_display}</Table.Cell>
                    <Table.Cell className="text-xs">{order.buyer_profile}</Table.Cell>
                    <Table.Cell className="text-xs">{order.profiles_id}</Table.Cell>
                    <Table.Cell className="text-xs">{order.depth}</Table.Cell>
                    <Table.Cell className="text-xs">
                      <span className={`px-2 py-1 rounded-full text-xs ${order.position === 0 ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                        {order.position === 0 ? 'Izquierda' : 'Derecha'}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      <span className={`px-2 py-1 rounded-full text-xs ${order.is_first_sale ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {order.is_first_sale ? 'Sí' : 'No'}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-xs">
                      <span className={`px-2 py-1 rounded-full text-xs ${order.is_subscription ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {order.is_subscription ? 'Sí' : 'No'}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-xs font-bold">{(order.cv || 0).toLocaleString()}</Table.Cell>
                    <Table.Cell className="text-xs font-bold">{(order.qv || 0).toLocaleString()}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          
          <PaginationControls />
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No hay órdenes en este periodo
        </div>
      )}
    </div>
  )
}

export default OrdersTable