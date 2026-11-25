'use client'

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { getCurrentUser } from "@/actions/auth/current-user"
import type { UserDto } from "@/dtos/userDTO"









type SiteContextValue = {
    // Logged-in user, or null for visitors (and until it has been loaded).
    user: UserDto | null
    setUser: Dispatch<SetStateAction<UserDto | null>>
    // True while the user is being loaded on first mount.
    isUserLoading: boolean
}

const SiteContext = createContext<SiteContextValue | null>(null)

type SiteContextProviderProps = {
    children: ReactNode
}

export function SiteContextProvider({ children }: SiteContextProviderProps) {
    const [user, setUser] = useState<UserDto | null>(null)
    const [isUserLoading, setIsUserLoading] = useState(true)

    // Load the logged-in user on the client after the first render.
    useEffect(() => {
        let cancelled = false

        getCurrentUser()
            .then((currentUser) => {
                if (!cancelled) setUser(currentUser)
            })
            .catch(() => {
                if (!cancelled) setUser(null)
            })
            .finally(() => {
                if (!cancelled) setIsUserLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <SiteContext.Provider value={{ user, setUser, isUserLoading }}>
            {children}
        </SiteContext.Provider>
    )
}

// Access site-wide state from any client component.
export function useSiteContext() {
    const context = useContext(SiteContext)

    if (!context) {
        throw new Error("useSiteContext must be used inside SiteContextProvider")
    }

    return context
}
