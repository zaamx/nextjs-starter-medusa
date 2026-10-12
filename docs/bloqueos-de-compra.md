# Bloqueos de compra por producto

Ciertos productos solo los pueden comprar socios que cumplan una condición del plan
de compensación. La condición se configura **por producto, desde `product.metadata`
en el admin de Medusa**, sin deploy: el webhook `product.updated` revalida la caché
del storefront.

**Guía para el operador de Medusa Admin:**
https://claude.ai/artifact/SVPS6Hvj2ia2tBRZai8dXX#707c0345-2437

Ese documento es el que se le pasa a comercial. Lo de abajo es la referencia técnica.

## Llaves

| Llave | Tipo | Default | Efecto |
| --- | --- | --- | --- |
| `gate_active_members_only` | boolean | ON en los SKUs de `DEFAULT_ACTIVE_MEMBERS_ONLY_SKUS` | Exige socio activo: `netme_next_renewal` con `days_left > 0` |
| `gate_reactivation_only` | boolean | ON en los handles de `DEFAULT_REACTIVATION_ONLY_HANDLES` | Exige sesión iniciada y, si se configura, inactividad |
| `gate_min_days_inactive` | number | `0` | Días mínimos sin calificar. Solo aplica con `gate_reactivation_only` |
| `gate_require_ever_qualified` | boolean | `false` | Exige haber calificado alguna vez. Solo aplica con `gate_reactivation_only` |

Los booleanos aceptan `true`/`false`, `1`/`0`, `si`/`no`, `on`/`off`, como string o
como booleano real. Una llave `gate_*` no reconocida dispara un `console.warn` en vez
de fallar en silencio.

## Dónde vive

| Archivo | Rol |
| --- | --- |
| `src/lib/util/product-gates.ts` | Parser de metadata, defaults y la lista de SKUs/handles |
| `src/lib/data/customer-status.ts` | `checkActivationEligibility(minDaysInactive, requireEverQualified)` |
| `src/modules/products/components/active-member-gate.tsx` | Gate de socios activos |
| `src/modules/products/components/activation-gate.tsx` | Gate de reactivación |

Ambos gates envuelven las acciones de compra en
`src/modules/products/templates/index.tsx`.

## Estado por defecto

| Producto | SKU | Quién compra |
| --- | --- | --- |
| Paquete Bonus | `WNBONUS` | Solo socios activos |
| Paquete de Almacén | `WNWAREHOUSE` | Solo socios activos |
| Paquete Activación 100 | `WNACTIVATION100` | Cualquier socio con sesión iniciada |
| Resto del catálogo | — | Sin restricción |

## Dos detalles de la lógica

1. **`days_without_qualified` negativo se clampea a 0.** Viene de
   `CURRENT_DATE - end_date` del último periodo calificado, y ese periodo puede ser el
   vigente, cuyo `end_date` aún no llega. Un socio que calificó esta semana tiene días
   negativos; eso es *cero días de inactividad*, no "menos que cero".
2. **Sin fila de calificación pasa, salvo que `gate_require_ever_qualified` esté en
   `true`.** `netme_get_last_qualified_info` no devuelve fila para quien nunca acumuló
   75 QV en un periodo.

## Limitación

Los gates son **client-side y solo en la ficha del producto**. Un carrito que ya trae
el producto, un link directo al carrito o un POST a la API de Medusa pasan sin
problema: el backend no valida nada de esto.
