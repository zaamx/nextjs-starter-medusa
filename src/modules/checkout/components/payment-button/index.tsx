"use client"

import { isManual, isStripe } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState, useRef, useCallback } from "react"
import ErrorMessage from "../error-message"
import { validatePaymentSession, generateIdempotencyKey } from "@lib/util/payment-session-validation"
import * as Sentry from "@sentry/nextjs"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton
          cart={cart}
          notReady={notReady}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled>Selecciona un método de pago</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isSubmittingRef = useRef(false)

  // Función para validar la payment session antes del pago
  const validateCurrentPaymentSession = useCallback(() => {
    const session = cart.payment_collection?.payment_sessions?.find(
      (s) => s.status === "pending"
    )
    
    // Crear un estado temporal para la validación
    const tempPaymentSessionState = {
      cartId: cart.id,
      paymentSessionId: session?.id || null,
      cartTotal: cart.total,
      cartCurrency: cart.currency_code,
      cartRegion: cart.region_id || null,
    }
    
    const validation = validatePaymentSession(cart, session, tempPaymentSessionState)
    
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Error en la validación de la sesión de pago")
      return false
    }
    
    return true
  }, [cart])

  const onPaymentCompleted = async () => {
    if (!cart?.id) {
      Sentry.captureMessage("Stripe payment completed without cart context", {
        level: "warning",
        tags: { feature: "checkout", provider: "stripe" },
      })
      setErrorMessage("No se encontró un carrito activo para completar el pedido")
      setSubmitting(false)
      isSubmittingRef.current = false
      return
    }

    await placeOrder(cart.id)
      .catch((err) => {
        Sentry.captureException(err, {
          tags: { feature: "checkout", provider: "stripe", action: "placeOrder" },
          extra: { cartId: cart.id },
        })
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
        isSubmittingRef.current = false
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements || !validateCurrentPaymentSession() ? true : false

  const handlePayment = async () => {
    // Prevenir múltiples submits simultáneos
    if (isSubmittingRef.current) {
      return
    }
    
    isSubmittingRef.current = true
    setSubmitting(true)
    setErrorMessage(null)

    // Validar la payment session antes de proceder
    if (!validateCurrentPaymentSession()) {
      setSubmitting(false)
      isSubmittingRef.current = false
      return
    }

    if (!stripe || !elements || !card || !cart || !session) {
      setSubmitting(false)
      isSubmittingRef.current = false
      setErrorMessage("Error: faltan elementos necesarios para el pago")
      return
    }

    // Generar idempotency key único para este intento
    const idempotencyKey = generateIdempotencyKey(cart.id)

    try {
      const result = await stripe.confirmCardPayment(session.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })

      const { error, paymentIntent } = result

      if (error) {
        const pi = error.payment_intent

        if (
          (pi && pi.status === "requires_capture") ||
          (pi && pi.status === "succeeded")
        ) {
          onPaymentCompleted()
        } else {
          setErrorMessage(error.message || "Error en el procesamiento del pago")
        }
        return
      }

      if (
        (paymentIntent && paymentIntent.status === "requires_capture") ||
        paymentIntent.status === "succeeded"
      ) {
        return onPaymentCompleted()
      }

    } catch (err: any) {
      Sentry.captureException(err, {
        tags: { feature: "checkout", provider: "stripe", action: "confirmCardPayment" },
        extra: {
          cartId: cart.id,
          paymentSessionId: session?.id,
        },
      })
      setErrorMessage(err.message || "Error inesperado durante el pago")
    } finally {
      setSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Realizar Pedido
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isSubmittingRef = useRef(false)

  const onPaymentCompleted = async () => {
    if (!cart?.id) {
      Sentry.captureMessage("Manual payment completed without cart context", {
        level: "warning",
        tags: { feature: "checkout", provider: "manual" },
      })
      setErrorMessage("No se encontró un carrito activo para completar el pedido")
      setSubmitting(false)
      isSubmittingRef.current = false
      return
    }

    await placeOrder(cart.id)
      .catch((err) => {
        Sentry.captureException(err, {
          tags: { feature: "checkout", provider: "manual", action: "placeOrder" },
          extra: { cartId: cart.id },
        })
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
        isSubmittingRef.current = false
      })
  }

  const handlePayment = () => {
    // Prevenir múltiples submits simultáneos
    if (isSubmittingRef.current) {
      return
    }
    
    isSubmittingRef.current = true
    setSubmitting(true)
    setErrorMessage(null)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady || isSubmittingRef.current}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid={dataTestId || "submit-order-button"}
      >
        Realizar pedido
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
