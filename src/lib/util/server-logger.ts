"use server"

import { headers } from "next/headers"

export async function logToServer(
  level: "info" | "warn" | "error",
  message: string,
  data?: any
) {
  try {
    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || "unknown"
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
    
    const logData = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userAgent,
      ip,
      environment: process.env.NODE_ENV
    }

    console.log(`🚀 [CLIENT-${level.toUpperCase()}] ${message}`, logData)
    
    return { success: true }
  } catch (error) {
    console.error("Failed to log to server:", error)
    return { success: false, error }
  }
}

// Convenience functions
export async function logInfo(message: string, data?: any) {
  return logToServer("info", message, data)
}

export async function logWarn(message: string, data?: any) {
  return logToServer("warn", message, data)
}

export async function logError(message: string, data?: any) {
  return logToServer("error", message, data)
}
