"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
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
      ) : (
        <Register 
          setCurrentView={setCurrentView} 
          redirectTo={redirectTo} 
          cart={cart}
          countryCode={countryCode}
        />
      )}
    </div>
  )
}

export default LoginTemplate
