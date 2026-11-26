'use client'

import { useFormatter, useNow, useTranslations } from "next-intl"
import type { HomeDashboard } from "@/types"









type HomeServersProps = {
    servers: HomeDashboard["servers"]
}

// Newest active servers with how many clans and players are on them.
export default function HomeServers({ servers }: HomeServersProps) {
    const t = useTranslations("HomePage")
    const format = useFormatter()
    // Updated every minute, so "ends in ..." stays right while the page is open.
    const now = useNow({ updateInterval: 60 * 1000 })

    if (servers.length === 0) {
        return (
            <p className="text-muted-foreground">{t("noServers")}</p>
        )
    }

    return (
        <ul className="flex flex-col divide-y rounded-xl border bg-card">
            {servers.map(({ server, clanCount, playerCount }) => {

                return (
                    <li
                    key={server.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3"
                    >
                        <span className="font-medium">{server.serverName}</span>
                        <span className="text-sm text-muted-foreground">
                            {t("serverStats", { clans: clanCount, players: playerCount })} · {t("serverEnds", { date: format.relativeTime(server.endsAt, now) })}
                        </span>
                    </li>
                )
            })}
        </ul>
    )
}
