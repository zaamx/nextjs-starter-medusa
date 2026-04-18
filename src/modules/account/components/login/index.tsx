import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  redirectTo?: string
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="w-full max-w-sm flex flex-col"
      data-testid="login-page"
    >
      {/* Heading */}
      <div className="mb-10">
        <p className="text-xs tracking-widest uppercase text-brand-magenta mb-3">
          Tu cuenta
        </p>
        <h1 className="font-display text-4xl text-grey-90 leading-none mb-2">
          BIENVENIDO DE VUELTA
        </h1>
        <p className="text-sm text-grey-50">
          Inicia sesión para acceder a tu perfil y pedidos.
        </p>
      </div>

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
          <Input
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>

        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
            className="text-xs text-grey-50 hover:text-brand-magenta transition-colors tracking-wide"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <ErrorMessage error={message} data-testid="login-error-message" />

        <SubmitButton
          data-testid="sign-in-button"
          className="w-full mt-6 !bg-brand-magenta !border-brand-magenta hover:opacity-90 !rounded-none font-display tracking-widest !text-sm h-12"
        >
          INICIAR SESIÓN
        </SubmitButton>
      </form>

      <div className="mt-8 pt-8 border-t border-grey-20 text-center">
        <p className="text-xs text-grey-50 mb-4">¿Aún no eres miembro?</p>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="w-full h-11 border border-grey-90 text-grey-90 text-xs tracking-widest uppercase font-display hover:bg-grey-90 hover:text-white transition-colors"
        >
          ÚNETE A WE NOW
        </button>
      </div>
    </div>
  )
}

export default Login
