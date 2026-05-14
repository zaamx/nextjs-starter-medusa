"use client"
import React, { useState } from "react"
import { FaQuestionCircle } from "react-icons/fa"

interface UnilevelLevelVolume {
  level: number
  cv_total: number
  actives: number
  inactives: number
  cv_qualified: number
  usd_paid: string
  usd_expected_lvl: string
}

interface UnilevelVolumeProps {
  unilevelData: UnilevelLevelVolume[]
  error: string | null
}

// Unilevel commission percentages per level
const COMMISSION_PERCENTAGES = [5, 25, 10, 5, 5]
// CV to USD conversion rate (adjust if needed)
const CV_TO_USD = 1

const UnilevelVolume: React.FC<UnilevelVolumeProps> = ({ unilevelData, error }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const isDark = false // Not supported in storefront yet

  const safeUnilevelData = unilevelData || []
  
  // ── Summary totals ────────────────────────────────────────────
  const totalCV = safeUnilevelData.reduce((sum, l) => sum + (l.cv_total || 0), 0)

  // As the unilevel data aggregate includes total CV, we use it directly as the qualifying CV for estimations
  const totalCVCalificado = totalCV

  const totalUSDPagado = safeUnilevelData.reduce((sum, level) => sum + parseFloat(level.usd_paid || '0'), 0)

  // USD Estimado = sum of (cv_total * commission %)
  const totalUSDEstimado = safeUnilevelData.reduce((sum, l, idx) => {
    const pct = COMMISSION_PERCENTAGES[idx] ?? 0
    return sum + (l.cv_total || 0) * CV_TO_USD * (pct / 100)
  }, 0)

  return (
    <div className={`${isDark ? 'bg-stone-800/40 border-stone-800/50 border' : 'bg-white'} rounded-2xl shadow p-4 space-y-4 relative`}>
      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'}`}>Volumen Unilevel</div>
        <button
          onClick={() => setIsHelpOpen(true)}
          className={`text-gray-400 ${isDark ? 'hover:text-stone-300' : 'hover:text-gray-600'} transition-colors`}
          title="Ayuda sobre Volumen Unilevel"
        >
          <FaQuestionCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* CV Total */}
        <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#181C2B]' : 'bg-blue-50'}`}>
          <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#4F8DDB]' : 'text-blue-500'}`}>
            CV<br />Total
          </div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>{totalCV.toLocaleString()}</div>
        </div>

        {/* CV Calificado */}
        <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#132219]' : 'bg-green-50'}`}>
          <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#27B151]' : 'text-green-500'}`}>
            CV<br />Calificado
          </div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-green-800'}`}>{totalCVCalificado.toLocaleString()}</div>
        </div>

        {/* USD Pagado */}
        <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#28183A]' : 'bg-purple-50'}`}>
          <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#B66BD8]' : 'text-purple-500'}`}>
            USD<br />Pagado
          </div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-purple-800'}`}>
            ${totalUSDPagado.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* USD Estimado */}
        <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#311E15]' : 'bg-orange-50'}`}>
          <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#E78229]' : 'text-orange-500'}`}>
            USD<br />Estimado
          </div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-orange-800'}`}>
            ${totalUSDEstimado.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {error ? (
        <div className={`text-center py-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <div className="font-medium">Error cargando volumen unilevel</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      ) : (
        <>
          {(!safeUnilevelData || safeUnilevelData.length === 0) && (
            <div className={`text-center py-6 text-sm ${isDark ? 'text-stone-500' : 'text-gray-500'}`}>
              No hay datos disponibles
            </div>
          )}

          {safeUnilevelData && safeUnilevelData.length > 0 && (
            <div>
              <div className={`text-sm font-bold ${isDark ? 'text-stone-200' : 'text-gray-800'} mb-2`}>Detalles por Nivel</div>
              <div className="space-y-3">
                {safeUnilevelData.map((level, idx) => {
                  const pct = COMMISSION_PERCENTAGES[idx] ?? 0
                  const totalMembers = (level.actives || 0) + (level.inactives || 0)
                  const efficiency = totalMembers > 0
                    ? ((level.actives || 0) / totalMembers) * 100
                    : 0
                  const cvCal = level.cv_total || 0;
                  const usdEstimado = (level.cv_total || 0) * CV_TO_USD * (pct / 100)

                  return (
                    <div key={idx} className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3`}>
                      {/* Level header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-bold ${isDark ? 'text-stone-300' : 'text-gray-900'}`}>
                          Nivel {level.level}{" "}
                          <span className={`text-sm font-normal ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>({pct}%)</span>
                        </span>
                        <span className={`text-xs font-semibold ${isDark ? 'text-stone-400' : ''}`}>
                          Eficiencia:{" "}
                          <span className={efficiency >= 50 ? (isDark ? "text-green-400" : "text-green-600") : (isDark ? "text-red-400" : "text-red-500")}>
                            {efficiency.toFixed(1)}%
                          </span>
                        </span>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <div className={`${isDark ? 'text-stone-500' : 'text-gray-400'}`}>CV Total</div>
                          <div className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>{(level.cv_total || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className={`${isDark ? 'text-stone-500' : 'text-gray-400'}`}>CV Calificado</div>
                          <div className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>{cvCal.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className={`${isDark ? 'text-stone-500' : 'text-gray-400'}`}>Miembros</div>
                          <div className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>
                            {totalMembers}{" "}
                            <span className={`${isDark ? 'text-green-400' : 'text-green-600'} font-semibold`}>({level.actives || 0}A)</span>
                          </div>
                        </div>
                        {/* USD Estimado */}
                        <div className="flex flex-col text-left min-w-[70px]">
                          <span className={`text-[11px] font-semibold ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>
                            USD Est.
                          </span>
                          <span className={`text-sm font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'}`}>
                            ${usdEstimado.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className={`sm:max-w-md max-h-[85vh] overflow-y-auto w-[95vw] rounded-xl relative ${isDark ? 'bg-[#0f1115] border border-stone-800' : 'bg-white'}`}>
            <button className={`absolute top-2 right-2 ${isDark ? 'text-stone-500 hover:text-stone-300' : 'text-gray-400 hover:text-gray-700'} text-xl`} onClick={() => setIsHelpOpen(false)}>&times;</button>
            <div className="p-6">
              <div className="mb-4 text-left">
                <h2 className={`text-xl font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'}`}>Tu Reporte de Equipo (Uninivel)</h2>
                <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-gray-500'} mt-1`}>
                  Aquí te explicamos qué significa cada número de tu tabla de ganancias y por qué pueden variar.
                </p>
              </div>

              <div className={`space-y-5 text-sm ${isDark ? 'text-stone-300' : 'text-gray-600'}`}>
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Nivel</h4>
                  <p className="mb-2">Indica qué tan "lejos" están las personas de ti.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Nivel 1:</strong> Son tus invitados directos.</li>
                    <li><strong>Nivel 2:</strong> Son los invitados de tus invitados.</li>
                    <li>Y así sucesivamente...</li>
                  </ul>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Volumen Total</h4>
                  <p>
                    Es la suma de todos los puntos (CV) que compró tu equipo en ese nivel. Representa todo lo que se vendió, sin importar si calificaste para cobrarlo o no.
                  </p>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Socios Activos e Inactivos</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Socios Activos:</strong> Número de personas en ese nivel que hicieron su compra mínima y están activas en este periodo.</li>
                    <li><strong>Socios Inactivos:</strong> Número de personas en ese nivel que no compraron o no alcanzaron el mínimo necesario.</li>
                  </ul>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Volumen Pagable</h4>
                  <p className="mb-3">De todo el volumen total, esta es la cantidad por la que sí te pagaron.</p>

                  <div className={`${isDark ? 'bg-blue-900/20' : 'bg-blue-50/50'} rounded-lg p-4 mb-2`}>
                    <h5 className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-800'} mb-2`}>¿Por qué puede ser menor que el total?</h5>
                    <ul className={`list-disc pl-5 space-y-2 ${isDark ? 'text-blue-300' : 'text-blue-700/80'}`}>
                      <li><strong>Primera Compra:</strong> El volumen de las primeras compras (paquetes de inicio) a menudo se paga principal o totalmente a través del Bono de Inicio Rápido, no en el Uninivel.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Pagado Real ($)</h4>
                  <p className="mb-1">Es la cantidad en dólares que ganaste de cada nivel en este periodo de comisiones.</p>
                  <p className={`text-xs italic ${isDark ? 'text-stone-500' : 'text-gray-500'}`}>Recuerda: Para cobrar cualquier comisión, debes cumplir con tu volumen personal (PV) mínimo requerido.</p>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Potencial ($)</h4>
                  <p className="mb-2">Es lo que habrías ganado si todo el volumen fuera 100% comisionable en este bono.</p>
                  <div className={`${isDark ? 'bg-stone-800/50 border-stone-700' : 'bg-gray-50 border-gray-100'} rounded p-3 mb-4 border`}>
                    <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-stone-300' : 'text-gray-700'}`}>Porcentajes del Plan We Now:</p>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <li>Nivel 1: <strong className={isDark ? 'text-stone-200' : 'text-gray-900'}>5%</strong></li>
                      <li>Nivel 2: <strong className={isDark ? 'text-stone-200' : 'text-gray-900'}>25%</strong></li>
                      <li>Nivel 3: <strong className={isDark ? 'text-stone-200' : 'text-gray-900'}>10%</strong></li>
                      <li>Nivel 4: <strong className={isDark ? 'text-stone-200' : 'text-gray-900'}>5%</strong></li>
                      <li>Nivel 5: <strong className={isDark ? 'text-stone-200' : 'text-gray-900'}>5%</strong></li>
                    </ul>
                  </div>

                  <div className={`${isDark ? 'bg-amber-900/10 text-amber-300' : 'bg-yellow-50 text-yellow-800'} rounded-lg p-3 text-sm`}>
                    <strong>Tip:</strong> Enfócate en la retención. El Bono Uninivel es el corazón de tu ingreso residual a largo plazo proveniente de recompras y autoenvíos.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  )
}

export default UnilevelVolume
