"use client"

import { useState, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { deleteLineItem } from "@lib/data/cart"

type BundleCartItemProps = {
  parentItem: HttpTypes.StoreCartLineItem
  childItems: HttpTypes.StoreCartLineItem[]
  currencyCode: string
}

const BundleCartItem: React.FC<BundleCartItemProps> = ({
  parentItem,
  childItems,
  currencyCode
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
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
      for (const childItem of childItems) {
        await deleteLineItem(childItem.id)
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
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      {/* Bundle Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-16 h-16 flex-shrink-0">
            <Thumbnail thumbnail={parentItem.thumbnail} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-gray-900">
              <LocalizedClientLink href={`/products/${parentItem.variant?.product?.handle}`}>
                {parentItem.title} (Bundle)
              </LocalizedClientLink>
            </h3>
            <LineItemOptions variant={parentItem.variant} />
            <p className="text-sm text-gray-500 mt-1">
              Quantity: {parentItem.quantity}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Items
          </Button>
          <button
            className="flex gap-x-1 text-red-600 hover:text-red-800 cursor-pointer disabled:opacity-50"
            onClick={handleRemoveBundle}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            <span>Remove Bundle</span>
          </button>
        </div>
      </div>

      {/* Bundle Price */}
      <div className="flex justify-end mb-3">
        <LineItemPrice
          item={parentItem}
          currencyCode={currencyCode}
        />
      </div>

      {/* Bundle Items */}
      {isExpanded && childItems.length > 0 && (
        <div className="border-t border-gray-200 pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Bundle Contents:
          </h4>
          <div className="space-y-2">
            {childItems.map((childItem) => (
              <div key={childItem.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-8 h-8 flex-shrink-0">
                    <Thumbnail thumbnail={childItem.thumbnail} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {childItem.title}
                    </p>
                    <LineItemOptions variant={childItem.variant} />
                    <p className="text-xs text-gray-500">
                      Qty: {childItem.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <LineItemPrice
                    item={childItem}
                    currencyCode={currencyCode}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BundleCartItem 