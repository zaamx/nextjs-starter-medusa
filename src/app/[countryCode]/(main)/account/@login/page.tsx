import { Metadata } from "next"
import { retrieveCart } from "@lib/data/cart"
import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión para acceder a una experiencia de compra mejorada.",
}

export default async function Login({ 
  params 
}: { 
  params: Promise<{ countryCode: string }> 
}) {
  const { countryCode } = await params
  const cart = await retrieveCart()

  return <LoginTemplate cart={cart} countryCode={countryCode} />
}
