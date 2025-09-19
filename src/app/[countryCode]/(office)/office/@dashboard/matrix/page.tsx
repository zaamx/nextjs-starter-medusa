"use client";

import React, { useState, useEffect } from "react";
import { HttpTypes } from "@medusajs/types";
import { retrieveCustomer } from "@lib/data/customer";
import { fetchMatrixData } from "@lib/data/netme_network";

// Types for matrix data
interface MatrixData {
  profiles_id: number;
  parent_profiles_id: number | null;
  customer_id: string;
  first_name: string;
  last_name: string;
  depth: number;
}

export default function MatrixPage() {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch matrix data
  useEffect(() => {
    const fetchData = async () => {
      if (!netmeProfileId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetchMatrixData(Number(netmeProfileId));
        
        if (!response.success) {
          throw new Error(response.error || 'Error fetching matrix data');
        }
        
        setMatrixData(response.data);

      } catch (err) {
        console.error('Error fetching matrix data:', err);
        setError('Error loading matrix data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [netmeProfileId]);

  if (loading) {
    return (
      <div className="relative p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando matriz...</p>
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Matriz de Red
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Aquí podrás ver la estructura de tu matriz de red.
        </p>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Padre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profundidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apellido
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {matrixData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.profiles_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.parent_profiles_id || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.depth}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.first_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.last_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {matrixData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay datos de matriz disponibles
          </div>
        )}
      </div>

      {/* Summary */}
      {matrixData.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Resumen de la Matriz</h3>
          <p className="text-sm text-blue-700">
            Total de perfiles en la matriz: <span className="font-semibold">{matrixData.length}</span>
          </p>
        </div>
      )}
    </div>
  );
}
