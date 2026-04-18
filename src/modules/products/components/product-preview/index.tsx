import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })

  return (
    <article className="flex flex-col group" data-testid="product-wrapper">
      {/* Image */}
      <LocalizedClientLink href={`/products/${product.handle}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-grey-10 mb-4">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors duration-300" />
        </div>
      </LocalizedClientLink>

      {/* Info */}
      <div className="flex flex-col gap-2 flex-1">
        <LocalizedClientLink href={`/products/${product.handle}`}>
          <h3
            className="font-display text-base tracking-wider text-grey-90 group-hover:text-brand-magenta transition-colors leading-tight"
            data-testid="product-title"
          >
            {product.title?.toUpperCase()}
          </h3>
        </LocalizedClientLink>

        {product.description && (
          <p className="text-xs text-grey-50 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {cheapestPrice && (
          <div className="mt-1">
            <PreviewPrice price={cheapestPrice} />
          </div>
        )}

        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="mt-3 block w-full bg-grey-90 text-white text-center font-display text-xs tracking-widest py-3 hover:bg-brand-magenta transition-colors"
        >
          COMPRAR AHORA
        </LocalizedClientLink>
      </div>
    </article>
  )
}
