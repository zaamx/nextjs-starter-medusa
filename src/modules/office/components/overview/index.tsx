"use client"
import React, { useState, useEffect } from "react";
import { FaUserCircle, FaWallet, FaTrophy, FaBell } from "react-icons/fa";
import { HttpTypes } from "@medusajs/types"
import { useOffice } from "@lib/context/office-context"
import { 
  fetchBinaryLegVolume, 
  fetchUnilevelLevelVolume, 
  fetchRankProgress,
  fetchRankProgressDetails,
  fetchNetmeRanks,
  fetchNetmeRankRequirements,
  fetchSpilloverVsBuild,
  fetchNetworkActivityMember,
  fetchNetworkActivityMemberOrders,
  fetchRenewalStatus,
  fetchProfileRankSummary,
  ApiResponse
} from "@lib/data/netme_network"

// Import subcomponents
import KPIBar from "./components/KPIBar"
import RankCalculator from "./components/RankCalculator"
import BinaryVolume from "./components/BinaryVolume"
import UnilevelVolume from "./components/UnilevelVolume"
import SpilloverVsBuildComponent from "./components/SpilloverVsBuild"
import NetworkActivityComponent from "./components/NetworkActivity"
import OrdersTable from "./components/OrdersTable"
import Alerts from "./components/Alerts"

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
  bank_prev_left: number
  bank_prev_right: number
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

interface RankProgressDetails {
  current_rank: string
  next_rank: string
  qv_total: number
  qv_needed: number
  qv_missing: number
  qv_const_needed: number
  qv_const_current: number
  qv_const_missing: number
  qv_spill_needed: number
  qv_spill_current: number
  qv_spill_missing: number
  active_left: number | null
  act_left_needed: number
  act_left_missing: number
  active_right: number | null
  act_right_needed: number
  act_right_missing: number
  cutoff: string
}

interface NetmeRank {
  id: number
  name: string
  level: number
  cap_usd: number
}

interface NetmeRankRequirement {
  id: number
  ranks_id: number
  type: number
  value: number
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
  depth: number
  position: number
}

interface RenewalStatus {
  renewal_period_id: number
  renewal_period_name: string
  renewal_date: string
  days_left: number
}

interface ProfileRankSummary {
  lifetime_rank_name: string
  lifetime_period_name: string
  month_rank_name: string
  month_period_name: string
}

