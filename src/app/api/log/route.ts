import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { level, message, data, timestamp } = body

    // Get request metadata
    const userAgent = request.headers.get("user-agent") || "unknown"
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown"
    const referer = request.headers.get("referer") || "unknown"

    const logEntry = {
      level,
      message,
      data,
      timestamp: timestamp || new Date().toISOString(),
      metadata: {
        userAgent,
        ip,
        referer,
        environment: process.env.NODE_ENV
      }
    }

    // Log to Vercel console
    switch (level) {
      case "error":
        console.error(`🚀 [API-LOG-ERROR] ${message}`, logEntry)
        break
      case "warn":
        console.warn(`🚀 [API-LOG-WARN] ${message}`, logEntry)
        break
      default:
        console.log(`🚀 [API-LOG-INFO] ${message}`, logEntry)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to process log request:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process log" },
      { status: 500 }
    )
  }
}
