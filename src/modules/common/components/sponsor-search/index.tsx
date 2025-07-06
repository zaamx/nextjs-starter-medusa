"use client"

import React, { useState, useEffect } from "react"
import { sdk } from "@lib/config"
import Modal from "@modules/common/components/modal"
import Input from "@modules/common/components/input"
import Spinner from "@modules/common/icons/spinner"

interface SponsorProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  has_account: boolean
  netme_id: number | null
  // Other fields exist but we only display name, last name, and email
}

interface SponsorSearchProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (sponsorId: string) => void
  selectedSponsorId?: string
}

const SponsorSearch: React.FC<SponsorSearchProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedSponsorId
}) => {
  const [query, setQuery] = useState("")
  const [sponsors, setSponsors] = useState<SponsorProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchSponsors = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSponsors([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await sdk.client.fetch<{ results: SponsorProfile[] }>(
        `/store/netme/search?query=${encodeURIComponent(searchQuery)}`,
        {
          method: "GET",
        }
      )
      
      // Filter out sponsors without netme_id
      const validSponsors = (response.results || []).filter(sponsor => sponsor.netme_id !== null)
      setSponsors(validSponsors)
    } catch (err) {
      console.error("Error searching sponsors:", err)
      setError("Failed to search sponsors. Please try again.")
      setSponsors([])
    } finally {
      setLoading(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchSponsors(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelectSponsor = (sponsor: SponsorProfile) => {
    console.log('=== SPONSOR SEARCH SELECTION ===')
    console.log('Selected sponsor object:', sponsor)
    // console.log('Sponsor netme_id:', sponsor.netme_id)
    // console.log('Sponsor netme_id type:', typeof sponsor.netme_id)
    // console.log('Converting to string:', sponsor.netme_id.toString())
    onSelect(sponsor.netme_id?.toString() || "")
    onClose()
  }

  const handleClearSelection = () => {
    onSelect("") // Clear selection
    onClose()
  }

  return (
    <Modal isOpen={isOpen} close={onClose} size="large">
      <Modal.Title>Search Sponsor</Modal.Title>
      <Modal.Body>
        <div className="w-full max-w-2xl">
          <div className="mb-4">
            <Input
              label="Search by name, email, or ID"
              name="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="sponsor-search-input"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4" data-testid="sponsor-search-error">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-8">
              <Spinner size={24} />
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-2">
              {sponsors.length === 0 && query.trim() && (
                <div className="text-center py-8 text-gray-500">
                  No valid sponsors found for "{query}"
                </div>
              )}

              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSponsorId === sponsor.netme_id?.toString() ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectSponsor(sponsor)}
                  data-testid={`sponsor-option-${sponsor.id}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {sponsor.first_name} {sponsor.last_name}
                      </div>
                      <div className="text-sm text-gray-600">{sponsor.email}</div>
                    </div>
                    <div className="text-sm text-gray-500">ID: {sponsor.netme_id || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSponsorId && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                Selected Sponsor ID: {selectedSponsorId}
              </div>
              <button
                onClick={handleClearSelection}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                data-testid="clear-sponsor-selection"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default SponsorSearch 