// netme_network.ts
"use client"

import { supabase } from "@lib/supabaseClient"

export const fetchBinaryNetwork = async (mlmId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('get_binary_tree', { _root_profile_id: mlmId })

    if (error) {
      console.error('Error fetching binary network:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in fetchBinaryNetwork:', error)
    return []
  }
} 


export const fetchUnilevelNetwork = async (mlmId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('get_unilevel_tree', { _root_profile_id: mlmId })

    if (error) {
      console.error('Error fetching unilevel network:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in fetchUnilevelNetwork:', error)
    return []
  }
}

// 1. Reporte “Volumen de Pierna”
export const fetchBinaryLegVolume = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('report_binary_leg_volume', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching binary leg volume:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in fetchBinaryLegVolume:', error)
    return []
  }
}

// 2. Reporte “Volumen por Nivel” (Unilevel)
export const fetchUnilevelLevelVolume = async (profileId: number, periodId: number, levels: number) => {
  try {
    const { data, error } = await supabase
      .rpc('report_unilevel_level_volume', { p_profile: profileId, p_period: periodId, p_max_depth: levels })
    if (error) {
      console.error('Error fetching unilevel level volume:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in fetchUnilevelLevelVolume:', error)
    return []
  }
}

// 3. Calculadora de avance/rango
export const fetchRankProgress = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('report_rank_progress', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching rank progress:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in fetchRankProgress:', error)
    return []
  }
}

// 4. Histórico de comisiones por bono
export const fetchCommissionDetails = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('report_commission_details', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching commission details:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in fetchCommissionDetails:', error)
    return []
  }
}

// 4.1. Resumen de comisiones por bono
export const fetchCommissionSummary = async (profileId: number, periods: number = 12) => {
  try {
    const { data, error } = await supabase
      .rpc('report_commission_summary', { p_profile: profileId, p_periods: periods })
    if (error) {
      console.error('Error fetching commission summary:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in fetchCommissionSummary:', error)
    return []
  }
}

// 5. Reporte “Actividad de la red – por afiliado”
export const fetchNetworkActivityMember = async (profileId: number, periodStartId?: number, periodEndId?: number) => {
  try {
    let params: any = { p_profile: profileId }
    if (periodStartId !== undefined && periodEndId !== undefined) {
      params.p_from_period = periodStartId
      params.p_to_period = periodEndId
    }
    const { data, error } = await supabase
      .rpc('report_network_activity_member', params)
    if (error) {
      console.error('Error fetching network activity member:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in fetchNetworkActivityMember:', error)
    return []
  }
}

// 6. Detalle de órdenes (por afiliado y periodo)
export const fetchNetworkActivityMemberOrders = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .from('vw_network_activity_member_orders')
      .select('*')
      .eq('profiles_id', profileId)
      .eq('periods_id', periodId)
      .order('transaction_date', { ascending: true })
    if (error) {
      console.error('Error fetching network activity member orders:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in fetchNetworkActivityMemberOrders:', error)
    return []
  }
}

// 7. Reporte “Spill-over vs. Construcción propia”
export const fetchSpilloverVsBuild = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('report_spillover_vs_build', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching spillover vs build:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Error in fetchSpilloverVsBuild:', error)
    return []
  }
}

export async function fetchNetworkActivity(profileId: number, fromPeriodId?: number, toPeriodId?: number) {
  let query = supabase
    .rpc('report_network_activity_member', {
      p_profile: profileId,
      ...(fromPeriodId && { p_from_period: fromPeriodId }),
      ...(toPeriodId && { p_to_period: toPeriodId })
    })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching network activity:', error)
    return []
  }

  return data || []
}

export async function fetchNetworkActivityOrders(profileId: number, periodId: number) {
  const { data, error } = await supabase
    .from('vw_network_activity_member_orders')
    .select('*')
    .eq('profiles_id', profileId)
    .eq('periods_id', periodId)
    .order('transaction_date', { ascending: false })

  if (error) {
    console.error('Error fetching network activity orders:', error)
    return []
  }

  return data || []
}