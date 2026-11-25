'use client'

import { useCallback, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { addClanServer } from "@/actions/clan-servers/add-clan-server"
import { getAvailableServers } from "@/actions/clan-servers/get-available-servers"
import ServerSearch from "@/components/servers/ServerSearch"
import { useClanContext } from "@/context/ClanContext"









// Adds an active server to the clan. Show it only to leader and officers.
export default function ClanServerAdd() {
    const t = useTranslations("ClanServers")
    const { clan, reload } = useClanContext()

    const [error, setError] = useState<string | null>(null)
    const [isAdding, startAdd] = useTransition()

    const search = useCallback((input: { term: string }) => getAvailableServers(clan.id, input), [clan.id])

    function handleAdd(serverId: string) {
        setError(null)

        startAdd(async () => {
            try {
                const result = await addClanServer(clan.id, serverId)

                if (result.success) {
                    reload()
                } else {
                    setError(result.error ?? t("actionError"))
                }
            } catch {
                setError(t("actionError"))
            }
        })
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <ServerSearch
            triggerText={t("add")}
            search={search}
            disabled={isAdding}
            onSelect={(server) => handleAdd(server.id)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    )
}
