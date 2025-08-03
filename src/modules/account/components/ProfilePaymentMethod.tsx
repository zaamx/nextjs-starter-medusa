"use client"

import React, { useMemo, useState, useEffect } from "react"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import AccountInfo from "./account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"
import { useActionState } from "react"

// Type for banks
interface Bank {
  id: number
  label: string
  legalname: string
  code: string
  markets: { name: string }
}

type PaymentMethodProps = {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}

const updatePaymentMethod = async (_currentState: Record<string, unknown>, formData: FormData) => {
  // Extract form values
  const country_code = formData.get("country_code") as string
  const currency = formData.get("currency") as string
  const bank = formData.get("bank") as string
  const account = formData.get("account") as string
  const repeat_account = formData.get("repeat_account") as string
  const clabe = formData.get("clabe") as string
  const repeat_clabe = formData.get("repeat_clabe") as string
  const phone_linked = formData.get("phone_linked") as string

  // Validation (repeat fields)
  if (account !== repeat_account) {
    return { success: false, error: "Las cuentas no coinciden" }
  }
  if (clabe !== repeat_clabe) {
    return { success: false, error: "Las CLABE/Routing no coinciden" }
  }

  // Build payment method object
  const paymentMethod = {
    country_code,
    currency,
    bank,
    account,
    clabe,
    phone_linked
  }

  // Merge with existing metadata
  const oldMetadata = (formData.get("old_metadata") as string) ? JSON.parse(formData.get("old_metadata") as string) : {}
  const newMetadata = {
    ...oldMetadata,
    netme_payment_method: paymentMethod
  }

  try {
    await updateCustomer({ metadata: newMetadata })
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.toString() }
  }
}

const ProfilePaymentMethod: React.FC<PaymentMethodProps> = ({ customer, regions }) => {
  const regionOptions = useMemo(() => {
    return (
      regions
        ?.map(region => region.countries?.map(country => ({
          value: country.iso_2,
          label: country.display_name,
          currency: region.currency_code // Use region's currency_code
        })))
        .flat() || []
    )
  }, [regions])

  // Get initial payment method from metadata if present
  const initialPayment = (customer.metadata?.netme_payment_method || {}) as any

  const [banks, setBanks] = useState<Bank[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>(initialPayment.country_code || "")
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([])
  const [currency, setCurrency] = useState<string>("")
  const [form, setForm] = useState({
    country_code: initialPayment.country_code || "",
    currency: initialPayment.currency || "",
    bank: initialPayment.bank || "",
    account: initialPayment.account || "",
    repeat_account: initialPayment.account || "",
    clabe: initialPayment.clabe || "",
    repeat_clabe: initialPayment.clabe || "",
    phone_linked: initialPayment.phone_linked || ""
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    import("@lib/data/banks.json")
      .then((mod) => setBanks(mod.default || mod))
      .catch(() => setBanks([]))
  }, [])

  useEffect(() => {
    if (selectedCountry) {
      setFilteredBanks(banks.filter(b => b.markets.name === selectedCountry.toUpperCase()))
      const region = regionOptions.find(r => r && r.value === selectedCountry)
      setCurrency(region?.currency || "")
      setForm(f => ({ ...f, currency: region?.currency || "" }))
    } else {
      setFilteredBanks([])
      setCurrency("")
      setForm(f => ({ ...f, currency: "" }))
    }
  }, [selectedCountry, banks, regionOptions])

  // Keep selectedCountry in sync with form.country_code (for edit mode)
  useEffect(() => {
    if (form.country_code && form.country_code !== selectedCountry) {
      setSelectedCountry(form.country_code)
    }
  }, [form.country_code])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === "country_code") setSelectedCountry(value)
  }

  const [state, formAction] = useActionState(updatePaymentMethod, { success: false, error: null })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    setError("")
    // Simple validation
    if (form.account !== form.repeat_account) {
      setError("Las cuentas no coinciden")
      return
    }
    if (form.clabe !== form.repeat_clabe) {
      setError("Las CLABE/Routing no coinciden")
      return
    }
    setSuccess(true)
    // For now, just log
    console.log("Payment method submitted:", form)
  }

  const currentInfo = (
    <div className="flex flex-col font-semibold" data-testid="current-info">
      <span>País: {form.country_code || "-"}</span>
      <span>Moneda: {form.currency || "-"}</span>
      <span>Banco: {filteredBanks.find(b => b.code === form.bank)?.label || "-"}</span>
      <span>Cuenta: {form.account ? "••••••••" : "-"}</span>
      <span>CLABE/Routing: {form.clabe ? "••••••••" : "-"}</span>
    </div>
  )

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="old_metadata" value={JSON.stringify(customer.metadata || {})} />
      <AccountInfo
        label="Método de pago"
        currentInfo={currentInfo}
        isSuccess={state.success}
        isError={!!state.error}
        errorMessage={state.error}
        clearState={() => {/* clear logic if needed */}}
        data-testid="account-payment-method-editor"
        // if customer has metadata.netme_payment_method, disable edit
        // disableEdit={!!customer.metadata?.netme_payment_method}
      >
        <div className="grid grid-cols-1 gap-y-2">
          <NativeSelect
            name="country_code"
            value={form.country_code}
            onChange={handleChange}
            required
            data-testid="payment-country-code-select"
          >
            <option value="">País</option>
            {regionOptions.map((option, i) => (
              option ? (
                <option key={i} value={option.value}>{option.label}</option>
              ) : null
            ))}
          </NativeSelect>
          <NativeSelect
            name="currency"
            value={form.currency}
            onChange={handleChange}
            required
            data-testid="payment-currency-select"
            disabled
          >
            <option value="">Moneda</option>
            {currency && <option value={currency}>{currency}</option>}
          </NativeSelect>
          <NativeSelect
            name="bank"
            value={form.bank}
            onChange={handleChange}
            required
            data-testid="payment-bank-select"
            disabled={!selectedCountry}
          >
            <option value="">Banco</option>
            {filteredBanks.map((bank) => (
              <option key={bank.id} value={bank.code}>{bank.label}</option>
            ))}
          </NativeSelect>
          <Input
            label="Cuenta"
            name="account"
            type="password"
            value={form.account}
            onChange={handleChange}
            required
            data-testid="payment-account-input"
          />
          <Input
            label="Repite la cuenta"
            name="repeat_account"
            value={form.repeat_account}
            onChange={handleChange}
            required
            data-testid="payment-repeat-account-input"
          />
          <Input
            label="CLABE o Número de Ruta"
            name="clabe"
            type="password"
            value={form.clabe}
            onChange={handleChange}
            required
            data-testid="payment-clabe-input"
          />
          <Input
            label="Repite la CLABE o Número de Ruta"
            name="repeat_clabe"
            value={form.repeat_clabe}
            onChange={handleChange}
            required
            data-testid="payment-repeat-clabe-input"
          />
          <Input
            label="Teléfono celular vinculado a la cuenta"
            name="phone_linked"
            type="tel"
            value={form.phone_linked}
            onChange={handleChange}
            required
            data-testid="payment-phone-linked-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePaymentMethod 