import { Container } from "@medusajs/ui"

import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const cardClass =
  "bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-4 min-h-[140px] border border-gray-100"
const headingClass =
  "text-xl font-bold text-gray-900 mb-1 tracking-tight leading-tight"
const labelClass =
  "text-sm text-gray-500 font-medium"
const valueClass =
  "text-2xl font-extrabold text-gray-800 tracking-tight"

const Overview = ({ customer, orders }: OverviewProps) => {
  return (
    <div data-testid="overview-page-wrapper" className="p-8">
      {/* DASHBOARD GRID */}
      <div className="text-xl-semi flex justify-between items-center mb-4">
        <span data-testid="welcome-message" data-value={customer?.first_name}>
          Hello {customer?.first_name}
        </span>
        <span className="text-small-regular  text-ui-fg-base">
          Signed in as:{" "}
          <span
            className="font-semibold"
            data-testid="customer-email"
            data-value={customer?.email}
          >
            {customer?.email}
          </span>
        </span>
      </div>
      {/*
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
        
        <div className={cardClass}>
          <h3 className={headingClass}>Volumen total del ciclo</h3>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-baseline gap-2">
              <span className={labelClass}>CV:</span>
              <span className={valueClass}>12,500</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={labelClass}>GV:</span>
              <span className={valueClass}>8,200</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={labelClass}>PV:</span>
              <span className={valueClass}>3,100</span>
            </div>
          </div>
        </div>
        
        <div className={cardClass}>
          <h3 className={headingClass}>Ventas personales</h3>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-baseline gap-2">
              <span className={labelClass}>Hoy:</span>
              <span className={valueClass}>$1,200</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={labelClass}>Semana:</span>
              <span className={valueClass}>$5,400</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={labelClass}>Mes:</span>
              <span className={valueClass}>$18,000</span>
            </div>
          </div>
        </div>
        
        <div className={cardClass}>
          <h3 className={headingClass}>Billetera</h3>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-baseline gap-2">
              <span className={labelClass}>Disponible:</span>
              <span className={valueClass}>$2,500</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={labelClass}>Pendiente:</span>
              <span className={valueClass}>$800</span>
            </div>
          </div>
        </div>
        
        <div className={cardClass + " xl:col-span-1 md:col-span-2"}>
          <h3 className={headingClass}>Rango actual vs. rango meta</h3>
          <div className="flex flex-col gap-2 mt-2 w-full">
            <div className="flex items-baseline gap-2">
              <span className={labelClass}>Rango actual:</span>
              <span className={valueClass}>Plata</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={labelClass}>Meta:</span>
              <span className={valueClass}>Oro</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: '60%' }} />
            </div>
            <span className="text-xs text-blue-600 mt-1 font-semibold">60% hacia el siguiente rango</span>
          </div>
        </div>
        
        <div className={cardClass + " xl:col-span-1 md:col-span-2"}>
          <h3 className={headingClass}>Alertas de calificación</h3>
          <ul className="list-disc pl-5 text-base text-red-600 mt-2 space-y-1">
            <li><span className="font-semibold">Pierna débil:</span> Falta 1,000 CV</li>
            <li><span className="font-semibold">Requisito de patrocinados:</span> Falta 1 directo</li>
            <li><span className="font-semibold">Vencimiento de autoship:</span> 3 días</li>
          </ul>
        </div>
        
        <div className={cardClass + " xl:col-span-1 md:col-span-2"}>
          <h3 className={headingClass}>Próximo corte de comisiones</h3>
          <span className="mb-2 text-lg font-semibold text-gray-700">20 de mayo, 2024</span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-mono font-bold text-blue-700">02:13:45</span>
            <span className="text-xs text-gray-400">hh:mm:ss</span>
          </div>
        </div>
      </div>
      */}
      {/* Optionally, keep the rest of the old overview content below for now */}
      {/* <div className="hidden small:block">
        <div className="flex flex-col py-8 border-t border-gray-200">
          <div className="flex flex-col gap-y-4 h-full col-span-1 row-span-2 flex-1">
            <div className="flex items-start gap-x-16 mb-6">
              <div className="flex flex-col gap-y-4">
                <h3 className="text-large-semi">Profile</h3>
                <div className="flex items-end gap-x-2">
                  <span
                    className="text-3xl-semi leading-none"
                    data-testid="customer-profile-completion"
                    data-value={getProfileCompletion(customer)}
                  >
                    {getProfileCompletion(customer)}%
                  </span>
                  <span className="uppercase text-base-regular text-ui-fg-subtle">
                    Completed
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                <h3 className="text-large-semi">Addresses</h3>
                <div className="flex items-end gap-x-2">
                  <span
                    className="text-3xl-semi leading-none"
                    data-testid="addresses-count"
                    data-value={customer?.addresses?.length || 0}
                  >
                    {customer?.addresses?.length || 0}
                  </span>
                  <span className="uppercase text-base-regular text-ui-fg-subtle">
                    Saved
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-2">
                <h3 className="text-large-semi">Recent orders</h3>
              </div>
              <ul
                className="flex flex-col gap-y-4"
                data-testid="orders-wrapper"
              >
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => {
                    return (
                      <li
                        key={order.id}
                        data-testid="order-wrapper"
                        data-value={order.id}
                      >
                        <LocalizedClientLink
                          href={`/account/orders/details/${order.id}`}
                        >
                          <Container className="bg-gray-50 flex justify-between items-center p-4">
                            <div className="grid grid-cols-3 grid-rows-2 text-small-regular gap-x-4 flex-1">
                              <span className="font-semibold">Date placed</span>
                              <span className="font-semibold">
                                Order number
                              </span>
                              <span className="font-semibold">
                                Total amount
                              </span>
                              <span data-testid="order-created-date">
                                {new Date(order.created_at).toDateString()}
                              </span>
                              <span
                                data-testid="order-id"
                                data-value={order.display_id}
                              >
                                #{order.display_id}
                              </span>
                              <span data-testid="order-amount">
                                {convertToLocale({
                                  amount: order.total,
                                  currency_code: order.currency_code,
                                })}
                              </span>
                            </div>
                            <button
                              className="flex items-center justify-between"
                              data-testid="open-order-button"
                            >
                              <span className="sr-only">
                                Go to order #{order.display_id}
                              </span>
                              <ChevronDown className="-rotate-90" />
                            </button>
                          </Container>
                        </LocalizedClientLink>
                      </li>
                    )
                  })
                ) : (
                  <span data-testid="no-orders-message">No recent orders</span>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
