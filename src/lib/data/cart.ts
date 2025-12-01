"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import * as Sentry from "@sentry/nextjs"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields:
          "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, *payment_collection, *payment_collection.payment_sessions",
      },
      headers,
      next,
      cache: "no-store", // Cambiado de "force-cache" a "no-store" para evitar datos obsoletos
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

/**
 * Retrieves a cart with fresh data, bypassing all cache layers
 * Use this for critical operations like payment session validation
 */
export async function retrieveCartFresh(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // Invalidar caché antes de obtener datos frescos
  const cartCacheTag = await getCacheTag("carts")
  if (cartCacheTag) {
    revalidateTag(cartCacheTag)
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields:
          "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, *payment_collection, *payment_collection.payment_sessions",
      },
      headers,
      cache: "no-store", // Sin caché para datos completamente frescos
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function addBundleToCart({
  items,
  countryCode,
}: {
  items: Array<{
    variant_id: string
    quantity: number
    metadata?: Record<string, any>
  }>
  countryCode: string
}) {
  if (!items || items.length === 0) {
    throw new Error("No items provided for bundle")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // Add items one by one as the API doesn't support batch operations
  for (const item of items) {
    const response = await sdk.client.fetch(
      `/store/carts/${cart.id}/bundle-line-items`,
      {
        method: "POST",
        body: {
          items: [
            {
              variant_id: item.variant_id,
              quantity: item.quantity,
              metadata: item.metadata
            }
          ]
        }
      }
    ).then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    }).catch(medusaError)
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.client.fetch(`/store/carts/${cartId}/line-items/${lineId}`, {
    method: "POST",
    body: { quantity },
    headers,
  })
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.client.fetch(`/store/carts/${cartId}/line-items/${lineId}`, {
    method: "DELETE",
    headers,
  })
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  console.log("🚀 [SERVER] setShippingMethod called", {
    cartId,
    shippingMethodId,
    timestamp: new Date().toISOString()
  })

  const headers = {
    ...(await getAuthHeaders()),
  }

  console.log("🚀 [SERVER] Headers prepared", {
    hasAuth: !!headers.authorization,
    timestamp: new Date().toISOString()
  })

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async (result) => {
      console.log("🚀 [SERVER] addShippingMethod success", {
        result: {
          id: result.cart?.id,
          shippingMethods: result.cart?.shipping_methods?.length || 0
        },
        timestamp: new Date().toISOString()
      })

      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      console.log("🚀 [SERVER] Cache revalidated", {
        cartCacheTag,
        timestamp: new Date().toISOString()
      })

      return result
    })
    .catch((error) => {
      Sentry.captureException(error, {
        tags: { feature: "checkout", action: "setShippingMethod" },
        extra: {
          cartId,
          shippingMethodId,
        },
      })
      console.error("🚀 [SERVER] addShippingMethod error", {
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        },
        cartId,
        shippingMethodId,
        timestamp: new Date().toISOString()
      })
      throw medusaError(error)
    })
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  // Invalidar caché antes de crear la payment session para asegurar datos frescos
  const cartCacheTag = await getCacheTag("carts")
  if (cartCacheTag) {
    revalidateTag(cartCacheTag)
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      // Invalidar caché después de crear la payment session
      if (cartCacheTag) {
        revalidateTag(cartCacheTag)
      }
      return resp
    })
    .catch((error) => {
      Sentry.captureException(error, {
        tags: { feature: "checkout", action: "initiatePaymentSession" },
        extra: {
          cartId: cart.id,
          providerId: data.provider_id,
        },
      })
      throw medusaError(error)
    })
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
// Helper function to build address from new fields or fallback to existing fields
const buildAddress = (formData: FormData, prefix: string) => {
  // Try to get new fields first
  const streetNumber = formData.get(`${prefix}.street_number`) as string
  const interiorNumber = formData.get(`${prefix}.interior_number`) as string
  const colonia = formData.get(`${prefix}.colonia`) as string
  const localidad = formData.get(`${prefix}.localidad`) as string
  const referencias = formData.get(`${prefix}.referencias`) as string

  // Build address_1: "Calle y número exterior, Colonia"
  let address_1 = ""
  if (streetNumber || colonia) {
    const parts = [streetNumber, colonia].filter(Boolean)
    address_1 = parts.join(", ")
  } else {
    // Fallback to existing address_1 if new fields are not available
    address_1 = (formData.get(`${prefix}.address_1`) as string) || ""
  }

  // Build address_2: "Número interior, Referencias"
  let address_2 = ""
  if (interiorNumber || referencias) {
    const parts = [interiorNumber, referencias].filter(Boolean)
    address_2 = parts.join(", ")
  } else {
    // Fallback to existing address_2 if new fields are not available
    address_2 = (formData.get(`${prefix}.address_2`) as string) || ""
  }

  // Use localidad for city, fallback to existing city field
  const city = localidad || (formData.get(`${prefix}.city`) as string) || ""

  // Build metadata with all new fields
  const metadata: Record<string, any> = {}
  if (streetNumber) metadata.street_number = streetNumber
  if (interiorNumber) metadata.interior_number = interiorNumber
  if (colonia) metadata.colonia = colonia
  if (localidad) metadata.localidad = localidad
  if (referencias) metadata.referencias = referencias

  return {
    first_name: formData.get(`${prefix}.first_name`),
    last_name: formData.get(`${prefix}.last_name`),
    address_1: address_1.trim(),
    address_2: address_2.trim(),
    company: formData.get(`${prefix}.company`),
    postal_code: formData.get(`${prefix}.postal_code`),
    city: city.trim(),
    country_code: formData.get(`${prefix}.country_code`),
    province: formData.get(`${prefix}.province`),
    phone: formData.get(`${prefix}.phone`),
    ...(Object.keys(metadata).length > 0 && { metadata }),
  }
}

export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const shippingAddress = buildAddress(formData, "shipping_address")

    const data = {
      shipping_address: shippingAddress,
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") {
      data.billing_address = shippingAddress
    } else {
      data.billing_address = buildAddress(formData, "billing_address")
    }

    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    Sentry.captureMessage("Checkout attempted to place order without cart id", {
      level: "warning",
      tags: { feature: "checkout", action: "placeOrder" },
    })
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cartRes
    })
    .catch((error) => {
      Sentry.captureException(error, {
        tags: { feature: "checkout", action: "completeCart" },
        extra: {
          cartId: id,
        },
      })
      throw medusaError(error)
    })

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "no-store", // Cambiado de "force-cache" a "no-store" para evitar datos obsoletos
  })
}
