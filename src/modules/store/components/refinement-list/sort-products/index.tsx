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
  { value: "price_asc", label: "Precio: Menor -> Mayor" },
  { value: "price_desc", label: "Precio: Mayor -> Menor" },
]

const SortProducts = ({ "data-testid": dataTestId, setQueryParams }: SortProductsProps) => {
  const [activeSortBy, setActiveSortBy] = useState<SortOptions>("default")
  const [disableDefault, setDisableDefault] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SortOptions

    // Si se selecciona "default" NO hacemos nada
    if (value === "default") {
      setActiveSortBy("default")
      return
    }

    // Una vez que selecciona otra opción, bloqueamos la default
    setDisableDefault(true)
    setActiveSortBy(value)
    setQueryParams("sortBy", value)
  }

  return (
    <div className="flex gap-2 items-center" data-testid={dataTestId}>
      <select
        id="sort-by"
        onChange={handleChange}
        value={activeSortBy}
        className="text-sm p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
