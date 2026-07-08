# Renovación Anual (SKU WNALN) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cobrar una renovación anual (SKU `WNALN`) a los miembros MLM que cumplieron 1 año desde su primera orden, auto-agregándola al carrito con una notificación global.

**Architecture:** 100% storefront (Next.js/Medusa SDK), sin cambios de backend. La lógica de decisión pura vive en un módulo sin dependencias de servidor (`renewal-logic.ts`) que se prueba con vitest; una capa de servidor (`membership.ts`) conecta esa lógica con las órdenes del cliente, el carrito y una cookie de cache. Dos disparadores (login y apertura del carrito) aseguran el ítem en el carrito, y componentes de UI lo marcan como no removible y muestran el banner.

**Tech Stack:** Next.js (App Router, Server Actions), Medusa JS SDK, TypeScript, `@medusajs/ui`, vitest (nuevo, solo para lógica pura).

## Global Constraints

- SKU de renovación: `WNALN` (constante `RENEWAL_SKU`).
- Alcance: solo miembros MLM → `customer.metadata.mlm_enabled === true`.
- Detección: `due = tieneOrdenPagada de hace > 1 año && NO tiene orden WNALN pagada en el último año`.
- Solo cuentan órdenes no canceladas (`order.status !== "canceled"`).
- Aliases de import: `@lib/*` → `src/lib/*`, `@modules/*` → `src/modules/*`.
- Métodos HTTP y SDK: usar siempre el SDK de Medusa existente (`sdk.client.fetch`, helpers de `lib/data/*`), nunca `fetch()` crudo.
- Texto del banner: *"Tu membresía cumplió 1 año. Agregamos tu renovación anual a tu carrito para continuar."*
- No se toca el backend (`mlm-core-new`).

---

### Task 1: Módulo de lógica pura + vitest

Extrae toda la decisión (sin dependencias de servidor) para poder probarla y reutilizarla en cliente y servidor.

**Files:**
- Create: `src/lib/util/renewal-logic.ts`
- Create: `src/lib/util/renewal-logic.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (agregar devDeps + script `test`)

**Interfaces:**
- Consumes: `HttpTypes` de `@medusajs/types` (solo tipos).
- Produces:
  - `RENEWAL_SKU: "WNALN"`
  - `isRenewalSku(sku?: string | null): boolean`
  - `oneYearAgoISO(now: Date): string`
  - `isCountableOrder(order: { status?: string | null }): boolean`
  - `orderHasRenewalSku(order: HttpTypes.StoreOrder): boolean`
  - `hasRenewalInCart(cart: HttpTypes.StoreCart | null): boolean`
  - `computeRenewalDue(input: { hasPastAnniversaryOrder: boolean; renewedWithinLastYear: boolean }): boolean`

- [ ] **Step 1: Instalar vitest y agregar el script de test**

Run:
```bash
cd /Users/alonsoavila/Dev/zaamx/multinivel/NOW/mlm-next-new
yarn add -D vitest@^2
```

Luego edita `package.json` y agrega dentro de `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Crear `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@lib": resolve(__dirname, "src/lib"),
      "@modules": resolve(__dirname, "src/modules"),
    },
  },
})
```

- [ ] **Step 3: Escribir el test que falla**

