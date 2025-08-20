"use client"

const MYSTORE_STORAGE_KEY = 'wenow_mystore_sponsor_id'
const MYSTORE_LOCKED_KEY = 'wenow_mystore_locked'

export interface MystoreData {
  sponsorId: string
  isLocked: boolean
}

/**
 * Store the mystore sponsor ID in localStorage
 */
export const storeMystoreSponsor = (sponsorId: string, isLocked: boolean = true): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.setItem(MYSTORE_STORAGE_KEY, sponsorId)
    localStorage.setItem(MYSTORE_LOCKED_KEY, isLocked.toString())
    return true
  } catch (error) {
    console.error('Failed to store mystore sponsor:', error)
    return false
  }
}

/**
 * Get the stored mystore sponsor ID from localStorage
 */
export const getMystoreSponsor = (): MystoreData | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const sponsorId = localStorage.getItem(MYSTORE_STORAGE_KEY)
    const isLocked = localStorage.getItem(MYSTORE_LOCKED_KEY) === 'true'
    
    if (sponsorId) {
      return {
        sponsorId,
        isLocked
      }
    }
  } catch (error) {
    console.error('Failed to get mystore sponsor:', error)
  }
  
  return null
}

/**
 * Clear the stored mystore sponsor ID
 */
export const clearMystoreSponsor = (): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(MYSTORE_STORAGE_KEY)
    localStorage.removeItem(MYSTORE_LOCKED_KEY)
  } catch (error) {
    console.error('Failed to clear mystore sponsor:', error)
  }
}

/**
 * Check if the current URL has a mystore parameter
 */
export const hasMystoreParameter = (searchParams: URLSearchParams): boolean => {
  return searchParams.has('mystore')
}

/**
 * Extract mystore parameter from URL search params
 */
export const extractMystoreParameter = (searchParams: URLSearchParams): string | null => {
  const mystore = searchParams.get('mystore')
  return mystore && /^\d+$/.test(mystore) ? mystore : null
}
