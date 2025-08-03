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
  selectedPeriod: NetmePeriod | null
  loading: boolean
  error: string | null
  refreshPeriods: () => Promise<void>
  setSelectedPeriod: (period: NetmePeriod | null) => void
  setSelectedPeriodById: (periodId: number) => void
}

// Create context
const OfficeContext = createContext<OfficeContextType | undefined>(undefined)

// Provider component
export const OfficeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [periods, setPeriods] = useState<NetmePeriod[]>([])
  const [currentPeriod, setCurrentPeriod] = useState<NetmePeriod | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<NetmePeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPeriods = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First, get the current period
      const { data: currentPeriodData, error: currentError } = await supabase
        .from('netme_periods')
        .select('*')
        .eq('current', true)
        .single()

      if (currentError) {
        console.error('Error fetching current period:', currentError)
        setError('Error fetching current period')
        return
      }

      if (!currentPeriodData) {
        setError('No current period found')
        return
      }

      // Then get the current period and 10 previous periods
      const { data, error } = await supabase
        .from('netme_periods')
        .select('*')
        .lte('id', currentPeriodData.id)
        .gte('id', currentPeriodData.id - 10)
        .order('id', { ascending: false })

      if (error) {
        console.error('Error fetching periods:', error)
        setError('Error fetching periods')
        return
      }

      setPeriods(data || [])
      
      // Set current period
      setCurrentPeriod(currentPeriodData)
      
      // Set selected period to current period if not already set
      if (!selectedPeriod) {
        setSelectedPeriod(currentPeriodData)
      }
      
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

  const setSelectedPeriodById = (periodId: number) => {
    const period = periods.find(p => p.id === periodId)
    setSelectedPeriod(period || null)
  }

  useEffect(() => {
    fetchPeriods()
  }, [])

  const value: OfficeContextType = {
    periods,
    currentPeriod,
    selectedPeriod,
    loading,
    error,
    refreshPeriods,
    setSelectedPeriod,
    setSelectedPeriodById
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