Create `src/lib/util/renewal-logic.test.ts`:
```ts
import { describe, it, expect } from "vitest"
import {
  RENEWAL_SKU,
  isRenewalSku,
  oneYearAgoISO,
  isCountableOrder,
  orderHasRenewalSku,
  hasRenewalInCart,
  computeRenewalDue,
} from "./renewal-logic"

describe("renewal-logic", () => {
  it("RENEWAL_SKU is WNALN", () => {
    expect(RENEWAL_SKU).toBe("WNALN")
  })

  it("isRenewalSku matches only WNALN", () => {
    expect(isRenewalSku("WNALN")).toBe(true)
    expect(isRenewalSku("WNSTART")).toBe(false)
    expect(isRenewalSku(null)).toBe(false)
    expect(isRenewalSku(undefined)).toBe(false)
  })

  it("oneYearAgoISO subtracts exactly one year", () => {
    const now = new Date("2026-07-08T00:00:00.000Z")
    expect(oneYearAgoISO(now)).toBe("2025-07-08T00:00:00.000Z")
  })

  it("isCountableOrder excludes canceled orders", () => {
    expect(isCountableOrder({ status: "completed" })).toBe(true)
    expect(isCountableOrder({ status: "pending" })).toBe(true)
    expect(isCountableOrder({ status: "canceled" })).toBe(false)
  })

  it("orderHasRenewalSku detects WNALN in items via variant.sku or variant_sku", () => {
    const orderA = { items: [{ variant: { sku: "WNALN" } }] } as any
    const orderB = { items: [{ variant_sku: "WNALN" }] } as any
    const orderC = { items: [{ variant: { sku: "WNSTART" } }] } as any
    expect(orderHasRenewalSku(orderA)).toBe(true)
    expect(orderHasRenewalSku(orderB)).toBe(true)
    expect(orderHasRenewalSku(orderC)).toBe(false)
    expect(orderHasRenewalSku({ items: [] } as any)).toBe(false)
  })

  it("hasRenewalInCart detects WNALN line", () => {
    const cart = { items: [{ variant: { sku: "WNALN" } }] } as any
    expect(hasRenewalInCart(cart)).toBe(true)
    expect(hasRenewalInCart({ items: [] } as any)).toBe(false)
    expect(hasRenewalInCart(null)).toBe(false)
  })

  it("computeRenewalDue truth table", () => {
    expect(computeRenewalDue({ hasPastAnniversaryOrder: true, renewedWithinLastYear: false })).toBe(true)
    expect(computeRenewalDue({ hasPastAnniversaryOrder: true, renewedWithinLastYear: true })).toBe(false)
    expect(computeRenewalDue({ hasPastAnniversaryOrder: false, renewedWithinLastYear: false })).toBe(false)
    expect(computeRenewalDue({ hasPastAnniversaryOrder: false, renewedWithinLastYear: true })).toBe(false)
  })
})
```

- [ ] **Step 4: Correr el test y verificar que falla**

Run: `yarn test`
Expected: FAIL — no puede resolver `./renewal-logic`.

- [ ] **Step 5: Implementar `src/lib/util/renewal-logic.ts`**

```ts
import type { HttpTypes } from "@medusajs/types"

export const RENEWAL_SKU = "WNALN"

export function isRenewalSku(sku?: string | null): boolean {
  return sku === RENEWAL_SKU
}

export function oneYearAgoISO(now: Date): string {
  const d = new Date(now)
  d.setUTCFullYear(d.getUTCFullYear() - 1)
  return d.toISOString()
}

export function isCountableOrder(order: { status?: string | null }): boolean {
  return order.status !== "canceled"
}

export function orderHasRenewalSku(order: HttpTypes.StoreOrder): boolean {
  const items = order.items ?? []
  return items.some(
    (it) => isRenewalSku(it.variant?.sku) || isRenewalSku((it as any).variant_sku)
  )
}

export function hasRenewalInCart(cart: HttpTypes.StoreCart | null): boolean {
  if (!cart?.items?.length) {
    return false
  }
  return cart.items.some(
    (it) => isRenewalSku(it.variant?.sku) || isRenewalSku((it as any).variant_sku)
  )
}

export function computeRenewalDue(input: {
  hasPastAnniversaryOrder: boolean
  renewedWithinLastYear: boolean
}): boolean {
  return input.hasPastAnniversaryOrder && !input.renewedWithinLastYear
}
```

- [ ] **Step 6: Correr el test y verificar que pasa**

Run: `yarn test`
Expected: PASS — 7 tests verdes.

- [ ] **Step 7: Commit**

```bash
git add src/lib/util/renewal-logic.ts src/lib/util/renewal-logic.test.ts vitest.config.ts package.json yarn.lock
git commit -m "feat(renewal): pure renewal decision logic + vitest setup"
```

---

### Task 2: Cookie de cache del estado de renovación

Espeja el patrón de `qualifiedInfo` para no recalcular en cada apertura del carrito.

**Files:**
- Modify: `src/lib/data/cookies.ts` (agregar al final, junto a `setQualifiedInfo`)

**Interfaces:**
- Produces:
  - `setRenewalStatus(info: string): Promise<void>`
  - `getRenewalStatusCookie(): Promise<string | undefined>`
  - `removeRenewalStatus(): Promise<void>`

- [ ] **Step 1: Agregar los helpers de cookie**

