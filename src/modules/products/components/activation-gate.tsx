"use client"

import React, { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { useRouter, usePathname } from "next/navigation"

import { checkActivationEligibility } from "@lib/data/customer-status"
import { getProductGateConfig } from "@lib/util/product-gates"

type Props = {
  product: HttpTypes.StoreProduct
  countryCode: string
  children: React.ReactNode
}

type GateStatus = "loading" | "logged-out" | "blocked" | "allowed"

/**
 * Bloquea la compra a quien no cumpla la ventana de inactividad (oferta de reactivación).
 *
 * Se enciende con `gate_reactivation_only` en la metadata del producto y se afina con
 * `gate_min_days_inactive` y `gate_require_ever_qualified`. Con los defaults actuales
 * solo exige sesión iniciada, así que cualquier socio inscrito puede comprar.
 */
export default function ActivationGate({ product, countryCode, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const [status, setStatus] = useState<GateStatus>("loading")

  const { reactivationOnly, minDaysInactive, requireEverQualified } =
    getProductGateConfig(product)

  useEffect(() => {
    if (!reactivationOnly) {
      return
    }

    let active = true

    checkActivationEligibility(minDaysInactive, requireEverQualified)
      .then((result) => {
        if (!active) return

        if (!result.isLoggedIn) {
          setStatus("logged-out")
          return
        }

        setStatus(result.isEligible ? "allowed" : "blocked")
      })
      .catch((err) => {
        console.error("Error checking activation eligibility:", err)
        if (active) {
          setStatus("blocked")
        }
      })

    return () => {
      active = false
    }
  }, [reactivationOnly, minDaysInactive, requireEverQualified, product.id])

  if (!reactivationOnly) {
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
            Oferta de Reactivación
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-8">
            Inicia sesión para descubrir si calificas para este paquete exclusivo que hemos preparado para tu regreso.
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
        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
            Oferta Exclusiva
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            {minDaysInactive > 0
              ? `Este paquete es exclusivo para usuarios con más de ${minDaysInactive} días de inactividad. Sigue explorando nuestros productos para encontrar más ofertas diseñadas para ti.`
              : "Este paquete no está disponible para tu cuenta en este momento. Sigue explorando nuestros productos para encontrar más ofertas diseñadas para ti."}
          </p>
        </div>
      </div>
    )
  }

  // Al cumplir las condiciones, mostramos el mensaje de bienvenida y el botón de añadir al carrito
  return (
    <div className="w-full space-y-8 my-8">
      <div className="w-full relative overflow-hidden rounded-3xl bg-[#0B0F19] px-6 py-12 shadow-2xl sm:px-12 border border-white/5">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[80%] h-48 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
            ¡Felicidades, cumples con los requisitos!
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Eres acreedor a comprar este paquete y disfrutar de tu reactivación. Agrega el producto a tu carrito a continuación.
          </p>
        </div>
      </div>

      <div className="pt-4">
        {children}
      </div>
    </div>
  )
}
