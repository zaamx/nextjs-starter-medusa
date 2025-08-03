"use client"

import { useState, useEffect } from "react"
import { requestPasswordReset } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(requestPasswordReset, undefined)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (message === null) {
      setIsSuccess(true)
    } else if (message) {
      setIsSuccess(false)
    }
  }, [message])

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="forgot-password-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Recuperar contraseña</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
      </p>
      
      {isSuccess ? (
        <div className="w-full">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Email enviado
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Si existe una cuenta con el email especificado, recibirá instrucciones para restablecer la contraseña.</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Volver al inicio de sesión
          </button>
        </div>
      ) : (
        <form className="w-full" action={formAction}>
          <div className="flex flex-col w-full gap-y-2">
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
                              title="Ingresa una dirección de email válida."
              autoComplete="email"
              required
              data-testid="email-input"
            />
          </div>
          <ErrorMessage error={message} data-testid="forgot-password-error-message" />
          <SubmitButton 
            data-testid="request-reset-button" 
            className="w-full mt-6"
          >
            Enviar instrucciones
          </SubmitButton>
        </form>
      )}
      
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        ¿Recordaste tu contraseña?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Inicia sesión
        </button>
      </span>
    </div>
  )
}

export default ForgotPassword 