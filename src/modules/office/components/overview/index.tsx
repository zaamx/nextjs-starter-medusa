"use client"
import React, { useState, useEffect } from "react";
import { FaBars, FaChevronRight, FaUserCircle, FaWallet, FaTrophy, FaBell, FaShoppingCart, FaUserPlus, FaMoneyBillWave } from "react-icons/fa";
import { HttpTypes } from "@medusajs/types"
import { useOffice } from "@lib/context/office-context"
import { 
  fetchBinaryLegVolume, 
  fetchUnilevelLevelVolume, 
  fetchRankProgress,
  fetchSpilloverVsBuild,
  fetchNetworkActivityMember,
  fetchNetworkActivityMemberOrders
} from "@lib/data/netme_network"
import { Table, Heading } from "@medusajs/ui"

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

interface SpilloverVsBuild {
  side: string
  cv_personal: number
  cv_spillover: number
  cv_total: number
}

interface NetworkActivity {
  period_id: number
  period_name: string
  new_orders: number
  reorders: number
  autoship_orders: number
  autoship_pct: string
  avg_ticket_cv: string
}

interface NetworkOrder {
  profiles_id: number
  periods_id: number
  order_display: number
  buyer_profile: number
  is_first_sale: boolean
  is_subscription: boolean | null
  cv: number
  transaction_date: string
}

