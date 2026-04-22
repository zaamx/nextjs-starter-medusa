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

const UnilevelVolume: React.FC<UnilevelVolumeProps> = ({ unilevelData, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl shadow p-4 border border-red-200">
        <div className="font-bold text-red-600 mb-2">Error cargando volumen unilevel</div>
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (!unilevelData || unilevelData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl shadow p-4 border border-gray-200">
        <div className="font-bold text-gray-600 mb-2">Volumen Unilevel</div>
        <div className="text-sm text-gray-700">No hay datos disponibles</div>
      </div>
    )
  }

  // Summary data calculations
  const totalCV = unilevelData.reduce((sum, level) => sum + (level.cv_total || 0), 0)
  const totalQualifiedCV = unilevelData.reduce((sum, level) => sum + (level.cv_qualified || 0), 0)
  const totalUSDPaid = unilevelData.reduce((sum, level) => sum + parseFloat(level.usd_paid || '0'), 0)
  const totalUSDExpected = unilevelData.reduce((sum, level) => sum + parseFloat(level.usd_expected_lvl || '0'), 0)

  // Level percentages (constants based on business logic usually)
  const getLevelPercentage = (level: number) => {
    switch (level) {
      case 1: return "5%";
      case 2: return "25%";
      case 3: return "10%";
      case 4: return "5%";
      case 5: return "5%";
      default: return "";
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="font-bold text-gray-900 text-lg">Volumen Unilevel</h2>
        <FaQuestionCircle className="text-gray-300 w-4 h-4 cursor-help" />
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-blue-50/50 rounded-2xl p-4 text-center border border-blue-50">
          <div className="text-xs font-bold text-blue-500 uppercase mb-1">CV Total</div>
          <div className="text-lg font-bold text-blue-700 leading-none">{totalCV.toLocaleString()}</div>
        </div>
        <div className="bg-green-50/50 rounded-2xl p-4 text-center border border-green-50">
          <div className="text-xs font-bold text-green-500 uppercase mb-1">CV Calificado</div>
          <div className="text-lg font-bold text-green-700 leading-none">{totalQualifiedCV.toLocaleString()}</div>
        </div>
        <div className="bg-purple-50/50 rounded-2xl p-4 text-center border border-purple-50">
          <div className="text-xs font-bold text-purple-500 uppercase mb-1">USD Pagado</div>
          <div className="text-lg font-bold text-purple-700 leading-none">${totalUSDPaid.toFixed(2)}</div>
        </div>
        <div className="bg-orange-50/50 rounded-2xl p-4 text-center border border-orange-50">
          <div className="text-xs font-bold text-orange-500 uppercase mb-1">USD Estimado</div>
          <div className="text-lg font-bold text-orange-700 leading-none">${totalUSDExpected.toFixed(2)}</div>
        </div>
      </div>

      {/* Details List */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Detalles por Nivel</h3>
        
        {unilevelData.slice(0, 5).map((level) => {
          const usdPaid = parseFloat(level.usd_paid || '0')
          const usdExpected = parseFloat(level.usd_expected_lvl || '0')
          const efficiency = usdExpected > 0 ? (usdPaid / usdExpected * 100) : 0
          
          return (
            <div key={level.level} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
              <div className="flex justify-between items-start mb-4">
                <div className="font-bold text-gray-900 text-sm leading-none">
                  Nivel {level.level} <span className="text-gray-300 font-bold ml-1">({getLevelPercentage(level.level)})</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-900 uppercase">Eficiencia: <span className="text-red-500">{efficiency.toFixed(1)}%</span></div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-0.5">CV Total</div>
                  <div className="text-sm font-bold text-gray-900">{(level.cv_total || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-0.5">CV Calificado</div>
                  <div className="text-sm font-bold text-gray-900">{(level.cv_qualified || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase mb-0.5">Miembros</div>
                  <div className="text-sm font-bold text-gray-900">
                    {(level.actives || 0) + (level.inactives || 0)} <span className="text-green-500 font-bold">({level.actives || 0}A)</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-orange-500 uppercase mb-0.5">USD Est.</div>
                  <div className="text-sm font-bold text-gray-900">${usdExpected.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UnilevelVolume
