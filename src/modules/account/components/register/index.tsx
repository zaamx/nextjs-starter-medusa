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

  // If user doesn't have required product, show gating message
  if (!hasRequiredProduct) {
    return (
      <div
        className="w-full max-w-sm flex flex-col"
        data-testid="register-page"
      >
        <div className="mb-10">
          <p className="text-xs tracking-widest uppercase text-brand-magenta mb-3">
            Registro
          </p>
          <h1 className="font-display text-4xl text-grey-90 leading-none mb-2">
            ÚNETE A WE NOW
          </h1>
          <p className="text-sm text-grey-50">
            Para convertirte en miembro necesitas completar un paso previo.
          </p>
        </div>

        <div className="border-l-2 border-brand-magenta pl-4 py-3 bg-brand-cream mb-8">
          <p className="text-sm font-medium text-grey-90">Paquete de inscripción requerido</p>
          <p className="text-xs text-grey-50 mt-1 leading-relaxed">
            Para registrarte como Miembro de We Now, primero debes adquirir uno de los{" "}
            <strong>Paquetes de Inscripción</strong>. Elige entre Zafiro, Esmeralda o el paquete estándar.
          </p>
          <LocalizedClientLink
            href={productUrl}
            className="inline-block mt-4 h-10 px-6 bg-brand-magenta text-white text-xs tracking-widest uppercase font-display leading-10 hover:opacity-90 transition-opacity"
          >
            VER PAQUETES DE INSCRIPCIÓN
          </LocalizedClientLink>
        </div>

        <div className="pt-6 border-t border-grey-20 text-center">
          <p className="text-xs text-grey-50 mb-4">¿Ya eres miembro?</p>
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="text-xs text-brand-magenta hover:opacity-70 transition-opacity tracking-wide"
          >
            Iniciar sesión →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-full max-w-sm flex flex-col"
      data-testid="register-page"
    >
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase text-brand-magenta mb-3">
          Registro
        </p>
        <h1 className="font-display text-4xl text-grey-90 leading-none mb-2">
          CONVIÉRTETE EN MIEMBRO
        </h1>
        <p className="text-sm text-grey-50">
          Crea tu perfil y accede a todos los beneficios de la comunidad We Now.
        </p>
      </div>

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
        <div className="flex flex-col w-full gap-y-3">
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
          <div className="flex flex-col gap-y-2 pt-1">
            <span className="text-xs tracking-widest uppercase text-grey-50">
              Lado Binario Preferido <span className="text-brand-magenta">*</span>
            </span>
            <div className="flex gap-x-4">
              <label className="flex items-center gap-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="preferred_side"
                  value="0"
                  required
                  data-testid="preferred-side-left"
                  className="accent-brand-magenta"
                />
                <span className="text-sm text-grey-70">Izquierda (0)</span>
              </label>
              <label className="flex items-center gap-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="preferred_side"
                  value="1"
                  required
                  data-testid="preferred-side-right"
                  className="accent-brand-magenta"
                />
                <span className="text-sm text-grey-70">Derecha (1)</span>
              </label>
            </div>
          </div>
        </div>

        <ErrorMessage error={message} data-testid="register-error" />

        <p className="text-xs text-grey-40 leading-relaxed mt-6">
          Al crear una cuenta, aceptas las{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="text-brand-magenta hover:opacity-70 transition-opacity"
          >
            Políticas de Privacidad
          </LocalizedClientLink>{" "}
          y los{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="text-brand-magenta hover:opacity-70 transition-opacity"
          >
            Términos de Uso
          </LocalizedClientLink>{" "}
          de We Now.
        </p>

        <SubmitButton
          className="w-full mt-4 !bg-brand-magenta !border-brand-magenta hover:opacity-90 !rounded-none font-display tracking-widest !text-sm h-12"
          data-testid="register-button"
        >
          CREAR MI CUENTA
        </SubmitButton>
      </form>

      <div className="mt-8 pt-8 border-t border-grey-20 text-center">
        <p className="text-xs text-grey-50 mb-4">¿Ya eres miembro?</p>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="w-full h-11 border border-grey-90 text-grey-90 text-xs tracking-widest uppercase font-display hover:bg-grey-90 hover:text-white transition-colors"
        >
          INICIAR SESIÓN
        </button>
      </div>
    </div>
  )
}

export default Register
