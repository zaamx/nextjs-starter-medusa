import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "mx"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  try {
    if (!BACKEND_URL) {
      console.error("[middleware] BACKEND_URL is not set!")
      throw new Error(
        "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }

    if (
      !regionMap.keys().next().value ||
      regionMapUpdated < Date.now() - 3600 * 1000
    ) {
      console.log(`[middleware] Fetching regions from: ${BACKEND_URL}/store/regions`)
      const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
        next: {
          revalidate: 3600,
          tags: [`regions-${cacheId}`],
        },
        cache: "force-cache",
      }).then(async (response) => {
        const json = await response.json()
        if (!response.ok) {
          console.error(`[middleware] Error response from backend:`, json)
          throw new Error(json.message)
        }
        return json
      })

      if (!regions?.length) {
        console.error("[middleware] No regions found in backend response!")
        throw new Error(
          "No regions found. Please set up regions in your Medusa Admin."
        )
      }

      // Create a map of country codes to regions.
      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
          regionMapCache.regionMap.set(c.iso_2 ?? "", region)
        })
      })

      regionMapCache.regionMapUpdated = Date.now()
      console.log(`[middleware] Region map updated. Keys:`, Array.from(regionMapCache.regionMap.keys()))
    }
  } catch (err: any) {
    console.error("[middleware] getRegionMap error:", err?.stack || err)
    throw err
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    // console.log(`[middleware] getCountryCode: urlCountryCode=${urlCountryCode}, vercelCountryCode=${vercelCountryCode}`)

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    // console.log(`[middleware] getCountryCode: resolved countryCode=${countryCode}`)
    return countryCode
  } catch (error: any) {
    console.error("[middleware] getCountryCode error:", error?.stack || error)
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  try {
    // console.log("[middleware] Incoming request:", request.url)
    // console.log("[middleware] BACKEND_URL:", BACKEND_URL)
    // console.log("[middleware] PUBLISHABLE_API_KEY exists?", !!PUBLISHABLE_API_KEY)
    // console.log("[middleware] DEFAULT_REGION:", DEFAULT_REGION)

    let redirectUrl = request.nextUrl.href
    let response = NextResponse.redirect(redirectUrl, 307)
    let cacheIdCookie = request.cookies.get("_medusa_cache_id")
    let cacheId = cacheIdCookie?.value || crypto.randomUUID()

    const regionMap = await getRegionMap(cacheId)
    // console.log("[middleware] regionMap keys:", Array.from(regionMap.keys()))

    const countryCode = regionMap && (await getCountryCode(request, regionMap))
    // console.log("[middleware] countryCode:", countryCode)

    const urlHasCountryCode =
      countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

    if (urlHasCountryCode && cacheIdCookie) {
      //  cacheIdCookie: NextResponse.next()")
      return NextResponse.next()
    }

    if (urlHasCountryCode && !cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
      // console.log("[middleware] urlHasCountryCode && !cacheIdCookie: set cookie and redirect")
      return response
    }

    if (request.nextUrl.pathname.includes(".")) {
      // console.log("[middleware] Static asset detected: NextResponse.next()")
      return NextResponse.next()
    }

    const redirectPath =
      request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
    const queryString = request.nextUrl.search ? request.nextUrl.search : ""

    if (!urlHasCountryCode && countryCode) {
      redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
      response = NextResponse.redirect(`${redirectUrl}`, 307)
      // console.log("[middleware] Redirecting to:", redirectUrl)
    }

    return response
  } catch (err: any) {
    console.error("[middleware] ERROR:", err?.stack || err)
    // Optionally, log the error as a string for Vercel's log search
    try {
      console.log("[middleware] ERROR STRING:", JSON.stringify(err, Object.getOwnPropertyNames(err)))
    } catch (jsonErr) {
      console.log("[middleware] ERROR JSON stringify failed:", jsonErr)
    }
    return new Response("Internal middleware error: " + (err?.message || err), { status: 500 })
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
