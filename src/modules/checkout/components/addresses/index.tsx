"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  // enviarAOtraDireccion represents whether the user wants to ship to a different address.
  // We default to false (which means shipping is same as billing).
  const { state: enviarAOtraDireccion, toggle: toggleEnviarAOtraDireccion } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? !compareAddresses(cart?.shipping_address, cart?.billing_address)
      : false
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
        >
          Datos de Facturación
          {!isOpen && <CheckCircleSolid />}
        </Heading>
        {!isOpen && cart?.billing_address && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-address-button"
            >
              Editar
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <BillingAddress cart={cart} />

            <div className="my-8 flex flex-col gap-y-4">
              <div className="flex flex-col">
                <Checkbox
                  label="Enviar a otra dirección"
                  name="enviar_a_otra_direccion"
                  checked={enviarAOtraDireccion}
                  onChange={toggleEnviarAOtraDireccion}
                  data-testid="shipping-address-checkbox"
                />
                <input
                  type="hidden"
                  name="enviar_a_otra_direccion_hidden"
                  value={enviarAOtraDireccion ? "on" : "off"}
                />
              </div>
            </div>

            {enviarAOtraDireccion && (
              <div className="border-t border-gray-100 pt-8 mt-4">
                <Heading
                  level="h2"
                  className="text-3xl-regular gap-x-4 pb-6"
                >
                  Dirección de envío
                </Heading>

                <ShippingAddress
                  customer={customer}
                  cart={cart}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100 mb-6">
              <Input
                label="Correo electrónico"
                name="email"
                type="email"
                title="Ingresa una dirección de email válida."
                autoComplete="email"
                defaultValue={cart?.email || customer?.email || ""}
                required
                data-testid="shipping-email-input"
              />
            </div>

            <SubmitButton className="mt-6" data-testid="submit-address-button">
              Continuar a la entrega
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && cart.billing_address ? (
              <div className="flex items-start gap-x-8">
                <div className="flex items-start gap-x-1 w-full">
                  <div
                    className="flex flex-col w-1/3"
                    data-testid="billing-address-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Dirección de Facturación
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.billing_address.first_name}{" "}
                      {cart.billing_address.last_name}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.billing_address.address_1}{" "}
                      {cart.billing_address.address_2}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.billing_address.postal_code},{" "}
                      {cart.billing_address.city}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.billing_address.country_code?.toUpperCase()}
                    </Text>
                  </div>

                  <div
                    className="flex flex-col w-1/3"
                    data-testid="shipping-address-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Dirección de Envío
                    </Text>

                    {!enviarAOtraDireccion ? (
                      <Text className="txt-medium text-ui-fg-subtle">
                        Las direcciones de facturación y entrega son las mismas.
                      </Text>
                    ) : (
                      <>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address?.first_name}{" "}
                          {cart.shipping_address?.last_name}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address?.address_1}{" "}
                          {cart.shipping_address?.address_2}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address?.postal_code},{" "}
                          {cart.shipping_address?.city}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address?.country_code?.toUpperCase()}
                        </Text>
                      </>
                    )}
                  </div>

                  <div
                    className="flex flex-col w-1/3 "
                    data-testid="shipping-contact-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Contacto
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address?.phone || cart.billing_address?.phone}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.email}
                    </Text>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses
