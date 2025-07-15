"use client"
import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"
import { HttpTypes } from "@medusajs/types"

// Placeholder for the right panel (profile/activity)
const OfficeRightPanel = () => (
  <aside className="h-full w-full bg-white rounded-xl shadow p-6 flex flex-col gap-6">
    {/* TODO: Add profile card, activity feed, and message input here */}
    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
      <span>Right Panel (Profile & Activity)</span>
    </div>
  </aside>
)

interface OfficeLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const OfficeLayout: React.FC<OfficeLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1 min-h-0">
        {/* {customer && <OfficeNav customer={customer} isCollapsed={isCollapsed} />} */}
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </main>
        {/* Right Panel */}
        {/* <div className="w-[340px] border-l border-gray-200 bg-gray-50 p-0">
          <OfficeRightPanel />
        </div> */}
      </div>
      {/* Responsive Footer/help section */}
      <footer className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-t border-gray-200 py-6 sm:py-8 px-4 sm:px-8 gap-4 sm:gap-8 bg-white">
        <div className="w-full sm:w-auto">
          <h3 className="text-lg sm:text-xl-semi mb-2 sm:mb-4">¿Tienes preguntas?</h3>
          <span className="txt-medium text-sm sm:text-base">
            Puedes encontrar preguntas frecuentes y respuestas en nuestra
            página de servicio al cliente.
          </span>
        </div>
        <div className="w-full sm:w-auto">
          <UnderlineLink href="/customer-service">
            Servicio al Cliente
          </UnderlineLink>
        </div>
      </footer>
    </div>
  )
}

export default OfficeLayout
