"use client"
import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"
import { HttpTypes } from "@medusajs/types"
import OfficeSidebar from "@modules/office/components/office-sidebar"

interface OfficeLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const OfficeLayout: React.FC<OfficeLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Permanent sidebar — desktop only */}
      {customer && <OfficeSidebar />}

      {/* Main area — scrolls independently */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
        <main className="flex-1">
          {children}
        </main>

        <footer className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-t border-gray-200 py-4 px-4 sm:px-8 gap-4 bg-white">
          <div>
            <h3 className="text-base font-medium mb-1">¿Tienes preguntas?</h3>
            <span className="text-sm text-gray-500">
              Puedes encontrar preguntas frecuentes en nuestra página de servicio al cliente.
            </span>
          </div>
          <UnderlineLink href="/customer-service">
            Servicio al Cliente
          </UnderlineLink>
        </footer>
      </div>
    </div>
  )
}

export default OfficeLayout
