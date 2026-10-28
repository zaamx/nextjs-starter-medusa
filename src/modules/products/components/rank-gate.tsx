"use client"

import React, { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { useRouter, usePathname } from "next/navigation"

import { getCustomerNetmeProfileId } from "@lib/data/customer-status"
import {
  fetchCurrentPeriod,
  fetchNetmeRanks,
  fetchProfileRankSummary,
} from "@lib/data/netme_network"
import { getProductGateConfig, RankSource } from "@lib/util/product-gates"

type Props = {
  product: HttpTypes.StoreProduct
  countryCode: string
  children: React.ReactNode
}

type GateStatus = "loading" | "logged-out" | "blocked" | "allowed"

type NetmeRank = { id: number; name: string; level: number }

// El RPC netme_profile_rank_summary devuelve un nombre por cada tipo de rango.
const RANK_FIELD_BY_SOURCE: Record<RankSource, string> = {
  current: "current_rank_name",
  lifetime: "lifetime_rank_name",
  monthly: "last_monthly_rank_name",
}

/**
 * Resuelve el rango mínimo escrito en la metadata contra el catálogo netme_ranks.
 * Acepta un nivel ("3") o un nombre ("Esmeralda", sin distinguir mayúsculas).
 * Devuelve 0 cuando no se puede resolver, que equivale a gate apagado.
 */
function resolveMinLevel(minRank: string | null, ranks: NetmeRank[]): number {
  if (!minRank) {
    return 0
  }

  const asNumber = Number(minRank)
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return asNumber
  }

  const match = ranks.find(
    (rank) => rank.name.trim().toLowerCase() === minRank.trim().toLowerCase()
  )

  if (!match) {
    console.warn(
      `[rank-gate] No existe el rango "${minRank}" en netme_ranks. Rangos válidos: ${ranks
        .map((r) => r.name)
        .join(", ")}. El bloqueo queda apagado.`
    )
    return 0
  }

  return match.level
}

/** Nivel del rango que trae el perfil, o 0 si es "Sin rango" o no se reconoce. */
function levelOfRankName(rankName: string | null, ranks: NetmeRank[]): number {
  if (!rankName) {
    return 0
  }
  const match = ranks.find(
    (rank) => rank.name.trim().toLowerCase() === rankName.trim().toLowerCase()
  )
  return match?.level ?? 0
}

/**
 * Bloquea la compra a los socios que no alcancen cierto rango.
 *
 * Se enciende con `gate_min_rank` en la metadata del producto y se afina con
 * `gate_rank_source` (current por defecto: el rango del periodo vigente).
 *
 * Falla cerrado: sin sesión, sin netme_profile_id, sin periodo vigente, error de
 * RPC o perfil sin rango, se bloquea la compra.
 */
export default function RankGate({ product, countryCode, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const [status, setStatus] = useState<GateStatus>("loading")
  const [requiredRankName, setRequiredRankName] = useState<string | null>(null)
  const [currentRankName, setCurrentRankName] = useState<string | null>(null)

  const { minRank, rankSource } = getProductGateConfig(product)
  const isGated = !!minRank

  useEffect(() => {
    if (!isGated) {
      return
    }

    let active = true

    const checkRank = async () => {
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

        const [summaryResult, ranksResult] = await Promise.all([
          fetchProfileRankSummary(profileId, periodResult.data.id),
          fetchNetmeRanks(),
        ])

        if (!active) return

        if (!summaryResult.success || !summaryResult.data || !ranksResult.success) {
          setStatus("blocked")
          return
        }

        const ranks = (ranksResult.data || []) as NetmeRank[]
        const minLevel = resolveMinLevel(minRank, ranks)

        // Un mínimo que no se resuelve deja el bloqueo apagado.
        if (minLevel <= 0) {
          setStatus("allowed")
          return
        }

        // Avisamos si el mínimo configurado no lo alcanza nadie en el catálogo.
        const topLevel = Math.max(0, ...ranks.map((r) => r.level))
        if (minLevel > topLevel) {
          console.warn(
            `[rank-gate] El rango mínimo (nivel ${minLevel}) supera al rango más alto del catálogo (nivel ${topLevel}). Nadie podrá comprar este producto.`
          )
        }

        const rankName = (summaryResult.data as any)[RANK_FIELD_BY_SOURCE[rankSource]]
        const level = levelOfRankName(rankName, ranks)

        setCurrentRankName(rankName ?? null)
        setRequiredRankName(ranks.find((r) => r.level === minLevel)?.name ?? minRank)
        setStatus(level >= minLevel ? "allowed" : "blocked")
      } catch (err) {
        console.error("Error checking rank gate:", err)
        if (active) {
          setStatus("blocked")
        }
      }
    }

    checkRank()

    return () => {
      active = false
    }
  }, [isGated, minRank, rankSource, product.id])

  if (!isGated) {
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
            Paquete Exclusivo por Rango
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-8">
            Inicia sesión para verificar tu rango y desbloquear este paquete.
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
            Paquete Exclusivo por Rango
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-8">
            {requiredRankName
              ? `Este paquete es exclusivo para el rango ${requiredRankName} o superior.`
              : "Este paquete es exclusivo para rangos superiores."}
            {currentRankName && currentRankName !== "Sin rango"
              ? ` Tu rango actual es ${currentRankName}.`
              : " Todavía no tienes rango asignado."}
          </p>
          <LocalizedOfficeLink countryCode={countryCode} />
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/** Atajo a la oficina virtual, donde el socio ve su avance de rango. */
function LocalizedOfficeLink({ countryCode }: { countryCode: string }) {
  return (
    <a
      href={`/${countryCode}/office/rank-calculator`}
      className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      Ver mi avance de rango
    </a>
  )
}
