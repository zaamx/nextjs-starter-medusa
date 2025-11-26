import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import React, { useMemo, useState } from "react"
import CountrySelect from "../country-select"
import ProvinceSelect from "../province-select"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
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
    if (cart?.billing_address) {
      return parseAddressFields(
        cart.billing_address.address_1,
        cart.billing_address.address_2,
        cart.billing_address.metadata as Record<string, any> | undefined
      )
    }
    return parseAddressFields()
  }, [cart?.billing_address])

  const [formData, setFormData] = useState<any>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.street_number": parsedFields.street_number,
    "billing_address.interior_number": parsedFields.interior_number,
    "billing_address.colonia": parsedFields.colonia,
    "billing_address.localidad": cart?.billing_address?.city || parsedFields.localidad,
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code": cart?.billing_address?.country_code || "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
    "billing_address.referencias": parsedFields.referencias,
  })

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
    if (e.target.name === "billing_address.country_code") {
      newFormData["billing_address.province"] = ""
    }
    
    setFormData(newFormData)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="billing-first-name-input"
        />
        <Input
          label="Apellido"
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="billing-last-name-input"
        />
        <Input
          label="Calle y número exterior"
          name="billing_address.street_number"
          autoComplete="address-line1"
          value={formData["billing_address.street_number"]}
          onChange={handleChange}
          required
          data-testid="billing-street-number-input"
        />
        <Input
          label="Número interior (si aplica)"
          name="billing_address.interior_number"
          autoComplete="address-line2"
          value={formData["billing_address.interior_number"]}
          onChange={handleChange}
          data-testid="billing-interior-number-input"
        />
        <Input
          label="Colonia"
          name="billing_address.colonia"
          autoComplete="address-line2"
          value={formData["billing_address.colonia"]}
          onChange={handleChange}
          required
          data-testid="billing-colonia-input"
        />
        <Input
          label="Empresa"
          name="billing_address.company"
          value={formData["billing_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="billing-company-input"
        />
        <Input
          label="Localidad (ciudad, municipio o alcaldía)"
          name="billing_address.localidad"
          autoComplete="address-level2"
          value={formData["billing_address.localidad"]}
          onChange={handleChange}
          required
          data-testid="billing-localidad-input"
        />
        <Input
          label="Código postal"
          name="billing_address.postal_code"
          autoComplete="postal-code"
          value={formData["billing_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="billing-postal-input"
        />
        <CountrySelect
          name="billing_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["billing_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="billing-country-select"
        />
        <ProvinceSelect
          name="billing_address.province"
          autoComplete="address-level1"
          countryCode={formData["billing_address.country_code"]}
          value={formData["billing_address.province"]}
          onChange={handleChange}
          required
          data-testid="billing-province-select"
        />
        <Input
          label="Referencias (opcionales)"
          name="billing_address.referencias"
          autoComplete="off"
          value={formData["billing_address.referencias"]}
          onChange={handleChange}
          data-testid="billing-referencias-input"
        />
        <Input
          label="Teléfono"
          name="billing_address.phone"
          autoComplete="tel"
          value={formData["billing_address.phone"]}
          onChange={handleChange}
          data-testid="billing-phone-input"
        />
      </div>
      {/* Hidden inputs for backward compatibility with Medusa API */}
      <input
        type="hidden"
        name="billing_address.address_1"
        value={`${formData["billing_address.street_number"] || ""}${formData["billing_address.colonia"] ? `, ${formData["billing_address.colonia"]}` : ""}`.trim()}
      />
      <input
        type="hidden"
        name="billing_address.address_2"
        value={`${formData["billing_address.interior_number"] || ""}${formData["billing_address.referencias"] ? (formData["billing_address.interior_number"] ? `, ${formData["billing_address.referencias"]}` : formData["billing_address.referencias"]) : ""}`.trim()}
      />
      <input
        type="hidden"
        name="billing_address.city"
        value={formData["billing_address.localidad"] || ""}
      />
    </>
  )
}

export default BillingAddress
