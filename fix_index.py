import re

with open("src/modules/office/components/overview/index.tsx", "r") as f:
    content = f.read()

# 1. Fix NetworkOrder
content = re.sub(
    r'(interface NetworkOrder \{[^\}]*?  position: number\n)\}',
    r'\1  unilevel_sponsor_id: number\n}',
    content,
    flags=re.MULTILINE
)

# 2. Fix the broken JSX structure at the bottom
# We'll find the "Viaja Wenow" block and replace everything after it.
match = re.search(r'(<div className="space-y-4">\s*<div className="text-xs text-gray-500">\s*<a href="https://myvortex365.com/WeNow".*?</a>\s*</div>)', content, re.DOTALL)

if match:
    # Everything before the match
    before = content[:match.end()]
    
    # We reconstruct the rest of the file properly
    rest = """
            {/* Responsive Office Navigation */}
            {/* 
            <div className="px-3 sm:px-4 pb-20 sm:pb-24">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <a href="/us/office/commissions" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-3 sm:p-4 hover:bg-blue-50 transition border border-gray-100">
                  <div className="text-xl sm:text-2xl mb-1"><FaWallet /></div>
                  <div className="text-xs font-semibold text-gray-700 text-center">Comisiones</div>
                </a>
                <a href="/us/office/matrix" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-3 sm:p-4 hover:bg-blue-50 transition border border-gray-100">
                  <div className="text-xl sm:text-2xl mb-1"><FaSitemap /></div>
                  <div className="text-xs font-semibold text-gray-700 text-center">Matriz</div>
                </a>
                <a href="/us/office/marketing-materials" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-3 sm:p-4 hover:bg-blue-50 transition border border-gray-100">
                  <div className="text-xl sm:text-2xl mb-1"><FaBell /></div>
                  <div className="text-xs font-semibold text-gray-700 text-center">Marketing</div>
                </a>
                <a href="/us/office/training-center" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-3 sm:p-4 hover:bg-blue-50 transition border border-gray-100">
                  <div className="text-xl sm:text-2xl mb-1"><FaTrophy /></div>
                  <div className="text-xs font-semibold text-gray-700 text-center">Formación</div>
                </a>
                <a href="/us/office/support-compliance" className="flex flex-col items-center justify-center bg-white rounded-2xl shadow p-3 sm:p-4 hover:bg-blue-50 transition border border-gray-100">
                  <div className="text-xl sm:text-2xl mb-1"><FaBell /></div>
                  <div className="text-xs font-semibold text-gray-700 text-center">Soporte</div>
                </a>
              </div>
            </div>
            */}
          </div>
        </div>
      </div>

      {/* Responsive Target Modal */}
      {showTargetModal && rankData.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setShowTargetModal(false)}>&times;</button>
            <div className="font-bold text-lg mb-4 text-blue-700">Requisitos para rango {rankData[0].next_rank}</div>

            {/* Basic Requirements */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Requisitos Básicos</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Volumen total: {(rankData[0].qv_needed || 0).toLocaleString()} QV</li>
                <li>Directos izquierda: {rankData[0].act_left_needed} activos</li>
                <li>Directos derecha: {rankData[0].act_right_needed} activos</li>
              </ul>
            </div>

            {/* Detailed Volume Breakdown */}
            {rankDetailsData.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Desglose de Volumen</h3>

                {/* Construction Volume */}
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-blue-900">Construcción</span>
                    <span className="text-sm text-blue-700">
                      {(rankDetailsData[0].qv_const_current || 0).toLocaleString()} / {(rankDetailsData[0].qv_const_needed || 0).toLocaleString()} QV
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (rankDetailsData[0].qv_const_current / rankDetailsData[0].qv_const_needed) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {rankDetailsData[0].qv_const_missing > 0
                      ? `Faltan ${(rankDetailsData[0].qv_const_missing || 0).toLocaleString()} QV`
                      : "¡Completado!"}
                  </div>
                </div>

                {/* Spillover Volume */}
                <div className="bg-green-50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-green-900">Línea de Poder (Power Line)</span>
                    <span className="text-sm text-green-700">
                      {(rankDetailsData[0].qv_spill_current || 0).toLocaleString()} / {(rankDetailsData[0].qv_spill_needed || 0).toLocaleString()} QV
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (rankDetailsData[0].qv_spill_current / rankDetailsData[0].qv_spill_needed) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {rankDetailsData[0].qv_spill_missing > 0
                      ? `Faltan ${(rankDetailsData[0].qv_spill_missing || 0).toLocaleString()} QV`
                      : "¡Completado!"}
                  </div>
                </div>

                {/* Total Progress */}
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-purple-900">Total</span>
                    <span className="text-sm text-purple-700">
                      {(rankDetailsData[0].qv_total || 0).toLocaleString()} / {(rankDetailsData[0].qv_needed || 0).toLocaleString()} QV
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (rankDetailsData[0].qv_total / rankDetailsData[0].qv_needed) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {rankDetailsData[0].qv_missing > 0
                      ? `Faltan ${(rankDetailsData[0].qv_missing || 0).toLocaleString()} QV`
                      : "¡Completado!"}
                  </div>
                </div>
              </div>
            )}

            {/* Direct Requirements */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Directos Requeridos</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="font-medium text-orange-900">Izquierda</div>
                    <div className="text-lg font-bold text-orange-700">
                      {(rankData[0].active_left ?? 0)} / {rankData[0].act_left_needed}
                    </div>
                    <div className="text-xs text-orange-600">
                      {rankData[0].act_left_missing > 0
                        ? `Falta ${rankData[0].act_left_missing}`
                        : "¡Completado!"}
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="font-medium text-orange-900">Derecha</div>
                    <div className="text-lg font-bold text-orange-700">
                      {(rankData[0].active_right ?? 0)} / {rankData[0].act_right_needed}
                    </div>
                    <div className="text-xs text-orange-600">
                      {rankData[0].act_right_missing > 0
                        ? `Falta ${rankData[0].act_right_missing}`
                        : "¡Completado!"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="text-xs text-gray-400 border-t pt-3">
              Cumple todos los requisitos para avanzar de rango.
              <div className="mt-2 text-blue-600">
                <strong>Nota:</strong> Al menos un 70% del volumen debe provenir de la construcción, y máximo un 30% de la Línea de Poder.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranks Catalog Modal */}
      {showRanksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setShowRanksModal(false)}>&times;</button>
            <div className="font-bold text-xl mb-6 text-blue-700">Catálogo de Rangos</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ranksData.map((rank) => {
                const requirements = getRankRequirements(rank.id)
                return (
                  <div key={rank.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{rank.name}</h3>
                        <p className="text-sm text-gray-600">Nivel {rank.level}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Tope USD</div>
                        <div className="font-bold text-green-600">${rank.cap_usd?.toLocaleString() || '0'}</div>
                      </div>
                    </div>

                    {requirements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Requerimientos:</h4>
                        <ul className="space-y-1">
                          {requirements.map((req) => (
                            <li key={req.id} className="text-xs text-gray-600 flex justify-between">
                              <span>{getRequirementTypeName(req.type)}:</span>
                              <span className="font-medium">{(req.value || 0).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {ranksData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Cargando catálogo de rangos...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
"""
    
    final_content = before + rest
    with open("src/modules/office/components/overview/index.tsx", "w") as f:
        f.write(final_content)
    print("Fixed file structure successfully.")
else:
    print("Could not find the match block!")
