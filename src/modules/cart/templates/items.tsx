import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"
import BundleCartItem from "@modules/cart/components/bundle-cart-item"

// Utility functions for bundle grouping
function isBundleParent(item) {
  return !!item.metadata?.bundle_id;
}
function isBundleChild(item) {
  return !!item.metadata?.bundled_by;
}
function getBundleChildren(parent, items) {
  return items.filter(
    (item) => item.metadata?.bundled_by === parent.metadata.bundle_id
  );
}

// ItemsTemplate

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items || [];
  const parents = items.filter(isBundleParent);
  const children = items.filter(isBundleChild);
  const regulars = items.filter(item => !isBundleParent(item) && !isBundleChild(item));

  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">Carrito</Heading>
      </div>
      <Table>
        <Table.Header className="border-t-0">
          <Table.Row className="text-ui-fg-subtle txt-medium-plus">
            <Table.HeaderCell className="!pl-0">Artículo</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell>Cantidad</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell">
              Precio
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right">
              Total
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.length > 0 ? (
            <>
              {parents.map(parent => {
                const bundleChildren = getBundleChildren(parent, children);
                return (
                  <BundleCartItem
                    key={parent.id}
                    parentItem={parent}
                    childItems={bundleChildren}
                    currencyCode={cart?.currency_code}
                  />
                );
              })}
              {regulars.map(item => (
                <Item key={item.id} item={item} currencyCode={cart?.currency_code} />
              ))}
            </>
          ) : (
            repeat(5).map((i) => {
              return <SkeletonLineItem key={i} />
            })
          )}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
