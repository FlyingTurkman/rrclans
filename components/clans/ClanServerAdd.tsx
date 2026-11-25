'use client'

import { useEffect, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { addClanServer } from "@/actions/clan-servers/add-clan-server"
import { getAvailableServers } from "@/actions/clan-servers/get-available-servers"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useClanContext } from "@/context/ClanContext"
import type { ServerDto } from "@/dtos/serverDTO"









// Adds an active server to the clan. Show it only to leader and officers.
export default function ClanServerAdd() {
    const t = useTranslations("ClanServers")
    const { clan, servers, reload } = useClanContext()

    // Null until the options are loaded.
    const [available, setAvailable] = useState<ServerDto[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isAdding, startAdd] = useTransition()

    // Reload the options when the servers of the clan change.
    useEffect(() => {
        let cancelled = false

        getAvailableServers(clan.id)
            .then((result) => {
                if (!cancelled) setAvailable(result.success ? result.data : [])
            })
            .catch(() => {
                if (!cancelled) setAvailable([])
            })

        return () => {
            cancelled = true
        }
    }, [clan.id, servers])

    function handleAdd(serverId: string | null) {
        if (!serverId) return

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

    if (!available) return null

    if (available.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">{t("noAvailable")}</p>
        )
    }

    const items = available.map((server) => ({ value: server.id, label: server.serverName }))

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Select<string>
            items={items}
            value={null}
            onValueChange={handleAdd}
            disabled={isAdding}
            >
                <SelectTrigger aria-label={t("add")}>
                    <SelectValue placeholder={t("add")}/>
                </SelectTrigger>
                <SelectContent>
                    {items.map((item) => {

                        return (
                            <SelectItem
                            key={item.value}
                            value={item.value}
                            >
                                {item.label}
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    )
}
