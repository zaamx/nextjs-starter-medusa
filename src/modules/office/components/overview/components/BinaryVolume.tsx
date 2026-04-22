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

interface SpilloverVsBuild {
  side: string
  cv_personal: number
  cv_spillover: number
  cv_total: number
}

interface BinaryVolumeProps {
  binaryData: BinaryLegVolume | null
  spilloverData: SpilloverVsBuild[] | null
  error: string | null
}

const BinaryVolume: React.FC<BinaryVolumeProps> = ({ binaryData, spilloverData, error }) => {
  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl shadow p-4 border border-red-200">
        <div className="font-bold text-red-600 mb-2">Error cargando volumen binario</div>
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  if (!binaryData) {
    return (
      <div className="bg-gray-50 rounded-2xl shadow p-4 border border-gray-200">
        <div className="font-bold text-gray-600 mb-2">Volumen Binario</div>
        <div className="text-sm text-gray-700">No hay datos disponibles</div>
      </div>
    )
  }

  const leftSpill = spilloverData?.find(s => s.side === 'left')
  const rightSpill = spilloverData?.find(s => s.side === 'right')

  // Top summary cards data
  const weeklyCV = (binaryData.cv_week_left || 0) + (binaryData.cv_week_right || 0)
  const totalBank = (binaryData.bank_prev_left || 0) + (binaryData.bank_prev_right || 0)

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="font-bold text-gray-900 text-lg">Volumen Binario</h2>
        <FaQuestionCircle className="text-gray-300 w-4 h-4 cursor-help" />
      </div>

      {/* Top Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-blue-50/50 rounded-2xl p-4 text-center border border-blue-50">
          <div className="text-xs font-bold text-blue-500 uppercase mb-1">CV Semanal</div>
          <div className="text-lg font-bold text-blue-700 leading-none">{weeklyCV.toLocaleString()}</div>
        </div>
        <div className="bg-green-50/50 rounded-2xl p-4 text-center border border-green-50">
          <div className="text-xs font-bold text-green-500 uppercase mb-1">Banco Binario</div>
          <div className="text-lg font-bold text-green-700 leading-none">{totalBank.toLocaleString()}</div>
        </div>
        <div className="bg-purple-50/50 rounded-2xl p-4 text-center border border-purple-50 opacity-60">
          <div className="text-xs font-bold text-purple-500 uppercase mb-1">USD Pagado</div>
          <div className="text-lg font-bold text-purple-700 leading-none">$0.00</div>
        </div>
        <div className="bg-orange-50/50 rounded-2xl p-4 text-center border border-orange-50 opacity-60">
          <div className="text-xs font-bold text-orange-500 uppercase mb-1">USD Esperado</div>
          <div className="text-lg font-bold text-orange-700 leading-none">$0.00</div>
        </div>
      </div>

      {/* Legs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 relative">
        {/* Vertical Divider for desktop */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-50 -translate-x-1/2" />

        {/* Pierna Izquierda */}
        <div>
          <h3 className="text-center font-bold text-gray-900 mb-6 text-sm">Pierna Izquierda</h3>
          <div className="space-y-3">
            {/* Derrame */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-orange-600 leading-none">{(leftSpill?.cv_spillover || 0).toLocaleString()} CV</div>
              <div className="text-xs font-bold text-orange-500 mt-1">Derrame Recibido</div>
            </div>
            {/* Volumen Periodo */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-blue-600 leading-none">{(binaryData.cv_week_left || 0).toLocaleString()} CV</div>
              <div className="text-xs font-bold text-gray-400 mt-1">Volumen del período</div>
            </div>
            {/* Banco Binario */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-green-600 leading-none">{(binaryData.bank_prev_left || 0).toLocaleString()} CV</div>
              <div className="text-xs font-bold text-green-600 mt-1">Banco Binario</div>
            </div>
            {/* Volumen para Puntos */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-blue-600 leading-none">{(binaryData.cv_period_left || 0).toLocaleString()} CV</div>
              <div className="text-xs font-bold text-gray-400 mt-1">Volumen para Puntos</div>
            </div>
            {/* Acumulados */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-purple-600 leading-none">{(binaryData.carry_left || 0).toLocaleString()} CV</div>
              <div className="text-xs font-bold text-purple-600 mt-1">Acumulados al Banco Binario</div>
            </div>
          </div>
        </div>

        {/* Pierna Derecha */}
        <div>
          <h3 className="text-center font-bold text-gray-900 mb-6 text-sm">Pierna Derecha</h3>
          <div className="space-y-3">
            {/* Derrame */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-orange-600 leading-none">{(rightSpill?.cv_spillover || 0).toLocaleString()} CV</div>
              <div className="text-xs font-bold text-orange-500 mt-1">Derrame Recibido</div>
            </div>
            {/* Volumen Periodo */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-blue-600 leading-none">{(binaryData.cv_week_right || 0).toLocaleString()} CV</div>
              <div className="text-xs font-bold text-gray-400 mt-1">Volumen del período</div>
            </div>
            {/* Banco Binario */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-green-600 leading-none">{(binaryData.bank_prev_right || 0).toLocaleString()} CV</div>
              <div className="text-xs font-bold text-green-600 mt-1">Banco Binario</div>
            </div>
            {/* Volumen para Puntos */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-blue-600 leading-none">{(binaryData.cv_period_right || 0).toLocaleString()} CV</div>
              <div className="text-xs font-bold text-gray-400 mt-1">Volumen para Puntos</div>
            </div>
            {/* Acumulados */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <div className="text-lg font-bold text-purple-600 leading-none">{(binaryData.carry_right || 0).toLocaleString()} CV</div>
              <div className="text-xs font-bold text-purple-600 mt-1">Acumulados al Banco Binario</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-10 pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center text-[13px] text-gray-600 px-2 gap-4">
        <div className="font-bold flex gap-1">Puntos pagados: <span className="text-gray-400 font-medium">{(binaryData.pairs_paid || 0)}</span></div>
        <div className="font-bold flex gap-1">Puntos pendientes: <span className="text-gray-400 font-medium">{(binaryData.pairs_pending || 0)}</span></div>
      </div>
    </div>
  )
}

export default BinaryVolume
