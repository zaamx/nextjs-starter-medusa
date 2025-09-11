"use client"
import React from "react"

interface UnilevelLevelVolume {
  level: number
  cv_total: number
  actives: number
  inactives: number
  cv_qualified: number
  usd_paid: string
  usd_expected_lvl: string
}

interface UnilevelVolumeProps {
  unilevelData: UnilevelLevelVolume[]
  error: string | null
}

const UnilevelVolume: React.FC<UnilevelVolumeProps> = ({ unilevelData, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl shadow p-4 border border-red-200">
        <div className="font-bold text-red-600 mb-2">Error cargando volumen unilevel</div>
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (!unilevelData || unilevelData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl shadow p-4 border border-gray-200">
        <div className="font-bold text-gray-600 mb-2">Volumen Unilevel</div>
        <div className="text-sm text-gray-700">No hay datos disponibles</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="font-bold text-gray-900 mb-4">Volumen Unilevel</div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="text-center bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-600 font-medium">CV Total</div>
          <div className="text-lg font-bold text-blue-900">
            {unilevelData.reduce((sum, level) => sum + (level.cv_total || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="text-center bg-green-50 rounded-lg p-3">
          <div className="text-xs text-green-600 font-medium">CV Calificado</div>
          <div className="text-lg font-bold text-green-900">
            {unilevelData.reduce((sum, level) => sum + (level.cv_qualified || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="text-center bg-purple-50 rounded-lg p-3">
          <div className="text-xs text-purple-600 font-medium">USD Pagado</div>
          <div className="text-lg font-bold text-purple-900">
            ${unilevelData.reduce((sum, level) => sum + parseFloat(level.usd_paid || '0'), 0).toFixed(2)}
          </div>
        </div>
        <div className="text-center bg-orange-50 rounded-lg p-3">
          <div className="text-xs text-orange-600 font-medium">USD Esperado</div>
          <div className="text-lg font-bold text-orange-900">
            ${unilevelData.reduce((sum, level) => sum + parseFloat(level.usd_expected_lvl || '0'), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Level Details */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-gray-700 mb-2">Detalles por Nivel</div>
        {unilevelData.slice(0, 5).map((level, idx) => {
          const usdPaid = parseFloat(level.usd_paid || '0')
          const usdExpected = parseFloat(level.usd_expected_lvl || '0')
          const efficiency = usdExpected > 0 ? (usdPaid / usdExpected * 100) : 0
          
          return (
            <div key={idx} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-gray-900">Nivel {level.level}</div>
                <div className="text-sm text-gray-600">
                  Eficiencia: <span className={`font-semibold ${efficiency >= 80 ? 'text-green-600' : efficiency >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {efficiency.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-gray-500">CV Total</div>
                  <div className="font-semibold text-gray-900">{(level.cv_total || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">CV Calificado</div>
                  <div className="font-semibold text-gray-900">{(level.cv_qualified || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Miembros</div>
                  <div className="font-semibold text-gray-900">
                    {(level.actives || 0) + (level.inactives || 0)}
                    <span className="text-green-600 ml-1">({level.actives || 0}A)</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">USD Pagado</div>
                  <div className="font-semibold text-gray-900">${usdPaid.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UnilevelVolume
