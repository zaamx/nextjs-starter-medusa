"use client"
import React from "react"

interface SpilloverVsBuild {
  side: string
  cv_personal: number
  cv_spillover: number
  cv_total: number
}

interface SpilloverVsBuildProps {
  spilloverData: SpilloverVsBuild[]
  error: string | null
}

const SpilloverVsBuildComponent: React.FC<SpilloverVsBuildProps> = ({ spilloverData, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl shadow p-4 border border-red-200">
        <div className="font-bold text-red-600 mb-2">Error cargando datos de derrame</div>
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (!spilloverData || spilloverData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl shadow p-4 border border-gray-200">
        <div className="font-bold text-gray-600 mb-2">Derrame vs. Construcción Propia</div>
        <div className="text-sm text-gray-700">No hay datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="font-bold text-gray-900 mb-3">Derrame vs. Construcción Propia</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {spilloverData.map((leg, idx) => (
          <div key={idx} className="text-center">
            <div className="text-sm text-gray-500">Pierna {leg.side === 'left' ? 'Izquierda' : 'Derecha'}</div>
            <div className="text-lg font-bold text-blue-600">{leg.cv_personal.toLocaleString()} CV</div>
            <div className="text-xs text-blue-600">Construcción propia</div>
            <div className="text-lg font-bold text-green-600">{leg.cv_spillover.toLocaleString()} CV</div>
            <div className="text-xs text-green-600">Derrame recibido de tus uplines</div>
            <div className="text-lg font-bold text-purple-600">
              {leg.cv_total.toLocaleString()} CV
            </div>
            <div className="text-xs text-purple-600">Total</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SpilloverVsBuildComponent
