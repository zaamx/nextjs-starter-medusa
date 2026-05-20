"use client"

import { usePathname, useParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const navGroups = [
  {
    items: [
      { name: "← Volver a la tienda", href: "/" },
      { name: "Dashboard", href: "/office" },
    ],
  },
  {
    label: "Red",
    items: [
      { name: "Genealogía Binaria", href: "/office/binary-genealogy" },
      { name: "Genealogía Unilevel", href: "/office/unilevel-genealogy" },
      { name: "Matriz", href: "/office/matrix" },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { name: "Comisiones", href: "/office/commissions" },
      { name: "Wallet", href: "/office/wallet" },
    ],
  },
  {
    label: "Pedidos",
    items: [
      { name: "Órdenes & Autoenvío", href: "/office/orders-autoship" },
    ],
  },
  {
    label: "Recursos",
    items: [
      { name: "Sitio Replicado", href: "/office/replicated-site" },
      { name: "Centro de Formación", href: "/office/training-center" },
      { name: "Soporte & Cumplimiento", href: "/office/support-compliance" },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { name: "Mi Perfil", href: "/account" },
    ],
  },
]

export default function OfficeSidebar() {
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const isActive = (href: string) => {
    const localizedHref = `/${countryCode}${href}`
    if (href === "/office") {
      return pathname === localizedHref
    }
    return pathname.startsWith(localizedHref)
  }

  return (
    <aside className="hidden small:flex flex-col w-56 xl:w-64 bg-brand-dark text-white flex-shrink-0 overflow-y-auto">
      {/* Nav groups */}
      <nav className="flex-1 px-3 pt-3 pb-4 flex flex-col gap-y-5 overflow-y-auto">
        {navGroups.map((group, i) => (
          <div key={i} className="flex flex-col gap-y-0.5">
            {group.label && (
              <p className="px-3 text-[10px] tracking-widest uppercase text-white/30 mb-1">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href)
              return (
                <LocalizedClientLink
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm transition-colors rounded-none ${
                    active
                      ? "bg-brand-magenta text-white font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`}
                >
                  {item.name}
                </LocalizedClientLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-[10px] text-white/20 tracking-widest">
          © {new Date().getFullYear()} We Now
        </p>
      </div>
    </aside>
  )
}
