'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { IoPersonRemove } from "react-icons/io5"
import { removeMember } from "@/actions/clan-panel/remove-member"
import { updateMemberRole } from "@/actions/clan-panel/update-member-role"
import ConfirmDialog from "@/components/layout/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UserAvatar from "@/components/user/UserAvatar"
import { useClanContext } from "@/context/ClanContext"
import { useSiteContext } from "@/context/SiteContext"
import type { ClanMemberDto } from "@/dtos/clanMemberDTO"
import { canManageRole, getAssignableRoles } from "@/lib/src/clanPermissions"
import type { ClanRole } from "@/types"









type ClanMemberRowProps = {
    member: ClanMemberDto
    onChanged: () => void
}

// Member in the clan panel: change the rank and remove, if the rank allows it.
export default function ClanMemberRow({ member, onChanged }: ClanMemberRowProps) {
    const t = useTranslations("ClanPanel")
    const tr = useTranslations("ClanRoles")
    const { viewerRole } = useClanContext()
    const { user } = useSiteContext()

    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const canManage = member.user.id !== user?.id && canManageRole(viewerRole, member.role)
    const roleItems = getAssignableRoles(viewerRole).map((value) => ({ value, label: tr(value) }))

    function handleRoleChange(role: ClanRole | null) {
        if (!role || role === member.role) return

        setError(null)

        startTransition(async () => {
            try {
                const result = await updateMemberRole(member.id, role)

                if (!result.success) setError(result.error ?? t("actionError"))

                onChanged()
            } catch {
                setError(t("actionError"))
            }
        })
    }

    return (
        <li className="flex flex-wrap items-center gap-3 py-2">
            <Link
            href={`/p/${member.user.id}`}
            className="flex min-w-0 flex-1 items-center gap-3 hover:underline"
            >
                <UserAvatar
                username={member.user.username}
                avatar={member.user.avatar}
                />
                <span className="min-w-0">
                    <span className="block truncate font-medium">{member.user.username}</span>
                    {member.server && <span className="block truncate text-sm text-muted-foreground">{member.server.serverName}</span>}
                </span>
            </Link>

            {!canManage && <span className="text-muted-foreground">{tr(member.role)}</span>}

            {canManage && (
                <>
                    <Select<ClanRole>
                    items={roleItems}
                    value={member.role}
                    onValueChange={handleRoleChange}
                    disabled={isPending}
                    >
                        <SelectTrigger aria-label={t("changeRole", { name: member.user.username })}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {roleItems.map((item) => {

                                return (
                                    <SelectItem
                                    key={item.value}
                                    value={item.value}
                                    >
                                        {item.label}
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                    <ConfirmDialog
                    trigger={<Button variant="ghost" size="icon" aria-label={t("removeMember", { name: member.user.username })}/>}
                    title={t("removeTitle")}
                    description={t("removeDescription", { name: member.user.username })}
                    confirmLabel={t("remove")}
                    onConfirm={() => removeMember(member.id)}
                    onSuccess={onChanged}
                    >
                        <IoPersonRemove/>
                    </ConfirmDialog>
                </>
            )}

            {error && <p className="w-full text-sm text-destructive">{error}</p>}
        </li>
    )
}
