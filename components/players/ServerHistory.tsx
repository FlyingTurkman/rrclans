'use client'

import { useFormatter, useTranslations } from "next-intl"
import type { ServerDto } from "@/dtos/serverDTO"









type ServerHistoryProps = {
    servers: ServerDto[]
}

// Servers a player has played on before.
export default function ServerHistory({ servers }: ServerHistoryProps) {
    const t = useTranslations("ServerHistory")
    const format = useFormatter()

    if (servers.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )
    }

    return (
        <ul className="flex flex-col divide-y text-sm">
            {servers.map((server) => {

                return (
                    <li
                    key={server.id}
                    className="flex flex-wrap justify-between gap-x-4 py-2"
                    >
                        <span className="font-medium">{server.serverName}</span>
                        <span className="text-muted-foreground">
                            {format.dateTimeRange(server.beganAt, server.endsAt, { dateStyle: "medium" })}
                        </span>
                    </li>
                )
            })}
        </ul>
    )
}
