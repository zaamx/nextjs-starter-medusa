import { Button } from "@medusajs/ui"
import { useMemo, useState, useEffect } from "react"
import { FaTruck, FaBox, FaExternalLinkAlt } from "react-icons/fa"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
  networkOrder?: any
}

const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || url === '#' || url === '.' || url.trim() === '') {
    return false
  }
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

const OrderCard = ({ order, networkOrder }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const [trackingInfo, setTrackingInfo] = useState<{
    url: string | null
    number: string | null
    carrier: string | null
  }>({ url: null, number: null, carrier: null })

  const [shippingMethodName, setShippingMethodName] = useState<string | null>(null)
  const [fulfillmentStatusText, setFulfillmentStatusText] = useState<string | null>(null)

  useEffect(() => {
    // 1. Initial values from order props
    let initialShippingMethod = null
    if (networkOrder?.shipping_method) {
      initialShippingMethod = networkOrder.shipping_method
    } else if (order.shipping_methods && order.shipping_methods.length > 0) {
      const sm = order.shipping_methods[0] as any
      initialShippingMethod = sm?.name || sm?.shipping_option?.name || sm?.data?.name || (sm?.metadata as any)?.name
    }
    setShippingMethodName(initialShippingMethod)

    const status = order.fulfillment_status || networkOrder?.fulfillment_status
    if (status) {
      const translations: Record<string, string> = {
        fulfilled: 'Entregado',
        shipped: 'Enviado',
        partially_shipped: 'Envío Parcial',
        partially_fulfilled: 'Parcial',
        not_fulfilled: 'Pendiente',
        canceled: 'Cancelado'
      }
      setFulfillmentStatusText(translations[status] || status)
    }

    // 2. Extract tracking info helper
    const extractTracking = (ord: any) => {
      if (!ord.fulfillments || ord.fulfillments.length === 0) {
        return { url: null, number: null, carrier: null }
      }

      const findInObject = (obj: any, targetKeys: string[]): any => {
        if (!obj || typeof obj !== 'object') return null
        const entries = Object.entries(obj)
        for (const [key, value] of entries) {
          if (targetKeys.some(tk => key.toLowerCase().includes(tk.toLowerCase()))) {
            if (value && typeof value !== 'object') return String(value)
            if (value && typeof value === 'object') {
              const subValue = findInObject(value, ['number', 'id', 'tracking', 'code', 'guide'])
              if (subValue) return subValue
            }
          }
        }
        for (const [key, value] of entries) {
          if (typeof value === 'object') {
            const result = findInObject(value, targetKeys)
            if (result) return result
          }
        }
        return null
      }

      for (const fulfillment of ord.fulfillments) {
        let trUrl = null
        let trNumber = null
        let trCarrier = null

        if (fulfillment.tracking_links && fulfillment.tracking_links.length > 0) {
          trUrl = fulfillment.tracking_links[0].url
          trNumber = fulfillment.tracking_links[0].tracking_number
          trCarrier = fulfillment.tracking_links[0].carrier
        }

        if (!trNumber && fulfillment.labels && fulfillment.labels.length > 0) {
          trUrl = fulfillment.labels[0].tracking_url || fulfillment.labels[0].label_url
          trNumber = fulfillment.labels[0].tracking_number
        }

        if (!trNumber && fulfillment.tracking_numbers && fulfillment.tracking_numbers.length > 0) {
          trNumber = fulfillment.tracking_numbers[0]
        }

        if (!trNumber) {
          trNumber = findInObject(fulfillment, ['tracking', 'tracking_number', 'guide', 'shipping_number', 'guia'])
        }

        if (!trCarrier) {
          trCarrier = findInObject(fulfillment, ['carrier', 'paqueteria', 'shipped_via', 'method_name'])
        }

        if (trNumber && !trCarrier && fulfillment.provider_id) {
          const prov = fulfillment.provider_id.toLowerCase()
          if (!['manual', 'system', 'manual-fulfillment'].includes(prov)) {
            trCarrier = prov.charAt(0).toUpperCase() + prov.slice(1)
          }
        }

        if (trNumber) {
          let dispNumber = trNumber
          let dispUrl = trUrl

          if (trNumber.includes('http')) {
            dispUrl = trNumber
            try {
              const urlObj = new URL(trNumber)
              dispNumber = urlObj.searchParams.get('trknbr') || trNumber.substring(trNumber.lastIndexOf('=') + 1)
            } catch {
              dispNumber = "Guía"
            }
          } else if (!dispUrl && trNumber) {
            dispUrl = `https://www.fedex.com/fedextrack/?trknbr=${trNumber}`
          }

          return {
            url: dispUrl && isValidUrl(dispUrl) ? dispUrl : null,
            number: dispNumber,
            carrier: trCarrier || "Envío"
          }
        }
      }
      return { url: null, number: null, carrier: null }
    }

    // 3. Set initial tracking or fetch if needed
    const initialTracking = extractTracking(order)
    if (initialTracking.number) {
      setTrackingInfo(initialTracking)
    } else if (order.fulfillments && order.fulfillments.length > 0) {
      // Fetch full details with labels
      import('@lib/data/orders').then(({ retrieveOrderDetail }) => {
        retrieveOrderDetail(order.id).then((fullOrder) => {
          if (fullOrder) {
            const fullTracking = extractTracking(fullOrder)
            if (fullTracking.number) {
              setTrackingInfo(fullTracking)
            }
          }
        }).catch((err) => console.error("Error fetching order details:", err))
      })
    }
  }, [order, networkOrder])

  // Determine dynamic carrier styles exactly matching user snippet
  const carrierStyle = useMemo(() => {
    let style = "bg-purple-600 text-white hover:bg-purple-700"
    const carrierText = ((trackingInfo.url || "") + " " + (trackingInfo.carrier || "")).toLowerCase()
    if (carrierText.includes('fedex')) {
      style = "bg-purple-600 text-white hover:bg-purple-700"
    } else if (carrierText.includes('dhl')) {
      style = "bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
    } else if (carrierText.includes('estafeta')) {
      style = "bg-red-600 text-white hover:bg-red-700"
    }
    return style
  }, [trackingInfo])

  return (
    <div className="flex flex-col" data-testid="order-card">
      <div className="uppercase text-large-semi mb-1 flex items-center gap-2">
        <span>#<span data-testid="order-display-id">{order.display_id}</span></span>
      </div>
      
      {/* Meta info row with integrated Network & Logistics metrics right next to item count */}
      <div className="flex items-center flex-wrap gap-1.5 text-small-regular text-ui-fg-base">
        <span data-testid="order-created-at">
          {new Date(order.created_at).toDateString()}
        </span>
        <span className="text-gray-300 font-normal">|</span>
        <span data-testid="order-amount">
          {convertToLocale({
            amount: order.total,
            currency_code: order.currency_code,
          })}
        </span>
        <span className="text-gray-300 font-normal">|</span>
        <span className="font-medium">{`${numberOfLines} ${
          numberOfLines > 1 ? "items" : "item"
        }`}</span>

        {/* Mapped Network / MLM status badges and week info */}
        {networkOrder && (
          <span className="flex items-center gap-1.5 flex-wrap">
            <span className="text-gray-300 font-normal">|</span>
            {/* Period / Week Info */}
            {networkOrder.period_name ? (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {networkOrder.period_name}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Semana {networkOrder.periods_id}
              </span>
            )}

            {/* Sale Type badge */}
            {networkOrder.is_first_sale ? (
              <span className="bg-gray-900 text-white px-2 py-0.5 rounded-full font-bold text-[10px]">
                Primera Venta
              </span>
            ) : networkOrder.is_subscription ? (
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                Autoenvío
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                Re-orden
              </span>
            )}

            {/* CV & QV */}
            <span className="font-extrabold text-blue-600 text-xs ml-0.5">{(networkOrder.cv || 0).toLocaleString()} CV</span>
            <span className="text-gray-300 font-normal">|</span>
            <span className="font-extrabold text-purple-600 text-xs">{(networkOrder.qv || 0).toLocaleString()} QV</span>
          </span>
        )}

        {/* Logistics Information Capsules (From Image representation) */}
        {(shippingMethodName || fulfillmentStatusText || trackingInfo.number) && (
          <span className="flex items-center gap-1.5 flex-wrap">
            <span className="text-gray-300 font-normal">|</span>
            
            {/* Shipping Method Badge */}
            {shippingMethodName && (
              <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                <FaTruck className="text-cyan-600 text-[10px]" />
                {shippingMethodName}
              </span>
            )}

            {/* Fulfillment Status Badge */}
            {fulfillmentStatusText && (
              <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                <FaBox className="text-green-600 text-[10px]" />
                {fulfillmentStatusText}
              </span>
            )}

            {/* Tracking Number Badge / Button */}
            {trackingInfo.number && (
              trackingInfo.url ? (
                <a
                  href={trackingInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`${carrierStyle} px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs`}
                >
                  <FaExternalLinkAlt className="text-[10px]" />
                  <span>{trackingInfo.number}</span>
                </a>
              ) : (
                <span className={`${carrierStyle} px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 shadow-2xs`}>
                  <FaExternalLinkAlt className="text-[10px]" />
                  <span>{trackingInfo.number}</span>
                </span>
              )
            )}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 small:grid-cols-5 gap-2 my-4">
        {[...(order.items || [])].sort((a, b) => {
          const aIsPack = a.title.toLowerCase().includes('paquete');
          const bIsPack = b.title.toLowerCase().includes('paquete');
          if (aIsPack && !bIsPack) return -1;
          if (!aIsPack && bIsPack) return 1;
          return 0;
        }).map((i) => {
          return (
            <div
              key={i.id}
              className="flex flex-col gap-y-2 items-center text-center"
              data-testid="order-item"
            >
              <div className="w-24 h-24 rounded-lg border border-gray-200 shadow-sm bg-white flex items-center justify-center overflow-hidden">
                <Thumbnail thumbnail={i.thumbnail} images={[]} size="full" />
              </div>
              <div className="flex flex-col items-center text-small-regular text-ui-fg-base mt-1">
                <span
                  className="text-ui-fg-base font-semibold line-clamp-2 leading-tight"
                  data-testid="item-title"
                >
                  {i.title}
                </span>
                <span className="text-gray-500 font-medium text-xs mt-0.5">x <span data-testid="item-quantity">{i.quantity}</span></span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-end">
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button data-testid="order-details-link" variant="secondary">
            Ver detalles
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderCard
