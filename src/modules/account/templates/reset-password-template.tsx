"use client"

import { useMemo, useState } from "react"
import { sdk } from "@lib/config"
import { useRouter } from "next/navigation"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"

type Props = {
  countryCode: string
}

const ResetPasswordTemplate = ({ countryCode }: Props) => {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  // Get token and email from URL parameters
  const searchParams = useMemo(() => {
    if (typeof window === "undefined") {
      return null
    }
    return new URLSearchParams(window.location.search)
  }, [])

  const token = useMemo(() => {
    return searchParams?.get("token")
  }, [searchParams])

  const email = useMemo(() => {
    return searchParams?.get("email")
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!token) {
      setMessage("Token de restablecimiento no válido")
      return
    }
    
    if (!email) {
      setMessage("Email no válido")
      return
    }
    
    if (!password) {
      setMessage("La contraseña es requerida")
      return
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden")
      return
    }

    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      await sdk.client.fetch(`/auth/customer/emailpass/update`, {
        method: 'post',
        body: {
          password,
        },
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      
      setIsSuccess(true)
      setMessage("¡Contraseña restablecida exitosamente!")
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push(`/${countryCode}/account`)
      }, 3000)
    } catch (error: any) {
      setMessage(`No se pudo restablecer la contraseña: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // If no token or email, show error
  if (!token || !email) {
    return (
      <div className="w-full flex justify-center px-8 py-8">
        <div className="max-w-sm w-full flex flex-col items-center">
          <h1 className="text-large-semi uppercase mb-6">Enlace inválido</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Enlace de restablecimiento inválido
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    El enlace de restablecimiento de contraseña no es válido o ha expirado. 
                    Por favor, solicita un nuevo enlace.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/${countryCode}/account`)}
            className="w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center px-8 py-8">
      <div className="max-w-sm w-full flex flex-col items-center">
        <h1 className="text-large-semi uppercase mb-6">Restablecer contraseña</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          Ingresa tu nueva contraseña para restablecer tu cuenta.
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
                    ¡Contraseña restablecida!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{message}</p>
                    <p className="mt-2">Serás redirigido al inicio de sesión en unos segundos...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col w-full gap-y-2">
              <Input
                label="Nueva contraseña"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="new-password-input"
              />
              <Input
                label="Confirmar contraseña"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="confirm-password-input"
              />
            </div>
            <ErrorMessage error={message} data-testid="reset-password-error-message" />
            <SubmitButton 
              data-testid="reset-password-button" 
              className="w-full mt-6"
            >
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordTemplate 