'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { cancelJoin } from "@/actions/clan-join/cancel-join"
import { joinClan } from "@/actions/clan-join/join-clan"
import { leaveClan } from "@/actions/clan-join/leave-clan"
import ConfirmDialog from "@/components/layout/ConfirmDialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { useClanContext } from "@/context/ClanContext"
import { useSiteContext } from "@/context/SiteContext"
import type { ActionResult } from "@/types"









// Join, request, invite answer or leave: depends on the join mode of the clan
// and the relation of the user to it.
export default function ClanJoinButton() {
    const t = useTranslations("ClanJoin")
    const { clan, joinStatus, viewerRole, reload } = useClanContext()
    const { user } = useSiteContext()

    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleAction(action: () => Promise<ActionResult<unknown>>) {
        setError(null)

        startTransition(async () => {
            try {
                const result = await action()

                if (!result.success) setError(result.error ?? t("actionError"))

                reload()
            } catch {
                setError(t("actionError"))
            }
        })
    }

    // The leader cannot leave.
    if (viewerRole === "LEADER") return null

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex gap-2">
                {!user && clan.joinMode !== "INVITE" && (
                    <Link
                    href={`/auth/login?next=${encodeURIComponent(`/c/${clan.id}`)}`}
                    className={buttonVariants()}
                    >
                        {t("loginToJoin")}
                    </Link>
                )}

                {joinStatus === "MEMBER" && (
                    <ConfirmDialog
                    trigger={<Button variant="outline"/>}
                    title={t("leaveTitle")}
                    description={t("leaveDescription", { name: clan.clanName })}
                    confirmLabel={t("leave")}
                    onConfirm={() => leaveClan(clan.id)}
                    onSuccess={reload}
                    >
                        {t("leave")}
                    </ConfirmDialog>
                )}

                {joinStatus === "INVITED" && (
                    <>
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
                    </>
                )}

                {joinStatus === "REQUESTED" && (
                    <Button
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleAction(() => cancelJoin(clan.id))}
                    >
                        {t("cancelRequest")}
                    </Button>
                )}

                {joinStatus === "NONE" && clan.joinMode === "INVITE" && (
                    <Button disabled>
                        {t("inviteOnly")}
                    </Button>
                )}

                {user && joinStatus === "NONE" && clan.joinMode !== "INVITE" && (
                    <Button
                    disabled={isPending}
                    onClick={() => handleAction(() => joinClan(clan.id))}
                    >
                        {clan.joinMode === "OPEN" ? t("join") : t("request")}
                    </Button>
                )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    )
}
