import { FaTrophy } from "react-icons/fa"

interface RankProgress {
  current_rank: string
  next_rank: string
  qv_total: number
  qv_needed: number
  qv_missing: number
  active_left: number | null
  act_left_needed: number
  act_left_missing: number
  active_right: number | null
  act_right_needed: number
  act_right_missing: number
  cutoff: string
}

interface RankCalculatorProps {
  rankData: RankProgress[]
  error: string | null
  onShowModal: () => void
  onShowRanks: () => void
}

const RankCalculator: React.FC<RankCalculatorProps> = ({ rankData, error, onShowModal, onShowRanks }) => {
  // Calculate rank progress percentage
  const getRankProgress = () => {
    if (error || !rankData || rankData.length === 0) {
      return { percent: 0, missing: "" }
    }

    const currentRank = rankData[0]
    const totalNeeded = currentRank.qv_needed + currentRank.act_left_needed + currentRank.act_right_needed
    const totalMissing = currentRank.qv_missing + currentRank.act_left_missing + currentRank.act_right_missing
    const completed = totalNeeded - totalMissing
    const percent = totalNeeded > 0 ? Math.round((completed / totalNeeded) * 100) : 0

    return { percent, missing: `Te faltan ${(currentRank.qv_missing || 0).toLocaleString()} QV` }
  }

  const rankProgress = getRankProgress()

  if (error) {
    return (
      <div className="rounded-2xl p-6 shadow-lg bg-red-50 border border-red-200 text-red-800">
        <div className="font-bold">Error cargando calculadora</div>
        <div className="text-sm mt-2">{error}</div>
      </div>
    )
  }

  if (!rankData || rankData.length === 0) {
    return (
      <div className="rounded-2xl p-6 shadow-lg bg-gray-50 border border-gray-100 text-gray-500 animate-pulse text-center font-bold">
        Cargando calculadora...
      </div>
    )
  }

  const { current_rank, next_rank } = rankData[0]

  return (
    <div className="rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-gradient-to-br from-[#4e81ff] via-[#855aff] to-[#e85aff] text-white relative overflow-hidden min-h-[220px] flex flex-col justify-between">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
        <div>
          <h2 className="text-lg sm:text-lg font-bold tracking-tight mb-1">Calculadora de Avance</h2>
          <div className="text-xs sm:text-xs font-semibold opacity-90">
            Rango actual: <span className="underline decoration-2 underline-offset-4">{current_rank}</span> &rarr; Meta: <span className="underline decoration-2 underline-offset-4">{next_rank}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onShowRanks}
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 hover:opacity-90 transition-opacity text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg"
          >
            <FaTrophy className="text-xs" />
            <span>Ver Rangos</span>
          </button>
          <button 
            onClick={onShowModal}
            className="bg-white/20 hover:bg-white/30 transition-colors text-white px-4 py-2 rounded-2xl text-xs font-bold backdrop-blur-sm"
          >
            Ver requisitos
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3 relative z-10">
        <div className="w-full bg-white/20 rounded-full h-4 relative overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
            style={{ width: `${rankProgress.percent}%` }} 
          />
        </div>
        
        <div className="space-y-1">
          <div className="text-sm font-bold tracking-wide">{rankProgress.percent}% para el siguiente rango</div>
          <div className="text-lg font-bold">{rankProgress.missing}</div>
          <div className="text-xs font-medium opacity-80 leading-snug">
            Al menos un 70% del volumen debe provenir de la Construcción, y máximo un 30% de la Línea de Poder.
          </div>
        </div>
      </div>

      {/* Decorative Blur Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  )
}

export default RankCalculator
