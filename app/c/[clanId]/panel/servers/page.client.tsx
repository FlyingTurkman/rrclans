'use client'

import { useTranslations } from "next-intl"
import ClanServerAdd from "@/components/clans/ClanServerAdd"
import ClanServerCard from "@/components/clans/ClanServerCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClanContext } from "@/context/ClanContext"









export default function ServersPageClient() {
    const t = useTranslations("ClanPanel")
    const ts = useTranslations("ClanServers")
    const { servers } = useClanContext()

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("servers")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <ClanServerAdd/>
                {servers.length === 0 ? (
                    <p className="text-muted-foreground">{ts("empty")}</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {servers.map((server) => {

                            return (
                                <li key={server.id}>
                                    <ClanServerCard
                                    server={server}
                                    canRemove
                                    />
                                </li>
                            )
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
