import { HttpTypes } from "@medusajs/types"
import { formatDateToMexicoCity } from "@lib/util/date"
import { Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
  customer?: HttpTypes.StoreCustomer | null
}

const OrderDetails = ({ order, showStatus, customer }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  const getBinaryPositionText = (position: number) => {
    return position === 1 ? "Derecha" : "Izquierda"
  }

  // Check if customer has the required metadata
  const hasWeNowMetadata = customer?.metadata &&
    typeof customer.metadata.binary_position === 'number' &&
    typeof customer.metadata.netme_profile_id === 'number' &&
    typeof customer.metadata.sponsor_profile_id === 'number'

  // Safely get metadata values
  const binaryPosition = customer?.metadata?.binary_position as number
  const netmeProfileId = customer?.metadata?.netme_profile_id as number
  const sponsorProfileId = customer?.metadata?.sponsor_profile_id as number

  return (
    <div>
      <Text>
        Hemos enviado los detalles de confirmación del pedido a{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>

      {customer && (
        <Text className="mt-2">
          Cliente:{" "}
          <span className="text-ui-fg-medium-plus font-semibold" data-testid="customer-name">
            {customer.first_name} {customer.last_name}
          </span>
        </Text>
      )}

      {hasWeNowMetadata && (
        <div className="mt-4 p-4 bg-ui-bg-base-hover rounded-lg border border-ui-border-base">
          <Text className="text-lg font-semibold text-ui-fg-base mb-2">
            ¡Bienvenido a la Red WeNow!
          </Text>
          <Text className="text-sm text-ui-fg-subtle mb-2">
            Ahora eres parte de nuestra red con los siguientes detalles:
          </Text>
          <div className="space-y-1 text-sm">
            <Text>
              <span className="font-medium">Posición en la Red:</span>{" "}
              <span className="text-ui-fg-interactive">
                {getBinaryPositionText(binaryPosition)}
              </span>
            </Text>
            <Text>
              <span className="font-medium">Tu ID de Perfil:</span>{" "}
              <span className="text-ui-fg-interactive">
                {netmeProfileId}
              </span>
            </Text>
            <Text>
              <span className="font-medium">ID de Perfil del Patrocinador:</span>{" "}
              <span className="text-ui-fg-interactive">
                {sponsorProfileId}
              </span>
            </Text>
          </div>
        </div>
      )}

      <Text className="mt-2">
        Fecha del pedido:{" "}
        <span data-testid="order-date">
          {formatDateToMexicoCity(order.created_at)}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Número de orden: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Estado de la orden:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              Estado del pago:{" "}
              <span
                className="text-ui-fg-subtle "
                sata-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
