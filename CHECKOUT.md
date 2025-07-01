# Checkout Process & Flow

This document provides a comprehensive overview of the checkout system implemented in the Medusa.js v2 Next.js starter template.

## Table of Contents

- [Overview](#overview)
- [Checkout Flow](#checkout-flow)
- [Checkout Components](#checkout-components)
- [Step-by-Step Process](#step-by-step-process)
- [Payment Integration](#payment-integration)
- [Shipping & Fulfillment](#shipping--fulfillment)
- [Address Management](#address-management)
- [Order Completion](#order-completion)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Best Practices](#best-practices)

## Overview

The checkout system is a multi-step process that guides users through address collection, shipping method selection, payment processing, and order confirmation. It's built with Next.js 15 server components and server actions for optimal performance and security.

### Key Features

- **Multi-step Checkout**: Address → Shipping → Payment → Review
- **Real-time Validation**: Form validation and error handling
- **Payment Integration**: Stripe and manual payment support
- **Shipping Options**: Calculated and fixed shipping methods
- **Guest & Authenticated**: Seamless experience for both user types
- **Responsive Design**: Mobile-first checkout experience
- **Order Summary**: Real-time cart totals and item preview

## Checkout Flow

### Main Checkout Page

```typescript
// src/app/[countryCode]/(checkout)/checkout/page.tsx
export default async function Checkout() {
  const cart = await retrieveCart()
  
  if (!cart) {
    return notFound()
  }
  
  const customer = await retrieveCustomer()
  
  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
```

### Checkout Form Structure

```typescript
// src/modules/checkout/templates/checkout-form/index.tsx
export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")
  
  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />
      <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      <Payment cart={cart} availablePaymentMethods={paymentMethods} />
      <Review cart={cart} />
    </div>
  )
}
```

## Checkout Components

### 1. Addresses Component

Handles shipping and billing address collection:

```typescript
// src/modules/checkout/components/addresses/index.tsx
const Addresses = ({ cart, customer }) => {
  const [sameAsBilling, toggleSameAsBilling] = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )
  
  const [message, formAction] = useActionState(setAddresses, null)
  
  return (
    <div className="bg-white">
      <form action={formAction}>
        <ShippingAddress customer={customer} checked={sameAsBilling} />
        {!sameAsBilling && <BillingAddress cart={cart} />}
        <SubmitButton>Continue to delivery</SubmitButton>
      </form>
    </div>
  )
}
```

**Features:**
- Separate shipping and billing address forms
- "Same as billing" toggle option
- Address validation and formatting
- Customer address pre-fill for authenticated users

### 2. Shipping Component

Manages shipping method selection:

```typescript
// src/modules/checkout/components/shipping/index.tsx
const Shipping = ({ cart, availableShippingMethods }) => {
  const [shippingMethodId, setShippingMethodId] = useState(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )
  
  const handleSetShippingMethod = async (id: string, variant: "shipping" | "pickup") => {
    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
  }
  
  return (
    <div className="bg-white">
      <RadioGroup value={shippingMethodId} onChange={handleSetShippingMethod}>
        {availableShippingMethods.map((method) => (
          <ShippingOption key={method.id} method={method} />
        ))}
      </RadioGroup>
    </div>
  )
}
```

**Features:**
- Calculated and fixed shipping options
- Pickup location support
- Real-time shipping cost calculation
- Shipping method validation

### 3. Payment Component

Handles payment method selection and processing:

```typescript
// src/modules/checkout/components/payment/index.tsx
const Payment = ({ cart, availablePaymentMethods }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )
  
  const setPaymentMethod = async (method: string) => {
    setSelectedPaymentMethod(method)
    if (isStripeFunc(method)) {
      await initiatePaymentSession(cart, { provider_id: method })
    }
  }
  
  return (
    <div className="bg-white">
      <RadioGroup value={selectedPaymentMethod} onChange={setPaymentMethod}>
        {availablePaymentMethods.map((method) => (
          <PaymentOption key={method.id} method={method} />
        ))}
      </RadioGroup>
    </div>
  )
}
```

**Features:**
- Multiple payment provider support (Stripe, PayPal, Manual)
- Stripe Elements integration
- Payment session management
- Gift card support

### 4. Review Component

Final order review and placement:

```typescript
// src/modules/checkout/components/review/index.tsx
const Review = ({ cart }) => {
  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)
  
  return (
    <div className="bg-white">
      {previousStepsCompleted && (
        <>
          <TermsAndConditions />
          <PaymentButton cart={cart} />
        </>
      )}
    </div>
  )
}
```

**Features:**
- Order summary validation
- Terms and conditions acceptance
- Payment button with order placement
- Error handling for incomplete steps

## Step-by-Step Process

### Step 1: Address Collection

```typescript
// Address form submission
export async function setAddresses(currentState: unknown, formData: FormData) {
  const data = {
    shipping_address: {
      first_name: formData.get("shipping_address.first_name"),
      last_name: formData.get("shipping_address.last_name"),
      address_1: formData.get("shipping_address.address_1"),
      // ... other fields
    },
    email: formData.get("email"),
  }
  
  const sameAsBilling = formData.get("same_as_billing")
  if (sameAsBilling === "on") {
    data.billing_address = data.shipping_address
  }
  
  await updateCart(data)
  redirect(`/${countryCode}/checkout?step=delivery`)
}
```

### Step 2: Shipping Method Selection

```typescript
// Shipping method selection
export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = { ...(await getAuthHeaders()) }
  
  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cart
    })
    .catch(medusaError)
}
```

### Step 3: Payment Method Selection

```typescript
// Payment session initiation
export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = { ...(await getAuthHeaders()) }
  
  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return resp
    })
    .catch(medusaError)
}
```

### Step 4: Order Placement

```typescript
// Order completion
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())
  const headers = { ...(await getAuthHeaders()) }
  
  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cartRes
    })
    .catch(medusaError)
  
  if (cartRes?.type === "order") {
    const countryCode = cartRes.order.shipping_address?.country_code?.toLowerCase()
    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }
  
  return cartRes.cart
}
```

## Payment Integration

### Payment Providers

The system supports multiple payment providers:

```typescript
// src/lib/constants.tsx
export const paymentInfoMap: Record<string, { title: string; icon: React.JSX.Element }> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
}

export const isStripe = (providerId?: string) => {
  return providerId?.startsWith("pp_stripe_")
}
```

### Stripe Integration

```typescript
// Stripe payment processing
const StripePaymentButton = ({ cart, notReady }) => {
  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")
  
  const handlePayment = async () => {
    await stripe.confirmCardPayment(session?.data.client_secret, {
      payment_method: {
        card: card,
        billing_details: {
          name: cart.billing_address?.first_name + " " + cart.billing_address?.last_name,
          address: {
            city: cart.billing_address?.city,
            country: cart.billing_address?.country_code,
            line1: cart.billing_address?.address_1,
            // ... other address fields
          },
          email: cart.email,
        },
      },
    })
    .then(({ error, paymentIntent }) => {
      if (paymentIntent?.status === "succeeded") {
        onPaymentCompleted()
      }
    })
  }
}
```

## Shipping & Fulfillment

### Shipping Methods

```typescript
// src/lib/data/fulfillment.ts
export const listCartShippingMethods = async (cartId: string) => {
  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("fulfillment")) }
  
  return sdk.client
    .fetch<HttpTypes.StoreShippingOptionListResponse>(`/store/shipping-options`, {
      method: "GET",
      query: {
        cart_id: cartId,
        fields: "+service_zone.fulfllment_set.type,*service_zone.fulfillment_set.location.address",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ shipping_options }) => shipping_options)
}
```

### Shipping Cost Calculation

```typescript
export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
) => {
  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("fulfillment")) }
  
  return sdk.client
    .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
      `/store/shipping-options/${optionId}/calculate`,
      {
        method: "POST",
        body: { cart_id: cartId, data },
        headers,
        next,
      }
    )
    .then(({ shipping_option }) => shipping_option)
}
```

## Address Management

### Address Validation

```typescript
// Address comparison utility
export default function compareAddresses(
  address1: HttpTypes.StoreCartAddress,
  address2: HttpTypes.StoreCartAddress
): boolean {
  return (
    address1?.first_name === address2?.first_name &&
    address1?.last_name === address2?.last_name &&
    address1?.address_1 === address2?.address_1 &&
    address1?.address_2 === address2?.address_2 &&
    address1?.postal_code === address2?.postal_code &&
    address1?.city === address2?.city &&
    address1?.country_code === address2?.country_code &&
    address1?.province === address2?.province
  )
}
```

### Customer Address Pre-fill

For authenticated users, the system can pre-fill addresses from their saved addresses:

```typescript
// Address selection from customer's saved addresses
const ShippingAddress = ({ customer, cart }) => {
  const savedAddresses = customer?.shipping_addresses || []
  
  return (
    <div>
      {savedAddresses.length > 0 && (
        <div className="mb-4">
          <label>Use saved address</label>
          <select onChange={handleAddressSelect}>
            {savedAddresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.first_name} {address.last_name} - {address.address_1}
              </option>
            ))}
          </select>
        </div>
      )}
      <AddressForm />
    </div>
  )
}
```

## Order Completion

### Order Confirmation

After successful payment and order placement:

```typescript
// Order confirmation redirect
if (cartRes?.type === "order") {
  const countryCode = cartRes.order.shipping_address?.country_code?.toLowerCase()
  const orderCacheTag = await getCacheTag("orders")
  revalidateTag(orderCacheTag)
  
  removeCartId() // Clear cart after successful order
  redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
}
```

### Order Confirmation Page

```typescript
// src/app/[countryCode]/(main)/order/[id]/confirmed/page.tsx
export default async function OrderConfirmed({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await retrieveOrder(id)
  
  return (
    <div className="content-container">
      <OrderCompletedTemplate order={order} />
    </div>
  )
}
```

## Error Handling

### Form Validation

```typescript
// Error handling in forms
const [message, formAction] = useActionState(setAddresses, null)

return (
  <form action={formAction}>
    <AddressForm />
    <SubmitButton>Continue to delivery</SubmitButton>
    <ErrorMessage error={message} data-testid="address-error-message" />
  </form>
)
```

### Payment Errors

```typescript
// Payment error handling
const handlePayment = async () => {
  try {
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card, billing_details }
    })
    
    if (error) {
      setErrorMessage(error.message)
      return
    }
    
    if (paymentIntent?.status === "succeeded") {
      await placeOrder()
    }
  } catch (err) {
    setErrorMessage("Payment failed. Please try again.")
  }
}
```

### Network Errors

```typescript
// Network error handling with retry
export const listCartShippingMethods = async (cartId: string) => {
  try {
    return await sdk.client.fetch(`/store/shipping-options`, {
      query: { cart_id: cartId },
      headers,
      next,
      cache: "force-cache",
    })
  } catch {
    return null // Graceful fallback
  }
}
```

## Security Considerations

### Server-side Processing

- All checkout operations use server actions
- Payment processing happens server-side
- Sensitive data never exposed to client

### Input Validation

```typescript
// Address validation
const validateAddress = (address: any) => {
  const required = ['first_name', 'last_name', 'address_1', 'city', 'country_code']
  for (const field of required) {
    if (!address[field]) {
      throw new Error(`${field} is required`)
    }
  }
}
```

### Payment Security

- Stripe Elements for secure card input
- PCI compliance through Stripe
- No card data stored locally
- Secure payment session management

## Best Practices

### Performance Optimization

1. **Server-side Rendering**: All checkout pages are server-rendered
2. **Caching**: Proper cache tags for shipping and payment data
3. **Lazy Loading**: Components load only when needed
4. **Optimistic Updates**: UI updates immediately with fallback

### User Experience

1. **Progress Indicators**: Clear step-by-step progress
2. **Form Persistence**: Data persists across steps
3. **Error Recovery**: Clear error messages with recovery options
4. **Mobile Optimization**: Responsive design for all devices

### Code Organization

1. **Modular Components**: Each step is a separate component
2. **Server Actions**: All form submissions use server actions
3. **Type Safety**: Full TypeScript support
4. **Error Boundaries**: Proper error handling at each level

### Testing Considerations

```typescript
// Test IDs for automated testing
<SubmitButton data-testid="submit-address-button">
  Continue to delivery
</SubmitButton>

<ErrorMessage error={message} data-testid="address-error-message" />
```

## Environment Variables

Required for checkout functionality:

```bash
# Medusa Backend
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_key_here

# Stripe Integration
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_stripe_key

# Application
NEXT_PUBLIC_BASE_URL=https://localhost:8000
```

## Troubleshooting

### Common Issues

1. **Cart Not Found**: Ensure cart ID is properly set in cookies
2. **Shipping Methods Not Loading**: Check region configuration in Medusa admin
3. **Payment Failures**: Verify Stripe keys and webhook configuration
4. **Address Validation**: Ensure all required fields are filled

### Debug Mode

Enable debug logging in development:

```typescript
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
```

This checkout system provides a robust, secure, and user-friendly experience for completing purchases in the Medusa.js v2 e-commerce application. 