Añade al final de `src/lib/data/cookies.ts`:
```ts
export const setRenewalStatus = async (info: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_renewal_status", info, {
    maxAge: 60 * 60, // 1 hora
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const getRenewalStatusCookie = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_renewal_status")?.value
}

export const removeRenewalStatus = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_renewal_status", "", {
    maxAge: -1,
  })
}
```

- [ ] **Step 2: Verificar que compila (typecheck)**

Run: `yarn tsc --noEmit`
Expected: sin errores nuevos en `cookies.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/cookies.ts
git commit -m "feat(renewal): cookie helpers para cache de estado de renovación"
```

---

### Task 3: Capa de servidor `membership.ts`

Conecta la lógica pura con las órdenes, el carrito y la cookie. No hay unit test (son server actions con dependencias de red/cookies); se verifica por typecheck/build y luego en la app.

**Files:**
- Create: `src/lib/data/membership.ts`

**Interfaces:**
- Consumes:
  - `listOrders(limit, offset, filters)` de `@lib/data/orders`
  - `retrieveCustomer()` de `@lib/data/customer`
  - `retrieveCart()`, `addToCart({ variantId, quantity, countryCode })` de `@lib/data/cart`
  - `listProducts({ countryCode, queryParams })` de `@lib/data/products`
  - `getRenewalStatusCookie()`, `setRenewalStatus()` de `@lib/data/cookies`
  - Lógica pura de `@lib/util/renewal-logic`
- Produces:
  - `type RenewalStatus = { due: boolean; expiresAt?: string }`
  - `computeRenewalStatus(): Promise<RenewalStatus>`
  - `getRenewalStatus(): Promise<RenewalStatus>` (usa cookie)
  - `refreshRenewalStatus(): Promise<RenewalStatus>` (fuerza recálculo + cache)
  - `ensureRenewalInCart(countryCode: string): Promise<void>`

- [ ] **Step 1: Implementar `src/lib/data/membership.ts`**

```ts
"use server"

import type { HttpTypes } from "@medusajs/types"
import { listOrders } from "./orders"
import { retrieveCustomer } from "./customer"
import { addToCart, retrieveCart } from "./cart"
import { listProducts } from "./products"
import { getRenewalStatusCookie, setRenewalStatus } from "./cookies"
import {
  RENEWAL_SKU,
  oneYearAgoISO,
  isCountableOrder,
  orderHasRenewalSku,
  hasRenewalInCart,
  computeRenewalDue,
} from "@lib/util/renewal-logic"

export type RenewalStatus = { due: boolean; expiresAt?: string }

let cachedRenewalVariantId: string | null = null

async function isMlmMember(): Promise<boolean> {
  const customer = await retrieveCustomer().catch(() => null)
  return Boolean(customer?.metadata?.mlm_enabled)
}

export async function computeRenewalStatus(): Promise<RenewalStatus> {
  if (!(await isMlmMember())) {
    return { due: false }
  }

  const cutoff = oneYearAgoISO(new Date())

  // ¿Tiene una orden (no cancelada) de hace más de 1 año?
  const olderOrders =
    (await listOrders(1, 0, {
      created_at: { $lt: cutoff },
      order: "created_at",
    }).catch(() => [])) as HttpTypes.StoreOrder[]
  const hasPastAnniversaryOrder = olderOrders.some(isCountableOrder)

  // ¿Renovó (orden WNALN no cancelada) en el último año?
  const recentOrders =
    (await listOrders(50, 0, {
      created_at: { $gte: cutoff },
    }).catch(() => [])) as HttpTypes.StoreOrder[]
  const renewalOrders = recentOrders
    .filter(isCountableOrder)
    .filter(orderHasRenewalSku)
  const renewedWithinLastYear = renewalOrders.length > 0

  const due = computeRenewalDue({
    hasPastAnniversaryOrder,
    renewedWithinLastYear,
  })

  // Fecha de vencimiento aproximada para textos (opcional):
  // última renovación + 1 año, si existe.
  let expiresAt: string | undefined
  if (renewalOrders.length > 0) {
    const latest = renewalOrders
      .map((o) => new Date(o.created_at as unknown as string).getTime())
      .sort((a, b) => b - a)[0]
    const exp = new Date(latest)
    exp.setUTCFullYear(exp.getUTCFullYear() + 1)
    expiresAt = exp.toISOString()
  }

  return { due, expiresAt }
}

export async function getRenewalStatus(): Promise<RenewalStatus> {
  const cached = await getRenewalStatusCookie()
  if (cached) {
    try {
      return JSON.parse(cached) as RenewalStatus
    } catch {
      // cae al recálculo
    }
  }
  const status = await computeRenewalStatus()
  await setRenewalStatus(JSON.stringify(status))
  return status
}

export async function refreshRenewalStatus(): Promise<RenewalStatus> {
  const status = await computeRenewalStatus()
  await setRenewalStatus(JSON.stringify(status))
  return status
}

async function getRenewalVariantId(countryCode: string): Promise<string | null> {
  if (cachedRenewalVariantId) {
    return cachedRenewalVariantId
  }
  const { response } = await listProducts({
    countryCode,
    queryParams: {
      q: RENEWAL_SKU,
      limit: 5,
      fields: "*variants",
    } as HttpTypes.StoreProductParams,
  })
  for (const product of response.products) {
    const variant = (product.variants ?? []).find(
      (v) => v.sku === RENEWAL_SKU
    )
    if (variant?.id) {
      cachedRenewalVariantId = variant.id
      return variant.id
    }
  }
  return null
}

export async function ensureRenewalInCart(countryCode: string): Promise<void> {
  const status = await getRenewalStatus()
  if (!status.due) {
    return
  }
  const cart = await retrieveCart().catch(() => null)
  if (hasRenewalInCart(cart)) {
    return
  }
  const variantId = await getRenewalVariantId(countryCode)
  if (!variantId) {
    console.error(
      `[renewal] No se encontró la variante para el SKU ${RENEWAL_SKU}`
    )
    return
  }
  await addToCart({ variantId, quantity: 1, countryCode })
}
```

