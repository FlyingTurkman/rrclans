'use client'

import type { ReactNode } from "react"
import { useTranslations } from "next-intl"
import { IoInformationCircleOutline, IoMegaphoneOutline, IoPeopleOutline, IoPersonAddOutline, IoServerOutline } from "react-icons/io5"
import PanelSidebar from "@/components/layout/PanelSidebar"
import { useClanContext } from "@/context/ClanContext"









// Pages of the panel. `value` is the translation key in the "ClanPanel.pages"
// namespace, `segment` the route folder (null is the first page).
const panelPages = [
    { value: "info", segment: null, icon: IoInformationCircleOutline },
    { value: "members", segment: "members", icon: IoPeopleOutline },
    { value: "joins", segment: "joins", icon: IoPersonAddOutline },
    { value: "servers", segment: "servers", icon: IoServerOutline },
    { value: "lfp", segment: "lfp", icon: IoMegaphoneOutline },
] as const

type PanelLayoutClientProps = {
    children: ReactNode
}

// Clan panel: everything the leader and officers change in their clan.
export default function PanelLayoutClient({ children }: PanelLayoutClientProps) {
    const t = useTranslations("ClanPanel")
    const { clan, canManage } = useClanContext()

    if (!canManage) {
        return (
            <p className="text-destructive">{t("forbidden")}</p>
        )
    }

    return (
        <PanelSidebar
        title={t("title")}
        pages={panelPages.map(({ value, segment, icon }) => ({
            segment,
            href: segment ? `/c/${clan.id}/panel/${segment}` : `/c/${clan.id}/panel`,
            label: t(`pages.${value}`),
            icon,
        }))}
        >
            {children}
        </PanelSidebar>
    )
}
