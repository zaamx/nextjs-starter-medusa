import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product, descriptionOnly }: ProductInfoProps & { descriptionOnly?: boolean }) => {
  if (descriptionOnly) {
    return product.description ? (
      <p
        className="text-sm text-grey-50 leading-relaxed whitespace-pre-line"
        data-testid="product-description"
      >
        {product.description}
      </p>
    ) : null
  }

  return (
    <div id="product-info" className="flex flex-col gap-y-3">
      {product.collection && (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="text-xs tracking-[0.2em] uppercase text-brand-magenta hover:text-brand-magenta/70 transition-colors"
        >
          {product.collection.title}
        </LocalizedClientLink>
      )}

      <h1
        className="font-display text-grey-90 leading-none"
        style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
        data-testid="product-title"
      >
        {product.title?.toUpperCase()}
      </h1>
    </div>
  )
}

export default ProductInfo
