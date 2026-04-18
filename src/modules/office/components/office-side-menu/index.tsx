"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { Fragment } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

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
      { name: "Materiales de Marketing", href: "/office/marketing-materials" },
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

const OfficeSideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center text-white/70 hover:text-white transition-colors focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="-translate-x-full opacity-0"
                enterTo="translate-x-0 opacity-100"
                leave="transition ease-in duration-150"
                leaveFrom="translate-x-0 opacity-100"
                leaveTo="-translate-x-full opacity-0"
              >
                <PopoverPanel className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-brand-dark text-white shadow-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
                    <div>
                      <span className="font-display text-base tracking-widest text-brand-magenta leading-none">
                        WE NOW
                      </span>
                      <p className="text-[9px] text-white/30 tracking-widest uppercase mt-0.5">
                        Oficina Virtual
                      </p>
                    </div>
                    <button
                      data-testid="close-menu-button"
                      onClick={close}
                      className="p-1.5 text-white/50 hover:text-white transition-colors"
                    >
                      <XMark className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Nav */}
                  <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-y-5">
                    {navGroups.map((group, i) => (
                      <div key={i} className="flex flex-col gap-y-0.5">
                        {group.label && (
                          <p className="px-3 text-[10px] tracking-widest uppercase text-white/30 mb-1">
                            {group.label}
                          </p>
                        )}
                        {group.items.map((item) => (
                          <LocalizedClientLink
                            key={item.href}
                            href={item.href}
                            onClick={close}
                            className="flex items-center px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/8 transition-colors"
                            data-testid={`${item.name.toLowerCase()}-link`}
                          >
                            {item.name}
                          </LocalizedClientLink>
                        ))}
                      </div>
                    ))}
                  </nav>

                  {/* Footer */}
                  <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
                    <p className="text-[10px] text-white/20 tracking-widest">
                      © {new Date().getFullYear()} We Now
                    </p>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default OfficeSideMenu
