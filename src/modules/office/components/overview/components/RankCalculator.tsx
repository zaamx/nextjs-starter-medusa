"use client"
import React from "react"
import { FaBell } from "react-icons/fa"

interface RankProgress {
  current_rank: string
  next_rank: string
  qv_total: number
  qv_needed: number
  qv_missing: number
  active_left: number | null
  act_left_needed: number
  act_left_missing: number
  active_right: number | null
  act_right_needed: number
  act_right_missing: number
  cutoff: string
}

interface RankCalculatorProps {
  rankData: RankProgress[]
  error: string | null
  onShowModal: () => void
}

const RankCalculator: React.FC<RankCalculatorProps> = ({ rankData, error, onShowModal }) => {
  // Calculate rank progress percentage with error handling
  const getRankProgress = () => {
    if (error) {
      return { percent: 0, missing: "Error cargando datos de rango" }
    }
    
    if (!rankData || rankData.length === 0) {
      return { percent: 0, missing: "Cargando datos..." }
    }

    const currentRank = rankData[0]
    const totalNeeded = currentRank.qv_needed + currentRank.act_left_needed + currentRank.act_right_needed
    const totalMissing = currentRank.qv_missing + currentRank.act_left_missing + currentRank.act_right_missing
    const completed = totalNeeded - totalMissing
    const percent = totalNeeded > 0 ? Math.round((completed / totalNeeded) * 100) : 0

    let missingText = ""
    if (currentRank.qv_missing > 0) {
      missingText += `Te faltan ${(currentRank.qv_missing || 0).toLocaleString()} QV`
    }
    if (currentRank.act_left_missing > 0) {
      missingText += missingText ? ` y ${currentRank.act_left_missing} directo izquierdo` : `Te faltan ${currentRank.act_left_missing} directo izquierdo`
    }
    if (currentRank.act_right_missing > 0) {
      missingText += missingText ? ` y ${currentRank.act_right_missing} directo derecho` : `Te faltan ${currentRank.act_right_missing} directo derecho`
    }

    return { percent, missing: missingText || "¡Completaste todos los requisitos!" }
  }

  const rankProgress = getRankProgress()

  if (error) {
    return (
      <div className="rounded-2xl p-4 sm:p-6 shadow-lg bg-red-100 border border-red-300 text-red-800">
        <div className="flex items-center gap-2">
          <FaBell className="text-red-600" />
          <div className="font-bold">Error cargando calculadora de avance</div>
        </div>
        <div className="text-sm mt-2">{error}</div>
      </div>
    )
  }

  if (!rankData || rankData.length === 0) {
    return (
      <div className="rounded-2xl p-4 sm:p-6 shadow-lg bg-gray-100 border border-gray-300 text-gray-600">
        <div className="font-bold">Calculadora de Avance</div>
        <div className="text-sm mt-2">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-4 sm:p-6 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
        <div>
          <div className="text-base sm:text-lg font-bold">Calculadora de Avance</div>
          <div className="text-xs font-medium">
            Rango actual: <span className="font-bold">{rankData[0].current_rank}</span> &rarr; Meta: <span className="font-bold">{rankData[0].next_rank}</span>
          </div>
        </div>
        <button 
          onClick={onShowModal} 
          className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow self-start sm:self-auto"
        >
          Ver requisitos
        </button>
      </div>
      <div className="w-full bg-white/30 rounded-full h-3 mt-2 mb-1">
        <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${rankProgress.percent}%` }} />
      </div>
      <div className="text-xs font-semibold mt-1">{rankProgress.percent}% hacia el siguiente rango</div>
      <div className="text-sm mt-2 font-medium">{rankProgress.missing}</div>
      <div className="text-xs text-white">Al menos 70% del volumen debe provenir del lado de construcción, y 30% del lado del derrame.</div>
    </div>
  )
}

export default RankCalculator
