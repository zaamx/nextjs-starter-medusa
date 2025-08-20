"use client"

import React, { useActionState, useRef, useState } from "react"
import Input from "@modules/common/components/input"
import SponsorInput from "@modules/common/components/sponsor-input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { hasRequiredRegistrationProduct, getRequiredProductUrl } from "@lib/util/cart-validation"
import { HttpTypes } from "@medusajs/types"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  redirectTo?: string
  cart?: HttpTypes.StoreCart | null
  countryCode?: string
}

const Register = ({ setCurrentView, cart, countryCode }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const formRef = useRef<HTMLFormElement>(null)

  const [sponsorId, setSponsorId] = useState("")

  const handleSponsorSelect = (sponsorId: string, sponsorInfo?: any) => {
    console.log('=== SPONSOR SELECTION ===')
    console.log('Selected sponsor ID:', sponsorId)
    console.log('Selected sponsor info:', sponsorInfo)
    console.log('Selected sponsor ID type:', typeof sponsorId)
    setSponsorId(sponsorId)
  }

  const handleSponsorInfoLoaded = (sponsorInfo: any) => {
    console.log('=== SPONSOR INFO LOADED ===')
    console.log('Sponsor info loaded:', sponsorInfo)
    // You can add additional logic here if needed when sponsor info is loaded
  }

  // Check if user has required product in cart
  const hasRequiredProduct = hasRequiredRegistrationProduct(cart || null)
  const productUrl = getRequiredProductUrl()

  // Log render state
  console.log('=== REGISTER RENDER ===', { sponsorId, hasRequiredProduct })

  // Log when sponsorId changes
  React.useEffect(() => {
    console.log('=== REGISTER SPONSOR ID CHANGE ===', { sponsorId })
  }, [sponsorId])

  // If user doesn't have required product, show message
  if (!hasRequiredProduct) {
    return (
      <div
        className="max-w-sm flex flex-col items-center"
        data-testid="register-page"
      >
        <h1 className="text-large-semi uppercase mb-6">
          Become a We Now Member
        </h1>
        <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Registration Package Required
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  To become a We Now Member, you need to purchase the "Paquete de Inscripción" 
                  (Registration Package) first. This package is required for all new members.
                </p>
              </div>
              <div className="mt-4">
                <LocalizedClientLink
                  href={productUrl}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Add Registration Package to Cart
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </div>
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          ¿Ya eres miembro?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="underline"
          >
            Iniciar sesión
          </button>
          .
        </span>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Conviértete en Miembro de We Now
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Crea tu perfil de Miembro de We Now y accede a una experiencia de compra mejorada.
      </p>
      <form 
        ref={formRef} 
        className="w-full flex flex-col" 
        action={formAction}
        onSubmit={(e) => {
          console.log('=== FORM SUBMISSION ===')
          console.log('Form submitted')
          console.log('Current sponsorId state:', sponsorId)
          
          // Client-side validation for sponsor ID
          if (!sponsorId || sponsorId.trim() === "") {
            e.preventDefault()
            alert("Por favor selecciona un patrocinador antes de enviar el formulario.")
            return
          }
          
          if (!/^\d+$/.test(sponsorId.trim())) {
            e.preventDefault()
            alert("Formato de ID de patrocinador inválido. Por favor selecciona un patrocinador usando la función de búsqueda.")
            return
          }
          
          console.log('Form elements:')
          const formData = new FormData(e.currentTarget)
          Array.from(formData.entries()).forEach(([key, value]) => {
            console.log(`${key}: ${value}`)
          })
        }}
      >
        <div className="flex flex-col w-full gap-y-2">
          {/* Standard Fields */}
          <Input
            label="Nombre"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Apellido"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Correo electrónico"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Teléfono"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            data-testid="phone-input"
          />
          <Input
            label="Contraseña"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />

          {/* MLM-Specific Fields */}
          <SponsorInput
            label="ID de Perfil del Patrocinador"
            name="sponsor_profile_id"
            value={sponsorId}
            onChange={handleSponsorSelect}
            onSponsorInfoLoaded={handleSponsorInfoLoaded}
            required
            data-testid="sponsor-profile-id-input"
          />

          {/* Hidden fields with demo values - TEMPORARY */}
          <input type="hidden" name="profile_types_id" value="1" />
          <input type="hidden" name="gender" value="M" />
          <input type="hidden" name="personal_id" value="DEMO123456789" />
          <input type="hidden" name="birth_date" value="1990-01-01" />
          <input type="hidden" name="street" value="Demo Street 123" />
          <input type="hidden" name="district" value="Demo District" />
          <input type="hidden" name="city" value="Demo City" />
          <input type="hidden" name="state" value="Demo State" />
          <input type="hidden" name="postal_code" value="12345" />
          <input type="hidden" name="tax_id" value="DEMO-TAX-123" />

          {/* Original fields - HIDDEN FOR NOW */}
          {/* 
          <Input
            label="Profile Type ID"
            name="profile_types_id"
            type="number"
            defaultValue="1"
            data-testid="profile-types-id-input"
          />
          
          <div className="flex flex-col gap-y-1">
            <label className="text-sm font-medium">Gender<span className="text-rose-500">*</span></label>
            <div className="flex gap-x-4">
              <label className="flex items-center gap-x-1">
                <input type="radio" name="gender" value="M" required data-testid="gender-male" /> Male
              </label>
              <label className="flex items-center gap-x-1">
                <input type="radio" name="gender" value="F" required data-testid="gender-female" /> Female
              </label>
            </div>
          </div>

          <Input
            label="Personal ID"
            name="personal_id"
            required
            data-testid="personal-id-input"
          />
          
          <Input
            label="Birth Date"
            name="birth_date"
            required
            type="date"
            data-testid="birth-date-input"
          />

          <Input
            label="Street"
            name="street"
            data-testid="street-input"
          />
          <Input
            label="District"
            name="district"
            data-testid="district-input"
          />
          <Input
            label="City"
            name="city"
            data-testid="city-input"
          />
          <Input
            label="State"
            name="state"
            data-testid="state-input"
          />
          <Input
            label="Postal Code"
            name="postal_code"
            data-testid="postal-code-input"
          />

          <Input
            label="Tax ID"
            name="tax_id"
            data-testid="tax-id-input"
          />
          */}

          {/* Binary Position Preference */}
          <div className="flex flex-col gap-y-1">
            <label className="text-sm font-medium">Lado Binario Preferido<span className="text-rose-500">*</span></label>
            <div className="flex gap-x-4">
              <label className="flex items-center gap-x-1">
                <input type="radio" name="preferred_side" value="0" required data-testid="preferred-side-left" /> Izquierda (0)
              </label>
              <label className="flex items-center gap-x-1">
                <input type="radio" name="preferred_side" value="1" required data-testid="preferred-side-right" /> Derecha (1)
              </label>
              {/* <label className="flex items-center gap-x-1">
                <input type="radio" name="preferred_side" value="" data-testid="preferred-side-auto" /> Auto-assign
              </label> */}
            </div>
          </div>
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          Al crear una cuenta, aceptas las{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            Políticas de Privacidad
          </LocalizedClientLink>{" "}
          y los{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            Términos de Uso
          </LocalizedClientLink>{" "}
          de We Now.
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Unirse
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        ¿Ya eres miembro?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Iniciar sesión
        </button>
        .
      </span>
    </div>
  )
}

export default Register
