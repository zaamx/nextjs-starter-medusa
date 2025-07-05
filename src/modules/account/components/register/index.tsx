"use client"

import React, { useActionState, useRef, useState } from "react"
import Input from "@modules/common/components/input"
import SponsorInput from "@modules/common/components/sponsor-input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  redirectTo?: string
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const formRef = useRef<HTMLFormElement>(null)

  const [sponsorId, setSponsorId] = useState("")

  const handleSponsorSelect = (sponsorId: string) => {
    console.log('=== SPONSOR SELECTION ===')
    console.log('Selected sponsor ID:', sponsorId)
    console.log('Selected sponsor ID type:', typeof sponsorId)
    setSponsorId(sponsorId)
  }

  // Log render state
  console.log('=== REGISTER RENDER ===', { sponsorId })

  // Log when sponsorId changes
  React.useEffect(() => {
    console.log('=== REGISTER SPONSOR ID CHANGE ===', { sponsorId })
  }, [sponsorId])

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Become a We Now Member
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Create your We Now Member profile, and get access to an enhanced
        shopping experience.
      </p>
      <form 
        ref={formRef} 
        className="w-full flex flex-col" 
        action={formAction}
        onSubmit={(e) => {
          console.log('=== FORM SUBMISSION ===')
          console.log('Form submitted')
          console.log('Current sponsorId state:', sponsorId)
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
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />

          {/* MLM-Specific Fields */}
          <SponsorInput
            label="Sponsor Profile ID"
            name="sponsor_profile_id"
            value={sponsorId}
            onChange={handleSponsorSelect}
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
            <label className="text-sm font-medium">Preferred Binary Side</label>
            <div className="flex gap-x-4">
              <label className="flex items-center gap-x-1">
                <input type="radio" name="preferred_side" value="0" data-testid="preferred-side-left" /> Left (0)
              </label>
              <label className="flex items-center gap-x-1">
                <input type="radio" name="preferred_side" value="1" data-testid="preferred-side-right" /> Right (1)
              </label>
              {/* <label className="flex items-center gap-x-1">
                <input type="radio" name="preferred_side" value="" data-testid="preferred-side-auto" /> Auto-assign
              </label> */}
            </div>
          </div>
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          By creating an account, you agree to We Now&apos;s{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Join
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
