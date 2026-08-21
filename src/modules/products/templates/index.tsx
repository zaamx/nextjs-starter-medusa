import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import ProductTemplateWrapper from "./product-template-wrapper"
import BundleAwareActions from "@modules/products/components/bundle-aware-actions"
import { HttpTypes } from "@medusajs/types"
import ActivationGate from "@modules/products/components/activation-gate"
import ActiveMemberGate from "@modules/products/components/active-member-gate"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <ProductTemplateWrapper
      product={product}
      region={region}
      countryCode={countryCode}
    >
      {/* Main product section — 2 column layout */}
      <div className="content-container py-12" data-testid="product-container">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-x-16 gap-y-8 items-start">

          {/* Left — Gallery (sticky on desktop) */}
          <div className="small:sticky small:top-24">
            <ImageGallery images={product?.images || []} />
          </div>

          {/* Right — Title → Price+Actions → Description → Tabs */}
          <div className="flex flex-col gap-y-8">
            {/* Nombre arriba del todo */}
            <ProductInfo product={product} />
            <ProductOnboardingCta />
            {/* Precio + opciones de compra */}
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ActivationGate product={product} countryCode={countryCode}>
                <ActiveMemberGate product={product} countryCode={countryCode}>
                  <BundleAwareActions
                    product={product}
                    region={region}
                    countryCode={countryCode}
                  />
                </ActiveMemberGate>
              </ActivationGate>
            </Suspense>
            {/* Descripción debajo de las acciones */}
            <ProductInfo product={product} descriptionOnly />
            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      {/* Related products */}
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </ProductTemplateWrapper>
  )
}

export default ProductTemplate
