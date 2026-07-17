"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getQualifiedInfoCookie, setQualifiedInfo } from "./cookies"

export async function checkActivationEligibility() {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders || !("authorization" in authHeaders)) {
    return { isLoggedIn: false, isEligible: false }
  }

  // Intentamos leer de la cookie primero para mayor velocidad
  const cachedInfo = await getQualifiedInfoCookie()
  let qualifiedInfo = null

  if (cachedInfo) {
    try {
      qualifiedInfo = JSON.parse(cachedInfo)
    } catch (e) {
      console.error("Failed to parse cached qualified info")
    }
  }

  // Si no está en cache (ej. sesión anterior), la obtenemos directamente
  if (!qualifiedInfo) {
    try {
      const data = await sdk.client.fetch<any>('/store/customers/me/last-qualified-info', {
        method: "GET",
        headers: authHeaders as Record<string, string>
      })
      console.log("Qualified info 2", data)

      if (data && Array.isArray(data) && data.length > 0) {
        qualifiedInfo = data[0]
        await setQualifiedInfo(JSON.stringify(qualifiedInfo)) // Cacheamos la info
      }
    } catch (err) {
      console.error("Failed to fetch qualified info inside Server Action:", err)
    }
  }

  if (qualifiedInfo) {
    // Validamos que los días sin calificación sean al menos 35 (5 semanas)
    return {
      isLoggedIn: true,
      isEligible: qualifiedInfo.days_without_qualified >= 35
    }
  }

  return { isLoggedIn: true, isEligible: false }
}
