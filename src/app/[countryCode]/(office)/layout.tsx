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
        <OfficeNav />
        {children}
        <Footer />
      </MystoreProvider>
    </OfficeProvider>
  )
}
