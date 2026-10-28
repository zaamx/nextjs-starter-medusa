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
| `gate_min_rank` | nombre o nivel | vacío | Rango mínimo. Acepta `Esmeralda` o `3`. Vacío = apagado |
| `gate_rank_source` | `current` / `lifetime` / `monthly` | `current` | Cuál de los tres rangos se evalúa |

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
| `src/modules/products/components/rank-gate.tsx` | Gate de rango |

Ambos gates envuelven las acciones de compra en
`src/modules/products/templates/index.tsx`.

## Estado por defecto

| Producto | SKU | Quién compra |
| --- | --- | --- |
| Paquete Bonus | `WNBONUS` | Solo socios activos |
| Paquete de Almacén | `WNWAREHOUSE` | Solo socios activos |
| Paquete Activación 100 | `WNACTIVATION100` | Cualquier socio con sesión iniciada |
| Resto del catálogo | — | Sin restricción |

## Rangos

El catálogo vive en `netme_ranks`: Socio (1), Zafiro (2), Esmeralda (3), Rubí (4),
Jade (5), Diamante (6). El rango del perfil sale del RPC
`netme_profile_rank_summary(p_profile, p_period)`, que devuelve tres nombres:

| Campo | `gate_rank_source` | Comportamiento |
| --- | --- | --- |
| `current_rank_name` | `current` | El del periodo vigente. Fluctúa cada semana |
| `lifetime_rank_name` | `lifetime` | Máximo histórico. Nunca baja |
| `last_monthly_rank_name` | `monthly` | El del periodo previo al último `is_quarterly` |

El RPC devuelve nombres, no niveles; `rank-gate.tsx` los cruza contra el catálogo.
Es seguro porque ambos leen de `netme_ranks.name`. `'Sin rango'` se trata como nivel 0.

Cuántos socios pasan hoy según el mínimo configurado:

| Rango mínimo | Con `current` | Con `lifetime` |
| --- | --- | --- |
| Socio | 3,099 | 3,099 |
| Zafiro | 65 | 156 |
| Esmeralda | 36 | 45 |
| Rubí | 1 | 5 |
| Jade | 0 | 3 |
| Diamante | 0 | 0 |

Con `current`, un `gate_min_rank` de Jade o Diamante bloquea a toda la red.

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
