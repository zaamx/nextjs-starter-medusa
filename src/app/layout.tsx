import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  // Fix for Next.js dev overlay crash when global.localStorage is improperly mocked as {}
  if (typeof window === 'undefined' && typeof global !== 'undefined') {
    // @ts-ignore
    if (typeof global.localStorage !== 'undefined' && typeof global.localStorage.getItem !== 'function') {
      // @ts-ignore
      delete global.localStorage
    }
  }

  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
