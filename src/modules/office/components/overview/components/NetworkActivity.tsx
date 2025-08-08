"use client"
import React from "react"

interface NetworkActivity {
  period_id: number
  period_name: string
  new_orders: number
  reorders: number
  autoship_orders: number
  autoship_pct: string
  avg_ticket_cv: string
}

interface NetworkActivityProps {
  currentPeriodActivity: NetworkActivity | undefined
  error: string | null
}

const NetworkActivityComponent: React.FC<NetworkActivityProps> = ({ currentPeriodActivity, error }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="font-bold text-gray-900 mb-3">Actividad de la Red</div>
      {error ? (
        <div className="text-center py-4 text-red-600">
          <div className="font-medium">Error cargando actividad de la red</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      ) : currentPeriodActivity ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{currentPeriodActivity.new_orders}</div>
            <div className="text-xs text-gray-500">Nuevas Inscripciones</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{currentPeriodActivity.reorders}</div>
            <div className="text-xs text-gray-500">Re-órdenes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{currentPeriodActivity.autoship_orders}</div>
            <div className="text-xs text-purple-600">Autoship ({currentPeriodActivity.autoship_pct}%)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{currentPeriodActivity.avg_ticket_cv} CV</div>
            <div className="text-xs text-gray-500">Ticket Promedio</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No hay datos de actividad para este periodo
        </div>
      )}
    </div>
  )
}

export default NetworkActivityComponent
