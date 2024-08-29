'use client'

import {createContext, useState} from 'react'

export const SidebarContext = createContext({
    isOpen: true,
    setIsOpen: (isOpen: boolean) => {},
})

export function SidebarContextProvider(props: any) {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const initSate = {
        isOpen,
        setIsOpen
    }
    return(
        <SidebarContext.Provider value={initSate}>
            {props.children}
        </SidebarContext.Provider>
    )
}