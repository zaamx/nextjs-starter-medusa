import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión para acceder a una experiencia de compra mejorada.",
}

export default function Login() {
  return <LoginTemplate />
}
