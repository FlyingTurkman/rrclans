'use client'

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { cancelJoin } from "@/actions/clan-join/cancel-join"
import { joinClan } from "@/actions/clan-join/join-clan"
import { getProfileInvites } from "@/actions/profile/get-profile-invites"
import ClanAvatar from "@/components/clans/ClanAvatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import type { ProfileInviteDto } from "@/dtos/clanJoinDTO"
import type { ActionResult } from "@/types"









// Clan invites of the logged-in user.
export default function ProfileInvites() {
    const t = useTranslations("ClanJoin")

    const [result, setResult] = useState<ActionResult<ProfileInviteDto[]> | null>(null)
    // Increased to load the invites again after a change. The old list stays
    // visible meanwhile.
    const [version, setVersion] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        let cancelled = false

        getProfileInvites()
            .catch((): ActionResult<ProfileInviteDto[]> => ({ success: false }))
            .then((newResult) => {
                if (!cancelled) setResult(newResult)
            })

        return () => {
            cancelled = true
        }
    }, [version])

    function handleAction(action: () => Promise<ActionResult<unknown>>) {
        setError(null)

        startTransition(async () => {
            try {
                const changed = await action()

                if (!changed.success) setError(changed.error ?? t("actionError"))

                setVersion((current) => current + 1)
            } catch {
                setError(t("actionError"))
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("yourInvites")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {error && <p className="text-destructive">{error}</p>}

                {!result && (
                    <div className="flex justify-center py-4">
                        <Spinner className="size-6" aria-label={t("loading")}/>
                    </div>
                )}

                {result && !result.success && (
                    <p className="text-destructive">{result.error ?? t("actionError")}</p>
                )}

                {result?.success && result.data.length === 0 && (
                    <p className="text-muted-foreground">{t("noInvites")}</p>
                )}

                <ul className="flex flex-col divide-y">
                    {result?.success && result.data.map(({ id, clan }) => {

                        return (
                            <li
                            key={id}
                            className="flex flex-wrap items-center gap-2 py-2"
                            >
                                <Link
                                href={`/c/${clan.id}`}
                                className="flex min-w-0 flex-1 items-center gap-3 hover:underline"
                                >
                                    <ClanAvatar
                                    clanName={clan.clanName}
                                    avatar={clan.avatar}
                                    />
                                    <span className="truncate font-medium">[{clan.clanTag}] {clan.clanName}</span>
                                </Link>
                                <Button
                                disabled={isPending}
                                onClick={() => handleAction(() => joinClan(clan.id))}
                                >
                                    {t("acceptInvite")}
                                </Button>
                                <Button
                                variant="outline"
                                disabled={isPending}
                                onClick={() => handleAction(() => cancelJoin(clan.id))}
                                >
                                    {t("declineInvite")}
                                </Button>
                            </li>
                        )
                    })}
                </ul>
            </CardContent>
        </Card>
    )
}
