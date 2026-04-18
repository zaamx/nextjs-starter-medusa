import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex items-baseline gap-x-3">
        <span
          className={clx("font-display text-2xl", {
            "text-brand-magenta": selectedPrice.price_type === "sale",
            "text-grey-90": selectedPrice.price_type !== "sale",
          })}
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {!variant && <span className="text-sm font-sans font-normal text-grey-50 mr-1">Desde</span>}
          {selectedPrice.calculated_price}
        </span>
        {selectedPrice.price_type === "sale" && (
          <span
            className="text-sm text-grey-40 line-through"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
        )}
      </div>
      {selectedPrice.price_type === "sale" && (
        <span className="text-xs text-brand-magenta font-medium">
          -{selectedPrice.percentage_diff}% de descuento
        </span>
      )}
    </div>
  )
}
