# Diseño — Cobro de Renovación Anual (SKU WNALN)

**Fecha:** 2026-07-08
**Proyecto:** `mlm-next-new` (storefront Medusa / Next.js)
**Alcance:** 100% storefront — **cero cambios de backend**

## 1. Objetivo

Cobrar una renovación anual a los **miembros MLM** cuando cumplen 1 año desde su
primera orden. La renovación (SKU `WNALN`) se agrega automáticamente al carrito en
la siguiente compra, se marca como obligatoria/no removible en la interfaz, y se
notifica al cliente mediante un banner global.

## 2. Decisiones acordadas

| Tema | Decisión |
|------|----------|
| Obligatoriedad | Obligatorio, no removible (a nivel UI); bloquea el checkout si falta |
| Recurrencia | Anual recurrente, se reinicia al pagar |
| Detección | **Última renovación + 1 año** (o primera orden si nunca ha renovado) |
| Alcance | Solo miembros MLM (con perfil `netme` / `customer.metadata.mlm_enabled`) |
| Notificación | Banner global en la tienda |
| Disparadores | Al **iniciar sesión** y al **abrir el carrito** |
| Arquitectura | Todo en el storefront (Opción B) |

### Nota de seguridad (aceptada)
Como toda la lógica vive en el navegador/servidor de Next, la regla "obligatorio /
no removible" se cumple para el flujo normal de UI, pero un usuario con
conocimientos técnicos podría evadirla desde las devtools. El backend **no** valida
esta regla en esta versión. Aceptado explícitamente por el usuario.

## 3. SKU

```
ANUAL_RENOVATION_SKU = WNALN
```

## 4. Lógica de detección

Se calcula con filtros de fecha sobre las órdenes del cliente, sin traer todo el
historial. Reutiliza el helper existente `listOrders(limit, offset, filters)` de
`src/lib/data/orders.ts` (ya acepta filtros arbitrarios y ordena por `-created_at`).

Sea `haceUnAño = hoy − 1 año`.

1. **Solo miembros MLM:** si el cliente no tiene `metadata.mlm_enabled === true`,
   retornar `{ due: false }` y no hacer nada más.
2. **¿Pasó el primer aniversario?** Consultar órdenes **pagadas/completadas** con
   `created_at < haceUnAño`, `limit: 1`. Si existe alguna →
   `tieneOrdenDeMás1Año = true`.
3. **¿Ya renovó este ciclo?** Consultar órdenes **pagadas/completadas** con
   `created_at >= haceUnAño` y revisar si alguna línea trae SKU `WNALN`. El store
   API de Medusa no filtra por SKU de línea, así que se traen las órdenes recientes
   (conjunto pequeño) y se inspeccionan sus `items[].variant?.sku` /
   `items[].variant_sku` en memoria. Si hay una → `renovóEnElÚltimoAño = true`.
4. **Resultado:**
   ```
   due = tieneOrdenDeMás1Año && !renovóEnElÚltimoAño
   ```
   Esto implementa "última renovación + 1 año": mientras exista una orden `WNALN`
   dentro del último año, no se vuelve a cobrar; cuando esa orden envejece más de 1
   año, `due` vuelve a `true`.

> Solo se consideran órdenes **pagadas/completadas** en ambas consultas: una orden
> cancelada no debe contar como primera compra, y una renovación no pagada no debe
> contar como "ya renovó".

## 5. Componentes

Todos nuevos salvo donde se indica. Se siguen los patrones existentes del repo
(`cart-validation.ts`, `customer-status.ts`).

### 5.1 `src/lib/data/membership.ts` (server action, `"use server"`)
- `getRenewalStatus(): Promise<{ due: boolean; expiresAt?: string }>`
  - Implementa la lógica de la sección 4.
  - Cachea el resultado en cookie (mismo patrón que `customer-status.ts` con
    `getQualifiedInfoCookie` / `setQualifiedInfo`) para no recalcular en cada apertura
    del carrito.
  - `expiresAt` = fecha de la última renovación (o primera orden) + 1 año, para el
    texto del banner.
- Invalidación de cache: en login y al completar una orden.

### 5.2 `src/lib/util/renewal-cart.ts`
Espeja `src/lib/util/cart-validation.ts`:
- `export const RENEWAL_SKU = "WNALN"`
- `hasRenewalInCart(cart): boolean` — revisa `items[].variant?.sku` y
  `items[].variant_sku`.
- `getRenewalVariantId(): Promise<string>` — resuelve el `variant_id` de `WNALN`
  vía `listProducts` (cacheado).
- `ensureRenewalInCart(countryCode): Promise<void>` — si `due && !hasRenewalInCart`,
  llama `addToCart({ variantId, quantity: 1, countryCode })`.

### 5.3 Disparadores
- **Login:** tras el login exitoso (server action de login del módulo `account`),
  correr `getRenewalStatus()` en modo fresco + `ensureRenewalInCart()`.
- **Al abrir el carrito:** el server component del carrito
  (`src/modules/cart/templates/...`) llama a `getRenewalStatus()` +
  `ensureRenewalInCart()` antes de renderizar.

### 5.4 "No removible" y bloqueo (UX)
- Componente de línea del carrito: si `item` es la renovación (SKU `WNALN`),
  ocultar/deshabilitar el botón de eliminar y el editor de cantidad, y mostrar una
  etiqueta "Renovación anual — obligatoria".
- Flujo de checkout: si `due && !hasRenewalInCart`, bloquear con mensaje
  (defensa en profundidad; normalmente ya estará agregado).

### 5.5 Banner global — `RenewalBanner`
- Componente cliente en el layout (o layout de cuenta) que aparece cuando `due` es
  `true`.
- Texto: *"Tu membresía cumplió 1 año. Agregamos tu renovación anual a tu carrito
  para continuar."*
- Estilo consistente con la tienda (usa el sistema de UI ya presente).

## 6. Reinicio del ciclo (automático)

No requiere lógica adicional. Una vez pagada la orden con `WNALN`, la consulta del
"último año" (sección 4, paso 3) la detecta y `due` pasa a `false` hasta el
siguiente aniversario. Se invalida el cache de estado al completar la orden.

## 7. Casos borde

- Cliente nuevo (< 1 año) o sin órdenes → `due = false`.
- No-miembro (sin `mlm_enabled`) → ignorado por completo.
- `WNALN` ya presente en el carrito → no se duplica.
- Órdenes canceladas → no cuentan (filtro por estado pagado/completado).
- Sesión persistente → cubierto por el disparador "al abrir el carrito".

## 8. Fuera de alcance

- Validación/obligatoriedad en el backend (Medusa).
- Envío de correo de renovación.
- Job/cron de detección en el servidor.
- Reportes administrativos de renovaciones.

## 9. Archivos afectados (resumen)

**Nuevos:**
- `src/lib/data/membership.ts`
- `src/lib/util/renewal-cart.ts`
- Componente `RenewalBanner` (ubicación en `src/modules/layout/...` o similar)

**Modificados:**
- Server action de login del módulo `account` (disparador login)
- Server component/template del carrito (disparador + UI no-removible)
- Componente de línea del carrito (ocultar eliminar/cantidad para `WNALN`)
- Flujo/botón de checkout (bloqueo defensivo)
- Layout que monta `RenewalBanner`
