'use client'

import { useState, useTransition } from "react"
import { useFormatter, useTranslations } from "next-intl"
import { IoTrash } from "react-icons/io5"
import { removeClanServer } from "@/actions/clan-servers/remove-clan-server"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClanContext } from "@/context/ClanContext"
import type { ServerDto } from "@/dtos/serverDTO"









type ClanServerCardProps = {
    server: ServerDto
}

export default function ClanServerCard({ server }: ClanServerCardProps) {
    const t = useTranslations("ClanServers")
    const format = useFormatter()
    const { clan, canManage, reload } = useClanContext()

    const [error, setError] = useState<string | null>(null)
    const [isRemoving, startRemove] = useTransition()

    function handleRemove() {
        setError(null)

        startRemove(async () => {
            try {
                const result = await removeClanServer(clan.id, server.id)

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
        <Card>
            <CardHeader>
                <CardTitle>{server.serverName}</CardTitle>
                <CardDescription>
                    {t("ends", { date: format.dateTime(server.endsAt, { dateStyle: "long", timeStyle: "short" }) })}
                </CardDescription>
                {canManage && (
                    <CardAction>
                        <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("remove", { name: server.serverName })}
                        disabled={isRemoving}
                        onClick={handleRemove}
                        >
                            <IoTrash/>
                        </Button>
                    </CardAction>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
            </CardHeader>
        </Card>
    )
}
