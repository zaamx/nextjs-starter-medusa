"use client"

import { useCallback } from "react"

export function useServerLogger() {
  const logToServer = useCallback(async (
    level: "info" | "warn" | "error",
    message: string,
    data?: any
  ) => {
    try {
      const response = await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          message,
          data,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        console.warn("Failed to send log to server:", response.statusText)
      }
    } catch (error) {
      console.warn("Failed to send log to server:", error)
    }
  }, [])

  const logInfo = useCallback((message: string, data?: any) => {
    return logToServer("info", message, data)
  }, [logToServer])

  const logWarn = useCallback((message: string, data?: any) => {
    return logToServer("warn", message, data)
  }, [logToServer])

  const logError = useCallback((message: string, data?: any) => {
    return logToServer("error", message, data)
  }, [logToServer])

  return {
    logInfo,
    logWarn,
    logError,
    logToServer
  }
}
