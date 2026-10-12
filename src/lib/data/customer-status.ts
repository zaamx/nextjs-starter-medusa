"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getQualifiedInfoCookie, setQualifiedInfo } from "./cookies"
import { retrieveCustomer } from "./customer"

/**
 * Evalúa si el cliente logueado cumple el bloqueo de reactivación de un producto.
 *
 * Los parámetros los decide `getProductGateConfig` a partir de la metadata del
 * producto, para que comercial pueda moverlos desde el admin de Medusa.
 *
 * @param minDaysInactive      Días mínimos sin calificar. 0 = sin ventana.
 * @param requireEverQualified Si true, quien nunca calificó queda bloqueado.
 */
export async function checkActivationEligibility(
  minDaysInactive: number = 0,
  requireEverQualified: boolean = false
) {
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
    // days_without_qualified viene negativo cuando el socio calificó en el periodo
    // vigente, cuyo end_date aún no llega. Eso es "cero días de inactividad".
    const daysInactive = Math.max(0, Number(qualifiedInfo.days_without_qualified) || 0)

    return {
      isLoggedIn: true,
      isEligible: daysInactive >= minDaysInactive
    }
  }

  // Sin fila de calificación: el socio nunca acumuló 75 QV en un periodo.
  return { isLoggedIn: true, isEligible: !requireEverQualified }
}

/**
 * Devuelve el netme_profile_id del cliente logueado.
 * Lo usan los gates de producto que necesitan consultar reportes de la red
 * (netme_*) fuera de la oficina virtual, donde no existe OfficeProvider.
 */
export async function getCustomerNetmeProfileId(): Promise<{
  isLoggedIn: boolean
  profileId: number | null
}> {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return { isLoggedIn: false, profileId: null }
  }

  const rawProfileId = (customer.metadata as any)?.netme_profile_id
  const profileId = Number(rawProfileId)

  return {
    isLoggedIn: true,
    profileId: Number.isFinite(profileId) && profileId > 0 ? profileId : null,
  }
}