- [ ] **Step 2: Verificar que compila (typecheck)**

Run: `yarn tsc --noEmit`
Expected: sin errores. Si `HttpTypes.StoreProductParams` no acepta `q`/`fields`, castear con `as any` en `queryParams` (el helper ya usa este patrón).

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/membership.ts
git commit -m "feat(renewal): capa de servidor (estado + auto-inyección al carrito)"
```

---

### Task 4: Disparador en el login

Recalcula y cachea el estado de renovación justo después de iniciar sesión (patrón idéntico a `fetchAndStoreQualifiedInfo`).

**Files:**
- Modify: `src/lib/data/customer.ts` (función `login`, ~línea 199-227)

**Interfaces:**
- Consumes: `refreshRenewalStatus()` de `@lib/data/membership`

- [ ] **Step 1: Importar `refreshRenewalStatus`**

En la parte superior de `src/lib/data/customer.ts`, junto a los demás imports de `@lib`:
```ts
import { refreshRenewalStatus } from "@lib/data/membership"
```

- [ ] **Step 2: Llamar el refresh dentro de `login`**

Dentro del `.then(async (token) => { ... })` de `login`, justo después de `await fetchAndStoreQualifiedInfo(token as string)`:
```ts
        await fetchAndStoreQualifiedInfo(token as string)
        await refreshRenewalStatus()
```

- [ ] **Step 3: Verificar que compila**

Run: `yarn tsc --noEmit`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/lib/data/customer.ts
git commit -m "feat(renewal): recalcular estado de renovación al iniciar sesión"
```

---

### Task 5: Disparador al abrir el carrito

Al renderizar la página del carrito, asegura el ítem de renovación y pasa `renewalDue` al template para la UI defensiva.

**Files:**
- Modify: `src/app/[countryCode]/(main)/cart/page.tsx`
- Modify: `src/modules/cart/templates/index.tsx`

**Interfaces:**
- Consumes: `getRenewalStatus()`, `ensureRenewalInCart()` de `@lib/data/membership`
- Produces: prop `renewalDue: boolean` en `CartTemplate` (y hacia `Summary` en Task 8)

- [ ] **Step 1: Actualizar la página del carrito**

Reemplaza el contenido de `src/app/[countryCode]/(main)/cart/page.tsx`:
```tsx
import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { ensureRenewalInCart, getRenewalStatus } from "@lib/data/membership"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Carrito",
  description: "Ver tu carrito",
}

export default async function Cart(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  // Asegura la renovación anual antes de leer el carrito final.
  await ensureRenewalInCart(countryCode).catch((e) =>
    console.error("[renewal] ensureRenewalInCart falló:", e)
  )

  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()
  const { due: renewalDue } = await getRenewalStatus()

  return (
    <CartTemplate cart={cart} customer={customer} renewalDue={renewalDue} />
  )
}
```

