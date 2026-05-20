"use client"
import React, { useState } from 'react'
import { FaPlaneDeparture, FaChevronDown, FaChevronUp } from "react-icons/fa"

const TravelBanner = () => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 rounded-2xl shadow-md overflow-hidden mb-4 md:mb-6 transition-all duration-300 relative border border-blue-400/30">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-24 h-24 bg-cyan-300 opacity-20 rounded-full blur-xl pointer-events-none"></div>

      {/* CTA Header (Always visible) */}
      <div 
        className="relative p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.08] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left Icon Area */}
        <div className="flex items-center w-8 sm:w-[140px]">
          <div className="relative hidden sm:flex items-center justify-center">
            {/* Glowing ring effect */}
            <div className="absolute inset-0 bg-white/30 rounded-full blur-sm animate-pulse"></div>
            <div className="relative bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30 shadow-sm">
              <FaPlaneDeparture className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        {/* Centered Text */}
        <div className="flex-1 text-center z-10 px-2">
          <h3 className="font-extrabold text-lg sm:text-xl leading-tight tracking-tight text-white drop-shadow-sm">Viaja con We Now</h3>
          <p className="text-xs sm:text-sm text-blue-50 mt-0.5 hidden sm:block opacity-90 font-medium">¿Quieres viajar? Nosotros te ayudamos... Y obtén grandes descuentos</p>
        </div>
        
        {/* Right Button Area */}
        <div className="flex justify-end w-auto sm:w-[140px] z-10">
          <button className="flex items-center gap-2 text-blue-700 bg-white hover:bg-gray-50 px-4 py-2 rounded-full transition-all text-sm font-bold shadow-sm hover:shadow whitespace-nowrap">
            {isExpanded ? (
              <>Ocultar <FaChevronUp className="w-3 h-3 opacity-70" /></>
            ) : (
              <>Ver Destinos <FaChevronDown className="w-3 h-3 opacity-70" /></>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <div 
        className={`transition-all duration-500 ease-in-out origin-top ${
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="relative border-t border-white/20 bg-white">
          <a href="https://myvortex365.com/WeNow" target="_blank" rel="noopener noreferrer" className="block relative group">
            <img 
              src="/viaja-wenow.jpg" 
              alt="Viaja Wenow" 
              className="w-auto h-auto max-w-full max-h-[500px] object-contain mx-auto"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
               <div className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all text-sm sm:text-base">
                 Haz clic y encuentra el viaje de tus sueños
               </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default TravelBanner
