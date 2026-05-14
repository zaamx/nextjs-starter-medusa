"use client"

import { Suspense, useState, useEffect } from "react"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useOffice } from "@lib/context/office-context"
import CartButton from "@modules/layout/components/cart-button"
import OfficeSideMenu from "../office-side-menu"

// Componente para el contador de tiempo restante
const PeriodCountdown = ({ selectedPeriod }: { selectedPeriod: any }) => {
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!selectedPeriod?.end_date) return ""

      const now = new Date()
      // Crear la fecha de vencimiento asegurándonos de que sea al final del día
      const endDate = new Date(selectedPeriod.end_date + 'T23:59:59.999')
      
      const difference = endDate.getTime() - now.getTime()

      if (difference <= 0) {
        return "Vencido"
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        return `${days}d ${hours}h`
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`
      } else {
        return `${minutes}m`
      }
    }

    setTimeLeft(calculateTimeLeft())
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000) // Actualizar cada minuto

    return () => clearInterval(timer)
  }, [selectedPeriod])

  if (!selectedPeriod) return null

  const isExpired = timeLeft === "Vencido"
  const isNearExpiry = selectedPeriod?.end_date && (() => {
    const now = new Date()
    const endDate = new Date(selectedPeriod.end_date + 'T23:59:59.999')
    return endDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000 // Menos de 24 horas
  })()

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border ${
      isExpired
        ? 'border-red-500/40 text-red-400'
        : isNearExpiry
          ? 'border-orange-500/40 text-orange-400'
          : 'border-white/15 text-white/70'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        isExpired ? 'bg-red-500' : isNearExpiry ? 'bg-orange-400' : 'bg-green-400'
      }`} />
      <span>{timeLeft}</span>
    </div>
  )
}

export default function OfficeNav() {
  const { periods, selectedPeriod, setSelectedPeriodById } = useOffice()

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const periodId = Number(event.target.value)
    setSelectedPeriodById(periodId)
  }

  return (
    <div className="inset-x-0 z-50 flex-shrink-0">
      <header className="h-14 bg-brand-dark border-b border-white/10">
        <nav className="flex items-center justify-between w-full h-full px-3 sm:px-6 gap-4">

          {/* Mobile hamburger — hidden on desktop */}
          <div className="flex items-center h-full small:hidden">
            <OfficeSideMenu regions={[]} />
          </div>

          {/* Brand — desktop only (sidebar shows it on mobile) */}
          <div className="hidden small:flex flex-col justify-center">
            <span className="font-display text-sm tracking-widest text-brand-magenta leading-none">
              WE NOW
            </span>
            <span className="text-[9px] text-white/30 tracking-widest uppercase">
              Oficina Virtual
            </span>
          </div>

          {/* Period selector + countdown — pushed to the right */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <label htmlFor="period-selector" className="text-[10px] tracking-widest uppercase text-white/40 hidden sm:block">
              Período
            </label>
            <select
              id="period-selector"
              value={selectedPeriod?.id || ""}
              onChange={handlePeriodChange}
              className="text-xs bg-white/8 border border-white/15 text-white px-2 py-1.5 focus:outline-none focus:border-brand-magenta min-w-[90px] sm:min-w-[120px] rounded-none appearance-none cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
            >
              {periods.slice(0, 8).map((period) => (
                <option key={period.id} value={period.id} className="bg-gray-900 text-white">
                  {period.name}
                </option>
              ))}
            </select>

            <PeriodCountdown selectedPeriod={selectedPeriod} />
          </div>

        </nav>
      </header>
    </div>
  )
}
