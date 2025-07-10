# Password Recovery Implementation

This document describes the password recovery functionality implemented in the Medusa.js v2 Next.js storefront.

## Overview

The password recovery system follows the Medusa.js documentation and implements a two-step process:

1. **Request Password Reset**: Users enter their email to request a password reset
2. **Reset Password**: Users click a link from their email to set a new password

## Components

### 1. Forgot Password Component (`src/modules/account/components/forgot-password/index.tsx`)

- **Purpose**: Handles the initial password reset request
- **Features**:
  - Email input validation
  - Server action integration using `useActionState`
  - Success/error message display
  - Navigation back to login

### 2. Reset Password Template (`src/modules/account/templates/reset-password-template.tsx`)

- **Purpose**: Handles the actual password reset when users click the email link
- **Features**:
  - Token and email extraction from URL parameters
  - Password and confirm password validation
  - Client-side SDK integration for password update
  - Success message with automatic redirect

### 3. Reset Password Page (`src/app/[countryCode]/(main)/account/reset-password/page.tsx`)

- **Purpose**: Page route for the reset password functionality
- **Features**:
  - Metadata for SEO
  - Country code parameter handling

## Server Actions

### Request Password Reset (`src/lib/data/customer.ts`)

```typescript
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
```

### Reset Password (`src/lib/data/customer.ts`)

```typescript
export async function resetPassword(_currentState: unknown, formData: FormData) {
  const token = formData.get("token") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validation logic...

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
```

## User Flow

### Step 1: Request Password Reset

1. User clicks "¿Olvidaste tu contraseña?" on the login page
2. User is taken to the forgot password view
3. User enters their email address
4. System sends request to Medusa backend
5. User receives success message (regardless of email existence for security)

### Step 2: Reset Password

1. User receives email with reset link: `/{countryCode}/account/reset-password?token={token}&email={email}`
2. User clicks the link
3. System validates token and email parameters
4. User enters new password and confirmation
5. System updates password via Medusa SDK
6. User is redirected to login page after success

## Security Features

### Email Privacy Protection

- The system always returns a success message when requesting password reset
- This prevents email enumeration attacks
- Users cannot determine if an email exists in the system

### Token Validation

- Reset tokens are validated on the client side
- Invalid or expired tokens show an error message
- Tokens are passed in the Authorization header (Medusa v2.6+)

### Password Requirements

- Minimum 8 characters
- Password confirmation validation
- Client-side validation before submission

## Integration Points

### Login Template Updates

The login template (`src/modules/account/templates/login-template.tsx`) was updated to:

- Add `FORGOT_PASSWORD` to the `LOGIN_VIEW` enum
- Include the forgot password component in the view switching logic

### Login Component Updates

The login component (`src/modules/account/components/login/index.tsx`) was updated to:

- Add "¿Olvidaste tu contraseña?" link
- Navigate to forgot password view when clicked

## API Endpoints Used

### Request Reset Password Token

```
POST /store/auth/customer/emailpass/reset-password
```

**Body:**
```json
{
  "identifier": "user@example.com"
}
```

### Reset Password

```
POST /store/auth/customer/emailpass/update
```

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "newpassword"
}
```

## Error Handling

### Common Error Scenarios

1. **Invalid Email**: Client-side validation prevents submission
2. **Invalid Token**: Shows error message and redirects to login
3. **Expired Token**: Same as invalid token
4. **Network Errors**: Displays user-friendly error messages
5. **Password Mismatch**: Client-side validation prevents submission

### Error Messages

All error messages are in Spanish to match the application's language:

- "El email es requerido"
- "Token de restablecimiento no válido"
- "Las contraseñas no coinciden"
- "La contraseña debe tener al menos 8 caracteres"
- "No se pudo restablecer la contraseña: {error}"

## Testing

### Manual Testing Scenarios

1. **Request Reset Flow**:
   - Navigate to login page
   - Click "¿Olvidaste tu contraseña?"
   - Enter valid email
   - Verify success message

2. **Reset Password Flow**:
   - Use reset link with valid token and email
   - Enter new password and confirmation
   - Verify password is updated and redirect occurs

3. **Error Handling**:
   - Test with invalid email format
   - Test with invalid/expired token
   - Test with mismatched passwords
   - Test with short passwords

## Configuration Requirements

### Backend Configuration

The Medusa backend must be configured to:

1. **Email Provider**: Set up email provider for sending reset emails
2. **Reset Password Subscriber**: Implement subscriber to handle reset password notifications
3. **Token Expiration**: Configure appropriate token expiration times

### Frontend Configuration

No additional configuration is required beyond the existing Medusa SDK setup.

## Future Enhancements

### Potential Improvements

1. **Rate Limiting**: Implement rate limiting for password reset requests
2. **Password Strength**: Add more sophisticated password strength validation
3. **Email Templates**: Customize email templates for better branding
4. **Analytics**: Track password reset usage for security monitoring
5. **Multi-language**: Support for multiple languages in error messages

## Troubleshooting

### Common Issues

1. **Reset Link Not Working**:
   - Check token expiration
   - Verify email parameter is correct
   - Ensure backend email configuration is working

2. **Password Update Fails**:
   - Verify token is valid and not expired
   - Check password meets minimum requirements
   - Ensure backend auth configuration is correct

3. **Email Not Received**:
   - Check backend email provider configuration
   - Verify email address is correct
   - Check spam/junk folders

## Dependencies

- `@medusajs/js-sdk`: For authentication API calls
- `react`: For component implementation
- `next/navigation`: For routing functionality
- `useActionState`: For server action integration

This implementation provides a secure, user-friendly password recovery system that follows Medusa.js best practices and integrates seamlessly with the existing authentication flow. 