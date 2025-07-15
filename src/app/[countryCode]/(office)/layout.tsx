import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import OfficeNav from "@modules/office/components/office-nav"
import Footer from "@modules/layout/templates/footer"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <OfficeNav />
      {children}
      <Footer />
    </>
  )
}