const Overview = ({customer}: OverviewProps) => {
  const { selectedPeriod } = useOffice()
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  
  // State for real data
  const [binaryData, setBinaryData] = useState<BinaryLegVolume | null>(null)
  const [unilevelData, setUnilevelData] = useState<UnilevelLevelVolume[]>([])
  const [rankData, setRankData] = useState<RankProgress | null>(null)
  const [spilloverData, setSpilloverData] = useState<SpilloverVsBuild[]>([])
  const [networkActivityData, setNetworkActivityData] = useState<NetworkActivity[]>([])
  const [networkOrdersData, setNetworkOrdersData] = useState<NetworkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const netmeProfileId = customer?.metadata?.netme_profile_id

  useEffect(() => {
    const fetchData = async () => {
      if (!netmeProfileId || !selectedPeriod) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch all reports in parallel
        const [binaryResult, unilevelResult, rankResult, spilloverResult, networkActivityResult, networkOrdersResult] = await Promise.all([
          fetchBinaryLegVolume(Number(netmeProfileId), selectedPeriod.id),
          fetchUnilevelLevelVolume(Number(netmeProfileId), selectedPeriod.id, 5),
          fetchRankProgress(Number(netmeProfileId), selectedPeriod.id),
          fetchSpilloverVsBuild(Number(netmeProfileId), selectedPeriod.id),
          fetchNetworkActivityMember(Number(netmeProfileId)),
          fetchNetworkActivityMemberOrders(Number(netmeProfileId), selectedPeriod.id)
        ])

        setBinaryData(binaryResult[0] || null)
        setUnilevelData(unilevelResult || [])
        setRankData(rankResult[0] || null)
        setSpilloverData(spilloverResult || [])
        setNetworkActivityData(networkActivityResult || [])
        setNetworkOrdersData(networkOrdersResult || [])

      } catch (err) {
        console.error('Error fetching overview data:', err)
        setError('Error loading data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [netmeProfileId, selectedPeriod])

  // Calculate KPIs from real data
  const getKPIs = () => {
    if (!binaryData || !unilevelData || spilloverData.length === 0) return []

    const totalCV = binaryData.cv_period_left + binaryData.cv_period_right
    const weekCV = binaryData.cv_week_left + binaryData.cv_week_right
    const totalActives = unilevelData.reduce((sum, level) => sum + level.actives, 0)
    const totalSpillover = spilloverData.reduce((sum, item) => sum + item.cv_spillover, 0)

    return [
      { label: "Vol. Semana", value: `${weekCV.toLocaleString()} CV`, countdown: false },
      { label: "Vol. Periodo", value: `${totalCV.toLocaleString()} CV`, countdown: false },
      { label: "Pares Pagados", value: `${binaryData.pairs_paid.toLocaleString()}`, countdown: false },
      { label: "Activos Unilevel", value: `${totalActives} activos`, countdown: false },
      { label: "Derrame Recibido", value: `${totalSpillover.toLocaleString()} CV`, countdown: false },
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

  // Get current period network activity
  const currentPeriodActivity = networkActivityData.find(activity => activity.period_id === selectedPeriod?.id)

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
      {/* Responsive Header */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-3 bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {(customer?.metadata?.mlm_data as any)?.profile_picture ? (
            <img src={(customer?.metadata?.mlm_data as any)?.profile_picture} alt="avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
          ) : (
            <FaUserCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
              {customer?.first_name} {customer?.last_name}
            </div>
            <div className="text-xs text-blue-600 font-semibold">
              {rankData?.current_rank || "Cargando..."}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 sm:px-3 py-1 rounded-lg shadow">
            <FaWallet className="mr-1 text-xs sm:text-sm" />
            <span className="font-bold text-xs sm:text-sm">
              {rankData?.cv_total ? `${rankData.cv_total.toLocaleString()} CV` : "0 CV"}
            </span>
          </div>
        </div>
      </header>

      {/* Responsive Grid Layout */}
      <div className="p-3 sm:p-4 space-y-4">
        
        {/* KPI Bar - Responsive horizontal scroll */}
        <div className="w-full">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="flex-shrink-0 bg-white rounded-xl shadow px-3 sm:px-5 py-3 sm:py-2 flex flex-col items-center min-w-[100px] sm:min-w-[120px] border border-gray-100">
                <span className="text-xs text-gray-500 font-medium text-center">{kpi.label}</span>
                <span className={`font-bold text-lg sm:text-2xl ${kpi.countdown ? "text-blue-600 font-mono" : "text-gray-900"} text-center`}>{kpi.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Left Column */}
          <div className="space-y-4">
            {/* Calculadora de Avance */}
            {rankData && (
              <div className="rounded-2xl p-4 sm:p-6 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                  <div>
                    <div className="text-base sm:text-lg font-bold">Calculadora de Avance</div>
                    <div className="text-xs font-medium">
                      Rango actual: <span className="font-bold">{rankData.current_rank}</span> &rarr; Meta: <span className="font-bold">{rankData.next_rank}</span>
                    </div>
                  </div>
                  <button onClick={() => setShowTargetModal(true)} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow self-start sm:self-auto">
                    Ver requisitos
                  </button>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3 mt-2 mb-1">
                  <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${rankProgress.percent}%` }} />
                </div>
                <div className="text-xs font-semibold mt-1">{rankProgress.percent}% hacia el siguiente rango</div>
                <div className="text-sm mt-2 font-medium">{rankProgress.missing}</div>
              </div>
            )}

            {/* Alertas */}
            {alerts.length > 0 && (
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
            )}

            {/* Volumen Binario de Pierna */}
            {binaryData && (
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="font-bold text-gray-900 mb-3">Volumen Binario de Pierna</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pierna Izquierda */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Pierna Izquierda</div>
                    <div className="text-lg font-bold text-blue-600">
                      {binaryData.cv_week_left.toLocaleString()} CV
                    </div>
                    <div className="text-xs text-gray-400">Generado esta semana</div>
                    <div className="text-lg font-bold text-blue-600">
                      {binaryData.cv_period_left.toLocaleString()} CV
                    </div>
                    <div className="text-xs text-gray-400">Volumen para pares</div>
                    <div className="text-lg font-bold text-purple-600">
                      {binaryData.carry_left.toLocaleString()} CV
                    </div>
                    <div className="text-xs text-purple-600">Volumen que se arrastrará al próximo periodo</div>
                  </div>

                  {/* Pierna Derecha */}
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Pierna Derecha</div>
                    <div className="text-lg font-bold text-blue-600">
                      {binaryData.cv_week_right.toLocaleString()} CV
                    </div>
                    <div className="text-xs text-gray-400">Generado esta semana</div>
                    <div className="text-lg font-bold text-blue-600">
                      {binaryData.cv_period_right.toLocaleString()} CV
                    </div>
                    <div className="text-xs text-gray-400">Volumen para pares</div>
                    <div className="text-lg font-bold text-purple-600">
                      {binaryData.carry_right.toLocaleString()} CV
                    </div>
                    <div className="text-xs text-purple-600">Volumen que se arrastrará al próximo periodo</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-600 gap-1">
                    <span><strong>Pares pagados:</strong> {binaryData.pairs_paid.toLocaleString()}</span>
                    <span><strong>Pares pendientes:</strong> {binaryData.pairs_pending.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Volumen por Nivel (Unilevel) */}
            {unilevelData.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-4">
                <div className="font-bold text-gray-900 mb-3">Volumen por Nivel (Unilevel)</div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {unilevelData.slice(0, 5).map((level, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xs text-gray-500">Nivel {level.level}</div>
                      <div className="text-sm font-bold text-gray-900">{level.cv_total.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">
                        {level.actives} activos, {level.inactives} inactivos
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Spillover vs Construcción Propia */}
            {spilloverData.length > 0 && (
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
            )}

            {/* Actividad de la Red */}
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="font-bold text-gray-900 mb-3">Actividad de la Red</div>
              {currentPeriodActivity ? (
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

            {/* Tabla de Órdenes - Mobile Optimized */}
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-gray-900">Órdenes del Periodo</div>
                <span className="text-xs text-gray-500">{networkOrdersData.length} órdenes</span>
              </div>
              {networkOrdersData.length > 0 ? (
                <div className="overflow-x-auto">
                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-2">
                    {networkOrdersData.slice(0, 5).map((order, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">#{order.order_display}</span>
                          <span className="text-xs font-bold">{order.cv.toLocaleString()} CV</span>
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
                          <Table.HeaderCell className="text-xs">Primera Venta</Table.HeaderCell>
                          <Table.HeaderCell className="text-xs">Autoship</Table.HeaderCell>
                          <Table.HeaderCell className="text-xs">CV</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {networkOrdersData.slice(0, 5).map((order, idx) => (
                          <Table.Row key={idx} className="hover:bg-gray-50">
                            <Table.Cell className="text-xs font-medium">#{order.order_display}</Table.Cell>
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
          </div>
        </div>
      </div>

      {/* Responsive Office Navigation */}
      <div className="px-3 sm:px-4 pb-20 sm:pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <a href="/us/office/commissions" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-3 sm:p-4 hover:bg-blue-50 transition border border-gray-100">
            <div className="text-xl sm:text-2xl mb-1"><FaWallet /></div>
            <div className="text-xs font-semibold text-gray-700 text-center">Comisiones</div>
          </a>
          <a href="/us/office/marketing-materials" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-3 sm:p-4 hover:bg-blue-50 transition border border-gray-100">
            <div className="text-xl sm:text-2xl mb-1"><FaBell /></div>
            <div className="text-xs font-semibold text-gray-700 text-center">Marketing</div>
          </a>
          <a href="/us/office/training-center" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-3 sm:p-4 hover:bg-blue-50 transition border border-gray-100">
            <div className="text-xl sm:text-2xl mb-1"><FaTrophy /></div>
            <div className="text-xs font-semibold text-gray-700 text-center">Formación</div>
          </a>
          <a href="/us/office/support-compliance" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-3 sm:p-4 hover:bg-blue-50 transition border border-gray-100">
            <div className="text-xl sm:text-2xl mb-1"><FaBell /></div>
            <div className="text-xs font-semibold text-gray-700 text-center">Soporte</div>
          </a>
        </div>
      </div>

      {/* Responsive Floating Action Button */}
      {/* <div className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-30">
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl hover:scale-105 transition"
          onClick={() => setShowFAB((v) => !v)}
          aria-label="Quick Actions"
        >
          +
        </button>
        {showFAB && (
          <div className="absolute bottom-16 sm:bottom-20 right-0 flex flex-col gap-2 sm:gap-3 items-end animate-fade-in">
            <button className="bg-white shadow px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 text-blue-700 font-semibold hover:bg-blue-50 text-sm">
              <FaShoppingCart className="text-xs" /> Comprar
            </button>
            <button className="bg-white shadow px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 text-green-700 font-semibold hover:bg-green-50 text-sm">
              <FaUserPlus className="text-xs" /> Patrocinar
            </button>
            <button className="bg-white shadow px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 text-purple-700 font-semibold hover:bg-purple-50 text-sm">
              <FaMoneyBillWave className="text-xs" /> Retirar saldo
            </button>
          </div>
        )}
      </div> */}

      {/* Responsive Target Modal */}
      {showTargetModal && rankData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setShowTargetModal(false)}>&times;</button>
            <div className="font-bold text-lg mb-2 text-blue-700">Requisitos para rango {rankData.next_rank}</div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-2">
              <li>Volumen total: {rankData.cv_needed.toLocaleString()} CV</li>
              <li>Directos izquierda: {rankData.act_left_needed} activos</li>
              <li>Directos derecha: {rankData.act_right_needed} activos</li>
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

