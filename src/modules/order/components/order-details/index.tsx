import { HttpTypes } from "@medusajs/types"
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
    return position === 1 ? "Right" : "Left"
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
        We have sent the order confirmation details to{" "}
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
          Customer:{" "}
          <span className="text-ui-fg-medium-plus font-semibold" data-testid="customer-name">
            {customer.first_name} {customer.last_name}
          </span>         
        </Text>
      )}

      {hasWeNowMetadata && (
        <div className="mt-4 p-4 bg-ui-bg-base-hover rounded-lg border border-ui-border-base">
          <Text className="text-lg font-semibold text-ui-fg-base mb-2">
            Welcome to WeNow Network!
          </Text>
          <Text className="text-sm text-ui-fg-subtle mb-2">
            You are now part of our network with the following details:
          </Text>
          <div className="space-y-1 text-sm">
            <Text>
              <span className="font-medium">Network Position:</span>{" "}
              <span className="text-ui-fg-interactive">
                {getBinaryPositionText(binaryPosition)}
              </span>
            </Text>
            <Text>
              <span className="font-medium">Your Profile ID:</span>{" "}
              <span className="text-ui-fg-interactive">
                {netmeProfileId}
              </span>
            </Text>
            <Text>
              <span className="font-medium">Sponsor Profile ID:</span>{" "}
              <span className="text-ui-fg-interactive">
                {sponsorProfileId}
              </span>
            </Text>
          </div>
        </div>
      )}
      
      <Text className="mt-2">
        Order date:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Order number: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Order status:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              Payment status:{" "}
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