- [ ] **Step 2: Aceptar y propagar `renewalDue` en `CartTemplate`**

En `src/modules/cart/templates/index.tsx`, actualiza la firma y el paso a `Summary`:
```tsx
const CartTemplate = ({
  cart,
  customer,
  renewalDue = false,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  renewalDue?: boolean
}) => {
```
Y en el bloque del `Summary`, pasa la prop:
```tsx
                      <Summary cart={cart as any} renewalDue={renewalDue} />
```

- [ ] **Step 3: Verificar que compila**

Run: `yarn tsc --noEmit`
Expected: `Summary` marcará error de prop faltante hasta Task 8; si ejecutas tasks en orden, aplica Task 8 antes del typecheck final. Para aislar esta task, verifica que `page.tsx` e `index.tsx` no tengan errores propios de sintaxis/imports.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[countryCode]/(main)/cart/page.tsx" src/modules/cart/templates/index.tsx
git commit -m "feat(renewal): asegurar renovación al abrir el carrito"
```

---

### Task 6: UI — línea de renovación no removible

Oculta el botón de eliminar y el selector de cantidad para la línea `WNALN`, con una etiqueta que explica que es obligatoria.

**Files:**
- Modify: `src/modules/cart/components/item/index.tsx`

**Interfaces:**
- Consumes: `isRenewalSku` de `@lib/util/renewal-logic`

- [ ] **Step 1: Importar el helper y calcular `isRenewalItem`**

Agrega el import (junto a los demás):
```ts
import { isRenewalSku } from "@lib/util/renewal-logic"
```
Dentro del componente, junto a `const isBundleChild = ...`:
```ts
  const isRenewalItem =
    isRenewalSku(item.variant?.sku) || isRenewalSku((item as any).variant_sku)
```

- [ ] **Step 2: Ocultar controles y mostrar etiqueta**

Reemplaza el bloque `{!isBundleChild && ( ... )}` (los controles `DeleteButton` + `CartItemSelect`) por una condición que también excluya la renovación, y añade la etiqueta cuando sea renovación:
```tsx
            {!isBundleChild && !isRenewalItem && (
              <>
                <DeleteButton id={item.id} data-testid="product-delete-button" />
                <CartItemSelect
                  value={item.quantity}
                  onChange={(value) => changeQuantity(parseInt(value.target.value))}
                  className="w-14 h-10 p-4"
                  data-testid="product-select-button"
                >
                  {/* TODO: Update this with the v2 way of managing inventory */}
                  {Array.from(
                    {
                      length: Math.min(maxQuantity, 10),
                    },
                    (_, i) => (
                      <option value={i + 1} key={i}>
                        {i + 1}
                      </option>
                    )
                  )}

                  <option value={1} key={1}>
                    1
                  </option>
                </CartItemSelect>
              </>
            )}
            {isRenewalItem && (
              <Text className="text-xs text-grey-50" data-testid="renewal-required-tag">
                Renovación anual — obligatoria
              </Text>
            )}
```
(`Text` ya está importado de `@medusajs/ui` en este archivo.)

- [ ] **Step 3: Verificar que compila**

Run: `yarn tsc --noEmit`
Expected: sin errores en `item/index.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/modules/cart/components/item/index.tsx
git commit -m "feat(renewal): línea de renovación no removible en el carrito"
```

---

### Task 7: Banner global de renovación

Componente de servidor que muestra la notificación cuando `due` es true, montado en el layout principal para que sea global.

**Files:**
- Create: `src/modules/layout/components/renewal-banner/index.tsx`
- Modify: `src/app/[countryCode]/(main)/layout.tsx`

**Interfaces:**
- Consumes: `getRenewalStatus()` de `@lib/data/membership`

- [ ] **Step 1: Crear el componente `RenewalBanner`**

Create `src/modules/layout/components/renewal-banner/index.tsx`:
```tsx
import { getRenewalStatus } from "@lib/data/membership"

const RenewalBanner = async () => {
  const { due } = await getRenewalStatus()

  if (!due) {
    return null
  }

  return (
    <div
      className="bg-brand-magenta/10 text-grey-90 border-b border-brand-magenta/30 py-2 px-6 text-center text-sm"
      data-testid="renewal-banner"
    >
      Tu membresía cumplió 1 año. Agregamos tu renovación anual a tu carrito para
      continuar.
    </div>
  )
}

