"use client"

import React, { useState } from "react"
import Input from "@modules/common/components/input"
import SponsorSearch from "@modules/common/components/sponsor-search"

interface SponsorInputProps {
  label: string
  name: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  "data-testid"?: string
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
  "data-testid": dataTestId
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | undefined>(
    value || undefined
  )
  const [selectedSponsorInfo, setSelectedSponsorInfo] = useState<SponsorInfo | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

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
    setIsModalOpen(true)
  }

  const handleClearSponsor = () => {
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
          style={{ background: "#f9fafb", cursor: "pointer" }}
        />
        <div
          className="absolute inset-0 cursor-pointer"
          style={{ background: "transparent" }}
          onClick={handleInputClick}
          data-testid={`${dataTestId}-overlay`}
        />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          data-testid={`${dataTestId}-search-button`}
          style={{ zIndex: 2 }}
        >
          Buscar
        </button>
      </div>
      {!selectedSponsorId && required && !validationError && (
        <div className="text-gray-400 text-sm mt-1">
          Haz clic en "Buscar" para seleccionar un patrocinador (requerido)
        </div>
      )}
      {selectedSponsorInfo && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <div className="font-medium">
              Selected: {selectedSponsorInfo.first_name} {selectedSponsorInfo.last_name}
            </div>
            <div className="text-green-600">{selectedSponsorInfo.email}</div>
            <div className="text-green-600">ID: {selectedSponsorInfo.netme_id}</div>
          </div>
          <button
            type="button"
            onClick={handleClearSponsor}
            className="text-sm text-green-600 hover:text-green-800 mt-1 underline"
            data-testid={`${dataTestId}-clear-button`}
          >
            Clear selection
          </button>
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