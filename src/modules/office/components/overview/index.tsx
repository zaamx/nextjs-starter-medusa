"use client"
import React, { useState, useEffect } from "react";
import { FaBars, FaChevronRight, FaUserCircle, FaWallet, FaTrophy, FaBell, FaShoppingCart, FaUserPlus, FaMoneyBillWave } from "react-icons/fa";
import { HttpTypes } from "@medusajs/types"
import { useOffice } from "@lib/context/office-context"
import { 
  fetchBinaryLegVolume, 
  fetchUnilevelLevelVolume, 
  fetchRankProgress 
} from "@lib/data/netme_network"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

// Types for the reports
interface BinaryLegVolume {
  cv_week_left: number
  cv_week_right: number
  cv_period_left: number
  cv_period_right: number
  carry_left: number
  carry_right: number
  pairs_paid: number
  pairs_pending: number
}

interface UnilevelLevelVolume {
  level: number
  cv_total: number
  actives: number
  inactives: number
}

interface RankProgress {
  current_rank: string
  next_rank: string
  cv_total: number
  cv_needed: number
  cv_missing: number
  active_left: number
  act_left_needed: number
  act_left_missing: number
  active_right: number
  act_right_needed: number
  act_right_missing: number
  cutoff: string
}

const Overview = ({customer}: OverviewProps) => {
  const { currentPeriod } = useOffice()
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  
  // State for real data
  const [binaryData, setBinaryData] = useState<BinaryLegVolume | null>(null)
  const [unilevelData, setUnilevelData] = useState<UnilevelLevelVolume[]>([])
  const [rankData, setRankData] = useState<RankProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const netmeProfileId = customer?.metadata?.netme_profile_id

  useEffect(() => {
    const fetchData = async () => {
      if (!netmeProfileId || !currentPeriod) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch all reports in parallel
        const [binaryResult, unilevelResult, rankResult] = await Promise.all([
          fetchBinaryLegVolume(Number(netmeProfileId), currentPeriod.id),
          fetchUnilevelLevelVolume(Number(netmeProfileId), currentPeriod.id, 5),
          fetchRankProgress(Number(netmeProfileId), currentPeriod.id)
        ])

        setBinaryData(binaryResult[0] || null)
        setUnilevelData(unilevelResult || [])
        setRankData(rankResult[0] || null)

      } catch (err) {
        console.error('Error fetching overview data:', err)
        setError('Error loading data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [netmeProfileId, currentPeriod])

  // Calculate KPIs from real data
  const getKPIs = () => {
    if (!binaryData || !unilevelData) return []

    const totalCV = binaryData.cv_period_left + binaryData.cv_period_right
    const weekCV = binaryData.cv_week_left + binaryData.cv_week_right
    const totalActives = unilevelData.reduce((sum, level) => sum + level.actives, 0)
    const spillover = Math.max(binaryData.cv_period_left, binaryData.cv_period_right) - 
                     Math.min(binaryData.cv_period_left, binaryData.cv_period_right)

    return [
      { label: "Vol. Semana", value: `${weekCV.toLocaleString()} CV`, countdown: false },
      { label: "Vol. Periodo", value: `${totalCV.toLocaleString()} CV`, countdown: false },
      { label: "Pares Pagados", value: `${binaryData.pairs_paid.toLocaleString()}`, countdown: false },
      { label: "Activos", value: `${totalActives} activos`, countdown: false },
      { label: "Derrame", value: `${spillover.toLocaleString()} CV`, countdown: false },
    ]
  }

  // Calculate rank progress percentage
  const getRankProgress = () => {
    if (!rankData) return { percent: 0, missing: "Cargando datos..." }

    const totalNeeded = rankData.cv_needed + rankData.act_left_needed + rankData.act_right_needed
    const totalMissing = rankData.cv_missing + rankData.act_left_missing + rankData.act_right_missing
    const completed = totalNeeded - totalMissing
    const percent = totalNeeded > 0 ? Math.round((completed / totalNeeded) * 100) : 0

    let missingText = ""
    if (rankData.cv_missing > 0) {
      missingText += `Te faltan ${rankData.cv_missing.toLocaleString()} CV`
    }
    if (rankData.act_left_missing > 0) {
      missingText += missingText ? ` y ${rankData.act_left_missing} directo izquierdo` : `Te faltan ${rankData.act_left_missing} directo izquierdo`
    }
    if (rankData.act_right_missing > 0) {
      missingText += missingText ? ` y ${rankData.act_right_missing} directo derecho` : `Te faltan ${rankData.act_right_missing} directo derecho`
    }

    return { percent, missing: missingText || "¡Completaste todos los requisitos!" }
  }

  // Generate alerts based on real data
  const getAlerts = () => {
    const alerts: Array<{ type: string; message: string }> = []
    
    if (!rankData) return alerts

    if (rankData.cv_missing > 0) {
      alerts.push({ type: "Volumen", message: `Faltan ${rankData.cv_missing.toLocaleString()} CV para calificar.` })
    }
    if (rankData.act_left_missing > 0) {
      alerts.push({ type: "Directos Izquierda", message: `Falta ${rankData.act_left_missing} directo activo.` })
    }
    if (rankData.act_right_missing > 0) {
      alerts.push({ type: "Directos Derecha", message: `Falta ${rankData.act_right_missing} directo activo.` })
    }

    return alerts
  }

  const kpis = getKPIs()
  const rankProgress = getRankProgress()
  const alerts = getAlerts()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Ultra-compact Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {(customer?.metadata?.mlm_data as any)?.profile_picture ? (
            <img src={(customer?.metadata?.mlm_data as any)?.profile_picture} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <FaUserCircle className="w-10 h-10 text-gray-400" />
          )}
          <div>
            <div className="font-bold text-gray-900 text-base leading-tight">
              {customer?.first_name} {customer?.last_name}
            </div>
            <div className="text-xs text-blue-600 font-semibold">
              {rankData?.current_rank || "Cargando..."}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-lg shadow">
            <FaWallet className="mr-1" />
            <span className="font-bold text-sm">
              {rankData?.cv_total ? `${rankData.cv_total.toLocaleString()} CV` : "0 CV"}
            </span>
          </div>
          <button className="ml-2 p-2 rounded hover:bg-gray-100">
            <FaBars className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* KPI Bar with Explanations */}
      <div className="mx-4 mb-4">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded-r">
          <div className="text-xs text-blue-800 font-medium mb-1">📊 KPIs Principales - ¿Qué significan?</div>
          <div className="text-xs text-blue-700">
            <strong>Vol. Semana:</strong> Producción desde lunes • <strong>Vol. Periodo:</strong> Acumulado para bonos • <strong>Derrame:</strong> Diferencia entre piernas
          </div>
        </div>
        
        <div className="overflow-x-auto flex gap-2 scrollbar-hide">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="flex-shrink-0 bg-white rounded-xl shadow-sm px-3 py-2 flex flex-col items-center min-w-[90px] border border-gray-100">
              <span className="text-xs text-gray-500 font-medium text-center leading-tight">{kpi.label}</span>
              <span className={`font-bold text-sm ${kpi.countdown ? "text-blue-600 font-mono" : "text-gray-900"}`}>{kpi.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Target Card (Advancement Calculator) */}
      {rankData && (
        <div className="mx-4 my-6 rounded-2xl p-6 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-lg font-bold">🎯 Calculadora de Avance</div>
              <div className="text-xs font-medium">
                Rango actual: <span className="font-bold">{rankData.current_rank}</span> &rarr; Meta: <span className="font-bold">{rankData.next_rank}</span>
              </div>
            </div>
            <button onClick={() => setShowTargetModal(true)} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow">
              Ver requisitos
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/30 rounded-full h-3 mb-2">
            <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${rankProgress.percent}%` }} />
          </div>
          <div className="text-xs font-semibold mb-2">{rankProgress.percent}% hacia el siguiente rango</div>
          
          {/* Status Message */}
          <div className="text-sm font-medium bg-white/10 rounded-lg p-2">
            {rankProgress.missing}
          </div>
          
          {/* Quick Stats */}
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold">{rankData.cv_total.toLocaleString()}</div>
                <div className="opacity-80">CV Total</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{rankData.active_left + rankData.active_right}</div>
                <div className="opacity-80">Directos</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{rankData.cutoff}</div>
                <div className="opacity-80">Corte</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mx-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2 border-l-4 border-red-400">
            <div className="font-bold text-red-600 mb-1 flex items-center gap-2">
              <FaBell /> Alertas de calificación
            </div>
            <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
              {alerts.map((alert, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{alert.type}:</span> {alert.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Binary Leg Volume Details - Improved */}
      {binaryData && (
        <div className="mx-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              📊 Volumen de Pierna
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                ¿Cómo leerlo?
              </span>
            </div>
            
            {/* Explanation */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded-r">
              <div className="text-xs text-blue-800 font-medium mb-1">📖 Interpretación rápida:</div>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• <strong>CV semana:</strong> Lo que produjo tu equipo desde el lunes</li>
                <li>• <strong>CV periodo:</strong> Lo que se acumula para pagar el binario esta semana</li>
                <li>• <strong>Pares pagados:</strong> Ciclos efectivamente liquidados</li>
                <li>• <strong>Pendientes:</strong> Se arrastran cuando la pierna corta alcance</li>
              </ul>
            </div>

            {/* Compact Leg Display */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">Pierna Izquierda</div>
                <div className="text-lg font-bold text-blue-700">{binaryData.cv_period_left.toLocaleString()} CV</div>
                <div className="text-xs text-blue-500">Semana: {binaryData.cv_week_left.toLocaleString()}</div>
                {binaryData.carry_left > 0 && (
                  <div className="text-xs text-blue-600 mt-1">Carry: {binaryData.carry_left.toLocaleString()}</div>
                )}
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                <div className="text-xs text-green-600 font-medium mb-1">Pierna Derecha</div>
                <div className="text-lg font-bold text-green-700">{binaryData.cv_period_right.toLocaleString()} CV</div>
                <div className="text-xs text-green-500">Semana: {binaryData.cv_week_right.toLocaleString()}</div>
                {binaryData.carry_right > 0 && (
                  <div className="text-xs text-green-600 mt-1">Carry: {binaryData.carry_right.toLocaleString()}</div>
                )}
              </div>
            </div>

            {/* Pairs Summary */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <div className="text-xs text-gray-500">Pares Pagados</div>
                  <div className="text-lg font-bold text-green-600">{binaryData.pairs_paid.toLocaleString()}</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center flex-1">
                  <div className="text-xs text-gray-500">Pendientes</div>
                  <div className="text-lg font-bold text-orange-600">{binaryData.pairs_pending.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unilevel Network Summary - New Widget */}
      {unilevelData.length > 0 && (
        <div className="mx-4 mb-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              🌐 Red Unilevel
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Resumen por nivel
              </span>
            </div>
            
            {/* Explanation */}
            <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mb-4 rounded-r">
              <div className="text-xs text-purple-800 font-medium mb-1">📖 Cómo leerlo:</div>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• <strong>Nivel 1:</strong> Directos, <strong>Nivel 2:</strong> Nietos, etc.</li>
                <li>• <strong>CV Total:</strong> Volumen que cuenta para bonos del periodo</li>
                <li>• <strong>Activos:</strong> Distribuidores con ≥60 QV (qualified)</li>
                <li>• <strong>Inactivos:</strong> Contactos a reactivar</li>
              </ul>
            </div>

            {/* Compact Level Display */}
            <div className="grid grid-cols-5 gap-2">
              {unilevelData.slice(0, 5).map((level, idx) => (
                <div key={idx} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 text-center">
                  <div className="text-xs text-purple-600 font-bold">N{level.level}</div>
                  <div className="text-sm font-bold text-purple-700">{level.cv_total.toLocaleString()}</div>
                  <div className="text-xs text-purple-500">
                    {level.actives}✓ {level.inactives}✗
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span>Total CV: <span className="font-bold text-purple-600">
                  {unilevelData.reduce((sum, level) => sum + level.cv_total, 0).toLocaleString()}
                </span></span>
                <span>Total Activos: <span className="font-bold text-green-600">
                  {unilevelData.reduce((sum, level) => sum + level.actives, 0)}
                </span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline (Recent Events) */}
      <div className="mx-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-gray-900">Actividad Reciente</div>
            <button className="text-blue-600 text-xs font-semibold flex items-center gap-1 hover:underline">
              Ver todo <FaChevronRight />
            </button>
          </div>
          <div className="text-sm text-gray-500 text-center py-4">
            Próximamente: Actividad en tiempo real
          </div>
        </div>
      </div>

      {/* Office Navigation */}
      <div className="mx-4 mb-24 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <a href="/us/office/commissions" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-4 hover:bg-blue-50 transition border border-gray-100">
          <div className="text-2xl mb-1"><FaWallet /></div>
          <div className="text-xs font-semibold text-gray-700">Comisiones</div>
        </a>
        <a href="/us/office/marketing-materials" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-4 hover:bg-blue-50 transition border border-gray-100">
          <div className="text-2xl mb-1"><FaBell /></div>
          <div className="text-xs font-semibold text-gray-700">Marketing</div>
        </a>
        <a href="/us/office/training-center" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-4 hover:bg-blue-50 transition border border-gray-100">
          <div className="text-2xl mb-1"><FaTrophy /></div>
          <div className="text-xs font-semibold text-gray-700">Formación</div>
        </a>
        <a href="/us/office/support-compliance" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-4 hover:bg-blue-50 transition border border-gray-100">
          <div className="text-2xl mb-1"><FaBell /></div>
          <div className="text-xs font-semibold text-gray-700">Soporte</div>
        </a>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-8 right-8 z-30">
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:scale-105 transition"
          onClick={() => setShowFAB((v) => !v)}
          aria-label="Quick Actions"
        >
          +
        </button>
        {showFAB && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-3 items-end animate-fade-in">
            <button className="bg-white shadow px-4 py-2 rounded-lg flex items-center gap-2 text-blue-700 font-semibold hover:bg-blue-50"><FaShoppingCart /> Comprar</button>
            <button className="bg-white shadow px-4 py-2 rounded-lg flex items-center gap-2 text-green-700 font-semibold hover:bg-green-50"><FaUserPlus /> Patrocinar</button>
            <button className="bg-white shadow px-4 py-2 rounded-lg flex items-center gap-2 text-purple-700 font-semibold hover:bg-purple-50"><FaMoneyBillWave /> Retirar saldo</button>
          </div>
        )}
      </div>

      {/* Target Modal */}
      {showTargetModal && rankData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowTargetModal(false)}>&times;</button>
            <div className="font-bold text-lg mb-2 text-blue-700">Requisitos para rango {rankData.next_rank}</div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-2">
              <li>Volumen total: {rankData.cv_needed.toLocaleString()} CV</li>
              <li>Directos izquierda: {rankData.act_left_needed} activos</li>
              <li>Directos derecha: {rankData.act_right_needed} activos</li>
              <li>Autoship vigente</li>
            </ul>
            <div className="text-xs text-gray-400">
              {rankProgress.percent === 100 ? "¡Completaste todos los requisitos!" : "Cumple todos los requisitos para avanzar de rango."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