export default RenewalBanner
```

- [ ] **Step 2: Montar el banner en el layout principal**

En `src/app/[countryCode]/(main)/layout.tsx`, agrega el import:
```ts
import RenewalBanner from "@modules/layout/components/renewal-banner"
```
Y renderízalo justo después de `<Nav />` (solo si hay `customer`):
```tsx
      <Nav />
      {customer && <RenewalBanner />}
```

- [ ] **Step 3: Verificar que compila**

Run: `yarn tsc --noEmit`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/modules/layout/components/renewal-banner/index.tsx "src/app/[countryCode]/(main)/layout.tsx"
git commit -m "feat(renewal): banner global de renovación"
```

---

### Task 8: Bloqueo defensivo del checkout

Si el cliente está en periodo de renovación y (por evasión) el ítem no está en el carrito, se deshabilita el botón "Ir a la compra".

**Files:**
- Modify: `src/modules/cart/templates/summary.tsx`

**Interfaces:**
- Consumes: `hasRenewalInCart` de `@lib/util/renewal-logic`; prop `renewalDue` de `CartTemplate` (Task 5)
- Produces: prop `renewalDue?: boolean` en `Summary`

- [ ] **Step 1: Actualizar `Summary` para recibir `renewalDue` y bloquear**

Reemplaza el contenido de `src/modules/cart/templates/summary.tsx`:
```tsx
"use client"

import { Button, Heading, Text } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { hasRenewalInCart } from "@lib/util/renewal-logic"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  renewalDue?: boolean
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, renewalDue = false }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const blockedByRenewal = renewalDue && !hasRenewalInCart(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Resumen
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      {blockedByRenewal ? (
        <>
          <Text className="text-sm text-rose-600" data-testid="renewal-block-message">
            Debes incluir tu renovación anual para continuar con la compra.
          </Text>
          <Button className="w-full h-10" disabled data-testid="checkout-button">
            Ir a la compra
          </Button>
        </>
      ) : (
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
        >
          <Button className="w-full h-10">Ir a la compra</Button>
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default Summary
```

- [ ] **Step 2: Verificar que compila (typecheck completo)**

Run: `yarn tsc --noEmit`
Expected: sin errores en todo el proyecto (ya con la prop `renewalDue` propagada desde Task 5).

- [ ] **Step 3: Commit**

```bash
git add src/modules/cart/templates/summary.tsx
git commit -m "feat(renewal): bloqueo defensivo del checkout sin renovación"
```

---

### Task 9: Verificación end-to-end + build

**Files:** ninguno (verificación).

- [ ] **Step 1: Correr toda la suite de lógica pura**

Run: `yarn test`
Expected: PASS.

- [ ] **Step 2: Typecheck y build**

Run: `yarn tsc --noEmit && yarn build`
Expected: sin errores.

- [ ] **Step 3: Verificación manual en la app**

Con `yarn dev` y un backend con datos:
1. Miembro MLM con primera orden > 1 año y sin `WNALN` en el último año → al iniciar sesión y abrir `/cart`, aparece la línea `WNALN`, el banner global, y la línea no tiene botón de eliminar ni selector de cantidad.
2. Ese mismo cliente después de completar la compra con `WNALN` → al volver a abrir el carrito, ya no se re-agrega y el banner desaparece (recuerda: la cookie de estado dura 1h; para forzar, vuelve a iniciar sesión).
3. Cliente NO miembro (sin `mlm_enabled`) → sin banner ni línea de renovación.
4. Cliente miembro con < 1 año → sin banner ni línea.

- [ ] **Step 4: Commit final (si hubo ajustes)**

```bash
git add -A
git commit -m "chore(renewal): verificación e2e y ajustes finales"
```

---

## Notas de ejecución

- La cookie `_medusa_renewal_status` cachea el estado 1 hora. Los disparadores de login (`refreshRenewalStatus`) y la lógica de la apertura del carrito lo mantienen coherente; tras completar una orden con `WNALN`, el estado se refresca en el siguiente login (aceptable según el spec).
- Resolución de la variante `WNALN`: se busca por `q: "WNALN"` en `listProducts` y se filtra por `variant.sku`. Si el `q` del backend no matchea SKUs de variante, ajustar `getRenewalVariantId` para usar el handle real del producto de renovación (dato a confirmar con el catálogo).
