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
    <div className="w-full flex justify-start px-8 py-8">
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
  )
}

export default LoginTemplate
