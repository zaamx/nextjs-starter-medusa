"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Become a Medusa Store Member
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Create your Medusa Store Member profile, and get access to an enhanced
        shopping experience.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
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
            label="Father last name"
            name="father_last_name"
            required
            data-testid="father-last-name-input"
          />
          <Input
            label="Birthday date (DD/MM/YY)"
            name="birthday_date"
            required
            pattern="[0-9]{2}/[0-9]{2}/[0-9]{2}"
            data-testid="birthday-date-input"
          />
          <div className="flex flex-col gap-y-1">
            <label className="text-sm font-medium">Binary position<span className="text-rose-500">*</span></label>
            <div className="flex gap-x-4">
              <label className="flex items-center gap-x-1">
                <input type="radio" name="binary_position" value="0" required data-testid="binary-position-0" /> 0
              </label>
              <label className="flex items-center gap-x-1">
                <input type="radio" name="binary_position" value="1" required data-testid="binary-position-1" /> 1
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-y-1">
            <label className="text-sm font-medium">Customer type<span className="text-rose-500">*</span></label>
            <div className="flex gap-x-4">
              <label className="flex items-center gap-x-1">
                <input type="checkbox" name="customer_type" value="retail" data-testid="customer-type-retail" /> Retail
              </label>
              <label className="flex items-center gap-x-1">
                <input type="checkbox" name="customer_type" value="associate" data-testid="customer-type-associate" /> Associate
              </label>
            </div>
          </div>
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
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          By creating an account, you agree to Medusa Store&apos;s{" "}
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
