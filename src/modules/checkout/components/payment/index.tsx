"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripeCardContainer,
} from "@modules/checkout/components/payment-container"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useRef } from "react"
import {
  validatePaymentSession,
  hasCartChanged,
  createInitialPaymentSessionState,
  updatePaymentSessionState,
  PaymentSessionState
} from "@lib/util/payment-session-validation"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )
  
  // Estado para rastrear la vinculación cart_id ↔ payment_session_id
  const [paymentSessionState, setPaymentSessionState] = useState<PaymentSessionState>(
    createInitialPaymentSessionState()
  )
  
  // Ref para prevenir múltiples submits simultáneos
  const isSubmittingRef = useRef(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const isStripe = isStripeFunc(selectedPaymentMethod)

  // Función para validar si la payment session es válida para el cart actual
  const isPaymentSessionValid = useCallback(() => {
    if (!activeSession || !cart) return false
    
    const validation = validatePaymentSession(cart, activeSession, paymentSessionState)
    return validation.isValid
  }, [activeSession, cart, paymentSessionState])

  // Función para invalidar y recrear payment session
  const invalidateAndRecreatePaymentSession = useCallback(async (method: string) => {
    try {
      setError(null)
      setPaymentSessionState(createInitialPaymentSessionState())
      
      // Crear nueva payment session
      await initiatePaymentSession(cart, {
        provider_id: method,
        data: {
          setup_future_usage: "off_session",
        },      
      })
      
      // Actualizar el estado con la nueva sesión
      setPaymentSessionState(updatePaymentSessionState(cart, activeSession))
    } catch (err: any) {
      setError(err.message || "Error al actualizar método de pago")
    }
  }, [cart, activeSession])

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    
    // Si la sesión actual no es válida o no existe, crear una nueva
    if (!isPaymentSessionValid() || !activeSession) {
      await invalidateAndRecreatePaymentSession(method)
    } else if (isStripeFunc(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
        data: {
          setup_future_usage: "off_session",
        },      
      })
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    // Prevenir múltiples submits simultáneos
    if (isSubmittingRef.current) {
      return
    }
    
    isSubmittingRef.current = true
    setIsLoading(true)
    
    try {
      // Validar que la payment session sea válida antes de continuar
      if (!isPaymentSessionValid()) {
        setError("La sesión de pago ha expirado. Actualizando método de pago...")
        await invalidateAndRecreatePaymentSession(selectedPaymentMethod)
        return
      }

      const shouldInputCard =
        isStripeFunc(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
          data: {
            setup_future_usage: "off_session",
          }
        })
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  // Inicializar y monitorear el estado de la payment session
  useEffect(() => {
    if (cart && activeSession) {
      // Si es la primera vez o el cart cambió, actualizar el estado
      if (!paymentSessionState.cartId || paymentSessionState.cartId !== cart.id) {
        setPaymentSessionState(updatePaymentSessionState(cart, activeSession))
      }
    }
  }, [cart, activeSession, paymentSessionState.cartId])

  // Monitorear cambios en el cart que requieren invalidar la payment session
  useEffect(() => {
    if (cart && paymentSessionState.cartId === cart.id) {
      if (hasCartChanged(cart, paymentSessionState) && activeSession) {
        // Invalidar la sesión actual y mostrar mensaje al usuario
        setError("Actualizamos tu método de pago por seguridad")
        setPaymentSessionState(createInitialPaymentSessionState())
      }
    }
  }, [cart, paymentSessionState, activeSession])

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
                !isOpen && !paymentReady,
            }
          )}
        >
          Pago
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Editar
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {availablePaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeFunc(paymentMethod.id) ? (
                      <StripeCardContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setCardBrand={setCardBrand}
                        setError={setError}
                        setCardComplete={setCardComplete}
                      />
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Método de pago
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Tarjeta de regalo
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripe && !cardComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard) ||
              !isPaymentSessionValid() ||
              isSubmittingRef.current
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeFunc(selectedPaymentMethod)
              ? "Ingresa los detalles de la tarjeta"
              : "Continuar a Confirmar"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Método de pago
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Detalles de pago
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    {isStripeFunc(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "Otro paso aparecerá"}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Método de pago
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Tarjeta de regalo
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
