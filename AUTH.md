# Authentication & Session Management

This document provides a comprehensive overview of the authentication system implemented in the Medusa.js v2 Next.js starter template.

## Table of Contents

- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [Session Management](#session-management)
- [Cookie Management](#cookie-management)
- [Authentication Utilities](#authentication-utilities)
- [Security Considerations](#security-considerations)
- [Error Handling](#error-handling)
- [Cart Transfer Process](#cart-transfer-process)
- [API Integration](#api-integration)

## Overview

The authentication system is built on top of Medusa.js v2's authentication module and uses JWT (JSON Web Tokens) for session management. The system supports both guest and authenticated user experiences with seamless cart transfer capabilities.

### Key Components

- **JWT-based Authentication**: Secure token-based authentication
- **Server-side Session Management**: All authentication logic runs on the server
- **Cookie-based Storage**: Secure HTTP-only cookies for token storage
- **Cart Transfer**: Automatic cart transfer between guest and authenticated sessions
- **Cache Management**: Intelligent cache invalidation for authenticated data

## Authentication Flow

### 1. User Registration Flow

```typescript
// Registration process in src/lib/data/customer.ts
export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    // 1. Register user with Medusa auth
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    // 2. Store authentication token
    await setAuthToken(token as string)

    // 3. Create customer profile
    const headers = { ...(await getAuthHeaders()) }
    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    // 4. Login to get fresh token
    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    // 5. Update token and invalidate cache
    await setAuthToken(loginToken as string)
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    // 6. Transfer guest cart to authenticated session
    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}
```

### 2. User Login Flow

```typescript
// Login process in src/lib/data/customer.ts
export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    // 1. Authenticate with Medusa
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        // 2. Store authentication token
        await setAuthToken(token as string)
        // 3. Invalidate customer cache
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    // 4. Transfer guest cart to authenticated session
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}
```

### 3. User Logout Flow

```typescript
// Logout process in src/lib/data/customer.ts
export async function signout(countryCode: string) {
  // 1. Logout from Medusa
  await sdk.auth.logout()

  // 2. Remove authentication token
  await removeAuthToken()

  // 3. Invalidate customer cache
  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  // 4. Remove cart ID
  await removeCartId()

  // 5. Invalidate cart cache
  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  // 6. Redirect to account page
  redirect(`/${countryCode}/account`)
}
```

## Session Management

### JWT Token Storage

Authentication tokens are stored in secure HTTP-only cookies:

```typescript
// Token storage in src/lib/data/cookies.ts
export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,           // Prevents XSS attacks
    sameSite: "strict",       // CSRF protection
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
  })
}
```

### Authentication Headers

All authenticated API requests include the JWT token:

```typescript
// Header generation in src/lib/data/cookies.ts
export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}
```

### Customer Retrieval

Authenticated customer data is fetched with proper caching:

```typescript
// Customer retrieval in src/lib/data/customer.ts
export const retrieveCustomer = async (): Promise<HttpTypes.StoreCustomer | null> => {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders) return null

  const headers = { ...authHeaders }
  const next = { ...(await getCacheOptions("customers")) }

  return await sdk.client
    .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
      method: "GET",
      query: { fields: "*orders" },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ customer }) => customer)
    .catch(() => null)
}
```

## Cookie Management

### Cache ID System

The application uses a cache ID system to ensure proper cache invalidation:

```typescript
// Cache ID management in src/lib/data/cookies.ts
export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}
```

### Cart ID Management

Cart IDs are stored separately from authentication tokens:

```typescript
// Cart ID management in src/lib/data/cookies.ts
export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}
```

## Authentication Utilities

### SDK Configuration

The Medusa SDK is configured with authentication support:

```typescript
// SDK configuration in src/lib/config.ts
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
```

### Error Handling

Comprehensive error handling for authentication failures:

```typescript
// Error handling in src/lib/util/medusa-error.ts
export default function medusaError(error: any): never {
  if (error.response) {
    const u = new URL(error.config.url, error.config.baseURL)
    console.error("Resource:", u.toString())
    console.error("Response data:", error.response.data)
    console.error("Status code:", error.response.status)
    console.error("Headers:", error.response.headers)

    const message = error.response.data.message || error.response.data
    throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
  } else if (error.request) {
    throw new Error("No response received: " + error.request)
  } else {
    throw new Error("Error setting up the request: " + error.message)
  }
}
```

## Security Considerations

### Cookie Security

- **HttpOnly**: Prevents XSS attacks by blocking JavaScript access
- **SameSite**: Prevents CSRF attacks
- **Secure**: Ensures cookies are only sent over HTTPS in production
- **MaxAge**: Automatic token expiration (7 days)

### Token Management

- JWT tokens are automatically managed by Medusa.js
- Tokens are refreshed on login
- Proper token cleanup on logout
- Server-side token validation

### Cache Security

- Cache tags are tied to user sessions
- Proper cache invalidation on authentication state changes
- No sensitive data cached in client-side storage

## Error Handling

### Authentication Errors

```typescript
// Error handling in login/register components
const [message, formAction] = useActionState(login, null)

// Display errors to users
<ErrorMessage error={message} data-testid="login-error-message" />
```

### Network Errors

- Graceful fallbacks for network failures
- User-friendly error messages
- Automatic retry mechanisms for cart operations

## Cart Transfer Process

### Automatic Cart Transfer

When a user logs in, their guest cart is automatically transferred to their authenticated session:

```typescript
// Cart transfer in src/lib/data/customer.ts
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
```

### Cart Mismatch Detection

The system detects when cart transfer fails and provides recovery options:

```typescript
// Cart mismatch banner in src/modules/layout/components/cart-mismatch-banner/index.tsx
function CartMismatchBanner(props: { customer: StoreCustomer; cart: StoreCart }) {
  const { customer, cart } = props

  if (!customer || !!cart.customer_id) {
    return
  }

  const handleSubmit = async () => {
    try {
      setIsPending(true)
      setActionText("Transferring..")
      await transferCart()
    } catch {
      setActionText("Run transfer again")
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-orange-300 text-orange-800">
      <span>Something went wrong when we tried to transfer your cart</span>
      <Button onClick={handleSubmit} disabled={isPending}>
        {actionText}
      </Button>
    </div>
  )
}
```

## API Integration

### Authenticated Requests

All API requests that require authentication use the `getAuthHeaders()` utility:

```typescript
// Example: Retrieving customer orders
export const retrieveOrder = async (id: string) => {
  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("orders")) }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
}
```

### Guest vs Authenticated Access

The system seamlessly handles both guest and authenticated users:

```typescript
// Cart retrieval with optional authentication
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("carts")) }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}
```

## Environment Variables

Required environment variables for authentication:

```bash
# Medusa Backend URL
MEDUSA_BACKEND_URL=http://localhost:9000

# Publishable API Key
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key_here

# Base URL for the application
NEXT_PUBLIC_BASE_URL=https://localhost:8000
```

## Best Practices

1. **Always use server actions** for authentication operations
2. **Implement proper error handling** for all auth flows
3. **Use cache tags** for proper cache invalidation
4. **Validate user input** before authentication
5. **Handle edge cases** like network failures gracefully
6. **Provide clear feedback** to users during authentication processes
7. **Implement proper logout** with cache cleanup
8. **Use secure cookie settings** in production

## Troubleshooting

### Common Issues

1. **Token Expiration**: Tokens automatically expire after 7 days
2. **Cart Transfer Failures**: Use the cart mismatch banner to retry
3. **Cache Issues**: Clear browser cookies to reset cache state
4. **Network Errors**: Check backend connectivity and API keys

### Debug Mode

Enable debug mode in development:

```typescript
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development", // Enable debug logging
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
```

This authentication system provides a robust, secure, and user-friendly experience for both guest and authenticated users in the Medusa.js v2 e-commerce application. 