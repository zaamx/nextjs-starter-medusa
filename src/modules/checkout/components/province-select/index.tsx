import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"
import { Label } from "@medusajs/ui"
import NativeSelect, {
  NativeSelectProps,
} from "@modules/common/components/native-select"
import allRegions from "@lib/allregions.json"

type ProvinceSelectProps = NativeSelectProps & {
  countryCode?: string
  label?: string
  required?: boolean
}

const ProvinceSelect = forwardRef<
  HTMLSelectElement,
  ProvinceSelectProps
>(({ placeholder = "Selecciona Estado/Provincia", countryCode, defaultValue, label, required, ...props }, ref) => {
  const innerRef = useRef<HTMLSelectElement>(null)

  useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
    ref,
    () => innerRef.current
  )

  const provinceOptions = useMemo(() => {
    if (!countryCode) {
      return []
    }

    const countryData = allRegions[countryCode as keyof typeof allRegions]
    if (!countryData || !countryData.region) {
      return []
    }

    return Object.entries(countryData.region).map(([code, name]) => ({
      value: code,
      label: name,
    }))
  }, [countryCode])

  return (
    <div className="flex flex-col w-full">
      {label && (
        <Label className="mb-2 txt-compact-medium-plus">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </Label>
      )}
      <NativeSelect
        ref={innerRef}
        placeholder={placeholder}
        defaultValue={props.value === undefined ? defaultValue : undefined}
        required={required}
        {...props}
      >
        {provinceOptions?.map(({ value, label }, index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
    </div>
  )
})

ProvinceSelect.displayName = "ProvinceSelect"

export default ProvinceSelect

