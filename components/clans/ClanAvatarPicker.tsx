'use client'

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { updateClanAvatar } from "@/actions/clan-panel/update-clan-avatar"
import ClanAvatar from "@/components/clans/ClanAvatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClanContext } from "@/context/ClanContext"
import { clanAvatars, getClanAvatarSrc, type ClanAvatarId } from "@/lib/src/clanAvatars"









// The first option is no avatar.
const options: (ClanAvatarId | null)[] = [null, ...clanAvatars]

// Avatar of the clan: one of the ready-made images or none. A click saves it.
export default function ClanAvatarPicker() {
    const t = useTranslations("ClanPanel")
    const { clan, reload } = useClanContext()

    // Known avatar of the clan, an unknown one is shown as none.
    const current = getClanAvatarSrc(clan.avatar) ? clan.avatar : null

    const [selected, setSelected] = useState(current)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleSelect(avatar: ClanAvatarId | null) {
        if (avatar === selected) return

        const previous = selected

        setError(null)
        setSelected(avatar)

        startTransition(async () => {
            try {
                const result = await updateClanAvatar(clan.id, avatar)

                if (result.success) {
                    reload()
                    return
                }

                setSelected(previous)
                setError(result.error ?? t("actionError"))
            } catch {
                // The request itself failed (e.g. no connection).
                setSelected(previous)
                setError(t("actionError"))
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("avatar")}</CardTitle>
                <CardDescription>{t("avatarDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <ul className="flex flex-wrap gap-3">
                    {options.map((avatar, index) => {
                        const label = avatar ? t("avatarOption", { number: index }) : t("noAvatar")

                        return (
                            <li key={avatar ?? "none"}>
                                <button
                                type="button"
                                className="block cursor-pointer rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed aria-pressed:ring-3 aria-pressed:ring-primary"
                                aria-pressed={avatar === selected}
                                aria-label={label}
                                title={label}
                                disabled={isPending}
                                onClick={() => handleSelect(avatar)}
                                >
                                    <ClanAvatar
                                    clanName={clan.clanName}
                                    avatar={avatar}
                                    size="lg"
                                    className="size-16 data-[size=lg]:size-16 *:text-2xl"
                                    />
                                </button>
                            </li>
                        )
                    })}
                </ul>

                {error && <p className="text-destructive">{error}</p>}
            </CardContent>
        </Card>
    )
}
