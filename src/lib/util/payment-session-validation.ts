import { HttpTypes } from "@medusajs/types"
import { retrieveCartFresh } from "@lib/data/cart"

export interface PaymentSessionValidationResult {
  isValid: boolean
  error?: string
  shouldRecreate?: boolean
}

export interface PaymentSessionState {
  cartId: string | null
  paymentSessionId: string | null
  cartTotal: number | null
  cartCurrency: string | null
  cartRegion: string | null
}

/**
 * Valida si una payment session es válida para el cart actual
 */
export function validatePaymentSession(
  cart: HttpTypes.StoreCart,
  activeSession: any,
  paymentSessionState: PaymentSessionState
): PaymentSessionValidationResult {
  // Verificar que existe una sesión activa
  if (!activeSession) {
    return {
      isValid: false,
      error: "No hay sesión de pago activa",
      shouldRecreate: true
    }
  }

  // Verificar que el cart_id coincida
  if (paymentSessionState.cartId && paymentSessionState.cartId !== cart.id) {
    return {
      isValid: false,
      error: "La sesión de pago no corresponde a este carrito",
      shouldRecreate: true
    }
  }

  // Verificar que el total coincida
  if (paymentSessionState.cartTotal && paymentSessionState.cartTotal !== cart.total) {
    return {
      isValid: false,
      error: "El total del carrito ha cambiado",
      shouldRecreate: true
    }
  }

  // Verificar que la currency coincida
  if (paymentSessionState.cartCurrency && paymentSessionState.cartCurrency !== cart.currency_code) {
    return {
      isValid: false,
      error: "La moneda del carrito ha cambiado",
      shouldRecreate: true
    }
  }

  // Verificar que la región coincida
  if (paymentSessionState.cartRegion && paymentSessionState.cartRegion !== cart.region_id) {
    return {
      isValid: false,
      error: "La región del carrito ha cambiado",
      shouldRecreate: true
    }
  }

  // Verificar que el payment intent no esté ya completado
  if (activeSession.data?.payment_intent?.status === "succeeded") {
    return {
      isValid: false,
      error: "Este pago ya fue procesado",
      shouldRecreate: true
    }
  }

  if (activeSession.data?.payment_intent?.status === "refunded") {
    return {
      isValid: false,
      error: "Este pago fue reembolsado",
      shouldRecreate: true
    }
  }

  return {
    isValid: true
  }
}

/**
 * Genera una idempotency key única para un intento de pago
 */
export function generateIdempotencyKey(cartId: string): string {
  return `payment_${cartId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Verifica si el carrito ha cambiado de manera que requiere invalidar la payment session
 */
export function hasCartChanged(
  cart: HttpTypes.StoreCart,
  paymentSessionState: PaymentSessionState
): boolean {
  if (!paymentSessionState.cartId || paymentSessionState.cartId !== cart.id) {
    return true
  }

  return (
    paymentSessionState.cartTotal !== cart.total ||
    paymentSessionState.cartCurrency !== cart.currency_code ||
    paymentSessionState.cartRegion !== cart.region_id
  )
}

/**
 * Crea un estado inicial de payment session
 */
export function createInitialPaymentSessionState(): PaymentSessionState {
  return {
    cartId: null,
    paymentSessionId: null,
    cartTotal: null,
    cartCurrency: null,
    cartRegion: null,
  }
}

/**
 * Actualiza el estado de payment session con los datos del cart y session actuales
 */
export function updatePaymentSessionState(
  cart: HttpTypes.StoreCart,
  activeSession: any
): PaymentSessionState {
  return {
    cartId: cart.id,
    paymentSessionId: activeSession?.id || null,
    cartTotal: cart.total,
    cartCurrency: cart.currency_code,
    cartRegion: cart.region_id || null,
  }
}

/**
 * Valida una payment session contra datos frescos del servidor
 * Esta función obtiene datos actualizados del carrito para validación crítica
 */
export async function validatePaymentSessionWithFreshData(
  cartId: string,
  paymentSessionId: string
): Promise<PaymentSessionValidationResult> {
  try {
    // Obtener datos frescos del carrito desde el servidor
    const freshCart = await retrieveCartFresh(cartId)
    
    if (!freshCart) {
      return {
        isValid: false,
        error: "Carrito no encontrado",
        shouldRecreate: true
      }
    }

    // Buscar la payment session en los datos frescos
    const activeSession = freshCart.payment_collection?.payment_sessions?.find(
      (s: any) => s.id === paymentSessionId && s.status === "pending"
    )

    if (!activeSession) {
      return {
        isValid: false,
        error: "Sesión de pago no encontrada o no está pendiente",
        shouldRecreate: true
      }
    }

    // Verificar que el payment intent no esté ya completado
    const paymentIntent = activeSession.data?.payment_intent as any
    if (paymentIntent?.status === "succeeded") {
      return {
        isValid: false,
        error: "Este pago ya fue procesado",
        shouldRecreate: true
      }
    }

    if (paymentIntent?.status === "refunded") {
      return {
        isValid: false,
        error: "Este pago fue reembolsado",
        shouldRecreate: true
      }
    }

    return {
      isValid: true
    }
  } catch (error: any) {
    return {
      isValid: false,
      error: `Error al validar sesión: ${error.message}`,
      shouldRecreate: true
    }
  }
}
