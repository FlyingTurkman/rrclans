'use client'

import type { ReactNode } from "react"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import type { IconType } from "react-icons"
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









type PanelSidebarProps = {
    title: string
    // `segment` is the route folder, null for the first page.
    pages: { segment: string | null, href: string, label: string, icon: IconType }[]
    children: ReactNode
}

// Sidebar with the pages of a panel next to the open page. Render it only in the
// layout of the panel, because the active page is the segment below that layout.
export default function PanelSidebar({ title, pages, children }: PanelSidebarProps) {
    const activeSegment = useSelectedLayoutSegment()

    return (
        <SidebarProvider className="min-h-0 flex-col gap-6 md:flex-row">
            {/* Part of the page instead of the screen edge, above the content on phones. */}
            <Sidebar
            collapsible="none"
            className="h-fit w-full shrink-0 rounded-xl border md:w-56"
            >
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>{title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {pages.map(({ segment, href, label, icon: Icon }) => {
                                    const isActive = segment === activeSegment

                                    return (
                                        <SidebarMenuItem key={href}>
                                            <SidebarMenuButton
                                            isActive={isActive}
                                            aria-current={isActive ? "page" : undefined}
                                            render={<Link href={href}/>}
                                            >
                                                <Icon/>
                                                <span>{label}</span>
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
