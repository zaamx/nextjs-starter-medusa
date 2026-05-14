"use client"
import React from "react"
import { FaBell, FaTrophy } from "react-icons/fa"

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
  onShowRanksModal?: () => void
}

const RankCalculator: React.FC<RankCalculatorProps> = ({ rankData, error, onShowModal, onShowRanksModal }) => {
  const isDark = false // Not supported in storefront yet

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
      <div className={`rounded-2xl p-4 sm:p-6 shadow-lg ${isDark ? 'bg-red-900/10 border-red-900/50 text-red-400' : 'bg-red-100 border-red-300 text-red-800'} border`}>
        <div className="flex items-center gap-2">
          <FaBell className={`${isDark ? 'text-red-500' : 'text-red-600'}`} />
          <div className="font-bold">Error cargando calculadora de avance</div>
        </div>
        <div className="text-sm mt-2">{error}</div>
      </div>
    )
  }

  if (!rankData || rankData.length === 0) {
    return (
      <div className={`rounded-2xl p-4 sm:p-6 shadow-lg ${isDark ? 'bg-stone-800/40 border-stone-800/50 text-stone-300' : 'bg-gray-100 border-gray-300 text-gray-600'} border`}>
        <div className="font-bold">Calculadora de Avance</div>
        <div className="text-sm mt-2">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl p-4 sm:p-6 shadow-lg ${isDark ? 'bg-gradient-to-r from-blue-900/60 to-purple-900/60 border border-blue-900/30' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white relative overflow-hidden`}>
      <div className="flex flex-row items-start sm:items-center justify-between mb-2 gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-base sm:text-lg font-bold truncate">Calculadora de Avance</div>
          <div className="text-[11px] sm:text-xs font-medium leading-tight">
            Rango actual: <span className="font-bold">{rankData[0].current_rank}</span> &rarr; Meta: <span className="font-bold">{rankData[0].next_rank}</span>
          </div>
        </div>
        <div className="flex flex-row gap-1.5 sm:gap-2 shrink-0 items-center">
          {onShowRanksModal && (
            <button onClick={onShowRanksModal} className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold shadow transition-colors whitespace-nowrap">
              <FaTrophy className="mr-1 text-xs" />Rangos
            </button>
          )}
          <button
            onClick={onShowModal}
            className="bg-white/20 hover:bg-white/30 text-white px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold shadow whitespace-nowrap"
          >
            Requisitos
          </button>
        </div>
      </div>
      <div className="w-full bg-white/30 rounded-full h-3 mt-2 mb-1">
        <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${rankProgress.percent}%` }} />
      </div>
      <div className="text-xs font-semibold mt-1">{rankProgress.percent}% para el siguiente rango</div>
      <div className="text-sm mt-2 font-medium">{rankProgress.missing}</div>
      <div className={`text-xs ${isDark ? 'text-blue-200' : 'text-white'}`}>Al menos un 70% del volumen debe provenir de la Construcción, y máximo un 30% de la Línea de Poder.</div>
    </div>
  )
}

export default RankCalculator
