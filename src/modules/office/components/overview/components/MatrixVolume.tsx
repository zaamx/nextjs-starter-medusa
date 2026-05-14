"use client"
import React from "react"

interface MatrixData {
    profiles_id: number;
    parent_profiles_id: number | null;
    customer_id: string;
    first_name: string;
    last_name: string;
    depth: number;
}

interface NetworkOrder {
    buyer_profile: number;
    cv?: number;
    is_first_sale?: boolean;
}

interface MatrixVolumeProps {
    matrixData: MatrixData[];
    networkOrdersData: NetworkOrder[];
    error: string | null;
}

const MatrixVolume: React.FC<MatrixVolumeProps> = ({ matrixData, networkOrdersData, error }) => {
    const isDark = false;

    // Agrupar datos por nivel (del 1 al 9)
    const levels = Array.from({ length: 9 }, (_, i) => i + 1);

    // Placeholder Matrix compensation percentages for levels 1 to 9
    // Please adjust these to match the official Matrix compensation plan
    const MATRIX_PERCENTAGES = [5, 5, 5, 5, 5, 5, 5, 5, 5];
    const CV_TO_USD = 1;

    const calculateLevelData = (level: number) => {
        // Buscar todas las personas en este nivel de la matriz
        const peopleInLevel = matrixData.filter(p => p.depth === level);
        const peopleCount = peopleInLevel.length;

        // Obtener los IDs de las personas en este nivel
        const profileIds = new Set(peopleInLevel.map(p => p.profiles_id));

        // Encontrar las órdenes de estas personas
        const levelOrders = networkOrdersData.filter(o => profileIds.has(o.buyer_profile));
        const ordersCount = levelOrders.length;

        // Sumar su CV SOLO de las recompras (is_first_sale === false)
        const reorders = levelOrders.filter(o => o.is_first_sale === false);

        // Cada paquete WNREORDER da exactamente 60 CV.
        // Calculamos cuántos paquetes WNREORDER hay asumiendo múltiplos de 60 CV por orden.
        const levelEligiblePackages = reorders.reduce((sum, o) => sum + Math.floor((o.cv || 0) / 60), 0);
        const matrixEligibleCV = levelEligiblePackages * 60;

        // Calcular el estimado basado en el porcentaje del nivel (solo aplica a WNREORDER)
        const pct = MATRIX_PERCENTAGES[level - 1] || 0;
        const levelUSDEstimado = matrixEligibleCV * CV_TO_USD * (pct / 100);

        return { level, peopleCount, ordersCount, levelCV: matrixEligibleCV, levelUSDEstimado, pct };
    };

    const totalPersonas = matrixData.length;
    // Calculate total orders from networkOrdersData that belong to someone in matrixData
    const totalMatrixOrders = networkOrdersData.filter(o => matrixData.some(p => p.profiles_id === o.buyer_profile)).length;

    // Sumar el USD estimado de todos los niveles
    const usdEstimado = levels.reduce((sum, level) => {
        const { levelUSDEstimado } = calculateLevelData(level);
        return sum + levelUSDEstimado;
    }, 0);

    // Asumiendo que USD Pagado sería lo mismo por ahora si todo está calificado,
    // o 0 si no se ha pagado según reglas. Dejaré el mismo framework.
    const usdPagado = usdEstimado;

    return (
        <div className={`${isDark ? 'bg-stone-800/40 border-stone-800/50 border' : 'bg-white'} rounded-2xl shadow p-4 relative space-y-4`}>
            {/* Title */}
            <div className="flex items-center gap-2 mb-3">
                <div className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'}`}>Volumen Matriz</div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Personas */}
                <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#181C2B]' : 'bg-blue-50'}`}>
                    <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#4F8DDB]' : 'text-blue-500'}`}>
                        Total<br />Personas
                    </div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>{totalPersonas.toLocaleString()}</div>
                </div>

                {/* Total Ordenes */}
                <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#132219]' : 'bg-green-50'}`}>
                    <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#27B151]' : 'text-green-500'}`}>
                        Total<br />Órdenes
                    </div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-green-800'}`}>{totalMatrixOrders.toLocaleString()}</div>
                </div>

                {/* USD Pagado */}
                <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#28183A]' : 'bg-purple-50'}`}>
                    <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#B66BD8]' : 'text-purple-500'}`}>
                        USD<br />Pagado
                    </div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-purple-800'}`}>
                        ${usdPagado.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>

                {/* USD Estimado */}
                <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#311E15]' : 'bg-orange-50'}`}>
                    <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#E78229]' : 'text-orange-500'}`}>
                        USD<br />Estimado
                    </div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-orange-800'}`}>
                        ${usdEstimado.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {error ? (
                <div className={`text-center py-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    <div className="font-medium">Error cargando volumen de la matriz</div>
                    <div className="text-sm mt-1">{error}</div>
                </div>
            ) : (
                <>
                    {/* Fallback Message si no hay datos en la matriz completa */}
                    {matrixData.length === 0 && (
                        <div className={`text-center py-6 text-sm ${isDark ? 'text-stone-500' : 'text-gray-500'}`}>
                            No hay información de matriz disponible.
                        </div>
                    )}

                    {/* Listado de Niveles */}
                    {matrixData.length > 0 && (
                        <div className="space-y-2 mt-4">
                            {levels.map(level => {
                                const data = calculateLevelData(level);
                                const capacidadVisible = Math.pow(3, level);

                                // Ocultar niveles que no tienen personas como solicitó el usuario
                                if (data.peopleCount === 0) return null;

                                return (
                                    <div key={level} className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-[#15171b] border-stone-800' : 'bg-gray-50/50 border-gray-100'}`}>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`font-bold text-sm ${isDark ? 'text-stone-300' : 'text-gray-900'}`}>Nivel {level}</span>
                                            <span className={`text-xs ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>({data.pct}%)</span>
                                        </div>
                                        <div className="flex items-center gap-6 sm:gap-10 text-right">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-blue-500' : 'text-blue-500'}`}>Personas</span>
                                                <span className={`font-bold text-sm ${isDark ? 'text-stone-200' : 'text-gray-900'}`}>
                                                    {data.peopleCount.toLocaleString()} <span className="text-xs font-normal opacity-50">/ {capacidadVisible.toLocaleString()}</span>
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-green-500' : 'text-green-600'}`}>Órdenes</span>
                                                <span className={`font-bold text-sm ${isDark ? 'text-stone-200' : 'text-gray-900'}`}>{data.ordersCount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col w-16">
                                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>USD Est.</span>
                                                <span className={`font-bold text-sm ${isDark ? 'text-stone-200' : 'text-gray-900'}`}>
                                                    ${data.levelUSDEstimado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default MatrixVolume
