"use client"

import { useState, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { Table, Text, clx } from "@medusajs/ui"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { deleteLineItem } from "@lib/data/cart"

type BundleCartItemProps = {
  parentItem: HttpTypes.StoreCartLineItem
  childItems: HttpTypes.StoreCartLineItem[]
  currencyCode: string
  type?: "full" | "preview"
}

const BundleCartItem: React.FC<BundleCartItemProps> = ({
  parentItem,
  childItems,
  currencyCode,
  type = "full"
}) => {
  const [isRemoving, setIsRemoving] = useState(false)

  // Check if this is actually a bundle
  const isBundle = useMemo(() => {
    return parentItem.metadata?.bundle_id || childItems.length > 0
  }, [parentItem.metadata, childItems])

  // Handle bundle removal
  const handleRemoveBundle = async () => {
    if (!isBundle) return
    
    setIsRemoving(true)
    try {
      // Remove parent item first
      await deleteLineItem(parentItem.id)
      
      // Remove all child items
      for (const child of childItems) {
        await deleteLineItem(child.id)
      }
    } catch (error) {
      console.error('Failed to remove bundle:', error)
    } finally {
      setIsRemoving(false)
    }
  }

  if (!isBundle) {
    return null
  }

  return (
    <>
      {/* Parent Bundle Item */}
      <Table.Row className="w-full bg-gray-50" data-testid="bundle-product-row">
        <Table.Cell className="!pl-0 p-4 w-24">
          <LocalizedClientLink
            href={`/products/${parentItem.product_handle}`}
            className={clx("flex", {
              "w-16": type === "preview",
              "small:w-24 w-12": type === "full",
            })}
          >
            <Thumbnail
              thumbnail={parentItem.thumbnail}
              images={parentItem.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>
        </Table.Cell>

        <Table.Cell className="text-left">
          <Text
            className="txt-medium-plus text-ui-fg-base"
            data-testid="bundle-product-title"
          >
            {parentItem.product_title} (Paquete)
          </Text>
          <LineItemOptions variant={parentItem.variant} data-testid="bundle-product-variant" />
        </Table.Cell>

        {type === "full" && (
          <Table.Cell>
            <div className="flex gap-2 items-center w-28">
              <button
                className="flex gap-x-1 text-red-600 hover:text-red-800 cursor-pointer disabled:opacity-50"
                onClick={handleRemoveBundle}
                disabled={isRemoving}
                data-testid="bundle-delete-button"
              >
                {isRemoving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                <span>Eliminar</span>
              </button>
            </div>
          </Table.Cell>
        )}

        {type === "full" && (
          <Table.Cell className="hidden small:table-cell">
            <LineItemUnitPrice
              item={parentItem}
              style="tight"
              currencyCode={currencyCode}
            />
          </Table.Cell>
        )}

        <Table.Cell className="!pr-0">
          <span
            className={clx("!pr-0", {
              "flex flex-col items-end h-full justify-center": type === "preview",
            })}
          >
            {type === "preview" && (
              <span className="flex gap-x-1 ">
                <Text className="text-ui-fg-muted">{parentItem.quantity}x </Text>
                <LineItemUnitPrice
                  item={parentItem}
                  style="tight"
                  currencyCode={currencyCode}
                />
              </span>
            )}
            <LineItemPrice
              item={parentItem}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
        </Table.Cell>
      </Table.Row>

      {/* Bundle Child Items */}
      {childItems.map((childItem) => (
        <Table.Row key={childItem.id} className="w-full bg-gray-100" data-testid="bundle-child-row">
          <Table.Cell className="!pl-0 p-4 w-24">
            <div className="pl-4">
              <LocalizedClientLink
                href={`/products/${childItem.product_handle}`}
                className={clx("flex", {
                  "w-16": type === "preview",
                  "small:w-24 w-12": type === "full",
                })}
              >
                <Thumbnail
                  thumbnail={childItem.thumbnail}
                  images={childItem.variant?.product?.images}
                  size="square"
                />
              </LocalizedClientLink>
            </div>
          </Table.Cell>

          <Table.Cell className="text-left">
            <div className="pl-4">
              <Text
                className="txt-medium text-ui-fg-muted"
                data-testid="bundle-child-title"
              >
                {childItem.product_title}
              </Text>
              <LineItemOptions variant={childItem.variant} data-testid="bundle-child-variant" />
            </div>
          </Table.Cell>

          {type === "full" && (
            <Table.Cell>
              <div className="flex gap-2 items-center w-28">
                <Text className="text-sm text-gray-500">
                  
                  
                  
                  : {childItem.quantity}
                </Text>
              </div>
            </Table.Cell>
          )}

          {type === "full" && (
            <Table.Cell className="hidden small:table-cell">
              <LineItemUnitPrice
                item={childItem}
                style="tight"
                currencyCode={currencyCode}
              />
            </Table.Cell>
          )}

          <Table.Cell className="!pr-0">
            <span
              className={clx("!pr-0", {
                "flex flex-col items-end h-full justify-center": type === "preview",
              })}
            >
              {type === "preview" && (
                <span className="flex gap-x-1 ">
                  <Text className="text-ui-fg-muted">{childItem.quantity}x </Text>
                  <LineItemUnitPrice
                    item={childItem}
                    style="tight"
                    currencyCode={currencyCode}
                  />
                </span>
              )}
              <LineItemPrice
                item={childItem}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          </Table.Cell>
        </Table.Row>
      ))}
    </>
  )
}

export default BundleCartItem 