"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useMemo } from "react"
import ReactCountryFlag from "react-country-flag"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type CountryOption = {
  country: string
  region: string
  label: string
}

type Props = {
  regions: HttpTypes.StoreRegion[]
}

export default function RegionSelectNav({ regions }: Props) {
  const { countryCode } = useParams()
  const currentPath = usePathname().split(`/${countryCode}`)[1]

  const options = useMemo(
    () =>
      regions
        .flatMap((r) =>
          (r.countries ?? []).map((c) => ({
            country: c.iso_2 ?? "",
            region: r.id,
            label: c.display_name ?? "",
          }))
        )
        .sort((a, b) => a.label.localeCompare(b.label)),
    [regions]
  )

  const current: CountryOption | null =
    options.find((o) => o.country === countryCode) ?? null

  const handleChange = (option: CountryOption) => {
    updateRegion(option.country, currentPath)
  }

  return (
    <Listbox value={current ?? options[0] ?? null} onChange={handleChange}>
      {({ open }) => (
        <div className="relative">
          <ListboxButton className="flex items-center gap-x-2 text-xs text-gray-600 hover:text-gray-900 transition-colors py-1">
            {current ? (
              <>
                {/* @ts-ignore */}
                <ReactCountryFlag svg countryCode={current.country} style={{ width: 16, height: 16 }} />
                <span>{current.label}</span>
              </>
            ) : (
              <span>Región</span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </ListboxButton>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute right-0 mt-1 max-h-60 w-48 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded z-50 text-xs no-scrollbar focus:outline-none">
              {options.map((o) => (
                <ListboxOption
                  key={o.country}
                  value={o}
                  className={({ active }) =>
                    `flex items-center gap-x-2 px-3 py-2 cursor-pointer ${
                      active ? "bg-gray-100" : ""
                    }`
                  }
                >
                  {/* @ts-ignore */}
                  <ReactCountryFlag svg countryCode={o.country} style={{ width: 14, height: 14 }} />
                  <span>{o.label}</span>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
