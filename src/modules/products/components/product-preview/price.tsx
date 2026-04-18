import { clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) return null

  return (
    <div className="flex items-center gap-2">
      {price.price_type === "sale" && (
        <s className="text-xs text-grey-40" data-testid="original-price">
          {price.original_price}
        </s>
      )}
      <span
        className={clx("text-sm font-semibold", {
          "text-brand-magenta": price.price_type === "sale",
          "text-grey-70": price.price_type !== "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </div>
  )
}
