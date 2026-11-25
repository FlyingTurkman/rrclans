'use client'

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSearchQuery } from "use-search-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { clanRoles } from "@/lib/src/clanRoles"
import type { ClanRole } from "@/types"









// Select value for "no rank filter".
const ALL_ROLES = "all"

type ListRoleSelectProps = {
    // Rank currently in the URL.
    role?: ClanRole
}

// Clan rank filter of a list.
export default function ListRoleSelect({ role }: ListRoleSelectProps) {
    const t = useTranslations("ListFilters")
    const tr = useTranslations("ClanRoles")
    const pathname = usePathname()
    const { routeToSearchParams } = useSearchQuery()

    const items = [
        { value: ALL_ROLES, label: t("allRoles") },
        ...clanRoles.map((value) => ({ value, label: tr(value) })),
    ]

    return (
        <Select
        items={items}
        value={role ?? ALL_ROLES}
        onValueChange={(newRole) => {
            routeToSearchParams(pathname, { role: newRole === ALL_ROLES ? undefined : newRole, page: undefined })
        }}
        >
            <SelectTrigger aria-label={t("roleLabel")}>
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                {items.map((item) => {

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
    )
}
