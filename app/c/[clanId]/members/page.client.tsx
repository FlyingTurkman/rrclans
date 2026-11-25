'use client'

import ClanMemberList from "@/components/clans/ClanMemberList"
import PlayerCard from "@/components/players/PlayerCard"









export default function MembersPageClient() {

    return (
        <ClanMemberList
        renderMembers={(members) => {

            return (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {members.map((member) => {

                        return (
                            <li key={member.id}>
                                <PlayerCard
                                player={member.user}
                                role={member.role}
                                server={member.server}
                                />
                            </li>
                        )
                    })}
                </ul>
            )
        }}
        />
    )
}
