'use client'

import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { usePathname } from "next/navigation"
import { getCurrentUser } from "@/actions/auth/current-user"
import { getUnreadCount } from "@/actions/notifications/get-unread-count"
import type { UserDto } from "@/dtos/userDTO"









type SiteContextValue = {
    // Logged-in user, or null for visitors (and until it has been loaded).
    user: UserDto | null
    setUser: Dispatch<SetStateAction<UserDto | null>>
    // True while the user is being loaded on first mount.
    isUserLoading: boolean
    // Unread notifications of the user.
    unreadCount: number
    reloadUnreadCount: () => void
}

const SiteContext = createContext<SiteContextValue | null>(null)

type SiteContextProviderProps = {
    children: ReactNode
}

export function SiteContextProvider({ children }: SiteContextProviderProps) {
    const [user, setUser] = useState<UserDto | null>(null)
    const [isUserLoading, setIsUserLoading] = useState(true)
    const [unread, setUnread] = useState({ userId: "", count: 0 })
    const pathname = usePathname()
    const userId = user?.id

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

    const reloadUnreadCount = useCallback(() => {
        if (!userId) return

        getUnreadCount()
            .then((result) => {
                if (result.success) setUnread({ userId, count: result.data })
            })
            .catch(() => undefined)
    }, [userId])

    // Load the number on login and on every page change. There is no polling:
    // live updates will come from a socket later.
    useEffect(() => {
        reloadUnreadCount()
    }, [reloadUnreadCount, pathname])

    // The number of another user (before a logout) is never shown.
    const unreadCount = unread.userId === userId ? unread.count : 0

    return (
        <SiteContext.Provider value={{ user, setUser, isUserLoading, unreadCount, reloadUnreadCount }}>
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
