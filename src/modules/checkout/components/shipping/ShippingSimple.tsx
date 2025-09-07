"use client"

import { RadioGroup, Radio } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import MedusaRadio from "@modules/common/components/radio"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type ShippingSimpleProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

function formatAddress(address: any) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

const ShippingSimple: React.FC<ShippingSimpleProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  // Check if cart contains WNSTART SKU
  const hasWNSTARTSku = cart.items?.some(item => item.variant_sku === "WNSTART")

  // Filter shipping methods based on WNSTART SKU presence
  const filteredShippingMethods = hasWNSTARTSku 
    ? availableShippingMethods
    : availableShippingMethods?.filter(sm => 
        sm.name !== "Free Shipping on Enrollment" && 
        sm.name !== "Envio Gratuito en Inscrición"
      )

  const _shippingMethods = filteredShippingMethods?.filter(
    (sm) => (sm as any).service_zone?.fulfillment_set?.type !== "pickup"
  )

  const _pickupMethods = filteredShippingMethods?.filter(
    (sm) => (sm as any).service_zone?.fulfillment_set?.type === "pickup"
  )

  const hasPickupOptions = !!_pickupMethods?.length

  // Initialize with existing cart shipping method if available
  useEffect(() => {
    const existingShippingMethodId = cart.shipping_methods?.at(-1)?.shipping_option_id
    if (existingShippingMethodId) {
      setSelectedShippingMethodId(existingShippingMethodId)
    }
  }, [cart.shipping_methods])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleContinue = async () => {
    if (!selectedShippingMethodId) {
      setError("Por favor seleccione un método de envío")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("🚀 [SHIPPING SIMPLE] Setting shipping method", {
        cartId: cart.id,
        shippingMethodId: selectedShippingMethodId,
        timestamp: new Date().toISOString()
      })

      const result = await setShippingMethod({ 
        cartId: cart.id, 
        shippingMethodId: selectedShippingMethodId 
      })

      console.log("🚀 [SHIPPING SIMPLE] Shipping method set successfully", {
        result,
        timestamp: new Date().toISOString()
      })

      // Navigate to payment step
      router.push(pathname + "?step=payment", { scroll: false })
    } catch (err: any) {
      console.error("🚀 [SHIPPING SIMPLE] Error setting shipping method", {
        error: err,
        message: err.message,
        cartId: cart.id,
        shippingMethodId: selectedShippingMethodId,
        timestamp: new Date().toISOString()
      })
      
      setError(err.message || "Error al seleccionar el método de envío")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && cart.shipping_methods?.length === 0,
            }
          )}
        >
          Envío
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolid />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Text>
              <button
                onClick={handleEdit}
                disabled={isLoading}
                className={clx(
                  "text-ui-fg-interactive hover:text-ui-fg-interactive-hover",
                  {
                    "opacity-50 cursor-not-allowed": isLoading,
                  }
                )}
                data-testid="edit-delivery-button"
              >
                Editar
              </button>
            </Text>
          )}
      </div>
      
      {isOpen ? (
        <>
          <div className="grid relative">
            <div className="flex flex-col">
              <span className="font-medium txt-medium text-ui-fg-base">
                Método de envío
              </span>
              <span className="mb-4 text-ui-fg-muted txt-medium">
                Cómo le gustaría que le llegue su pedido
              </span>
            </div>
            
            <div data-testid="delivery-options-container" className="relative">
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <div className="flex flex-col items-center gap-3">
                    <Loader className="animate-spin h-6 w-6 text-ui-fg-interactive" />
                    <span className="text-sm text-ui-fg-muted">Procesando...</span>
                  </div>
                </div>
              )}
              
              <div className="pb-8 md:pt-0 pt-2">
                <RadioGroup
                  value={selectedShippingMethodId}
                  disabled={isLoading}
                  onChange={(value) => {
                    if (isLoading) return
                    console.log("🚀 [SHIPPING SIMPLE] Method selected", {
                      selectedValue: value,
                      timestamp: new Date().toISOString()
                    })
                    setSelectedShippingMethodId(value)
                    setError(null) // Clear any previous errors
                  }}
                >
                  {/* Pickup Option */}
                  {hasPickupOptions && (
                    <Radio
                      value={_pickupMethods?.find((option: any) => !option.insufficient_inventory)?.id || ""}
                      data-testid="delivery-option-radio"
                      disabled={isLoading}
                      className={clx(
                        "flex items-center justify-between text-small-regular py-4 border rounded-rounded px-8 mb-2",
                        {
                          "border-ui-border-interactive":
                            _pickupMethods?.some(m => m.id === selectedShippingMethodId),
                          "cursor-pointer hover:shadow-borders-interactive-with-active": !isLoading,
                          "cursor-not-allowed opacity-50": isLoading,
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <MedusaRadio
                          checked={_pickupMethods?.some(m => m.id === selectedShippingMethodId)}
                        />
                        <span className="text-base-regular">
                          Recoger pedido en sucursal
                        </span>
                      </div>
                      <span className="justify-self-end text-ui-fg-base">
                        -
                      </span>
                    </Radio>
                  )}
                  
                  {/* Shipping Methods */}
                  {_shippingMethods?.map((option) => {
                    return (
                      <Radio
                        key={option.id}
                        value={option.id}
                        data-testid="delivery-option-radio"
                        disabled={isLoading}
                        className={clx(
                          "flex items-center justify-between text-small-regular py-4 border rounded-rounded px-8 mb-2",
                          {
                            "border-ui-border-interactive":
                              option.id === selectedShippingMethodId,
                            "cursor-pointer hover:shadow-borders-interactive-with-active": !isLoading,
                            "cursor-not-allowed opacity-50": isLoading,
                          }
                        )}
                      >
                        <div className="flex items-center gap-x-4">
                          <MedusaRadio
                            checked={option.id === selectedShippingMethodId}
                          />
                          <span className="text-base-regular">
                            {option.name}
                          </span>
                        </div>
                        <span className="justify-self-end text-ui-fg-base">
                          {option.price_type === "flat" ? (
                            convertToLocale({
                              amount: option.amount!,
                              currency_code: cart?.currency_code,
                            })
                          ) : (
                            "Calculado al finalizar"
                          )}
                        </span>
                      </Radio>
                    )
                  })}
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Pickup Location Selection */}
          {_pickupMethods?.some(m => m.id === selectedShippingMethodId) && (
            <div className="grid relative">
              <div className="flex flex-col">
                <span className="font-medium txt-medium text-ui-fg-base">
                  Sucursal
                </span>
                <span className="mb-4 text-ui-fg-muted txt-medium">
                  Elija una sucursal cerca de usted
                </span>
              </div>
              
              <div data-testid="delivery-options-container" className="relative">
                <div className="pb-8 md:pt-0 pt-2">
                  <RadioGroup
                    value={selectedShippingMethodId}
                    disabled={isLoading}
                    onChange={(value) => {
                      if (isLoading) return
                      console.log("🚀 [SHIPPING SIMPLE] Pickup location selected", {
                        selectedValue: value,
                        timestamp: new Date().toISOString()
                      })
                      setSelectedShippingMethodId(value)
                      setError(null)
                    }}
                  >
                    {_pickupMethods?.map((option) => {
                      return (
                        <Radio
                          key={option.id}
                          value={option.id}
                          disabled={(option as any).insufficient_inventory || isLoading}
                          data-testid="delivery-option-radio"
                          className={clx(
                            "flex items-center justify-between text-small-regular py-4 border rounded-rounded px-8 mb-2",
                            {
                              "border-ui-border-interactive":
                                option.id === selectedShippingMethodId,
                              "cursor-pointer hover:shadow-borders-interactive-with-active": !(option as any).insufficient_inventory && !isLoading,
                              "hover:shadow-brders-none cursor-not-allowed opacity-50":
                                (option as any).insufficient_inventory || isLoading,
                            }
                          )}
                        >
                          <div className="flex items-start gap-x-4">
                            <MedusaRadio
                              checked={option.id === selectedShippingMethodId}
                            />
                            <div className="flex flex-col">
                              <span className="text-base-regular">
                                {option.name}
                              </span>
                              <span className="text-base-regular text-ui-fg-muted">
                                {formatAddress(
                                  (option as any).service_zone?.fulfillment_set?.location
                                    ?.address
                                )}
                              </span>
                            </div>
                          </div>
                          <span className="justify-self-end text-ui-fg-base">
                            {convertToLocale({
                              amount: option.amount!,
                              currency_code: cart?.currency_code,
                            })}
                          </span>
                        </Radio>
                      )
                    })}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          <div>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              size="large"
              className="mt"
              onClick={handleContinue}
              isLoading={isLoading}
              disabled={!selectedShippingMethodId}
              data-testid="submit-delivery-option-button"
            >
              Continuar al pago
            </Button>
          </div>
        </>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Método
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {cart.shipping_methods?.at(-1)?.name}{" "}
                  {convertToLocale({
                    amount: cart.shipping_methods?.at(-1)?.amount!,
                    currency_code: cart?.currency_code,
                  })}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingSimple
