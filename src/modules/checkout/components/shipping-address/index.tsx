import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"
import ProvinceSelect from "../province-select"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  // Helper function to parse address fields from address_1 and address_2
  const parseAddressFields = (address_1?: string, address_2?: string, metadata?: Record<string, any>) => {
    return {
      street_number: metadata?.street_number || address_1?.split(",")[0]?.trim() || "",
      interior_number: metadata?.interior_number || "",
      colonia: metadata?.colonia || address_1?.split(",")[1]?.trim() || "",
      localidad: "",
      referencias: metadata?.referencias || address_2 || "",
    }
  }

  const parsedFields = useMemo(() => {
    if (cart?.shipping_address) {
      return parseAddressFields(
        cart.shipping_address.address_1,
        cart.shipping_address.address_2,
        cart.shipping_address.metadata as Record<string, any> | undefined
      )
    }
    return parseAddressFields()
  }, [cart?.shipping_address])

  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.street_number": parsedFields.street_number,
    "shipping_address.interior_number": parsedFields.interior_number,
    "shipping_address.colonia": parsedFields.colonia,
    "shipping_address.localidad": cart?.shipping_address?.city || parsedFields.localidad,
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    "shipping_address.referencias": parsedFields.referencias,
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      const parsed = parseAddressFields(
        address.address_1,
        address.address_2,
        address.metadata as Record<string, any> | undefined
      )
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.street_number": parsed.street_number,
        "shipping_address.interior_number": parsed.interior_number,
        "shipping_address.colonia": parsed.colonia,
        "shipping_address.localidad": address?.city || parsed.localidad,
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
        "shipping_address.referencias": parsed.referencias,
      }))
    }

    if (email) {
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
    }
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      const parsed = parseAddressFields(
        cart.shipping_address.address_1,
        cart.shipping_address.address_2,
        cart.shipping_address.metadata as Record<string, any> | undefined
      )
      setFormData((prevState) => ({
        ...prevState,
        "shipping_address.street_number": parsed.street_number,
        "shipping_address.interior_number": parsed.interior_number,
        "shipping_address.colonia": parsed.colonia,
        "shipping_address.localidad": cart.shipping_address?.city || parsed.localidad,
        "shipping_address.referencias": parsed.referencias,
      }))
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    }
    
    // Clear province when country changes
    if (e.target.name === "shipping_address.country_code") {
      newFormData["shipping_address.province"] = ""
    }
    
    setFormData(newFormData)
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Apellido"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <Input
          label="Calle y número exterior"
          name="shipping_address.street_number"
          autoComplete="address-line1"
          value={formData["shipping_address.street_number"]}
          onChange={handleChange}
          required
          data-testid="shipping-street-number-input"
        />
        <Input
          label="Número interior (si aplica)"
          name="shipping_address.interior_number"
          autoComplete="address-line2"
          value={formData["shipping_address.interior_number"]}
          onChange={handleChange}
          data-testid="shipping-interior-number-input"
        />
        <Input
          label="Colonia"
          name="shipping_address.colonia"
          autoComplete="address-line2"
          value={formData["shipping_address.colonia"]}
          onChange={handleChange}
          required
          data-testid="shipping-colonia-input"
        />
        <Input
          label="Empresa"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
        <Input
          label="Localidad (ciudad, municipio o alcaldía)"
          name="shipping_address.localidad"
          autoComplete="address-level2"
          value={formData["shipping_address.localidad"]}
          onChange={handleChange}
          required
          data-testid="shipping-localidad-input"
        />
        <Input
          label="Código postal"
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-postal-code-input"
        />
        <CountrySelect
          name="shipping_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["shipping_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-country-select"
        />
        <ProvinceSelect
          name="shipping_address.province"
          autoComplete="address-level1"
          countryCode={formData["shipping_address.country_code"]}
          value={formData["shipping_address.province"]}
          onChange={handleChange}
          required
          data-testid="shipping-province-select"
        />
        <Input
          label="Referencias (opcionales)"
          name="shipping_address.referencias"
          autoComplete="off"
          value={formData["shipping_address.referencias"]}
          onChange={handleChange}
          data-testid="shipping-referencias-input"
        />
      </div>
      {/* Hidden inputs for backward compatibility with Medusa API */}
      <input
        type="hidden"
        name="shipping_address.address_1"
        value={`${formData["shipping_address.street_number"] || ""}${formData["shipping_address.colonia"] ? `, ${formData["shipping_address.colonia"]}` : ""}`.trim()}
      />
      <input
        type="hidden"
        name="shipping_address.address_2"
        value={`${formData["shipping_address.interior_number"] || ""}${formData["shipping_address.referencias"] ? (formData["shipping_address.interior_number"] ? `, ${formData["shipping_address.referencias"]}` : formData["shipping_address.referencias"]) : ""}`.trim()}
      />
      <input
        type="hidden"
        name="shipping_address.city"
        value={formData["shipping_address.localidad"] || ""}
      />
      <div className="my-8">
        <Checkbox
                      label="Dirección de facturación igual a la de envío"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
                          title="Ingresa una dirección de email válida."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />
        <Input
          label="Teléfono"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          data-testid="shipping-phone-input"
        />
      </div>
    </>
  )
}

export default ShippingAddress
