"use client"
import React from "react"

interface UnilevelLevelVolume {
  level: number
  cv_total: number
  actives: number
  inactives: number
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
      <div className="font-bold text-gray-900 mb-3">Volumen Unilevel</div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {unilevelData.slice(0, 5).map((level, idx) => {
          // Unilevel commission percentages
          const commissionPercentages = [5, 25, 10, 5, 5]
          const percentage = commissionPercentages[level.level - 1] || 0
          
          return (
            <div key={idx} className="text-center">
              <div className="text-xs text-gray-500">Nivel {level.level}</div>
              <div className="text-sm font-bold text-gray-900">{(level.cv_total || 0).toLocaleString()}</div>
              <div className="text-xs text-blue-600 font-semibold">{percentage}%</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UnilevelVolume
