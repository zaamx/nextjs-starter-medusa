"use client"

import { useState } from "react"

export type SortOptions = "price_asc" | "price_desc" | "created_at" | "default"

type SortProductsProps = {
  sortBy: SortOptions | undefined
  setQueryParams: (name: string, value: SortOptions | undefined) => void
  "data-testid"?: string
}

const sortOptions = [
  { value: "default", label: "Ordenar por" },
  { value: "created_at", label: "Últimos Arribos" },
  { value: "price_asc", label: "Precio: Menor → Mayor" },
  { value: "price_desc", label: "Precio: Mayor → Menor" },
]

const SortProducts = ({ "data-testid": dataTestId, setQueryParams }: SortProductsProps) => {
  const [activeSortBy, setActiveSortBy] = useState<SortOptions>("default")
  const [disableDefault, setDisableDefault] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortOptions
    if (value === "default") {
      setActiveSortBy("default")
      return
    }
    setDisableDefault(true)
    setActiveSortBy(value)
    setQueryParams("sortBy", value)
  }

  return (
    <div className="flex items-center gap-2" data-testid={dataTestId}>
      <span className="text-xs tracking-widest uppercase text-grey-50 hidden small:block">
        Ordenar
      </span>
      <select
        onChange={handleChange}
        value={activeSortBy}
        className="text-xs border border-grey-20 bg-white text-grey-70 px-3 py-2 focus:outline-none focus:border-brand-magenta transition-colors cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.value === "default" && disableDefault}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SortProducts
