"use client"

import React, { useState, useEffect } from "react"
import Input from "@modules/common/components/input"
import SponsorSearch from "@modules/common/components/sponsor-search"
import { getMystoreSponsor } from "@lib/util/mystore-utils"
import { useMystore } from "@modules/common/components/mystore-provider"

interface SponsorInputProps {
  label: string
  name: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  "data-testid"?: string
  onSponsorInfoLoaded?: (sponsorInfo: SponsorInfo) => void
}

interface SponsorInfo {
  id: string
  first_name: string
  last_name: string
  email: string
  netme_id: number
}

const SponsorInput: React.FC<SponsorInputProps> = ({
  label,
  name,
  value,
  onChange,
  required = false,
  "data-testid": dataTestId,
  onSponsorInfoLoaded
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | undefined>(
    value || undefined
  )
  const [selectedSponsorInfo, setSelectedSponsorInfo] = useState<SponsorInfo | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isLoadingMystore, setIsLoadingMystore] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Use mystore context
  const { mystoreData, isProcessing } = useMystore()

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check for mystore parameter on component mount
  useEffect(() => {
    if (!isClient) return // Only run on client side
    
    let isMounted = true
    
    const checkMystoreSponsor = async () => {
      // First check context, then fallback to localStorage
      const data = mystoreData || getMystoreSponsor()
      
      if (data && isMounted) {
        console.log('=== MYSTORE SPONSOR FOUND ===')
        console.log('Mystore data:', data)
        
        setIsLocked(data.isLocked)
        setIsLoadingMystore(true)
        
        try {
          // Search for the sponsor by netme_id
          const response = await fetch(`/api/sponsor-search?query=${data.sponsorId}`)
          const responseData = await response.json()
          
          if (responseData.results && responseData.results.length > 0 && isMounted) {
            // Find the sponsor with matching netme_id
            const matchingSponsor = responseData.results.find(
              (sponsor: any) => sponsor.netme_id?.toString() === data.sponsorId
            )
            
            if (matchingSponsor && isMounted) {
              console.log('=== MYSTORE SPONSOR FOUND AND SELECTED ===')
              console.log('Matching sponsor:', matchingSponsor)
              
              setSelectedSponsorId(data.sponsorId)
              setSelectedSponsorInfo(matchingSponsor)
              onChange?.(data.sponsorId)
              onSponsorInfoLoaded?.(matchingSponsor)
            }
          }
        } catch (error) {
          console.error('Error loading mystore sponsor:', error)
        } finally {
          if (isMounted) {
            setIsLoadingMystore(false)
          }
        }
      }
    }
    
    checkMystoreSponsor()
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false
    }
  }, [onChange, onSponsorInfoLoaded, isClient, mystoreData])

  // Update selectedSponsorId when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedSponsorId(value)
      validateSponsorId(value)
    }
  }, [value])

  const validateSponsorId = (sponsorId: string) => {
    if (required && (!sponsorId || sponsorId.trim() === "")) {
      setValidationError("La selección de patrocinador es requerida")
      return false
    }
    
    if (sponsorId && sponsorId.trim() !== "" && !/^\d+$/.test(sponsorId.trim())) {
              setValidationError("Formato de ID de patrocinador inválido")
      return false
    }
    
    setValidationError(null)
    return true
  }

  const handleSponsorSelect = (sponsorId: string, sponsorInfo?: any) => {
    // Don't allow changes if locked
    if (isLocked) {
      console.log('=== SPONSOR INPUT LOCKED ===')
      console.log('Cannot change sponsor - locked by mystore parameter')
      return
    }
    
    console.log('=== SPONSOR INPUT SELECTION ===')
    console.log('SponsorInput received sponsorId:', sponsorId)
    console.log('SponsorInput received sponsorInfo:', sponsorInfo)
    console.log('SponsorInput sponsorId type:', typeof sponsorId)
    
    const trimmedSponsorId = sponsorId.trim()
    setSelectedSponsorId(trimmedSponsorId === "" ? undefined : trimmedSponsorId)
    setSelectedSponsorInfo(sponsorInfo || null)
    
    if (validateSponsorId(trimmedSponsorId)) {
      onChange?.(trimmedSponsorId)
    }
  }

  // Remove direct input change handler - only allow selection via modal
  const handleInputClick = () => {
    if (isLocked) {
      console.log('=== SPONSOR INPUT LOCKED ===')
      console.log('Cannot open search modal - locked by mystore parameter')
      return
    }
    setIsModalOpen(true)
  }

  const handleClearSponsor = () => {
    // Don't allow clearing if locked
    if (isLocked) {
      console.log('=== SPONSOR INPUT LOCKED ===')
      console.log('Cannot clear sponsor - locked by mystore parameter')
      return
    }
    
    setSelectedSponsorId(undefined)
    setSelectedSponsorInfo(null)
    setValidationError(null)
    onChange?.("")
  }

  // Update the input value when selectedSponsorId changes
  React.useEffect(() => {
    if (selectedSponsorId !== undefined) {
      onChange?.(selectedSponsorId)
    }
  }, [selectedSponsorId, onChange])

  // Log render state
  console.log('=== SPONSOR INPUT RENDER ===', { value, selectedSponsorId, name, validationError })

  return (
    <>
      <div className="relative">
        <Input
          label={label}
          name={name}
          value={selectedSponsorId || ""}
          onChange={() => {}} // Disable direct input
          readOnly={true}
          required={required}
          data-testid={dataTestId}
          style={{ 
            background: isLocked ? "#f3f4f6" : "#f9fafb", 
            cursor: isLocked ? "not-allowed" : "pointer" 
          }}
        />
        <div
          className={`absolute inset-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ background: "transparent" }}
          onClick={handleInputClick}
          data-testid={`${dataTestId}-overlay`}
        />
        {(isLoadingMystore || isProcessing) ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-gray-400 text-white rounded">
            Cargando...
          </div>
        ) : isLocked ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-green-600 text-white rounded">
            Bloqueado
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            data-testid={`${dataTestId}-search-button`}
            style={{ zIndex: 2 }}
          >
            Buscar
          </button>
        )}
      </div>
      {!selectedSponsorId && required && !validationError && !isLoadingMystore && (
        <div className="text-gray-400 text-sm mt-1">
          {isLocked 
            ? "Patrocinador predeterminado cargando..." 
            : "Haz clic en \"Buscar\" para seleccionar un patrocinador (requerido)"
          }
        </div>
      )}
      {selectedSponsorInfo && (
        <div className={`mt-2 p-3 border rounded-lg ${
          isLocked 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className={`text-sm ${
            isLocked ? 'text-blue-800' : 'text-green-800'
          }`}>
            <div className="font-medium">
              {isLocked ? 'Patrocinador Predeterminado: ' : 'Selected: '}
              {selectedSponsorInfo.first_name} {selectedSponsorInfo.last_name}
            </div>
            <div className={isLocked ? 'text-blue-600' : 'text-green-600'}>
              {selectedSponsorInfo.email}
            </div>
            <div className={isLocked ? 'text-blue-600' : 'text-green-600'}>
              ID: {selectedSponsorInfo.netme_id}
            </div>
            {isLocked && (
              <div className="text-blue-500 text-xs mt-1">
                Este patrocinador fue asignado automáticamente y no puede ser cambiado
              </div>
            )}
          </div>
          {!isLocked && (
            <button
              type="button"
              onClick={handleClearSponsor}
              className="text-sm text-green-600 hover:text-green-800 mt-1 underline"
              data-testid={`${dataTestId}-clear-button`}
            >
              Clear selection
            </button>
          )}
        </div>
      )}
      {validationError && (
        <div className="text-red-500 text-sm mt-1" data-testid={`${dataTestId}-error`}>
          {validationError}
        </div>
      )}
      <SponsorSearch
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSponsorSelect}
        selectedSponsorId={selectedSponsorId}
      />
    </>
  )
}

export default SponsorInput 