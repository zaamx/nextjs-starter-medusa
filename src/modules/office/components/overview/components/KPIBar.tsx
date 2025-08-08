"use client"
import React from "react"

interface KPI {
  label: string
  value: string
  countdown: boolean
}

interface KPIBarProps {
  kpis: KPI[]
}

const KPIBar: React.FC<KPIBarProps> = ({ kpis }) => {
  return (
    <div className="w-full">
      <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="flex-shrink-0 bg-white rounded-xl shadow px-3 sm:px-5 py-3 sm:py-2 flex flex-col items-center min-w-[100px] sm:min-w-[120px] border border-gray-100">
            <span className="text-xs text-gray-500 font-medium text-center">{kpi.label}</span>
            <span className={`font-bold text-lg sm:text-2xl ${kpi.countdown ? "text-blue-600 font-mono" : "text-gray-900"} text-center`}>{kpi.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KPIBar
