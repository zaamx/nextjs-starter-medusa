import { retrieveCustomer } from "@lib/data/customer"
import { Toaster } from "@medusajs/ui"
import OfficeLayout from "@modules/office/components/templates/office-layout"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <OfficeLayout customer={customer}>
      {customer ? dashboard : login}
      <Toaster />
    </OfficeLayout>
  )
}
