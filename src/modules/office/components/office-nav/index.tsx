"use client"

import { clx } from "@medusajs/ui"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import { useParams, usePathname } from "next/navigation"

import ChevronDown from "@modules/common/icons/chevron-down"
import User from "@modules/common/icons/user"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"

const OfficeNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  // Add new navigation items for each office section
  const officeSections = [
    { label: "Dashboard", href: "/office", icon: <User size={20} /> },
    { label: "Genealogía Binaria", href: "/office/binary-genealogy", icon: <Package size={20} /> },
    { label: "Genealogía Unilevel", href: "/office/unilevel-genealogy", icon: <Package size={20} /> },
    // { label: "Calculadora de Avance / Rango", href: "/office/rank-calculator", icon: <ChevronDown className='rotate-180' /> },
    { label: "Estado de Comisiones", href: "/office/commissions", icon: <Package size={20} /> },
    { label: "Órdenes & Autoship", href: "/office/orders-autoship", icon: <Package size={20} /> },
    // { label: "Billetera digital", href: "/office/wallet", icon: <User size={20} /> },
    // { label: "Reportes avanzados", href: "/office/reports", icon: <Package size={20} /> },
    { label: "Materiales de Marketing", href: "/office/marketing-materials", icon: <User size={20} /> },
    { label: "Centro de Formación", href: "/office/training-center", icon: <User size={20} /> },
    { label: "Soporte & Cumplimiento", href: "/office/support-compliance", icon: <User size={20} /> },
    // { label: "Herramientas administrativas", href: "/office/admin-tools", icon: <User size={20} /> },
  ]

  return (
    <div>
      <div className="hidden small:block" data-testid="office-nav">
        <div>
          <div className="text-base-regular">
            <ul className="flex flex-col gap-y-2">
              {officeSections.map((section) => (
                <li key={section.href}>
                  <LocalizedClientLink
                    href={section.href}
                    className={clx(
                      "flex items-center gap-x-2 px-4 py-2 rounded hover:bg-gray-100 transition",
                      route.startsWith(section.href) ? "bg-gray-100 font-semibold" : "text-ui-fg-subtle"
                    )}
                    data-testid={`office-nav-${section.label.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {section.icon}
                    <span>{section.label}</span>
                  </LocalizedClientLink>
                </li>
              ))}
              <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8 w-full"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <ArrowRightOnRectangle />
                      <span>Log out</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={clx("text-ui-fg-subtle hover:text-ui-fg-base", {
        "text-ui-fg-base font-semibold": active,
      })}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default OfficeNav
