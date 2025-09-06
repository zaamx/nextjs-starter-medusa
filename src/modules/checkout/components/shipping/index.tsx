"use client"

import { RadioGroup, Radio } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { logError, logInfo, logWarn } from "@lib/util/server-logger"
import { useServerLogger } from "@lib/hooks/use-server-logger"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import Divider from "@modules/common/components/divider"
import MedusaRadio from "@modules/common/components/radio"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
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

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  // Initial component debug log
  console.log("🚀 [SHIPPING DEBUG] Component initialized", {
    cartId: cart.id,
    cartShippingMethods: cart.shipping_methods?.map(sm => ({
      id: sm.shipping_option_id,
      name: sm.name,
      amount: sm.amount
    })),
    initialShippingMethodId: cart.shipping_methods?.at(-1)?.shipping_option_id,
    availableShippingMethodsCount: availableShippingMethods?.length,
    timestamp: new Date().toISOString()
  })

  // Debug cart changes
  useEffect(() => {
    console.log("🚀 [SHIPPING DEBUG] Cart data changed", {
      cartId: cart.id,
      cartShippingMethods: cart.shipping_methods?.map(sm => ({
        id: sm.shipping_option_id,
        name: sm.name,
        amount: sm.amount
      })),
      currentShippingMethodId: shippingMethodId,
      timestamp: new Date().toISOString()
    })
  }, [cart.shipping_methods, cart.id])

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { logInfo: logToAPI, logError: logErrorToAPI } = useServerLogger()

  const isOpen = searchParams.get("step") === "delivery"

  // Check if cart contains WNSTART SKU
  const hasWNSTARTSku = cart.items?.some(item => item.variant_sku === "WNSTART")

  console.log("🚀 [SHIPPING DEBUG] Cart analysis", {
    cartId: cart.id,
    hasWNSTARTSku,
    cartItems: cart.items?.map(item => ({
      id: item.id,
      variant_sku: item.variant_sku,
      title: item.title
    })),
    availableShippingMethodsCount: availableShippingMethods?.length,
    availableShippingMethods: availableShippingMethods?.map(sm => ({
      id: sm.id,
      name: sm.name,
      price_type: sm.price_type,
      amount: sm.amount,
      fulfillment_type: (sm as any).service_zone?.fulfillment_set?.type
    })),
    timestamp: new Date().toISOString()
  })

  // Filter shipping methods based on WNSTART SKU presence
  // When WNSTART is present: show all options (including enrollment ones)
  // When WNSTART is NOT present: hide enrollment options
  const filteredShippingMethods = hasWNSTARTSku 
    ? availableShippingMethods
    : availableShippingMethods?.filter(sm => 
        sm.name !== "Free Shipping on Enrollment" && 
        sm.name !== "Envio Gratuito en Inscrición"
      )

  console.log("🚀 [SHIPPING DEBUG] Filtered shipping methods", {
    filteredCount: filteredShippingMethods?.length,
    filteredMethods: filteredShippingMethods?.map(sm => ({
      id: sm.id,
      name: sm.name,
      price_type: sm.price_type,
      amount: sm.amount,
      fulfillment_type: (sm as any).service_zone?.fulfillment_set?.type
    })),
    timestamp: new Date().toISOString()
  })

  const _shippingMethods = filteredShippingMethods?.filter(
    (sm) => (sm as any).service_zone?.fulfillment_set?.type !== "pickup"
  )

  const _pickupMethods = filteredShippingMethods?.filter(
    (sm) => (sm as any).service_zone?.fulfillment_set?.type === "pickup"
  )

  console.log("🚀 [SHIPPING DEBUG] Method categorization", {
    shippingMethodsCount: _shippingMethods?.length,
    shippingMethods: _shippingMethods?.map(sm => ({
      id: sm.id,
      name: sm.name,
      price_type: sm.price_type,
      amount: sm.amount
    })),
    pickupMethodsCount: _pickupMethods?.length,
    pickupMethods: _pickupMethods?.map(sm => ({
      id: sm.id,
      name: sm.name,
      price_type: sm.price_type,
      amount: sm.amount,
      location: (sm as any).service_zone?.fulfillment_set?.location?.address
    })),
    timestamp: new Date().toISOString()
  })

  const hasPickupOptions = !!_pickupMethods?.length

  useEffect(() => {
    console.log("🚀 [SHIPPING DEBUG] useEffect triggered", {
      availableShippingMethodsCount: availableShippingMethods?.length,
      shippingMethodsCount: _shippingMethods?.length,
      pickupMethodsCount: _pickupMethods?.length,
      currentShippingMethodId: shippingMethodId,
      cartShippingMethods: cart.shipping_methods?.map(sm => ({
        id: sm.shipping_option_id,
        name: sm.name,
        amount: sm.amount
      })),
      timestamp: new Date().toISOString()
    })

    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const calculatedMethods = _shippingMethods.filter((sm) => sm.price_type === "calculated")
      console.log("🚀 [SHIPPING DEBUG] Calculating prices for methods", {
        calculatedMethodsCount: calculatedMethods.length,
        calculatedMethods: calculatedMethods.map(sm => ({
          id: sm.id,
          name: sm.name,
          price_type: sm.price_type
        })),
        cartId: cart.id,
        timestamp: new Date().toISOString()
      })

      const promises = calculatedMethods.map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          console.log("🚀 [SHIPPING DEBUG] Price calculation results", {
            results: res.map((r, index) => ({
              index,
              status: r.status,
              value: r.status === "fulfilled" ? r.value : null,
              reason: r.status === "rejected" ? r.reason : null
            })),
            timestamp: new Date().toISOString()
          })

          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

          console.log("🚀 [SHIPPING DEBUG] Final calculated prices map", {
            pricesMap,
            timestamp: new Date().toISOString()
          })

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        }).catch((error) => {
          console.error("🚀 [SHIPPING DEBUG] Price calculation error", {
            error,
            timestamp: new Date().toISOString()
          })
          setIsLoadingPrices(false)
        })
      } else {
        setIsLoadingPrices(false)
      }
    } else {
      setIsLoadingPrices(false)
    }

    const matchingPickupMethod = _pickupMethods?.find((m) => m.id === shippingMethodId)
    if (matchingPickupMethod) {
      console.log("🚀 [SHIPPING DEBUG] Found matching pickup method, setting pickup options ON", {
        matchingMethod: {
          id: matchingPickupMethod.id,
          name: matchingPickupMethod.name
        },
        timestamp: new Date().toISOString()
      })
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    console.log("🚀 [SHIPPING DEBUG] handleSubmit called", {
      currentShippingMethodId: shippingMethodId,
      cartShippingMethods: cart.shipping_methods?.map(sm => ({
        id: sm.shipping_option_id,
        name: sm.name,
        amount: sm.amount
      })),
      hasShippingMethod: !!(cart.shipping_methods?.[0]),
      timestamp: new Date().toISOString()
    })
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    console.log("🚀 [SHIPPING DEBUG] Starting handleSetShippingMethod", {
      id,
      variant,
      cartId: cart.id,
      currentShippingMethodId: shippingMethodId,
      timestamp: new Date().toISOString()
    })

    // Log to server for Vercel console
    await logInfo("Shipping method selection started", {
      id,
      variant,
      cartId: cart.id,
      currentShippingMethodId: shippingMethodId
    })

    setError(null)

    // Update pickup options state based on variant
    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
      console.log("🚀 [SHIPPING DEBUG] Set pickup options ON")
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
      console.log("🚀 [SHIPPING DEBUG] Set pickup options OFF")
    }

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      console.log("🚀 [SHIPPING DEBUG] Updating shipping method ID", {
        previous: prev,
        new: id
      })
      return id
    })

    try {
      console.log("🚀 [SHIPPING DEBUG] Calling setShippingMethod API", {
        cartId: cart.id,
        shippingMethodId: id
      })
      
      const result = await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      
      console.log("🚀 [SHIPPING DEBUG] setShippingMethod API success", {
        result,
        timestamp: new Date().toISOString()
      })

      // Log success to server
      await logInfo("Shipping method selection successful", {
        cartId: cart.id,
        shippingMethodId: id,
        variant,
        result: {
          cartId: result.cart?.id,
          shippingMethodsCount: result.cart?.shipping_methods?.length || 0
        }
      })

      // Don't reset the shippingMethodId here - let the useEffect handle it
      // The cart will be updated and the useEffect will sync the state
    } catch (err: any) {
      console.error("🚀 [SHIPPING DEBUG] setShippingMethod API error", {
        error: err,
        message: err.message,
        stack: err.stack,
        cartId: cart.id,
        shippingMethodId: id,
        timestamp: new Date().toISOString()
      })
      
      // Log error to server
      await logError("Shipping method selection failed", {
        cartId: cart.id,
        shippingMethodId: id,
        variant,
        error: {
          message: err.message,
          stack: err.stack
        }
      })
      
      // Only reset on error
      setShippingMethodId(currentId)
      setError(err.message)
    } finally {
      setIsLoading(false)
      console.log("🚀 [SHIPPING DEBUG] handleSetShippingMethod completed", {
        finalShippingMethodId: shippingMethodId,
        timestamp: new Date().toISOString()
      })
    }
  }

  useEffect(() => {
    console.log("🚀 [SHIPPING DEBUG] isOpen changed", {
      isOpen,
      step: searchParams.get("step"),
      timestamp: new Date().toISOString()
    })
    setError(null)
  }, [isOpen])

  // Sync shippingMethodId with cart's shipping methods
  useEffect(() => {
    const cartShippingMethodId = cart.shipping_methods?.at(-1)?.shipping_option_id
    console.log("🚀 [SHIPPING DEBUG] Syncing shipping method ID with cart", {
      cartShippingMethodId,
      currentShippingMethodId: shippingMethodId,
      cartShippingMethods: cart.shipping_methods?.map(sm => ({
        id: sm.shipping_option_id,
        name: sm.name,
        amount: sm.amount
      })),
      timestamp: new Date().toISOString()
    })

    if (cartShippingMethodId && cartShippingMethodId !== shippingMethodId) {
      console.log("🚀 [SHIPPING DEBUG] Updating shipping method ID to match cart", {
        from: shippingMethodId,
        to: cartShippingMethodId,
        timestamp: new Date().toISOString()
      })
      setShippingMethodId(cartShippingMethodId)
    }
  }, [cart.shipping_methods, shippingMethodId])

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
                    <span className="text-sm text-ui-fg-muted">Actualizando método de envío...</span>
                  </div>
                </div>
              )}
              <div className="pb-8 md:pt-0 pt-2">
                <RadioGroup
                  value={shippingMethodId}
                  disabled={isLoading}
                  onChange={(v) => {
                    if (isLoading) return // Prevent changes while loading
                    
                    console.log("🚀 [SHIPPING DEBUG] Shipping method radio changed", {
                      selectedValue: v,
                      availableShippingMethods: _shippingMethods?.map(m => ({
                        id: m.id,
                        name: m.name,
                        price_type: m.price_type,
                        amount: m.amount
                      })),
                      availablePickupMethods: _pickupMethods?.map(m => ({
                        id: m.id,
                        name: m.name,
                        insufficient_inventory: (m as any).insufficient_inventory
                      })),
                      timestamp: new Date().toISOString()
                    })
                    
                    if (v) {
                      // Check if it's a pickup method
                      const isPickupMethod = _pickupMethods?.some(m => m.id === v)
                      console.log("🚀 [SHIPPING DEBUG] Radio selection logic", {
                        selectedValue: v,
                        isPickupMethod,
                        pickupMethodIds: _pickupMethods?.map(m => m.id),
                        shippingMethodIds: _shippingMethods?.map(m => m.id),
                        timestamp: new Date().toISOString()
                      })
                      
                      // Log to API for Vercel console
                      logToAPI("User selected shipping method", {
                        selectedValue: v,
                        isPickupMethod,
                        cartId: cart.id,
                        currentShippingMethodId: shippingMethodId
                      })
                      
                      handleSetShippingMethod(v, isPickupMethod ? "pickup" : "shipping")
                    }
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
                            _pickupMethods?.some(m => m.id === shippingMethodId),
                          "cursor-pointer hover:shadow-borders-interactive-with-active": !isLoading,
                          "cursor-not-allowed opacity-50": isLoading,
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <MedusaRadio
                          checked={_pickupMethods?.some(m => m.id === shippingMethodId)}
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
                    const isDisabled =
                      option.price_type === "calculated" &&
                      !isLoadingPrices &&
                      typeof calculatedPricesMap[option.id] !== "number"

                    return (
                      <Radio
                        key={option.id}
                        value={option.id}
                        data-testid="delivery-option-radio"
                        disabled={isDisabled || isLoading}
                        className={clx(
                          "flex items-center justify-between text-small-regular py-4 border rounded-rounded px-8 mb-2",
                          {
                            "border-ui-border-interactive":
                              option.id === shippingMethodId,
                            "cursor-pointer hover:shadow-borders-interactive-with-active": !isDisabled && !isLoading,
                            "hover:shadow-brders-none cursor-not-allowed opacity-50":
                              isDisabled || isLoading,
                          }
                        )}
                      >
                        <div className="flex items-center gap-x-4">
                          <MedusaRadio
                            checked={option.id === shippingMethodId}
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
                          ) : calculatedPricesMap[option.id] ? (
                            convertToLocale({
                              amount: calculatedPricesMap[option.id],
                              currency_code: cart?.currency_code,
                            })
                          ) : isLoadingPrices ? (
                            <Loader />
                          ) : (
                            "-"
                          )}
                        </span>
                      </Radio>
                    )
                  })}
                </RadioGroup>
              </div>
            </div>
          </div>

          {_pickupMethods?.some(m => m.id === shippingMethodId) && (
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
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-3">
                      <Loader className="animate-spin h-6 w-6 text-ui-fg-interactive" />
                      <span className="text-sm text-ui-fg-muted">Actualizando sucursal...</span>
                    </div>
                  </div>
                )}
                <div className="pb-8 md:pt-0 pt-2">
                  <RadioGroup
                    value={shippingMethodId}
                    disabled={isLoading}
                    onChange={(v) => {
                      if (isLoading) return // Prevent changes while loading
                      
                      console.log("🚀 [SHIPPING DEBUG] Pickup location radio changed", {
                        selectedValue: v,
                        availablePickupMethods: _pickupMethods?.map(m => ({
                          id: m.id,
                          name: m.name,
                          price_type: m.price_type,
                          amount: m.amount,
                          location: (m as any).service_zone?.fulfillment_set?.location?.address
                        })),
                        timestamp: new Date().toISOString()
                      })
                      v && handleSetShippingMethod(v, "pickup")
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
                                option.id === shippingMethodId,
                              "cursor-pointer hover:shadow-borders-interactive-with-active": !(option as any).insufficient_inventory && !isLoading,
                              "hover:shadow-brders-none cursor-not-allowed opacity-50":
                                (option as any).insufficient_inventory || isLoading,
                            }
                          )}
                        >
                          <div className="flex items-start gap-x-4">
                            <MedusaRadio
                              checked={option.id === shippingMethodId}
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
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!cart.shipping_methods?.[0]}
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

export default Shipping
