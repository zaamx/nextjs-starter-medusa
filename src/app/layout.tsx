import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Inter, Barlow_Condensed } from "next/font/google"
import "styles/globals.css"
import BugReportButton from "@modules/common/components/bug-report-button"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-barlow-condensed",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  // Attempt to clear potentially broken global.localStorage on server-side to prevent
  // issues with libraries that check for its existence during SSR.
  if (typeof window === 'undefined' && typeof global !== 'undefined') {
    try {
      // @ts-ignore - Avoid accessing it directly if possible to not trigger Node 22 warnings
      const descriptor = Object.getOwnPropertyDescriptor(global, 'localStorage');
      if (descriptor) {
        // @ts-ignore
        if (typeof global.localStorage !== 'undefined' && typeof global.localStorage.getItem !== 'function') {
          // @ts-ignore
          delete global.localStorage
        }
      }
    } catch (e) {
      // Silently ignore errors from accessing experimental global properties
    }
  }

  return (
    <html lang="en" data-mode="light" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body className={inter.className}>
        <main className="relative">{props.children}</main>
        <BugReportButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
