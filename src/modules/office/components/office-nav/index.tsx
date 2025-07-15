"use client"

import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useOffice } from "@lib/context/office-context"
import CartButton from "@modules/layout/components/cart-button"
import OfficeSideMenu from "../office-side-menu"

export default function OfficeNav() {
  const { periods, selectedPeriod, setSelectedPeriodById } = useOffice()

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const periodId = Number(event.target.value)
    setSelectedPeriodById(periodId)
  }

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-14 sm:h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular px-3 sm:px-6">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <OfficeSideMenu regions={[]} />
            </div>
          </div>

          <div className="flex items-center h-full gap-2 sm:gap-4">
            <LocalizedClientLink
              href="/"
              className="txt-compact-large-plus sm:txt-compact-xlarge-plus hover:text-ui-fg-base uppercase font-bold"
              data-testid="nav-store-link"
            >
              <span className="hidden sm:inline">WeNow Office</span>
              <span className="sm:hidden">WENOW</span>
            </LocalizedClientLink>
            
            {/* Responsive Period Selector */}
            <div className="flex items-center gap-1 sm:gap-2">
              <label htmlFor="period-selector" className="text-xs font-medium text-gray-600 hidden sm:block">
                Período:
              </label>
              <select
                id="period-selector"
                value={selectedPeriod?.id || ""}
                onChange={handlePeriodChange}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[80px] sm:min-w-[120px]"
              >
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                Tu Cuenta
              </LocalizedClientLink>
            </div>
          </div> */}
        </nav>
      </header>
    </div>
  )
}
