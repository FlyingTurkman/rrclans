'use client'

import { useEffect, useState, useTransition, type ReactNode } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { answerJoinRequest } from "@/actions/clan-panel/answer-join-request"
import { cancelInvite } from "@/actions/clan-panel/cancel-invite"
import { getClanJoins } from "@/actions/clan-panel/get-clan-joins"
import ClanInviteSearch from "@/components/clans/ClanInviteSearch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import UserAvatar from "@/components/user/UserAvatar"
import { useClanContext } from "@/context/ClanContext"
import type { ClanJoinDto } from "@/dtos/clanJoinDTO"
import type { ActionResult, ClanJoins as ClanJoinsData } from "@/types"









type JoinRowProps = {
    join: ClanJoinDto
    children: ReactNode
}

// Player of a request or invite, with its buttons.
function JoinRow({ join, children }: JoinRowProps) {

    return (
        <li className="flex flex-wrap items-center gap-2 py-2">
            <Link
            href={`/p/${join.user.id}`}
            className="flex min-w-0 flex-1 items-center gap-3 hover:underline"
            >
                <UserAvatar
                username={join.user.username}
                avatar={join.user.avatar}
                />
                <span className="truncate font-medium">{join.user.username}</span>
            </Link>
            {children}
        </li>
    )
}

// Join requests and invites in the clan panel.
export default function ClanJoins() {
    const t = useTranslations("ClanPanel")
    const { clan, reload } = useClanContext()

    const [result, setResult] = useState<ActionResult<ClanJoinsData> | null>(null)
    // Increased to load the lists again after a change. The old lists stay
    // visible meanwhile.
    const [version, setVersion] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        let cancelled = false

        getClanJoins(clan.id)
            .catch((): ActionResult<ClanJoinsData> => ({ success: false }))
            .then((newResult) => {
                if (!cancelled) setResult(newResult)
            })

        return () => {
            cancelled = true
        }
    }, [clan.id, version])

    // New members also change the member list of the clan.
    function handleChanged() {
        setVersion((current) => current + 1)
        reload()
    }

    function handleAction(action: () => Promise<ActionResult>) {
        setError(null)

        startTransition(async () => {
            try {
                const changed = await action()

                if (!changed.success) setError(changed.error ?? t("actionError"))

                handleChanged()
            } catch {
                setError(t("actionError"))
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("joins")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <ClanInviteSearch onInvited={handleChanged}/>

                {error && <p className="text-destructive">{error}</p>}

                {!result && (
                    <div className="flex justify-center py-4">
                        <Spinner className="size-6" aria-label={t("loading")}/>
                    </div>
                )}

                {result && !result.success && (
                    <p className="text-destructive">{result.error ?? t("actionError")}</p>
                )}

                {result?.success && (
                    <>
                        <h3 className="font-medium">{t("requests")}</h3>
                        {result.data.requests.length === 0 ? (
                            <p className="text-muted-foreground">{t("noRequests")}</p>
                        ) : (
                            <ul className="flex flex-col divide-y">
                                {result.data.requests.map((request) => {

                                    return (
                                        <JoinRow
                                        key={request.id}
                                        join={request}
                                        >
                                            <Button
                                            disabled={isPending}
                                            onClick={() => handleAction(() => answerJoinRequest(request.id, true))}
                                            >
                                                {t("accept")}
                                            </Button>
                                            <Button
                                            variant="outline"
                                            disabled={isPending}
                                            onClick={() => handleAction(() => answerJoinRequest(request.id, false))}
                                            >
                                                {t("reject")}
                                            </Button>
                                        </JoinRow>
                                    )
                                })}
                            </ul>
                        )}

                        <h3 className="font-medium">{t("invites")}</h3>
                        {result.data.invites.length === 0 ? (
                            <p className="text-muted-foreground">{t("noInvites")}</p>
                        ) : (
                            <ul className="flex flex-col divide-y">
                                {result.data.invites.map((invite) => {

                                    return (
                                        <JoinRow
                                        key={invite.id}
                                        join={invite}
                                        >
                                            <Button
                                            variant="outline"
                                            disabled={isPending}
                                            onClick={() => handleAction(() => cancelInvite(invite.id))}
                                            >
                                                {t("cancelInvite")}
                                            </Button>
                                        </JoinRow>
                                    )
                                })}
                            </ul>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
