'use client'

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { ClanDetail } from "@/types"









type ClanContextValue = ClanDetail & {
    // Loads the clan again after a change.
    reload: () => void
}

const ClanContext = createContext<ClanContextValue | null>(null)

type ClanContextProviderProps = {
    detail: ClanDetail
    reload: () => void
    children: ReactNode
}

export function ClanContextProvider({ detail, reload, children }: ClanContextProviderProps) {
    const value = useMemo(() => ({ ...detail, reload }), [detail, reload])

    return (
        <ClanContext.Provider value={value}>
            {children}
        </ClanContext.Provider>
    )
}

// Clan of the current /c/[clanId] page, loaded by its layout.
export function useClanContext() {
    const context = useContext(ClanContext)

    if (!context) {
        throw new Error("useClanContext must be used inside ClanContextProvider")
    }

    return context
}
