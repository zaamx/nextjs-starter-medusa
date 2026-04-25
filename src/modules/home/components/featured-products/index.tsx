import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { getProductPrice } from "@lib/util/get-product-price"

type FeaturedProductsProps = {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}

export default async function FeaturedProducts({ collections, region }: FeaturedProductsProps) {
  const featuredCollections = collections.slice(0, 3)
  const countryCode = region.countries?.[0]?.iso_2 ?? "us"

  const productsByCollection = await Promise.all(
    featuredCollections.map(async (collection) => {
      try {
        const { response } = await listProducts({
          pageParam: 1,
          queryParams: {
            limit: 1,
            region_id: region.id,
            collection_id: [collection.id],
            fields: "+variants.calculated_price",
          },
          countryCode,
        })
        return { collection, product: response?.products?.[0] ?? null }
      } catch {
        return { collection, product: null }
      }
    })
  )

  const validItems = productsByCollection.filter((p) => p.product !== null)

  if (validItems.length === 0) return null

  return (
    <section className="bg-white py-24">
      <div className="content-container">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] text-grey-50 uppercase mb-4">
            Explora Productos
          </p>
          <h2
            className="font-display text-grey-90"
            style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
          >
            ENCUENTRA TU FÓRMULA
          </h2>
        </div>

        <div className="grid grid-cols-1 small:grid-cols-3 gap-8">
          {validItems.map(({ collection, product }) => {
            if (!product) return null
            const { cheapestPrice } = getProductPrice({ product })

            return (
              <article key={collection.id} className="flex flex-col">
                <LocalizedClientLink href={`/products/${product.handle}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-grey-10 mb-6 group">
                    <span className="absolute top-3 left-3 z-10 text-[10px] tracking-widest border border-grey-90 text-grey-90 px-2 py-1 bg-white/80">
                      SUMINISTRO 30 DÍAS
                    </span>
                    {product.thumbnail ? (
                      <Image
                        src={product.thumbnail}
                        alt={product.title ?? "Producto"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="font-display text-grey-40 text-xl">WENOW</span>
                      </div>
                    )}
                  </div>
                </LocalizedClientLink>

                <div className="flex flex-col gap-3">
                  <h3 className="font-display text-xl tracking-wider text-grey-90">
                    {product.title?.toUpperCase()}
                  </h3>
                  <p className="text-sm text-grey-50 line-clamp-1">
                    {product.description}
                  </p>

                  {cheapestPrice && (
                    <div className="flex items-center gap-2">
                      {cheapestPrice.price_type === "sale" && (
                        <s className="text-sm text-grey-40">
                          {cheapestPrice.original_price}
                        </s>
                      )}
                      <span className="text-sm font-semibold text-brand-magenta">
                        {cheapestPrice.calculated_price}
                      </span>
                    </div>
                  )}

                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    className="block w-full bg-grey-90 text-white text-center font-display text-sm tracking-widest py-4 hover:bg-grey-80 transition-colors mt-2"
                  >
                    COMPRAR AHORA
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    className="block text-center text-xs tracking-widest text-grey-50 hover:text-brand-magenta transition-colors"
                  >
                    SUSCRÍBETE Y AHORRA 30%
                  </LocalizedClientLink>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