const Overview = ({customer}: OverviewProps) => {
  const { selectedPeriod, currentPeriod } = useOffice()
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showRanksModal, setShowRanksModal] = useState(false);
  
  // State for real data
  const [binaryData, setBinaryData] = useState<BinaryLegVolume | null>(null)
  const [unilevelData, setUnilevelData] = useState<UnilevelLevelVolume[]>([])
  const [rankData, setRankData] = useState<RankProgress[]>([])
  const [rankDetailsData, setRankDetailsData] = useState<RankProgressDetails[]>([])
  const [ranksData, setRanksData] = useState<NetmeRank[]>([])
  const [rankRequirementsData, setRankRequirementsData] = useState<NetmeRankRequirement[]>([])
  const [spilloverData, setSpilloverData] = useState<SpilloverVsBuild[]>([])
  const [networkActivityData, setNetworkActivityData] = useState<NetworkActivity[]>([])
  const [networkOrdersData, setNetworkOrdersData] = useState<NetworkOrder[]>([])
  const [renewalData, setRenewalData] = useState<RenewalStatus | null>(null)
  const [rankSummaryData, setRankSummaryData] = useState<ProfileRankSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [componentErrors, setComponentErrors] = useState<Record<string, string>>({})

  const netmeProfileId = (customer?.metadata as any)?.netme_profile_id

  // Function to fetch detailed rank progress data
  const fetchRankDetails = async () => {
    if (!netmeProfileId || !selectedPeriod) return

    try {
      const detailsResult = await fetchRankProgressDetails(Number(netmeProfileId), selectedPeriod.id)
      if (detailsResult.success) {
        setRankDetailsData(detailsResult.data || [])
        setComponentErrors(prev => ({ ...prev, rankDetails: '' }))
      } else {
        console.error('Error fetching rank details:', detailsResult.error)
        setComponentErrors(prev => ({ ...prev, rankDetails: detailsResult.error || 'Error loading rank details' }))
      }
    } catch (err) {
      console.error('Error fetching rank details:', err)
      setComponentErrors(prev => ({ ...prev, rankDetails: 'Error loading rank details' }))
    }
  }

  // Function to fetch rank catalog and requirements
  const fetchRanksData = async () => {
    try {
      const [ranksResult, requirementsResult] = await Promise.all([
        fetchNetmeRanks(),
        fetchNetmeRankRequirements()
      ])
      
      if (ranksResult.success) {
        setRanksData(ranksResult.data || [])
        setComponentErrors(prev => ({ ...prev, ranks: '' }))
      } else {
        console.error('Error fetching ranks:', ranksResult.error)
        setComponentErrors(prev => ({ ...prev, ranks: ranksResult.error || 'Error loading ranks' }))
      }
      
      if (requirementsResult.success) {
        setRankRequirementsData(requirementsResult.data || [])
        setComponentErrors(prev => ({ ...prev, rankRequirements: '' }))
      } else {
        console.error('Error fetching rank requirements:', requirementsResult.error)
        setComponentErrors(prev => ({ ...prev, rankRequirements: requirementsResult.error || 'Error loading rank requirements' }))
      }
    } catch (err) {
      console.error('Error fetching ranks data:', err)
      setComponentErrors(prev => ({ ...prev, ranks: 'Error loading ranks data' }))
    }
  }

  // Function to get requirements for a specific rank
  const getRankRequirements = (rankId: number) => {
    return rankRequirementsData.filter(req => req.ranks_id === rankId)
  }

  // Function to get requirement type name
  const getRequirementTypeName = (type: number) => {
    switch (type) {
      case 1: return "QV Personal"
      case 2: return "Construcción"
      case 3: return "Línea de Poder"
      default: return "Otro"
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!netmeProfileId || !selectedPeriod) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch all reports in parallel with proper error handling
        const [binaryResult, unilevelResult, rankResult, spilloverResult, networkActivityResult, networkOrdersResult, renewalResult, rankSummaryResult] = await Promise.all([
          fetchBinaryLegVolume(Number(netmeProfileId), selectedPeriod.id),
          fetchUnilevelLevelVolume(Number(netmeProfileId), selectedPeriod.id, 5),
          fetchRankProgress(Number(netmeProfileId), selectedPeriod.id),
          fetchSpilloverVsBuild(Number(netmeProfileId), selectedPeriod.id),
          fetchNetworkActivityMember(Number(netmeProfileId)),
          fetchNetworkActivityMemberOrders(Number(netmeProfileId), selectedPeriod.id),
          currentPeriod ? fetchRenewalStatus(Number(netmeProfileId), currentPeriod.id) : Promise.resolve({ success: true, data: null, error: null }),
          fetchProfileRankSummary(Number(netmeProfileId), selectedPeriod.id)
        ])

        // Handle binary data
        if (binaryResult.success) {
          setBinaryData(binaryResult.data[0] || null)
          setComponentErrors(prev => ({ ...prev, binary: '' }))
        } else {
          console.error('Error loading binary data:', binaryResult.error)
          setComponentErrors(prev => ({ ...prev, binary: binaryResult.error || 'Error loading binary data' }))
          setBinaryData(null)
        }

        // Handle unilevel data
        if (unilevelResult.success) {
          setUnilevelData(unilevelResult.data || [])
          setComponentErrors(prev => ({ ...prev, unilevel: '' }))
        } else {
          console.error('Error loading unilevel data:', unilevelResult.error)
          setComponentErrors(prev => ({ ...prev, unilevel: unilevelResult.error || 'Error loading unilevel data' }))
          setUnilevelData([])
        }

        // Handle rank data
        if (rankResult.success) {
          setRankData(rankResult.data || [])
          setComponentErrors(prev => ({ ...prev, rank: '' }))
        } else {
          console.error('Error loading rank data:', rankResult.error)
          setComponentErrors(prev => ({ ...prev, rank: rankResult.error || 'Error loading rank data' }))
          setRankData([])
        }

        // Handle spillover data
        if (spilloverResult.success) {
          setSpilloverData(spilloverResult.data || [])
          setComponentErrors(prev => ({ ...prev, spillover: '' }))
        } else {
          console.error('Error loading spillover data:', spilloverResult.error)
          setComponentErrors(prev => ({ ...prev, spillover: spilloverResult.error || 'Error loading spillover data' }))
          setSpilloverData([])
        }

        // Handle network activity data
        if (networkActivityResult.success) {
          setNetworkActivityData(networkActivityResult.data || [])
          setComponentErrors(prev => ({ ...prev, networkActivity: '' }))
        } else {
          console.error('Error loading network activity data:', networkActivityResult.error)
          setComponentErrors(prev => ({ ...prev, networkActivity: networkActivityResult.error || 'Error loading network activity data' }))
          setNetworkActivityData([])
        }

        // Handle network orders data
        if (networkOrdersResult.success) {
          setNetworkOrdersData(networkOrdersResult.data || [])
          setComponentErrors(prev => ({ ...prev, networkOrders: '' }))
        } else {
          console.error('Error loading network orders data:', networkOrdersResult.error)
          setComponentErrors(prev => ({ ...prev, networkOrders: networkOrdersResult.error || 'Error loading network orders data' }))
          setNetworkOrdersData([])
        }

        // Handle renewal data
        if (renewalResult.success) {
          setRenewalData(renewalResult.data)
          setComponentErrors(prev => ({ ...prev, renewal: '' }))
        } else {
          console.error('Error loading renewal data:', renewalResult.error)
          setComponentErrors(prev => ({ ...prev, renewal: renewalResult.error || 'Error loading renewal data' }))
          setRenewalData(null)
        }

        // Handle rank summary data
        if (rankSummaryResult.success) {
          setRankSummaryData(rankSummaryResult.data)
          setComponentErrors(prev => ({ ...prev, rankSummary: '' }))
        } else {
          console.error('Error loading rank summary data:', rankSummaryResult.error)
          setComponentErrors(prev => ({ ...prev, rankSummary: rankSummaryResult.error || 'Error loading rank summary data' }))
          setRankSummaryData(null)
        }
      } catch (err) {
        console.error('Error fetching overview data:', err)
        setError('Error loading data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [netmeProfileId, selectedPeriod, currentPeriod])

  // Calculate KPIs from real data with error handling
  const getKPIs = () => {
    const kpis = []

    // Week and Period Volume from binary data
    if (binaryData && !componentErrors.binary) {
    const totalCV = (binaryData.cv_period_left || 0) + (binaryData.cv_period_right || 0)
    const weekCV = (binaryData.cv_week_left || 0) + (binaryData.cv_week_right || 0)
      kpis.push(
      { label: "Vol. Semana", value: `${weekCV.toLocaleString()} CV`, countdown: false },
      { label: "Vol. Periodo", value: `${totalCV.toLocaleString()} CV`, countdown: false },
        { label: "Puntos Pagados", value: `${(binaryData.pairs_paid || 0).toLocaleString()}`, countdown: false }
      )
    } else if (componentErrors.binary) {
      kpis.push(
        { label: "Vol. Semana", value: "Error", countdown: false },
        { label: "Vol. Periodo", value: "Error", countdown: false },
        { label: "Puntos Pagados", value: "Error", countdown: false }
      )
    } else {
      kpis.push(
        { label: "Vol. Semana", value: "0 CV", countdown: false },
        { label: "Vol. Periodo", value: "0 CV", countdown: false },
        { label: "Puntos Pagados", value: "0", countdown: false }
      )
    }
    
    // Actives from unilevel data
    if (unilevelData.length > 0 && !componentErrors.unilevel) {
      const totalActives = unilevelData.reduce((sum, level) => sum + level.actives, 0)
      kpis.push({ label: "Activos Unilevel", value: `${totalActives} activos`, countdown: false })
    } else if (componentErrors.unilevel) {
      kpis.push({ label: "Activos Unilevel", value: "Error", countdown: false })
    } else {
      kpis.push({ label: "Activos Unilevel", value: "0 activos", countdown: false })
    }
    
    // Spillover from spillover data
    if (spilloverData.length > 0 && !componentErrors.spillover) {
      const totalSpillover = spilloverData.reduce((sum, item) => sum + (item.cv_spillover || 0), 0)
      kpis.push({ label: "Derrame Recibido", value: `${totalSpillover.toLocaleString()} CV`, countdown: false })
    } else if (componentErrors.spillover) {
      kpis.push({ label: "Derrame Recibido", value: "Error", countdown: false })
    } else {
      kpis.push({ label: "Derrame Recibido", value: "0 CV", countdown: false })
    }

    return kpis 
  }

  // Generate alerts based on real data with error handling
  const getAlerts = () => {
    const alerts: Array<{ type: string; message: string }> = []
    
    if (componentErrors.rank) {
      alerts.push({ type: "Error", message: "No se pudieron cargar los datos de rango." })
      return alerts
    }
    
    if (!rankData || rankData.length === 0) return alerts

    const currentRank = rankData[0]
    if (currentRank.qv_missing > 0) {
      alerts.push({ type: "Volumen", message: `Faltan ${(currentRank.qv_missing || 0).toLocaleString()} QV para calificar.` })
    }
    if (currentRank.act_left_missing > 0) {
      alerts.push({ type: "Directos Izquierda", message: `Falta ${currentRank.act_left_missing} directo activo.` })
    }
    if (currentRank.act_right_missing > 0) {
      alerts.push({ type: "Directos Derecha", message: `Falta ${currentRank.act_right_missing} directo activo.` })
    }

    return alerts
  }

  const kpis = getKPIs()
  const alerts = getAlerts()

  // Get current period network activity
  const currentPeriodActivity = networkActivityData.find(activity => activity.period_id === selectedPeriod?.id)

  // Handle modal actions
  const handleShowTargetModal = async () => {
    await fetchRankDetails()
    setShowTargetModal(true)
  }

  const handleShowRanksModal = async () => {
    await fetchRanksData()
    setShowRanksModal(true)
  }

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
          {((customer?.metadata as any)?.mlm_data as any)?.profile_picture ? (
            <img src={((customer?.metadata as any)?.mlm_data as any)?.profile_picture} alt="avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
          ) : (
            <FaUserCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
              {customer?.first_name} {customer?.last_name} &nbsp;| ID: {(customer?.metadata as any)?.netme_profile_id}
            </div>
            <div className="text-xs text-blue-600 font-semibold">
              {componentErrors.rank ? "Error" : (rankData.length > 0 ? rankData[0].current_rank : "Cargando...")}
              {rankSummaryData && !componentErrors.rankSummary && (
              <span className="text-xs text-gray-500">
                &nbsp; - <span className="mr-2">Vitalicio: {rankSummaryData.lifetime_rank_name}</span>
                <span>Anterior: {rankSummaryData.month_rank_name}</span>
              </span>
            )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Compact Renewal Status */}
          {renewalData && !componentErrors.renewal && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
              renewalData.days_left > 0 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${renewalData.days_left > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="flex flex-col">
                <span className="font-semibold">{renewalData.days_left > 0 ? 'Activo' : 'Inactivo'} Hasta {renewalData.renewal_period_name.replace(/\d+$/, (match) => String(parseInt(match) - 1))} </span>
                <span className="text-xs opacity-75">
                  {renewalData.days_left > 0 
                    ? `Renovar ${renewalData.renewal_period_name}`
                    : 'Renovación vencida'
                  }
                </span>
              </div>
              {renewalData.days_left <= 7 && renewalData.days_left > 0 && (
                <span className="text-orange-600 font-bold">⚠</span>
              )}
            </div>
          )}
          
          <button 
            onClick={handleShowRanksModal}
            className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 sm:px-3 py-1 rounded-lg shadow hover:from-green-600 hover:to-blue-600 transition"
          >
            <FaTrophy className="mr-1 text-xs sm:text-sm" />
            <span className="font-bold text-xs sm:text-sm">Ver Rangos</span>
          </button>
        </div>
      </header>

      {/* Responsive Grid Layout */}
      <div className="p-3 sm:p-4 space-y-4">
        
        {/* KPI Bar */}
        <KPIBar kpis={kpis} />

        {/* Main Content Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Left Column */}
          <div className="space-y-4">
            {/* Rank Calculator */}
            <RankCalculator 
              rankData={rankData}
              error={componentErrors.rank || null}
              onShowModal={handleShowTargetModal}
            />

            {/* Alerts */}
            <Alerts alerts={alerts} />

            {/* Binary Volume */}
            <BinaryVolume 
              binaryData={binaryData}
              error={componentErrors.binary || null}
            />

            {/* Unilevel Volume */}
            <UnilevelVolume 
              unilevelData={unilevelData}
              error={componentErrors.unilevel || null}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Spillover vs Build */}
            <SpilloverVsBuildComponent 
              spilloverData={spilloverData}
              error={componentErrors.spillover || null}
            />

            {/* Network Activity */}
            <NetworkActivityComponent 
              currentPeriodActivity={currentPeriodActivity}
              error={componentErrors.networkActivity || null}
            />

            {/* Orders Table */}
            <OrdersTable 
              networkOrdersData={networkOrdersData}
              error={componentErrors.networkOrders || null}
            />
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

      {/* Responsive Target Modal */}
      {showTargetModal && rankData.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setShowTargetModal(false)}>&times;</button>
            <div className="font-bold text-lg mb-4 text-blue-700">Requisitos para rango {rankData[0].next_rank}</div>
            
            {/* Basic Requirements */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Requisitos Básicos</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Volumen total: {(rankData[0].qv_needed || 0).toLocaleString()} QV</li>
                <li>Directos izquierda: {rankData[0].act_left_needed} activos</li>
                <li>Directos derecha: {rankData[0].act_right_needed} activos</li>
              </ul>
            </div>

            {/* Detailed Volume Breakdown */}
            {rankDetailsData.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Desglose de Volumen</h3>
                
                {/* Construction Volume */}
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-blue-900">Construcción</span>
                    <span className="text-sm text-blue-700">
                      {(rankDetailsData[0].qv_const_current || 0).toLocaleString()} / {(rankDetailsData[0].qv_const_needed || 0).toLocaleString()} QV
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (rankDetailsData[0].qv_const_current / rankDetailsData[0].qv_const_needed) * 100)}%` }} 
                    />
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {rankDetailsData[0].qv_const_missing > 0 
                      ? `Faltan ${(rankDetailsData[0].qv_const_missing || 0).toLocaleString()} QV` 
                      : "¡Completado!"}
                  </div>
                </div>

                {/* Spillover Volume */}
                <div className="bg-green-50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-green-900">Línea de Poder (Power Line)</span>
                    <span className="text-sm text-green-700">
                      {(rankDetailsData[0].qv_spill_current || 0).toLocaleString()} / {(rankDetailsData[0].qv_spill_needed || 0).toLocaleString()} QV
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (rankDetailsData[0].qv_spill_current / rankDetailsData[0].qv_spill_needed) * 100)}%` }} 
                    />
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {rankDetailsData[0].qv_spill_missing > 0 
                      ? `Faltan ${(rankDetailsData[0].qv_spill_missing || 0).toLocaleString()} QV` 
                      : "¡Completado!"}
                  </div>
                </div>

                {/* Total Progress */}
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-purple-900">Total</span>
                    <span className="text-sm text-purple-700">
                      {(rankDetailsData[0].qv_total || 0).toLocaleString()} / {(rankDetailsData[0].qv_needed || 0).toLocaleString()} QV
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (rankDetailsData[0].qv_total / rankDetailsData[0].qv_needed) * 100)}%` }} 
                    />
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {rankDetailsData[0].qv_missing > 0 
                      ? `Faltan ${(rankDetailsData[0].qv_missing || 0).toLocaleString()} QV` 
                      : "¡Completado!"}
                  </div>
                </div>
              </div>
            )}

            {/* Direct Requirements */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Directos Requeridos</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="font-medium text-orange-900">Izquierda</div>
                    <div className="text-lg font-bold text-orange-700">
                      {(rankData[0].active_left ?? 0)} / {rankData[0].act_left_needed}
                    </div>
                    <div className="text-xs text-orange-600">
                      {rankData[0].act_left_missing > 0 
                        ? `Falta ${rankData[0].act_left_missing}` 
                        : "¡Completado!"}
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="font-medium text-orange-900">Derecha</div>
                    <div className="text-lg font-bold text-orange-700">
                      {(rankData[0].active_right ?? 0)} / {rankData[0].act_right_needed}
                    </div>
                    <div className="text-xs text-orange-600">
                      {rankData[0].act_right_missing > 0 
                        ? `Falta ${rankData[0].act_right_missing}` 
                        : "¡Completado!"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="text-xs text-gray-400 border-t pt-3">
              Cumple todos los requisitos para avanzar de rango.
              <div className="mt-2 text-blue-600">
                <strong>Nota:</strong> Al menos un 70% del volumen debe provenir de la construcción, y máximo un 30% de la Línea de Poder.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranks Catalog Modal */}
      {showRanksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setShowRanksModal(false)}>&times;</button>
            <div className="font-bold text-xl mb-6 text-blue-700">Catálogo de Rangos</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ranksData.map((rank) => {
                const requirements = getRankRequirements(rank.id)
                return (
                  <div key={rank.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{rank.name}</h3>
                        <p className="text-sm text-gray-600">Nivel {rank.level}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Tope USD</div>
                        <div className="font-bold text-green-600">${rank.cap_usd?.toLocaleString() || '0'}</div>
                      </div>
                    </div>
                    
                    {requirements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Requerimientos:</h4>
                        <ul className="space-y-1">
                          {requirements.map((req) => (
                            <li key={req.id} className="text-xs text-gray-600 flex justify-between">
                              <span>{getRequirementTypeName(req.type)}:</span>
                              <span className="font-medium">{(req.value || 0).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {ranksData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Cargando catálogo de rangos...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;