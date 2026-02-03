"use client"

const MYSTORE_STORAGE_KEY = 'wenow_mystore_sponsor_id'
const MYSTORE_LOCKED_KEY = 'wenow_mystore_locked'

export interface MystoreData {
  sponsorId: string
  isLocked: boolean
}

/**
 * Safely check if localStorage is available
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined' &&
      typeof window.localStorage.getItem === 'function'
    )
  } catch (e) {
    return false
  }
}

/**
 * Store the mystore sponsor ID in localStorage
 */
export const storeMystoreSponsor = (sponsorId: string, isLocked: boolean = true): boolean => {
  if (!isLocalStorageAvailable()) return false

  try {
    window.localStorage.setItem(MYSTORE_STORAGE_KEY, sponsorId)
    window.localStorage.setItem(MYSTORE_LOCKED_KEY, isLocked.toString())
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
  if (!isLocalStorageAvailable()) return null

  try {
    const sponsorId = window.localStorage.getItem(MYSTORE_STORAGE_KEY)
    const isLocked = window.localStorage.getItem(MYSTORE_LOCKED_KEY) === 'true'

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
  if (!isLocalStorageAvailable()) return

  try {
    window.localStorage.removeItem(MYSTORE_STORAGE_KEY)
    window.localStorage.removeItem(MYSTORE_LOCKED_KEY)
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
