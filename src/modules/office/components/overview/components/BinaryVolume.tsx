"use client"
import React from "react"

interface BinaryLegVolume {
  cv_week_left: number
  cv_week_right: number
  cv_period_left: number
  cv_period_right: number
  bank_prev_left: number
  bank_prev_right: number
  carry_left: number
  carry_right: number
  pairs_paid: number
  pairs_pending: number
}

interface BinaryVolumeProps {
  binaryData: BinaryLegVolume | null
  error: string | null
}

const BinaryVolume: React.FC<BinaryVolumeProps> = ({ binaryData, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl shadow p-4 border border-red-200">
        <div className="font-bold text-red-600 mb-2">Error cargando volumen binario</div>
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (!binaryData) {
    return (
      <div className="bg-gray-50 rounded-2xl shadow p-4 border border-gray-200">
        <div className="font-bold text-gray-600 mb-2">Volumen Binario</div>
        <div className="text-sm text-gray-700">No hay datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="font-bold text-gray-900 mb-3">Volumen Binario</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pierna Izquierda */}
        <div className="text-center">
          <div className="text-sm text-gray-500">Pierna Izquierda</div>
          <div className="text-lg font-bold text-blue-600">
            {(binaryData.cv_week_left || 0).toLocaleString()} CV
          </div>
          <div className="text-xs text-gray-400">Volumen del período</div>
          <div className="text-lg font-bold text-orange-600">
            {(binaryData.bank_prev_left || 0).toLocaleString()} CV
          </div>
          <div className="text-xs text-orange-600">Banco Binario</div>
          <div className="text-lg font-bold text-blue-600">
            {(binaryData.cv_period_left || 0).toLocaleString()} CV
          </div>
          <div className="text-xs text-gray-400">Volumen para Puntos</div>
          <div className="text-lg font-bold text-purple-600">
            {(binaryData.carry_left || 0).toLocaleString()} CV
          </div>
          <div className="text-xs text-purple-600">Acumulados al Banco Binario</div>
        </div>

        {/* Pierna Derecha */}
        <div className="text-center">
          <div className="text-sm text-gray-500">Pierna Derecha</div>
          <div className="text-lg font-bold text-blue-600">
            {(binaryData.cv_week_right || 0).toLocaleString()} CV
          </div>
          <div className="text-xs text-gray-400">Volumen del período</div>
          <div className="text-lg font-bold text-orange-600">
            {(binaryData.bank_prev_right || 0).toLocaleString()} CV
          </div>
          <div className="text-xs text-orange-600">Banco Binario</div>
          <div className="text-lg font-bold text-blue-600">
            {(binaryData.cv_period_right || 0).toLocaleString()} CV
          </div>
          <div className="text-xs text-gray-400">Volumen para Puntos</div>
          <div className="text-lg font-bold text-purple-600">
            {(binaryData.carry_right || 0).toLocaleString()} CV
          </div>
          <div className="text-xs text-purple-600">Acumulados al Banco Binario</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-600 gap-1">
          <span><strong>Puntos pagados:</strong> {(binaryData.pairs_paid || 0).toLocaleString()}</span>
          <span><strong>Puntos pendientes:</strong> {(binaryData.pairs_pending || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

export default BinaryVolume
