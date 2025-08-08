// netme_network.ts
"use client"

import { supabase } from "@lib/supabaseClient"

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error: string | null
}

export const fetchBinaryNetwork = async (mlmId: number): Promise<ApiResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .rpc('get_binary_tree', { _root_profile_id: mlmId })

    if (error) {
      console.error('Error fetching binary network:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchBinaryNetwork:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
} 


export const fetchUnilevelNetwork = async (mlmId: number): Promise<ApiResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .rpc('get_unilevel_tree', { _root_profile_id: mlmId })

    if (error) {
      console.error('Error fetching unilevel network:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchUnilevelNetwork:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 1. Reporte “Volumen de Pierna”
export const fetchBinaryLegVolume = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('report_binary_leg_volume', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching binary leg volume:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchBinaryLegVolume:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 2. Reporte “Volumen por Nivel” (Unilevel)
export const fetchUnilevelLevelVolume = async (profileId: number, periodId: number, levels: number) => {
  try {
    const { data, error } = await supabase
      .rpc('report_unilevel_level_volume', { p_profile: profileId, p_period: periodId, p_max_depth: levels })
    if (error) {
      console.error('Error fetching unilevel level volume:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchUnilevelLevelVolume:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 3. Calculadora de avance/rango
export const fetchRankProgress = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('report_rank_progress', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching rank progress:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchRankProgress:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 3.1. Detalles de avance/rango
export const fetchRankProgressDetails = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('report_rank_progress_details', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching rank progress details:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchRankProgressDetails:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 3.2. Catálogo de rangos
export const fetchNetmeRanks = async (): Promise<ApiResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .from('netme_ranks')
      .select('*')
      .order('level', { ascending: true })
    if (error) {
      console.error('Error fetching netme ranks:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchNetmeRanks:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 3.3. Requerimientos de rangos
export const fetchNetmeRankRequirements = async (): Promise<ApiResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .from('netme_rank_requirements')
      .select('*')
      .order('ranks_id', { ascending: true })
    if (error) {
      console.error('Error fetching netme rank requirements:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchNetmeRankRequirements:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 4. Histórico de comisiones por bono
export const fetchCommissionDetails = async (profileId: number, periodId: number): Promise<ApiResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .rpc('report_commission_details', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching commission details:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchCommissionDetails:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 4.1. Resumen de comisiones por bono
export const fetchCommissionSummary = async (profileId: number, periods: number = 12): Promise<ApiResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .rpc('report_commission_summary', { p_profile: profileId, p_periods: periods })
    if (error) {
      console.error('Error fetching commission summary:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchCommissionSummary:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
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
      .rpc('report_binary_activity_member', params)
    if (error) {
      console.error('Error fetching network activity member:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchNetworkActivityMember:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 6. Detalle de órdenes (por afiliado y periodo)
export const fetchNetworkActivityMemberOrders = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .from('vw_binary_activity_member_orders')
      .select('*')
      .eq('profiles_id', profileId)
      .eq('periods_id', periodId)
      .order('transaction_date', { ascending: true })
    if (error) {
      console.error('Error fetching network activity member orders:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchNetworkActivityMemberOrders:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 7. Reporte “Spill-over vs. Construcción propia”
export const fetchSpilloverVsBuild = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('report_spillover_vs_build', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching spillover vs build:', error)
      return { success: false, data: [], error: error.message }
    }
    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchSpilloverVsBuild:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function fetchNetworkActivity(profileId: number, fromPeriodId?: number, toPeriodId?: number): Promise<ApiResponse<any[]>> {
  try {
    let query = supabase
      .rpc('report_binary_activity_member', {
        p_profile: profileId,
        ...(fromPeriodId && { p_from_period: fromPeriodId }),
        ...(toPeriodId && { p_to_period: toPeriodId })
      })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching network activity:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [], error: null }
  } catch (error) {
    console.error('Error in fetchNetworkActivity:', error)
    return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 8. Renewal status - Check if user is active (returns period names)
export const fetchRenewalStatus = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('netme_next_renewal', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching renewal status:', error)
      return { success: false, data: null, error: error.message }
    }
    return { success: true, data: data?.[0] || null, error: null }
  } catch (error) {
    console.error('Error in fetchRenewalStatus:', error)
    return { success: false, data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 9. Profile rank summary - Get lifetime and current period ranks
export const fetchProfileRankSummary = async (profileId: number, periodId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('netme_profile_rank_summary', { p_profile: profileId, p_period: periodId })
    if (error) {
      console.error('Error fetching profile rank summary:', error)
      return { success: false, data: null, error: error.message }
    }
    return { success: true, data: data?.[0] || null, error: null }
  } catch (error) {
    console.error('Error in fetchProfileRankSummary:', error)
    return { success: false, data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
