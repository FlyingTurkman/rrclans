'use client'

import { useTranslations } from "next-intl"
import ClanMemberList from "@/components/clans/ClanMemberList"
import ClanMemberRow from "@/components/clans/ClanMemberRow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"









export default function MembersPageClient() {
    const t = useTranslations("ClanPanel")

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("members")}</CardTitle>
            </CardHeader>
            <CardContent>
                <ClanMemberList
                renderMembers={(members, onChanged) => {

                    return (
                        <ul className="flex flex-col divide-y">
                            {members.map((member) => {

                                return (
                                    <ClanMemberRow
                                    key={member.id}
                                    member={member}
                                    onChanged={onChanged}
                                    />
                                )
                            })}
                        </ul>
                    )
                }}
                />
            </CardContent>
        </Card>
    )
}
