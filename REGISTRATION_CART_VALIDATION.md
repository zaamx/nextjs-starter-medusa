# Registration Cart Validation Implementation

## Overview

This implementation adds a requirement that users must have the "Paquete de Inscripción" (Registration Package) product in their cart before they can register as a We Now Member.

## Requirements

- Users must have a product with `variant_sku: "WNSTART"` in their cart to register
- If the required product is not in the cart, show a message with a button to add it
- The button should link to the product page: `/products/paquete-de-lanzamiento` (LocalizedClientLink handles country code)

## Implementation Details

### 1. Cart Validation Utility (`src/lib/util/cart-validation.ts`)

Created a utility file with two functions:

- `hasRequiredRegistrationProduct(cart)`: Checks if the cart contains the required product
- `getRequiredProductUrl()`: Returns the product URL (LocalizedClientLink handles country code)

### 2. Modified Registration Component (`src/modules/account/components/register/index.tsx`)

Updated the Register component to:
- Accept `cart` and `countryCode` props
- Check if the required product is in the cart
- Show a warning message with a button if the product is missing
- Only allow registration if the required product is present

### 3. Updated Login Template (`src/modules/account/templates/login-template.tsx`)

Modified to accept and pass through:
- `cart` prop (optional StoreCart)
- `countryCode` prop (optional string)

### 4. Updated Login Page (`src/app/[countryCode]/(main)/account/@login/page.tsx`)

Modified to:
- Fetch cart data using `retrieveCart()`
- Extract country code from URL params
- Pass both to the LoginTemplate component

### 5. Updated Checkout Page (`src/app/[countryCode]/(checkout)/checkout/page.tsx`)

Updated to pass cart and countryCode to LoginTemplate when user is not logged in.

## User Experience

### When Required Product is Missing:
- Shows a warning message with amber styling
- Explains that the registration package is required
- Provides a button to "Add Registration Package to Cart"
- Button links to the product page (LocalizedClientLink handles country code)

### When Required Product is Present:
- Registration form displays normally
- User can proceed with registration as usual

## Technical Notes

- The validation checks for `variant_sku: "WNSTART"` or `variant.sku: "WNSTART"`
- Handles edge cases: null cart, empty cart, cart without items
- Uses TypeScript for type safety
- Maintains existing functionality for login flow
- Preserves all existing form fields and validation

## Testing

The implementation was tested with:
- Cart containing the required product (should allow registration)
- Empty cart (should show warning)
- Cart with other products (should show warning)
- Null cart (should show warning)

All test cases passed successfully. 