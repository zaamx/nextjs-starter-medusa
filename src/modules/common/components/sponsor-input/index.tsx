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

  // Update selectedSponsorId when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedSponsorId(value)
    }
  }, [value])

  const handleSponsorSelect = (sponsorId: string) => {
    // console.log('=== SPONSOR INPUT SELECTION ===')
    // console.log('SponsorInput received sponsorId:', sponsorId)
    // console.log('SponsorInput sponsorId type:', typeof sponsorId)
    setSelectedSponsorId(sponsorId === "" ? undefined : sponsorId)
    onChange?.(sponsorId)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    console.log('=== SPONSOR INPUT CHANGE ===')
    console.log('Input changed to:', newValue)
    console.log('Input value type:', typeof newValue)
    setSelectedSponsorId(newValue || undefined)
    onChange?.(newValue)
  }

  // Update the input value when selectedSponsorId changes
  React.useEffect(() => {
    // console.log('=== SPONSOR INPUT USEEFFECT ===')
    // console.log('selectedSponsorId:', selectedSponsorId)
    // console.log('selectedSponsorId type:', typeof selectedSponsorId)
    if (selectedSponsorId !== undefined) {
      // console.log('Calling onChange with:', selectedSponsorId)
      onChange?.(selectedSponsorId)
    }
  }, [selectedSponsorId, onChange])

  // Log render state
  // console.log('=== SPONSOR INPUT RENDER ===', { value, selectedSponsorId, name })

  return (
    <div className="relative">
      <Input
        label={label}
        name={name}
        value={selectedSponsorId || ""}
        onChange={handleInputChange}
        required={required}
        data-testid={dataTestId}
      />
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        data-testid={`${dataTestId}-search-button`}
      >
        Search
      </button>
      
      <SponsorSearch
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSponsorSelect}
        selectedSponsorId={selectedSponsorId}
      />
    </div>
  )
}

export default SponsorInput 