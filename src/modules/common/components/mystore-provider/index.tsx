"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  storeMystoreSponsor, 
  hasMystoreParameter, 
  extractMystoreParameter,
  getMystoreSponsor,
  MystoreData
} from '@lib/util/mystore-utils'

interface MystoreContextType {
  mystoreData: MystoreData | null
  isProcessing: boolean
  hasProcessed: boolean
}

const MystoreContext = createContext<MystoreContextType>({
  mystoreData: null,
  isProcessing: false,
  hasProcessed: false
})

export const useMystore = () => useContext(MystoreContext)

interface MystoreProviderProps {
  children: ReactNode
}

export const MystoreProvider: React.FC<MystoreProviderProps> = ({ children }) => {
  const searchParams = useSearchParams()
  const [mystoreData, setMystoreData] = useState<MystoreData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed) {
      return
    }

    setIsProcessing(true)

    // Check if mystore parameter exists in URL
    if (hasMystoreParameter(searchParams)) {
      const mystoreValue = extractMystoreParameter(searchParams)
      
      if (mystoreValue) {
        // Check if we already have this value stored to prevent overwriting
        const existingData = getMystoreSponsor()
        if (existingData && existingData.sponsorId === mystoreValue) {
          console.log('=== MYSTORE ALREADY STORED ===')
          console.log('Mystore value already exists:', mystoreValue)
          setMystoreData(existingData)
          setHasProcessed(true)
          setIsProcessing(false)
          return
        }

        console.log('=== MYSTORE PARAMETER DETECTED ===')
        console.log('Mystore value:', mystoreValue)
        
        // Store the mystore sponsor ID in localStorage
        const success = storeMystoreSponsor(mystoreValue, true)
        
        if (success) {
          console.log('Mystore sponsor ID stored in localStorage')
          const newData = { sponsorId: mystoreValue, isLocked: true }
          setMystoreData(newData)
        } else {
          console.error('Failed to store mystore sponsor ID')
        }
      }
    }

    setHasProcessed(true)
    setIsProcessing(false)
  }, [searchParams, hasProcessed])

  return (
    <MystoreContext.Provider value={{ mystoreData, isProcessing, hasProcessed }}>
      {children}
    </MystoreContext.Provider>
  )
}
