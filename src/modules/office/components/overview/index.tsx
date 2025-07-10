"use client"
import React, { useState } from "react";
import { FaBars, FaChevronRight, FaUserCircle, FaWallet, FaTrophy, FaBell, FaShoppingCart, FaUserPlus, FaMoneyBillWave } from "react-icons/fa";
import { HttpTypes } from "@medusajs/types"
type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

// Mock Data
const mockUser = {
  name: "Juan Pérez",
  avatar: null,
  rank: "Plata",
  balance: 2500,
};
const mockKPIs = [
  { label: "Vol. Personal", value: "3,100 PV" },
  { label: "Vol. Grupal", value: "8,200 GV" },
  { label: "Próx. Corte", value: "02:13:45", countdown: true },
  { label: "Patrocinados", value: "5 activos" },
  { label: "Derrame", value: "1,200 CV" },
];
const mockTarget = {
  current: "Plata",
  next: "Oro",
  percent: 60,
  missing: "Te faltan 240 CV y 1 directo activo",
  requirements: [
    "5,000 CV en pierna débil",
    "3 directos activos",
    "Autoship vigente",
  ],
};
const mockTimeline = [
  { icon: <FaTrophy className="text-yellow-500" />, text: "¡Recibiste Bono Binario!", date: "Hoy, 10:15" },
  { icon: <FaUserPlus className="text-blue-500" />, text: "Nuevo afiliado: Ana L.", date: "Ayer, 18:22" },
  { icon: <FaShoppingCart className="text-green-500" />, text: "Pedido enviado #1234", date: "Ayer, 14:05" },
];
const mockAlerts = [
  { type: "Pierna débil", message: "Faltan 1,000 CV para calificar." },
  { type: "Patrocinados", message: "Falta 1 directo activo." },
  { type: "Autoship", message: "Vence en 3 días." },
];
const officeLinks = [
  { label: "Comisiones", href: "/us/office/commissions", icon: <FaWallet /> },
  { label: "Marketing", href: "/us/office/marketing-materials", icon: <FaBell /> },
  { label: "Formación", href: "/us/office/training-center", icon: <FaTrophy /> },
  { label: "Soporte", href: "/us/office/support-compliance", icon: <FaBell /> },
];

const Overview = ({customer}: OverviewProps) => {
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  return (
    <div className="relative min-h-screen bg-gray-50">
       {/* Overlay */}
       <div className="absolute inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center pointer-events-auto">
        <span className="text-3xl font-bold text-gray-700">Próximamente</span>
      </div>
      {/* Ultra-compact Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {mockUser.avatar ? (
            <img src={mockUser.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <FaUserCircle className="w-10 h-10 text-gray-400" />
          )}
          <div>
            <div className="font-bold text-gray-900 text-base leading-tight">{customer?.first_name}</div>
            <div className="text-xs text-blue-600 font-semibold">{mockUser.rank}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-lg shadow">
            <FaWallet className="mr-1" />
            <span className="font-bold text-sm">${mockUser.balance.toLocaleString()}</span>
          </div>
          <button className="ml-2 p-2 rounded hover:bg-gray-100">
            <FaBars className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* KPI Bar */}
      <div className="overflow-x-auto py-4 px-2 flex gap-3 scrollbar-hide">
        {mockKPIs.map((kpi, idx) => (
          <div key={idx} className="flex-shrink-0 bg-white rounded-full shadow px-5 py-2 flex flex-col items-center min-w-[120px] border border-gray-100">
            <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
            <span className={`font-bold text-base ${kpi.countdown ? "text-blue-600 font-mono" : "text-gray-900"}`}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Target Card (Advancement Calculator) */}
      <div className="mx-4 my-6 rounded-2xl p-6 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-lg font-bold">Calculadora de Avance</div>
            <div className="text-xs font-medium">Rango actual: <span className="font-bold">{mockTarget.current}</span> &rarr; Meta: <span className="font-bold">{mockTarget.next}</span></div>
          </div>
          <button onClick={() => setShowTargetModal(true)} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow">Ver requisitos</button>
        </div>
        <div className="w-full bg-white/30 rounded-full h-3 mt-2 mb-1">
          <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${mockTarget.percent}%` }} />
        </div>
        <div className="text-xs font-semibold mt-1">{mockTarget.percent}% hacia el siguiente rango</div>
        <div className="text-sm mt-2 font-medium">{mockTarget.missing}</div>
      </div>

      {/* Alerts Section */}
      <div className="mx-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2 border-l-4 border-red-400">
          <div className="font-bold text-red-600 mb-1 flex items-center gap-2"><FaBell /> Alertas de calificación</div>
          <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
            {mockAlerts.map((alert, idx) => (
              <li key={idx}><span className="font-semibold">{alert.type}:</span> {alert.message}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Timeline (Recent Events) */}
      <div className="mx-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-gray-900">Actividad Reciente</div>
            <button className="text-blue-600 text-xs font-semibold flex items-center gap-1 hover:underline">
              Ver todo <FaChevronRight />
            </button>
          </div>
          <ul className="divide-y divide-gray-100">
            {mockTimeline.map((event, idx) => (
              <li key={idx} className="flex items-center gap-3 py-2">
                {event.icon}
                <span className="text-sm text-gray-800 flex-1">{event.text}</span>
                <span className="text-xs text-gray-400">{event.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Office Navigation */}
      <div className="mx-4 mb-24 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {officeLinks.map((link, idx) => (
          <a key={idx} href={link.href} className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-4 hover:bg-blue-50 transition border border-gray-100">
            <div className="text-2xl mb-1">{link.icon}</div>
            <div className="text-xs font-semibold text-gray-700">{link.label}</div>
          </a>
        ))}
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-8 right-8 z-30">
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:scale-105 transition"
          onClick={() => setShowFAB((v) => !v)}
          aria-label="Quick Actions"
        >
          +
        </button>
        {showFAB && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-3 items-end animate-fade-in">
            <button className="bg-white shadow px-4 py-2 rounded-lg flex items-center gap-2 text-blue-700 font-semibold hover:bg-blue-50"><FaShoppingCart /> Comprar</button>
            <button className="bg-white shadow px-4 py-2 rounded-lg flex items-center gap-2 text-green-700 font-semibold hover:bg-green-50"><FaUserPlus /> Patrocinar</button>
            <button className="bg-white shadow px-4 py-2 rounded-lg flex items-center gap-2 text-purple-700 font-semibold hover:bg-purple-50"><FaMoneyBillWave /> Retirar saldo</button>
          </div>
        )}
      </div>

      {/* Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowTargetModal(false)}>&times;</button>
            <div className="font-bold text-lg mb-2 text-blue-700">Requisitos para rango {mockTarget.next}</div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-2">
              {mockTarget.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
            <div className="text-xs text-gray-400">Cumple todos los requisitos para avanzar de rango.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
