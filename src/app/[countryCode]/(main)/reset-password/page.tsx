import { Metadata } from 'next'
import ResetPasswordTemplate from '@modules/account/templates/reset-password-template'

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description: "Restablece tu contraseña para acceder a tu cuenta.",
}

export default async function ResetPassword({ 
  params 
}: { 
  params: Promise<{ countryCode: string }> 
}) {
  const { countryCode } = await params

  return <ResetPasswordTemplate countryCode={countryCode} />
} 