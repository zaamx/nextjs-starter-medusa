"use client"

import React, { useEffect, useState } from "react"
import * as Sentry from "@sentry/nextjs"
import { FaBullhorn } from "react-icons/fa"

export default function BugReportButton() {
  const [feedback, setFeedback] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Small delay to ensure Sentry is fully initialized on the client side
      const timer = setTimeout(() => {
        const fb = (Sentry as any).getFeedback?.()
        if (fb) setFeedback(fb)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClick = () => {
    if (feedback) {
      feedback.openDialog()
    }
  }

  if (!feedback) return null

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center h-10 w-10 hover:w-[130px] bg-[#1E1F29] hover:bg-[#2A2B36] text-white rounded-full transition-all duration-300 ease-in-out shadow-lg cursor-pointer overflow-hidden group border border-white/10"
      title="Report a Bug"
    >
      <div className="flex items-center px-3 gap-2.5 whitespace-nowrap w-full">
        <FaBullhorn className="w-4 h-4 flex-shrink-0 text-white" />
        <span className="text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Report a Bug
        </span>
      </div>
    </button>
  )
}
