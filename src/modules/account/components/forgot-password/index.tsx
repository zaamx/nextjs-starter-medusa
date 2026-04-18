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
      className="w-full max-w-sm flex flex-col"
      data-testid="forgot-password-page"
    >
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase text-brand-magenta mb-3">
          Acceso
        </p>
        <h1 className="font-display text-4xl text-grey-90 leading-none mb-2">
          RECUPERAR CONTRASEÑA
        </h1>
        <p className="text-sm text-grey-50">
          Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
        </p>
      </div>

      {isSuccess ? (
        <div className="flex flex-col gap-y-6">
          <div className="border-l-2 border-green-500 pl-4 py-2 bg-green-50">
            <p className="text-sm font-medium text-green-800">Email enviado</p>
            <p className="text-xs text-green-700 mt-1">
              Si existe una cuenta con ese email, recibirás instrucciones para restablecer tu contraseña.
            </p>
          </div>
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="w-full h-12 bg-brand-magenta text-white text-xs tracking-widest uppercase font-display hover:opacity-90 transition-opacity"
          >
            VOLVER AL INICIO DE SESIÓN
          </button>
        </div>
      ) : (
        <form className="w-full" action={formAction}>
          <div className="flex flex-col w-full gap-y-3">
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
            className="w-full mt-6 !bg-brand-magenta !border-brand-magenta hover:opacity-90 !rounded-none font-display tracking-widest !text-sm h-12"
          >
            ENVIAR INSTRUCCIONES
          </SubmitButton>
        </form>
      )}

      <div className="mt-8 pt-8 border-t border-grey-20 text-center">
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="text-xs text-grey-50 hover:text-brand-magenta transition-colors tracking-wide"
        >
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  )
}

export default ForgotPassword
