'use client'

import { useTranslations } from "next-intl"
import PlayerCard from "@/components/players/PlayerCard"
import { useClanContext } from "@/context/ClanContext"









export default function MembersPageClient() {
    const t = useTranslations("ClanPage")
    const { members } = useClanContext()

    if (members.length === 0) {
        return (
            <p className="text-muted-foreground">{t("noMembers")}</p>
        )
    }

    return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => {

                return (
                    <li key={member.id}>
                        <PlayerCard
                        player={member.user}
                        role={member.role}
                        />
                    </li>
                )
            })}
        </ul>
    )
}
