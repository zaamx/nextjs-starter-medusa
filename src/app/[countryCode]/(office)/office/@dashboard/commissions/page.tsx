"use client";

import React, { useState } from "react";

// Mock data for demonstration
const mockPeriods = [
  { id: "202528", label: "Semana 28, 2025" },
  { id: "202527", label: "Semana 27, 2025" },
  { id: "202526", label: "Semana 26, 2025" },
  { id: "202525", label: "Semana 25, 2025" },
  { id: "202524", label: "Semana 24, 2025" },
];

const mockBonusTypes = [
  {
    type: "Binary Bonus",
    total: 1250.00,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    type: "Check Match Bonus",
    total: 890.50,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    type: "Fast Start Bonus",
    total: 450.00,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    type: "Unilevel Bonus",
    total: 675.25,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  }
];

const mockCommissionsData = [
  {
    id: 1,
    type: "Binary Bonus",
    period: "202528",
    amount: 1250.00,
    details: [
      { description: "Left leg volume", amount: 850.00 },
      { description: "Right leg volume", amount: 400.00 },
      { description: "Matching bonus", amount: 0.00 }
    ]
  },
  {
    id: 2,
    type: "Check Match Bonus",
    period: "202528",
    amount: 890.50,
    details: [
      { description: "Level 1 matches", amount: 450.00 },
      { description: "Level 2 matches", amount: 340.50 },
      { description: "Level 3 matches", amount: 100.00 }
    ]
  },
  {
    id: 3,
    type: "Fast Start Bonus",
    period: "202528",
    amount: 450.00,
    details: [
      { description: "New member bonus", amount: 300.00 },
      { description: "First order bonus", amount: 150.00 }
    ]
  },
  {
    id: 4,
    type: "Unilevel Bonus",
    period: "202528",
    amount: 675.25,
    details: [
      { description: "Level 1 commission", amount: 400.00 },
      { description: "Level 2 commission", amount: 200.00 },
      { description: "Level 3 commission", amount: 75.25 }
    ]
  }
];

export default function CommissionsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("202528");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const totalEarnings = mockBonusTypes.reduce((sum, bonus) => sum + bonus.total, 0);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="relative p-8 ">
      {/* Overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center pointer-events-auto">
        <span className="text-3xl font-bold text-gray-700">Próximamente</span>
      </div>
      {/* Page content below (will be covered by overlay) */}
      {/* Header with Total Earnings */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Estado de Comisiones
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Aquí podrás ver el estado de tus comisiones.
        </p>
        
        {/* Total Earnings Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Total de Ganancias</h2>
              <p className="text-3xl font-bold">{formatCurrency(totalEarnings)}</p>
            </div>
            
            {/* Bonus Type Totals */}
            <div className="flex gap-4">
              {mockBonusTypes.map((bonus) => (
                <div key={bonus.type} className="text-center">
                  <div className={`w-3 h-3 rounded-full ${bonus.color} mx-auto mb-1`}></div>
                  <p className="text-xs opacity-90">{bonus.type}</p>
                  <p className="text-sm font-semibold">{formatCurrency(bonus.total)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Período
        </label>
        <select
          id="period-select"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {mockPeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Bono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockCommissionsData.map((commission) => (
                <React.Fragment key={commission.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${mockBonusTypes.find(b => b.type === commission.type)?.color} mr-3`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {commission.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commission.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(commission.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRow(commission.id)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        {expandedRows.includes(commission.id) ? (
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                  
                  {/* Collapsible Details Row */}
                  {expandedRows.includes(commission.id) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-2">
                          {commission.details.map((detail, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                              <span className="text-sm text-gray-600">{detail.description}</span>
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(detail.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 