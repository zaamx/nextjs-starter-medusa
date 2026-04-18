import { listRegions } from "@lib/data/regions"
import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { StoreRegion } from "@medusajs/types"
import NavClient from "./nav-client"

export default async function Nav() {
  const [regions, cart, customer] = await Promise.all([
    listRegions().then((r: StoreRegion[]) => r),
    retrieveCart().catch(() => null),
    retrieveCustomer().catch(() => null),
  ])

  return <NavClient regions={regions} cart={cart} isAuthenticated={!!customer} />
}
