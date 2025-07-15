"use client";

import React, { useState, useEffect } from "react";
import { HttpTypes } from "@medusajs/types";
import { useOffice } from "@lib/context/office-context";
import { 
  fetchCommissionSummary, 
  fetchCommissionDetails 
} from "@lib/data/netme_network";
import { retrieveCustomer } from "@lib/data/customer";
import Modal from "@modules/common/components/modal";

// Types for real data
interface CommissionSummary {
  period_name: string;
  bonus_type: string;
  monto_bruto: string;
  total_bruto: string;
}

interface CommissionDetail {
  bonus_type: string;
  orders_id: number;
  origin_profile_id: number;
  cv: number;
  usd: number | null;
  obtained: boolean;
}

interface CommissionSummaryGrouped {
  period_name: string;
  bonuses: {
    type: string;
    amount: number;
    total: number;
  }[];
}

export default function CommissionsPage() {
  const { periods, currentPeriod } = useOffice();
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [commissionSummary, setCommissionSummary] = useState<CommissionSummaryGrouped[]>([]);
  const [commissionDetails, setCommissionDetails] = useState<CommissionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBonusType, setSelectedBonusType] = useState<string>("");
  const [selectedPeriodName, setSelectedPeriodName] = useState<string>("");

  const netmeProfileId = customer?.metadata?.netme_profile_id;

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customerData = await retrieveCustomer();
        setCustomer(customerData);
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Error loading customer data');
      }
    };

    fetchCustomer();
  }, []);

  // Set initial selected period
  useEffect(() => {
    if (currentPeriod && !selectedPeriod) {
      setSelectedPeriod(currentPeriod.id);
    }
  }, [currentPeriod, selectedPeriod]);

  // Fetch commission data
  useEffect(() => {
    const fetchData = async () => {
      if (!netmeProfileId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch commission summary for last 12 periods
        const summaryData = await fetchCommissionSummary(Number(netmeProfileId), 12);
        
        // Group summary data by period
        const groupedSummary = summaryData.reduce((acc: CommissionSummaryGrouped[], item: CommissionSummary) => {
          const existingPeriod = acc.find(p => p.period_name === item.period_name);
          
          if (existingPeriod) {
            existingPeriod.bonuses.push({
              type: item.bonus_type,
              amount: parseFloat(item.monto_bruto),
              total: parseFloat(item.total_bruto)
            });
          } else {
            acc.push({
              period_name: item.period_name,
              bonuses: [{
                type: item.bonus_type,
                amount: parseFloat(item.monto_bruto),
                total: parseFloat(item.total_bruto)
              }]
            });
          }
          
          return acc;
        }, []);

        setCommissionSummary(groupedSummary);

        // Fetch commission details for selected period
        if (selectedPeriod) {
          const detailsData = await fetchCommissionDetails(Number(netmeProfileId), selectedPeriod);
          setCommissionDetails(detailsData);
        }

      } catch (err) {
        console.error('Error fetching commission data:', err);
        setError('Error loading commission data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [netmeProfileId, selectedPeriod]);

  // Get current period summary
  const currentPeriodSummary = commissionSummary.find(summary => 
    summary.period_name === periods.find(p => p.id === selectedPeriod)?.name
  );

  // Calculate total earnings for current period
  const totalEarnings = currentPeriodSummary?.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0) || 0;

  // Get bonus type colors
  const getBonusTypeColor = (type: string) => {
    const colors = {
      binary: { color: "bg-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      unilevel: { color: "bg-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" },
      fast_start: { color: "bg-purple-500", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      leadership: { color: "bg-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
      matching: { color: "bg-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" }
    };
    return colors[type as keyof typeof colors] || colors.binary;
  };

  const openDetailsModal = (bonusType: string, periodName: string) => {
    setSelectedBonusType(bonusType);
    setSelectedPeriodName(periodName);
    setShowDetailsModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatBonusType = (type: string) => {
    const labels = {
      binary: "Binary Bonus",
      unilevel: "Unilevel Bonus", 
      fast_start: "Fast Start Bonus",
      leadership: "Leadership Bonus",
      matching: "Matching Bonus"
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Get filtered details for selected bonus type
  const getFilteredDetails = () => {
    return commissionDetails.filter(detail => detail.bonus_type === selectedBonusType);
  };

  if (loading) {
    return (
      <div className="relative p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando comisiones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-8">
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
            {currentPeriodSummary && (
              <div className="flex gap-4">
                {currentPeriodSummary.bonuses.map((bonus) => {
                  const colors = getBonusTypeColor(bonus.type);
                  return (
                    <div key={bonus.type} className="text-center">
                      <div className={`w-3 h-3 rounded-full ${colors.color} mx-auto mb-1`}></div>
                      <p className="text-xs opacity-90">{formatBonusType(bonus.type)}</p>
                      <p className="text-sm font-semibold">{formatCurrency(bonus.amount)}</p>
                    </div>
                  );
                })}
              </div>
            )}
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
          value={selectedPeriod || ""}
          onChange={(e) => setSelectedPeriod(Number(e.target.value))}
          className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
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
              {currentPeriodSummary?.bonuses.map((bonus) => {
                const colors = getBonusTypeColor(bonus.type);
                const detailsCount = commissionDetails.filter(detail => detail.bonus_type === bonus.type).length;
                
                return (
                  <tr key={bonus.type} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${colors.color} mr-3`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatBonusType(bonus.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currentPeriodSummary.period_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(bonus.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openDetailsModal(bonus.type, currentPeriodSummary.period_name)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                        disabled={detailsCount === 0}
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver detalles ({detailsCount})
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Summary */}
      {commissionSummary.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Comisiones (Últimos 12 períodos)</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissionSummary.map((summary) => {
                    const periodTotal = summary.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
                    return (
                      <tr key={summary.period_name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {summary.period_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(periodTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            {summary.bonuses.map((bonus) => {
                              const colors = getBonusTypeColor(bonus.type);
                              return (
                                <span key={bonus.type} className={`px-2 py-1 rounded-full text-xs ${colors.bgColor} ${colors.borderColor} border`}>
                                  {formatBonusType(bonus.type)}: {formatCurrency(bonus.amount)}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Commission Details Modal */}
      <Modal isOpen={showDetailsModal} close={() => setShowDetailsModal(false)} size="large">
        <Modal.Title>
          Detalles de {formatBonusType(selectedBonusType)} - {selectedPeriodName}
        </Modal.Title>
        <Modal.Body>
          <div className="w-full max-h-[60vh] overflow-hidden flex flex-col">
            {getFilteredDetails().length > 0 ? (
              <>
                <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orden
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Perfil Origen
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CV
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto USD
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white">
                      {getFilteredDetails().map((detail, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{detail.orders_id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {detail.origin_profile_id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {detail.cv.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {/* <span className={`px-2 py-1 rounded-full text-xs ${
                              detail.obtained 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {detail.obtained ? 'Obtenido' : 'No Obtenido'}
                            </span> */}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {detail.usd ? formatCurrency(detail.usd) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay detalles disponibles para este bono
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
} 