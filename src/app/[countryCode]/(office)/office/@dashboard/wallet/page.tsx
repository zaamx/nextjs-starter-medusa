import { FaWallet, FaClock } from "react-icons/fa";

export default function WalletPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
      <div className="relative mb-8 group">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-brand-magenta rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
        {/* Icon container */}
        <div className="relative bg-white p-6 rounded-full shadow-xl border border-gray-100 transform transition-transform duration-300 hover:scale-105">
          <FaWallet className="w-14 h-14 text-brand-magenta" />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
        Mi Billetera Digital
      </h1>

      <p className="text-lg md:text-xl text-gray-500 max-w-md mb-10 leading-relaxed">
        Estamos preparando una nueva herramienta para ti.
      </p>

      <div className="inline-flex items-center gap-3 px-8 py-4 bg-pink-50 border-2 border-pink-100 rounded-full text-brand-magenta font-bold shadow-md hover:bg-pink-100 transition-colors">
        <FaClock className="w-6 h-6" />
        <span className="uppercase tracking-widest text-lg md:text-xl">Próximamente</span>
      </div>
    </div>
  );
} 