"use client"
import React from "react"
import { FaBell } from "react-icons/fa"

interface Alert {
  type: string
  message: string
}

interface AlertsProps {
  alerts: Alert[]
}

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2 border-l-4 border-red-400">
      <div className="font-bold text-red-600 mb-1 flex items-center gap-2">
        <FaBell /> Alertas de calificación
      </div>
      <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
        {alerts.map((alert, idx) => (
          <li key={idx}>
            <span className="font-semibold">{alert.type}:</span> {alert.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Alerts
