"use client"
import React from "react"
import { Table } from "@medusajs/ui"

interface NetworkOrder {
  profiles_id: number
  periods_id: number
  order_display: number
  buyer_profile: number
  is_first_sale: boolean
  is_subscription: boolean | null
  cv: number
  transaction_date: string
  depth: number
  position: number
}

interface OrdersTableProps {
  networkOrdersData: NetworkOrder[]
  error: string | null
}

const OrdersTable: React.FC<OrdersTableProps> = ({ networkOrdersData, error }) => {
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
            {networkOrdersData.slice(0, 5).map((order, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">#{order.order_display}</span>
                  <span className="text-xs font-bold">{order.cv.toLocaleString()} CV</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  Profundidad: {order.depth} | Posición: {order.position === 0 ? 'Izquierda' : 'Derecha'}
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${order.is_first_sale ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {order.is_first_sale ? 'Primera Venta' : 'Re-orden'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${order.is_subscription ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {order.is_subscription ? 'Autoship' : 'Manual'}
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
                  <Table.HeaderCell className="text-xs">Profundidad</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Posición</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Primera Venta</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">Autoship</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs">CV</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {networkOrdersData.slice(0, 5).map((order, idx) => (
                  <Table.Row key={idx} className="hover:bg-gray-50">
                    <Table.Cell className="text-xs font-medium">#{order.order_display}</Table.Cell>
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
                    <Table.Cell className="text-xs font-bold">{order.cv.toLocaleString()}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          
          {networkOrdersData.length > 5 && (
            <div className="text-center mt-2">
              <span className="text-xs text-gray-500">
                Mostrando 5 de {networkOrdersData.length} órdenes
              </span>
            </div>
          )}
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
