"use client"

import React, { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { useRouter, usePathname } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCustomerNetmeProfileId } from "@lib/data/customer-status"
import { fetchCurrentPeriod, fetchRenewalStatus } from "@lib/data/netme_network"

// SKUs de variantes restringidas a socios activos.
const ACTIVE_ONLY_SKUS = ["WNBONUS", "WNWAREHOUSE"]

// Producto al que mandamos a los socios inactivos para reactivarse.
const RENEWAL_PRODUCT_HREF = "/products/paquete-de-recompra"

type Props = {
  product: HttpTypes.StoreProduct
  countryCode: string
  children: React.ReactNode
}

type GateStatus = "loading" | "logged-out" | "blocked" | "allowed"

/**
 * Bloquea la compra del Paquete Bonus (SKU WNBONUS) a los socios que no estén activos.
 *
 * "Activo" = netme_next_renewal devuelve una renovación con days_left > 0, es decir,
 * el socio hizo al menos 75 QV dentro de las últimas 4 semanas.
 *
 * Falla cerrado: si no hay sesión, no hay netme_profile_id, la RPC truena o el socio
 * nunca calificó, se bloquea la compra.
 */
export default function ActiveMemberGate({ product, countryCode, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const [status, setStatus] = useState<GateStatus>("loading")
  const [renewalPeriodName, setRenewalPeriodName] = useState<string | null>(null)

  // Solo aplicamos la validación a las variantes restringidas.
  const isRestricted = !!product.variants?.some((variant) =>
    ACTIVE_ONLY_SKUS.includes((variant.sku ?? "").toUpperCase())
  )

  useEffect(() => {
    if (!isRestricted) {
      return
    }

    let active = true

    const checkActiveStatus = async () => {
      try {
        const { isLoggedIn, profileId } = await getCustomerNetmeProfileId()

        if (!active) return

        if (!isLoggedIn) {
          setStatus("logged-out")
          return
        }

        if (!profileId) {
          setStatus("blocked")
          return
        }

        const periodResult = await fetchCurrentPeriod()

        if (!active) return

        if (!periodResult.success || !periodResult.data) {
          setStatus("blocked")
          return
        }

        const renewalResult = await fetchRenewalStatus(profileId, periodResult.data.id)

        if (!active) return

        if (!renewalResult.success || !renewalResult.data) {
          // Sin fila = el socio nunca acumuló 75 QV en un periodo.
          setStatus("blocked")
          return
        }

        setRenewalPeriodName(renewalResult.data.renewal_period_name ?? null)
        setStatus(renewalResult.data.days_left > 0 ? "allowed" : "blocked")
      } catch (err) {
        console.error("Error checking active member status:", err)
        if (active) {
          setStatus("blocked")
        }
      }
    }

    checkActiveStatus()

    return () => {
      active = false
    }
  }, [isRestricted, product.id])

  if (!isRestricted) {
    return <>{children}</>
  }

  // Evitamos problemas de hidratación renderizando un skeleton hasta resolver el estatus.
  if (status === "loading") {
    return (
      <div className="w-full min-h-[150px] animate-pulse bg-ui-bg-subtle rounded-3xl" />
    )
  }

  if (status === "logged-out") {
    const handleLoginRedirect = () => {
      router.push(`/${countryCode}/account?redirect=${encodeURIComponent(pathname)}`)
    }

    return (
      <div className="w-full relative overflow-hidden rounded-3xl bg-[#0B0F19] px-6 py-16 shadow-2xl sm:px-12 my-8 border border-white/5">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[80%] h-48 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
            Paquete Exclusivo para Socios Activos
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-8">
            Inicia sesión para verificar tu estatus y desbloquear este paquete.
          </p>
          <button
            onClick={handleLoginRedirect}
            className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  if (status === "blocked") {
    return (
      <div className="w-full relative overflow-hidden rounded-3xl bg-[#0B0F19] px-6 py-16 shadow-2xl sm:px-12 my-8 border border-white/5">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[80%] h-48 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
            Paquete Exclusivo para Socios Activos
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-8">
            {renewalPeriodName
              ? `Tu renovación venció en ${renewalPeriodName}. Realiza una compra de al menos 75 QV para reactivarte y desbloquear este paquete.`
              : "Necesitas estar activo para comprar este paquete. Realiza una compra de al menos 75 QV para activarte."}
          </p>
          <LocalizedClientLink
            href={RENEWAL_PRODUCT_HREF}
            className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Comprar Paquete de Recompra
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
