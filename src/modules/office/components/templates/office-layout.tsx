import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"
import OfficeNav from "../office-nav"
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
        {/* Sidebar */}
        <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col p-6">
          {customer && <OfficeNav customer={customer} />}
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </main>
        {/* Right Panel */}
        {/* <div className="w-[340px] border-l border-gray-200 bg-gray-50 p-0">
          <OfficeRightPanel />
        </div> */}
      </div>
      {/* Footer/help section (optional, can be removed if not needed) */}
      <footer className="flex flex-col small:flex-row items-end justify-between border-t border-gray-200 py-8 px-8 gap-8 bg-white">
        <div>
          <h3 className="text-xl-semi mb-4">Got questions?</h3>
          <span className="txt-medium">
            You can find frequently asked questions and answers on our
            customer service page.
          </span>
        </div>
        <div>
          <UnderlineLink href="/customer-service">
            Customer Service
          </UnderlineLink>
        </div>
      </footer>
    </div>
  )
}

export default OfficeLayout
