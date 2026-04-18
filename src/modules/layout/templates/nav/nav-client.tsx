"use client"

import { useState, Fragment } from "react"
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RegionSelectNav from "@modules/layout/components/region-select-nav"
import CartDrawer from "@modules/layout/components/cart-drawer"
import { HttpTypes } from "@medusajs/types"

const BASE_LINKS = [
  { label: "INICIO", href: "/" },
  { label: "TIENDA", href: "/store" },
]

const AUTH_LINKS = [
  { label: "OFICINA", href: "/office" },
]

type NavClientProps = {
  regions: HttpTypes.StoreRegion[]
  cart: HttpTypes.StoreCart | null
  isAuthenticated: boolean
}

export default function NavClient({ regions, cart, isAuthenticated }: NavClientProps) {
  const NAV_LINKS = isAuthenticated ? [...BASE_LINKS, ...AUTH_LINKS] : BASE_LINKS
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <nav className="content-container flex h-16 items-center justify-between">
          {/* Logo */}
          <LocalizedClientLink href="/" className="flex-shrink-0">
            <span className="font-display text-2xl tracking-wider text-gray-900">
              WENOW
            </span>
          </LocalizedClientLink>

          {/* Desktop links */}
          <div className="hidden small:flex items-center gap-x-8">
            {NAV_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.href}
                href={link.href}
                className="font-display text-sm tracking-widest text-gray-700 hover:text-brand-magenta transition-colors"
              >
                {link.label}
              </LocalizedClientLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-x-4">
            {/* Region select — desktop */}
            <div className="hidden small:block">
              <RegionSelectNav regions={regions} />
            </div>

            {/* Account — desktop */}
            {isAuthenticated ? (
              <LocalizedClientLink
                href="/account"
                className="hidden small:flex items-center text-gray-700 hover:text-brand-magenta transition-colors"
                data-testid="nav-account-link"
                aria-label="Tu cuenta"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </LocalizedClientLink>
            ) : (
              <div className="hidden small:flex items-center gap-x-2">
                <LocalizedClientLink
                  href="/account"
                  className="font-display text-xs tracking-widest text-gray-700 hover:text-brand-magenta transition-colors"
                  data-testid="nav-login-link"
                >
                  INICIA SESIÓN
                </LocalizedClientLink>
                <span className="text-gray-300">|</span>
                <LocalizedClientLink
                  href="/account"
                  className="font-display text-xs tracking-widest text-white bg-brand-magenta px-3 py-1.5 hover:opacity-90 transition-opacity"
                  data-testid="nav-register-link"
                >
                  REGÍSTRATE
                </LocalizedClientLink>
              </div>
            )}

            {/* Cart */}
            <CartDrawer cart={cart} />

            {/* Hamburger — mobile */}
            <button
              className="small:hidden flex flex-col gap-1.5 p-1 text-gray-700"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="block w-5 h-px bg-current" />
              <span className="block w-5 h-px bg-current" />
              <span className="block w-5 h-px bg-current" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu drawer */}
      <Transition show={mobileOpen} as={Fragment}>
        <Dialog onClose={() => setMobileOpen(false)} className="relative z-50">
          {/* Backdrop */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </TransitionChild>

          {/* Panel */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200">
                <span className="font-display text-xl tracking-wider text-gray-900">WENOW</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-gray-500 hover:text-gray-900"
                  aria-label="Cerrar menú"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 px-6 py-8 flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <LocalizedClientLink
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-2xl text-gray-900 hover:text-brand-magenta transition-colors"
                  >
                    {link.label}
                  </LocalizedClientLink>
                ))}
                {isAuthenticated ? (
                  <LocalizedClientLink
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-2xl text-gray-900 hover:text-brand-magenta transition-colors"
                  >
                    MI CUENTA
                  </LocalizedClientLink>
                ) : (
                  <>
                    <LocalizedClientLink
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="font-display text-2xl text-gray-900 hover:text-brand-magenta transition-colors"
                    >
                      INICIA SESIÓN
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="font-display text-2xl text-brand-magenta hover:opacity-70 transition-opacity"
                    >
                      REGÍSTRATE
                    </LocalizedClientLink>
                  </>
                )}
              </nav>

              {/* Footer: region */}
              <div className="px-6 py-6 border-t border-gray-200">
                <RegionSelectNav regions={regions} />
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  )
}
