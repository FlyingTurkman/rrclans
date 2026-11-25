'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSearchQuery } from "use-search-query"
import { getServer } from "@/actions/servers/get-server"
import { searchServers } from "@/actions/servers/search-servers"
import ServerSearch from "@/components/servers/ServerSearch"
import type { ServerDto } from "@/dtos/serverDTO"









type ListServerSelectProps = {
    // Server id currently in the URL.
    server?: string
}

// Active server filter of a list.
export default function ListServerSelect({ server }: ListServerSelectProps) {
    const t = useTranslations("ListFilters")
    const pathname = usePathname()
    const { routeToSearchParams } = useSearchQuery()

    // Server of the URL, to show its name.
    const [selected, setSelected] = useState<ServerDto | null>(null)

    const isKnown = selected?.id === server

    useEffect(() => {
        if (!server || isKnown) return

        let cancelled = false

        getServer(server)
            .then((result) => {
                if (!cancelled && result.success) setSelected(result.data)
            })
            .catch(() => undefined)

        return () => {
            cancelled = true
        }
    }, [server, isKnown])

    function getTriggerText() {
        if (!server) return t("allServers")

        return selected && isKnown ? selected.serverName : t("unknownServer")
    }

    return (
        <ServerSearch
        triggerText={getTriggerText()}
        search={searchServers}
        selectedId={server}
        onSelect={(newServer) => {
            setSelected(newServer)
            routeToSearchParams(pathname, { server: newServer.id, page: undefined })
        }}
        clearText={t("allServers")}
        onClear={() => routeToSearchParams(pathname, { server: undefined, page: undefined })}
        />
    )
}
