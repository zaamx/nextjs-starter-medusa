"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "@modules/layout/components/country-select/"
import { HttpTypes } from "@medusajs/types"

const OfficeSideMenuItems = {
  "< Volver a la tienda": "/",
  Dashboard: "/office",
  "Genealogía Binaria": "/office/binary-genealogy",
  "Genealogía Unilevel": "/office/unilevel-genealogy",
  "Estado de Comisiones": "/office/commissions",
  "Órdenes & Autoenvío": "/office/orders-autoship",
  "Materiales de Marketing": "/office/marketing-materials",
  "Centro de Formación": "/office/training-center",
  "Soporte & Cumplimiento": "/office/support-compliance",
  "Mi cuenta": "/account",
}

const OfficeSideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  const toggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base text-sm sm:text-base font-medium"
                >
                  Menu
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-30 inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-[rgba(39,38,90,0.5)] rounded-rounded justify-between p-4 sm:p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button 
                        data-testid="close-menu-button" 
                        onClick={close}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <XMark className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>
                    <ul className="flex flex-col gap-3 sm:gap-4 items-start justify-start">
                      {Object.entries(OfficeSideMenuItems).map(([name, href]) => {
                        return (
                          <li key={name} className="w-full">
                            <LocalizedClientLink
                              href={href}
                              className="text-base sm:text-lg hover:text-ui-fg-disabled block w-full py-2 px-1 rounded transition-colors hover:bg-white/10"
                              onClick={close}
                              data-testid={`${name.toLowerCase()}-link`}
                            >
                              {name}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex flex-col gap-y-4 sm:gap-y-6">
                      <div
                        className="flex justify-between items-center"
                        onMouseEnter={toggleState.open}
                        onMouseLeave={toggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={toggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150 w-4 h-4 sm:w-5 sm:h-5",
                            toggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small text-xs sm:text-sm">
                        © {new Date().getFullYear()} We Now. Todos los derechos
                        reservados.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default OfficeSideMenu
