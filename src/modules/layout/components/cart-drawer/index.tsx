"use client"

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

const CartDrawer = ({ cart: cartState }: { cart?: HttpTypes.StoreCart | null }) => {
  const [open, setOpen] = useState(false)
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(undefined)

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)
  const pathname = usePathname()

  const timedOpen = () => {
    setOpen(true)
    const timer = setTimeout(() => setOpen(false), 5000)
    setActiveTimer(timer)
  }

  useEffect(() => {
    return () => { if (activeTimer) clearTimeout(activeTimer) }
  }, [activeTimer])

  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center text-gray-700 hover:text-brand-magenta transition-colors"
        aria-label={`Carrito (${totalItems} productos)`}
        data-testid="nav-cart-link"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-brand-magenta text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Drawer */}
      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50">
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
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="fixed inset-y-0 right-0 w-full max-w-sm bg-white flex flex-col shadow-xl"
              data-testid="nav-cart-dropdown"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <DialogTitle className="font-display text-base tracking-widest text-gray-900">
                  TU CARRITO
                </DialogTitle>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                  aria-label="Cerrar carrito"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {cartState && cartState.items?.length ? (
                <>
                  {/* Items */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar">
                    {cartState.items
                      .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
                      .map((item) => (
                        <div key={item.id} className="flex gap-4 items-start" data-testid="cart-item">
                          <LocalizedClientLink
                            href={`/products/${item.product_handle}`}
                            onClick={() => setOpen(false)}
                            className="shrink-0"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                              <Thumbnail
                                thumbnail={item.thumbnail}
                                images={item.variant?.product?.images}
                                size="square"
                              />
                            </div>
                          </LocalizedClientLink>

                          <div className="flex-1 min-w-0">
                            <p className="text-base-semi text-gray-900 truncate">
                              <LocalizedClientLink
                                href={`/products/${item.product_handle}`}
                                onClick={() => setOpen(false)}
                                data-testid="product-link"
                              >
                                {item.title}
                              </LocalizedClientLink>
                            </p>
                            <LineItemOptions
                              variant={item.variant}
                              data-testid="cart-item-variant"
                              data-value={item.variant}
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-small-regular text-gray-500" data-testid="cart-item-quantity" data-value={item.quantity}>
                                Cantidad: {item.quantity}
                              </span>
                              <LineItemPrice
                                item={item}
                                style="tight"
                                currencyCode={cartState.currency_code}
                              />
                            </div>
                          </div>

                          <DeleteButton
                            id={item.id}
                            className="shrink-0 text-gray-400 hover:text-gray-900"
                            data-testid="cart-item-remove-button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </DeleteButton>
                        </div>
                      ))}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 space-y-4">
                    <p className="text-xs text-center text-gray-500 bg-gray-50 rounded px-3 py-2">
                      Suscríbete y ahorra 25% en cada pedido
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-base-semi text-gray-900">
                        Subtotal <span className="text-small-regular font-normal">(excl. impuestos)</span>
                      </span>
                      <span className="text-large-semi text-gray-900" data-testid="cart-subtotal" data-value={subtotal}>
                        {convertToLocale({ amount: subtotal, currency_code: cartState.currency_code })}
                      </span>
                    </div>
                    <LocalizedClientLink href="/cart" onClick={() => setOpen(false)}>
                      <Button
                        className="w-full !bg-brand-magenta !text-white hover:!bg-brand-magenta/90 font-display tracking-widest"
                        size="large"
                        data-testid="go-to-cart-button"
                      >
                        PAGAR
                      </Button>
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href="/cart"
                      onClick={() => setOpen(false)}
                      className="block text-center text-xs text-gray-500 hover:text-gray-900 underline"
                    >
                      Ver carrito completo
                    </LocalizedClientLink>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                  </svg>
                  <p className="font-display text-lg tracking-widest text-gray-900">
                    TU CARRITO ESTÁ VACÍO
                  </p>
                  <LocalizedClientLink href="/store" onClick={() => setOpen(false)}>
                    <Button
                      className="!bg-brand-magenta !text-white hover:!bg-brand-magenta/90 font-display tracking-widest"
                    >
                      COMPRAR AHORA
                    </Button>
                  </LocalizedClientLink>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  )
}

export default CartDrawer
