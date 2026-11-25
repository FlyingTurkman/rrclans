'use client'

import type { ReactNode } from "react"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { useTranslations } from "next-intl"
import { IoInformationCircleOutline, IoMegaphoneOutline, IoPeopleOutline, IoPersonAddOutline, IoServerOutline } from "react-icons/io5"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useClanContext } from "@/context/ClanContext"









// Pages of the panel. `value` is the route folder ("info" is the first page)
// and the translation key in the "ClanPanel.pages" namespace.
const panelPages = [
    { value: "info", path: "", icon: IoInformationCircleOutline },
    { value: "members", path: "/members", icon: IoPeopleOutline },
    { value: "joins", path: "/joins", icon: IoPersonAddOutline },
    { value: "servers", path: "/servers", icon: IoServerOutline },
    { value: "lfp", path: "/lfp", icon: IoMegaphoneOutline },
] as const

type PanelLayoutClientProps = {
    children: ReactNode
}

// Clan panel: everything the leader and officers change in their clan.
export default function PanelLayoutClient({ children }: PanelLayoutClientProps) {
    const t = useTranslations("ClanPanel")
    const { clan, canManage } = useClanContext()
    const segment = useSelectedLayoutSegment() ?? "info"

    if (!canManage) {
        return (
            <p className="text-destructive">{t("forbidden")}</p>
        )
    }

    return (
        <SidebarProvider className="min-h-0 flex-col gap-6 md:flex-row">
            {/* Part of the page instead of the screen edge, above the content on phones. */}
            <Sidebar
            collapsible="none"
            className="h-fit w-full shrink-0 rounded-xl border md:w-56"
            >
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>{t("title")}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {panelPages.map(({ value, path, icon: Icon }) => {

                                    return (
                                        <SidebarMenuItem key={value}>
                                            <SidebarMenuButton
                                            isActive={segment === value}
                                            aria-current={segment === value ? "page" : undefined}
                                            render={<Link href={`/c/${clan.id}/panel${path}`}/>}
                                            >
                                                <Icon/>
                                                <span>{t(`pages.${value}`)}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <div className="min-w-0 flex-1">
                {children}
            </div>
        </SidebarProvider>
    )
}
