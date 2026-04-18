"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const LoginTemplate = ({ 
  redirectTo, 
  cart, 
  countryCode 
}: { 
  redirectTo?: string
  cart?: HttpTypes.StoreCart | null
  countryCode?: string
}) => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="flex flex-1 min-h-[calc(100vh-64px)]">
      {/* Left brand panel */}
      <div className="hidden small:flex flex-col justify-between w-1/2 bg-brand-dark text-white p-16 self-stretch">
        <div>
          <span className="font-display text-2xl tracking-widest text-brand-magenta">
            WE NOW
          </span>
        </div>
        <div className="flex flex-col gap-y-6">
          <h2 className="font-display text-5xl leading-none">
            CIENCIA QUE<br />TRANSFORMA.
          </h2>
          <p className="text-sm text-grey-40 leading-relaxed max-w-xs">
            Fórmulas de alta concentración desarrolladas para resultados reales. Únete a la comunidad We Now.
          </p>
          <div className="flex flex-col gap-y-3 pt-4 border-t border-grey-80">
            {[
              "Acceso exclusivo a beneficios de miembro",
              "Seguimiento de pedidos y suscripciones",
              "Programa de referidos con comisiones reales",
            ].map((item) => (
              <div key={item} className="flex items-center gap-x-3">
                <span className="w-1 h-1 rounded-full bg-brand-magenta flex-shrink-0" />
                <span className="text-xs text-grey-40 tracking-wide">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-grey-70 tracking-widest uppercase">
          &copy; {new Date().getFullYear()} We Now · Todos los derechos reservados
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-16 bg-white">
        {currentView === "sign-in" ? (
          <Login setCurrentView={setCurrentView} redirectTo={redirectTo} />
        ) : currentView === "register" ? (
          <Register
            setCurrentView={setCurrentView}
            redirectTo={redirectTo}
            cart={cart}
            countryCode={countryCode}
          />
        ) : (
          <ForgotPassword setCurrentView={setCurrentView} />
        )}
      </div>
    </div>
  )
}

export default LoginTemplate
