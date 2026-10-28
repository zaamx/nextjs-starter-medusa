import { HttpTypes } from "@medusajs/types"

/**
 * Configuración de bloqueos de compra por producto.
 *
 * Los valores salen de `product.metadata`, que comercial edita desde el admin de
 * Medusa sin necesidad de deploy: el webhook `product.updated` revalida la caché
 * del storefront. Si la metadata no trae una llave, se usa el default de código.
 *
 * Guía para el operador de Medusa Admin:
 * https://claude.ai/artifact/SVPS6Hvj2ia2tBRZai8dXX#707c0345-2437
 */

// SKUs con el gate de socios activos encendido por defecto.
const DEFAULT_ACTIVE_MEMBERS_ONLY_SKUS = ["WNBONUS", "WNWAREHOUSE"]

// Handles con el gate de reactivación encendido por defecto.
// Activación 100 lo trae encendido pero sin ventana de inactividad: eso exige
// sesión iniciada y deja comprar a cualquier socio inscrito.
const DEFAULT_REACTIVATION_ONLY_HANDLES = ["paquete-activacion-100"]

// Producto al que mandamos a los socios inactivos para reactivarse.
export const RENEWAL_PRODUCT_HREF = "/products/paquete-de-recompra"

export const GATE_METADATA_KEYS = [
  "gate_active_members_only",
  "gate_reactivation_only",
  "gate_min_days_inactive",
  "gate_require_ever_qualified",
  "gate_min_rank",
  "gate_rank_source",
] as const

/** De cuál de los tres rangos del perfil se lee el nivel. */
export type RankSource = "current" | "lifetime" | "monthly"

const RANK_SOURCES: RankSource[] = ["current", "lifetime", "monthly"]

export type ProductGateConfig = {
  /** Exige socio activo: netme_next_renewal con days_left > 0. */
  activeMembersOnly: boolean
  /** Exige inactividad (oferta de reactivación). Implica sesión iniciada. */
  reactivationOnly: boolean
  /** Días mínimos sin calificar para pasar el gate de reactivación. */
  minDaysInactive: number
  /** Exige haber calificado alguna vez (≥75 QV en algún periodo). */
  requireEverQualified: boolean
  /**
   * Rango mínimo, tal cual lo escribió comercial: un nombre ("Esmeralda") o un
   * nivel ("3"). Se resuelve contra el catálogo netme_ranks en el componente,
   * porque aquí no podemos consultar Supabase. null = gate apagado.
   */
  minRank: string | null
  /** Cuál rango se evalúa. Por defecto el del periodo vigente. */
  rankSource: RankSource
}

function toBoolean(raw: unknown, fallback: boolean): boolean {
  if (raw === undefined || raw === null || raw === "") {
    return fallback
  }
  if (typeof raw === "boolean") {
    return raw
  }
  const normalized = String(raw).trim().toLowerCase()
  if (["true", "1", "si", "sí", "yes", "on"].includes(normalized)) {
    return true
  }
  if (["false", "0", "no", "off"].includes(normalized)) {
    return false
  }
  return fallback
}

function toNumber(raw: unknown, fallback: number): number {
  if (raw === undefined || raw === null || raw === "") {
    return fallback
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Avisa en consola cuando la metadata trae una llave `gate_*` que no existe,
 * para que un typo en el admin no apague un bloqueo en silencio.
 */
function warnOnUnknownGateKeys(
  metadata: Record<string, unknown>,
  productLabel: string
) {
  const unknown = Object.keys(metadata).filter(
    (key) =>
      key.toLowerCase().startsWith("gate_") &&
      !GATE_METADATA_KEYS.includes(key as (typeof GATE_METADATA_KEYS)[number])
  )

  if (unknown.length > 0) {
    console.warn(
      `[product-gates] Llaves gate_* no reconocidas en "${productLabel}": ${unknown.join(
        ", "
      )}. Llaves válidas: ${GATE_METADATA_KEYS.join(", ")}`
    )
  }
}

function toRankLabel(raw: unknown): string | null {
  if (raw === undefined || raw === null) {
    return null
  }
  const label = String(raw).trim()
  return label === "" ? null : label
}

function toRankSource(raw: unknown): RankSource {
  const normalized = String(raw ?? "").trim().toLowerCase()
  return RANK_SOURCES.includes(normalized as RankSource)
    ? (normalized as RankSource)
    : "current"
}

export function getProductGateConfig(
  product: HttpTypes.StoreProduct
): ProductGateConfig {
  const metadata = (product.metadata ?? {}) as Record<string, unknown>

  warnOnUnknownGateKeys(metadata, product.handle ?? product.id ?? "producto")

  const matchesDefaultActiveSku = !!product.variants?.some((variant) =>
    DEFAULT_ACTIVE_MEMBERS_ONLY_SKUS.includes((variant.sku ?? "").toUpperCase())
  )
  const matchesDefaultReactivationHandle = DEFAULT_REACTIVATION_ONLY_HANDLES.includes(
    product.handle ?? ""
  )

  return {
    activeMembersOnly: toBoolean(
      metadata.gate_active_members_only,
      matchesDefaultActiveSku
    ),
    reactivationOnly: toBoolean(
      metadata.gate_reactivation_only,
      matchesDefaultReactivationHandle
    ),
    minDaysInactive: Math.max(0, toNumber(metadata.gate_min_days_inactive, 0)),
    requireEverQualified: toBoolean(metadata.gate_require_ever_qualified, false),
    minRank: toRankLabel(metadata.gate_min_rank),
    rankSource: toRankSource(metadata.gate_rank_source),
  }
}
