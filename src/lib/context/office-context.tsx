 "use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@lib/supabaseClient'

// Types
export interface NetmePeriod {
  id: number
  number: string
  name: string
  start_date: string
  end_date: string
  current: boolean
  is_quarterly: boolean
}

export interface OfficeContextType {
  periods: NetmePeriod[]
  currentPeriod: NetmePeriod | null
  loading: boolean
  error: string | null
  refreshPeriods: () => Promise<void>
}

// Create context
const OfficeContext = createContext<OfficeContextType | undefined>(undefined)

// Provider component
export const OfficeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [periods, setPeriods] = useState<NetmePeriod[]>([])
  const [currentPeriod, setCurrentPeriod] = useState<NetmePeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPeriods = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('netme_periods')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Error fetching periods:', error)
        setError('Error fetching periods')
        return
      }

      setPeriods(data || [])
      
      // Find current period
      const current = data?.find(period => period.current === true)
      setCurrentPeriod(current || null)
      
    } catch (err) {
      console.error('Error in fetchPeriods:', err)
      setError('Error fetching periods')
    } finally {
      setLoading(false)
    }
  }

  const refreshPeriods = async () => {
    await fetchPeriods()
  }

  useEffect(() => {
    fetchPeriods()
  }, [])

  const value: OfficeContextType = {
    periods,
    currentPeriod,
    loading,
    error,
    refreshPeriods
  }

  return (
    <OfficeContext.Provider value={value}>
      {children}
    </OfficeContext.Provider>
  )
}

// Hook to use the context
export const useOffice = () => {
  const context = useContext(OfficeContext)
  if (context === undefined) {
    throw new Error('useOffice must be used within an OfficeProvider')
  }
  return context
}