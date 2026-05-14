"use client"
import React, { useState } from "react"
import { FaQuestionCircle } from "react-icons/fa"

interface BinaryLegVolume {
  cv_week_left: number
  cv_week_right: number
  cv_period_left: number
  cv_period_right: number
  bank_prev_left: number
  bank_prev_right: number
  carry_left: number
  carry_right: number
  pairs_paid: number
  pairs_pending: number
}

export interface SpilloverVsBuild {
  side: string
  cv_personal: number
  cv_spillover: number
  cv_total: number
}

interface BinaryVolumeProps {
  binaryData: BinaryLegVolume | null
  spilloverData?: SpilloverVsBuild[] | null
  error: string | null
  spilloverError?: string | null
}

const BinaryVolume: React.FC<BinaryVolumeProps> = ({ binaryData, spilloverData, error, spilloverError }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const isDark = false // Not supported in storefront yet

  const spilloverLeft = spilloverData?.find(s => s.side === 'left')
  const spilloverRight = spilloverData?.find(s => s.side === 'right')

  const safeData = binaryData || {
    cv_week_left: 0,
    cv_week_right: 0,
    cv_period_left: 0,
    cv_period_right: 0,
    bank_prev_left: 0,
    bank_prev_right: 0,
    carry_left: 0,
    carry_right: 0,
    pairs_paid: 0,
    pairs_pending: 0
  }

  return (
    <div className={`${isDark ? 'bg-stone-800/40 border-stone-800/50 border' : 'bg-white'} rounded-2xl shadow p-4 relative`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'}`}>Volumen Binario</div>
        <button
          onClick={() => setIsHelpOpen(true)}
          className={`text-gray-400 ${isDark ? 'hover:text-stone-300' : 'hover:text-gray-600'} transition-colors`}
          title="Ayuda sobre Volumen Binario"
        >
          <FaQuestionCircle className="w-4 h-4" />
        </button>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* CV Semanal */}
        <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#181C2B]' : 'bg-blue-50'}`}>
          <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#4F8DDB]' : 'text-blue-500'}`}>
            CV<br />Semanal
          </div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>
            {((safeData.cv_week_left || 0) + (safeData.cv_week_right || 0)).toLocaleString()}
          </div>
        </div>

        {/* Banco Binario */}
        <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#132219]' : 'bg-green-50'}`}>
          <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#27B151]' : 'text-green-500'}`}>
            Banco<br />Binario
          </div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-green-800'}`}>
            {((safeData.bank_prev_left || 0) + (safeData.bank_prev_right || 0)).toLocaleString()}
          </div>
        </div>

        {/* USD Pagado */}
        <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#28183A]' : 'bg-purple-50'}`}>
          <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#B66BD8]' : 'text-purple-500'}`}>
            USD<br />Pagado
          </div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-purple-800'}`}>
            ${((safeData.pairs_paid || 0) * 0.30).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* USD Esperado */}
        <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-[#311E15]' : 'bg-orange-50'}`}>
          <div className={`text-xs font-semibold leading-tight mb-1 ${isDark ? 'text-[#E78229]' : 'text-orange-500'}`}>
            USD<br />Esperado
          </div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-orange-800'}`}>
            ${((safeData.pairs_pending || 0) * 0.30).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {(error || spilloverError) ? (
        <div className={`text-center py-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <div className="font-medium">Error cargando volumen binario</div>
          <div className="text-sm mt-1">{error || spilloverError}</div>
        </div>
      ) : (
        <>
          {!binaryData && (
            <div className={`text-center py-6 text-sm ${isDark ? 'text-stone-500' : 'text-gray-500'}`}>
              No hay datos disponibles
            </div>
          )}

          {binaryData && (
            <>
              <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-6">
                {/* Pierna Izquierda */}
                <div className="space-y-3">
                  <div className={`text-sm font-bold text-center ${isDark ? 'text-stone-300' : 'text-gray-800'}`}>Pierna Izquierda</div>

                  <div className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3 flex flex-col items-center justify-center`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                      {(spilloverLeft?.cv_spillover || 0).toLocaleString()} CV
                    </div>
                    <div className={`text-xs ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>Derrame Recibido</div>
                  </div>

                  <div className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3 flex flex-col items-center justify-center`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {(safeData.cv_week_left || 0).toLocaleString()} CV
                    </div>
                    <div className={`text-xs ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>Volumen del período</div>
                  </div>

                  <div className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3 flex flex-col items-center justify-center`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {(safeData.bank_prev_left || 0).toLocaleString()} CV
                    </div>
                    <div className={`text-xs ${isDark ? 'text-green-500' : 'text-green-600'}`}>Banco Binario</div>
                  </div>

                  <div className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3 flex flex-col items-center justify-center`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {(safeData.cv_period_left || 0).toLocaleString()} CV
                    </div>
                    <div className={`text-xs ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>Volumen para Puntos</div>
                  </div>

                  <div className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3 flex flex-col items-center justify-center`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      {(safeData.carry_left || 0).toLocaleString()} CV
                    </div>
                    <div className={`text-xs ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>Acumulados al Banco Binario</div>
                  </div>
                </div>

                {/* Pierna Derecha */}
                <div className="space-y-3">
                  <div className={`text-sm font-bold text-center ${isDark ? 'text-stone-300' : 'text-gray-800'}`}>Pierna Derecha</div>

                  <div className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3 flex flex-col items-center justify-center`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                      {(spilloverRight?.cv_spillover || 0).toLocaleString()} CV
                    </div>
                    <div className={`text-xs ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>Derrame Recibido</div>
                  </div>

                  <div className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3 flex flex-col items-center justify-center`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {(safeData.cv_week_right || 0).toLocaleString()} CV
                    </div>
                    <div className={`text-xs ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>Volumen del período</div>
                  </div>

                  <div className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3 flex flex-col items-center justify-center`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {(safeData.bank_prev_right || 0).toLocaleString()} CV
                    </div>
                    <div className={`text-xs ${isDark ? 'text-green-500' : 'text-green-600'}`}>Banco Binario</div>
                  </div>

                  <div className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3 flex flex-col items-center justify-center`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {(safeData.cv_period_right || 0).toLocaleString()} CV
                    </div>
                    <div className={`text-xs ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>Volumen para Puntos</div>
                  </div>

                  <div className={`border ${isDark ? 'border-stone-800/50 bg-[#0f1115]/50' : 'border-gray-100 bg-gray-50/60'} rounded-xl p-3 flex flex-col items-center justify-center`}>
                    <div className={`text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      {(safeData.carry_right || 0).toLocaleString()} CV
                    </div>
                    <div className={`text-xs ${isDark ? 'text-purple-500' : 'text-purple-600'}`}>Acumulados al Banco Binario</div>
                  </div>
                </div>
              </div>

              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-stone-800' : 'border-gray-100'}`}>
                <div className={`flex flex-col sm:flex-row sm:justify-between text-xs ${isDark ? 'text-stone-400' : 'text-gray-600'} gap-1`}>
                  <span><strong>Puntos pagados:</strong> {(safeData.pairs_paid || 0).toLocaleString()}</span>
                  <span><strong>Puntos pendientes:</strong> {(safeData.pairs_pending || 0).toLocaleString()}</span>
                </div>
              </div>
            </>
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
                <h2 className={`text-xl font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'}`}>Tu Reporte de Equipo (Binario)</h2>
                <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-gray-500'} mt-1`}>
                  Este reporte te muestra cómo crece tu equipo en tus dos piernas (Izquierda y Derecha) y cuánto dinero estás generando.
                </p>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Derrame Recibido</h4>
                  <p className={`${isDark ? 'text-stone-400' : 'text-gray-600'}`}>
                    Es el volumen (CV) indirecto generado por personas que entraron a la red por efecto derrame de tus uplines, antes de la construcción directa tuya o indirecta de tus downlines.
                  </p>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Volumen del período</h4>
                  <p className={`${isDark ? 'text-stone-400' : 'text-gray-600'}`}>
                    Son los puntos (CV) que entraron exclusivamente en esta semana. Es el trabajo fresco de tu equipo.
                  </p>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Banco Binario</h4>
                  <p className={`${isDark ? 'text-stone-400' : 'text-gray-600'}`}>
                    Son los puntos que te sobraron de la semana pasada y que guardaste para usarlos ahora.
                  </p>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Volumen para Puntos</h4>
                  <p className={`${isDark ? 'text-stone-400' : 'text-gray-600'}`}>
                    Es la suma de: <strong className="font-bold">Volumen del período + Banco Binario</strong>. Este es el total de puntos que tienes listos para cobrar.
                  </p>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Puntos pagados</h4>
                  <p className={`${isDark ? 'text-stone-400' : 'text-gray-600'} mb-2`}>Es la cantidad de volumen que ya cobraste.</p>
                  <p className={`${isDark ? 'text-stone-400' : 'text-gray-600'}`}>
                    El sistema toma tu pierna más débil (la de menor volumen) y te paga el 30% de esa cantidad.
                  </p>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Puntos pendientes</h4>
                  <ul className={`list-disc pl-5 space-y-2 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>
                    <li><strong className="font-bold">Si la semana está abierta (en curso):</strong> Verás volumen en ambas piernas (Izquierda y Derecha) al mismo tiempo. Esto es normal porque aún no se ha hecho el corte. Este número te dice cuánto cobrarías si la semana cerrara ahora mismo.</li>
                    <li><strong className="font-bold">Si la semana ya cerró:</strong> Generalmente será 0, porque ese volumen ya se convirtió en dinero ("Puntos pagados").</li>
                  </ul>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-1`}>Acumulados al Banco Binario</h4>
                  <p className={`${isDark ? 'text-stone-400' : 'text-gray-600'} mb-2`}>Es lo que te sobra después de cobrar.<br />Se calcula restando lo que cobraste a tu volumen total.</p>

                  <div className={`${isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50/70 text-blue-800'} rounded-lg p-3 mb-2`}>
                    Este "sobrante" se guarda en tu banco para iniciar la siguiente semana.
                  </div>
                </div>

                <div>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-2`}>Reglas para Cobrar (Binario)</h4>
                  <p className={`${isDark ? 'text-stone-400' : 'text-gray-600'} mb-3`}>
                    Para desbloquear el pago de tus pares y guardar tus puntos sobrantes, debes cumplir 3 condiciones obligatorias cada semana:
                  </p>

                  <div className={`space-y-3 mb-4 ${isDark ? 'text-stone-300' : 'text-gray-700'}`}>
                    <div className="flex gap-2 items-start">
                      <span className="text-white bg-green-500 mt-0.5 rounded-sm p-0.5 text-[10px] flex-shrink-0">✓</span>
                      <p><strong className="font-bold font-medium">Tú Activo:</strong> Haber realizado tu compra personal mínima.</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="text-white bg-green-500 mt-0.5 rounded-sm p-0.5 text-[10px] flex-shrink-0">✓</span>
                      <p><strong className="font-bold font-medium">1 Directo Activo a la Izquierda:</strong> Tener al menos un invitado personal colocado en tu equipo izquierdo que también haya hecho su compra.</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="text-white bg-green-500 mt-0.5 rounded-sm p-0.5 text-[10px] flex-shrink-0">✓</span>
                      <p><strong className="font-bold font-medium">1 Directo Activo a la Derecha:</strong> Tener al menos un invitado personal colocado en tu equipo derecho que también haya hecho su compra.</p>
                    </div>
                  </div>

                  <div className={`${isDark ? 'bg-amber-900/10 border-amber-900/50 text-amber-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'} border rounded-lg p-3 text-sm`}>
                    <span className="font-bold">⚠️ ¡Importante!</span> Si no cumples estas 3 reglas al cierre de la semana, no solo no cobrarás el bono, sino que perderás todos los puntos acumulados en tu banco. ¡Asegúrate de calificar siempre!
                  </div>
                </div>

                <div className={`border ${isDark ? 'border-stone-800' : 'border-gray-200'} rounded-xl p-4 mt-2`}>
                  <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-gray-900'} mb-2`}>Resumen</h4>
                  <p className={`${isDark ? 'text-stone-400' : 'text-gray-600'} text-sm`}>
                    Mientras la semana está activa, verás puntos acumulándose en ambos lados. Al cierre (Domingo en la noche), el sistema iguala las piernas, te paga el lado menor, y guarda el sobrante del lado mayor para la próxima semana.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  )
}

export default BinaryVolume
