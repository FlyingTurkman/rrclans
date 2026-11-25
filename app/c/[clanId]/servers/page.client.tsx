'use client'

import { useTranslations } from "next-intl"
import ClanServerAdd from "@/components/clans/ClanServerAdd"
import ClanServerCard from "@/components/clans/ClanServerCard"
import { useClanContext } from "@/context/ClanContext"









export default function ServersPageClient() {
    const t = useTranslations("ClanServers")
    const { servers, canManage } = useClanContext()

    return (
        <>
            {canManage && <ClanServerAdd/>}

            {servers.length === 0 ? (
                <p className="text-muted-foreground">{t("empty")}</p>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {servers.map((server) => {

                        return (
                            <li key={server.id}>
                                <ClanServerCard server={server}/>
                            </li>
                        )
                    })}
                </ul>
            )}
        </>
    )
}
