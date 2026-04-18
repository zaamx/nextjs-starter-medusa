import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import OfficeNav from "@modules/office/components/office-nav"
import Footer from "@modules/layout/templates/footer"
import { OfficeProvider } from "@lib/context/office-context"
import { MystoreProvider } from "@modules/common/components/mystore-provider"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OfficeProvider>
      <MystoreProvider>
        <div className="flex flex-col h-screen overflow-hidden">
          <OfficeNav />
          <div className="flex flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </MystoreProvider>
    </OfficeProvider>
  )
}
