import { FaQuestionCircle } from "react-icons/fa"

interface MatrixLevelVolume {
  level: number
  persons: number
  total_persons_needed: number
  orders: number
  usd_expected: string
}

interface MatrixVolumeProps {
  matrixData: MatrixLevelVolume[]
  error: string | null
}

const MatrixVolume: React.FC<MatrixVolumeProps> = ({ matrixData, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl shadow p-4 border border-red-200">
        <div className="font-bold text-red-600 mb-2">Error cargando volumen matriz</div>
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  const levels = matrixData.length > 0 ? matrixData : [
    { level: 1, persons: 3, total_persons_needed: 3, orders: 0, usd_expected: "0.00" },
    { level: 2, persons: 9, total_persons_needed: 9, orders: 0, usd_expected: "0.00" },
    { level: 3, persons: 27, total_persons_needed: 27, orders: 2, usd_expected: "3.00" },
    { level: 4, persons: 81, total_persons_needed: 81, orders: 5, usd_expected: "12.00" },
    { level: 5, persons: 243, total_persons_needed: 243, orders: 3, usd_expected: "6.00" },
    { level: 6, persons: 636, total_persons_needed: 729, orders: 11, usd_expected: "30.00" },
  ]

  // Summary data
  const totalPersons = levels.reduce((sum, l) => sum + l.persons, 0)
  const totalOrders = levels.reduce((sum, l) => sum + l.orders, 0)
  const usdPaid = "51.00" // Mock/Placeholder
  const usdEstimated = levels.reduce((sum, l) => sum + parseFloat(l.usd_expected), 0).toFixed(2)

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="font-bold text-gray-900 text-lg">Volumen Matriz</h2>
        <FaQuestionCircle className="text-gray-300 w-4 h-4 cursor-help" />
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-blue-50/50 rounded-2xl p-4 text-center border border-blue-50">
          <div className="text-xs font-bold text-blue-500 uppercase mb-1">Total Personas</div>
          <div className="text-lg font-bold text-blue-700 leading-none">{totalPersons.toLocaleString()}</div>
        </div>
        <div className="bg-green-50/50 rounded-2xl p-4 text-center border border-green-50">
          <div className="text-xs font-bold text-green-500 uppercase mb-1">Total Órdenes</div>
          <div className="text-lg font-bold text-green-700 leading-none">{totalOrders.toLocaleString()}</div>
        </div>
        <div className="bg-purple-50/50 rounded-2xl p-4 text-center border border-purple-50">
          <div className="text-xs font-bold text-purple-500 uppercase mb-1">USD Pagado</div>
          <div className="text-lg font-bold text-purple-700 leading-none">${usdPaid}</div>
        </div>
        <div className="bg-orange-50/50 rounded-2xl p-4 text-center border border-orange-50">
          <div className="text-xs font-bold text-orange-500 uppercase mb-1">USD Estimado</div>
          <div className="text-lg font-bold text-orange-700 leading-none">${usdEstimated}</div>
        </div>
      </div>

      {/* Details List */}
      <div className="space-y-4">
        {levels.map((level) => (
          <div key={level.level} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
            <div className="flex justify-between items-start mb-4">
              <div className="font-bold text-gray-900 text-sm leading-none">
                Nivel {level.level} <span className="text-gray-300 font-bold ml-1">(5%)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xs font-bold text-blue-500 uppercase mb-1">Personas</div>
                <div className="text-sm font-bold text-gray-900">
                  {level.persons} <span className="text-gray-300 font-bold">/ {level.total_persons_needed}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-green-500 uppercase mb-1">Órdenes</div>
                <div className="text-sm font-bold text-gray-900">{level.orders}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-orange-500 uppercase mb-1">USD Est.</div>
                <div className="text-sm font-bold text-gray-900">${parseFloat(level.usd_expected).toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MatrixVolume
