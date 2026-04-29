"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag, revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
  setQualifiedInfo,
  removeQualifiedInfo,
} from "./cookies"
import { revalidateProductsCache } from "@lib/util/revalidate-cache"

export async function fetchAndStoreQualifiedInfo(token?: string) {
  const authHeaders = token ? { authorization: `Bearer ${token}` } : await getAuthHeaders()

  if (!authHeaders || !("authorization" in authHeaders)) {
    return null
  }

  try {
    const data = await sdk.client.fetch<any>('/store/customers/me/last-qualified-info', {
      method: "GET",
      headers: authHeaders as Record<string, string>
    });
    console.log('Qualified info:', data);
    if (data && Array.isArray(data) && data.length > 0) {
      await setQualifiedInfo(JSON.stringify(data[0]));
    }
  } catch (err) {
    console.error("Failed to fetch qualified info:", err);
  }
}

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    // getAuthHeaders returns {} when there is no token — {} is truthy, so
    // we must check for the actual authorization key, not just truthiness.
    if (!authHeaders || !("authorization" in authHeaders)) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        // no-store ensures the session check is always fresh — tag-based
        // revalidation (revalidateTag) handles post-login/logout invalidation.
        cache: "no-store",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string

  // Get MLM-specific form data
  const sponsorProfileId = formData.get("sponsor_profile_id") as string
  const profileTypesId = formData.get("profile_types_id") as string
  const gender = formData.get("gender") as string
  const personalId = formData.get("personal_id") as string
  const birthDate = formData.get("birth_date") as string
  const preferredSide = formData.get("preferred_side") as string

  // Validate sponsor profile ID
  if (!sponsorProfileId || sponsorProfileId.trim() === "") {
    return "Sponsor Profile ID is required"
  }

  // Validate sponsor profile ID format (must be a number)
  if (!/^\d+$/.test(sponsorProfileId.trim())) {
    return "Invalid Sponsor Profile ID format"
  }

  // Convert to number and validate it's positive
  const sponsorIdNumber = parseInt(sponsorProfileId.trim())
  if (isNaN(sponsorIdNumber) || sponsorIdNumber <= 0) {
    return "Sponsor Profile ID must be a valid positive number"
  }

  // Get address fields
  const street = formData.get("street") as string
  const district = formData.get("district") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const postalCode = formData.get("postal_code") as string

  // Get tax information (assuming it's a JSON string or structured data)
  const taxId = formData.get("tax_id") as string



  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
    metadata: {
      // Add MLM-specific metadata
      mlm_enabled: true,
      mlm_data: {
        sponsor_profile_id: sponsorIdNumber, // Use validated sponsor ID
        profile_types_id: profileTypesId ? parseInt(profileTypesId) : 1,
        gender: gender || undefined,
        personal_id: personalId || undefined,
        tax_id: taxId ? { tax_id: taxId } : undefined,
        address: {
          street: street || undefined,
          district: district || undefined,
          city: city || undefined,
          state: state || undefined,
          postal_code: postalCode || undefined,
        },
        birth_date: birthDate || undefined,
        preferred_side: preferredSide ? parseInt(preferredSide) : undefined,
      }
    },
  }
  console.log('Full customerForm:', JSON.stringify(customerForm, null, 2))

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    // Revalidate products cache to ensure user gets correct pricing based on their customer group
    const cacheId = await getCacheTag("products")
    await revalidateProductsCache(cacheId)

    await fetchAndStoreQualifiedInfo(loginToken as string)

    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)

        // Revalidate products cache to ensure user gets correct pricing based on their customer group
        const cacheId = await getCacheTag("products")
        await revalidateProductsCache(cacheId)

        await fetchAndStoreQualifiedInfo(token as string)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()
  await removeQualifiedInfo()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  // Purge the server-side Full Route Cache and the client Router Cache for
  // the entire tree so no stale office/account RSC payloads survive logout.
  revalidatePath("/", "layout")

  redirect(`/${countryCode}/account`)
}

export async function requestPasswordReset(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return "El email es requerido"
  }

  try {
    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: email,
    })
    return null // Success
  } catch (error: any) {
    return error.toString()
  }
}

export async function resetPassword(_currentState: unknown, formData: FormData) {
  const token = formData.get("token") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!token) {
    return "Token de restablecimiento no válido"
  }

  if (!email) {
    return "Email no válido"
  }

  if (!password) {
    return "La contraseña es requerida"
  }

  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres"
  }

  try {
    await sdk.auth.updateProvider("customer", "emailpass", {
      email,
      password,
    }, token)
    return null // Success
  } catch (error: any) {
    return error.toString()
  }
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
