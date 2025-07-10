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