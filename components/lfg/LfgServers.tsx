'use client'

import { useTranslations } from "next-intl"
import type { ServerDto } from "@/dtos/serverDTO"









type LfgServersProps = {
    servers: ServerDto[]
}

// Active servers of a listing.
export default function LfgServers({ servers }: LfgServersProps) {
    const t = useTranslations("Lfg")

    if (servers.length === 0) {
        return (
            <p className="text-xs text-muted-foreground">{t("noServers")}</p>
        )
    }

    return (
        <ul className="flex flex-wrap gap-1" aria-label={t("servers")}>
            {servers.map((server) => {

                return (
                    <li
                    key={server.id}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs"
                    >
                        {server.serverName}
                    </li>
                )
            })}
        </ul>
    )
}
