'use client'

import type { ReactNode } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { IoKeyOutline, IoMailOutline, IoPersonAddOutline, IoPersonOutline, IoServerOutline } from "react-icons/io5"
import PanelSidebar from "@/components/layout/PanelSidebar"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import UserAvatar from "@/components/user/UserAvatar"
import { useSiteContext } from "@/context/SiteContext"









// Pages of the profile. `value` is the translation key in the "ProfilePage.pages"
// namespace, `segment` the route folder (null is the first page).
const profilePages = [
    { value: "info", segment: null, icon: IoPersonOutline },
    { value: "server", segment: "server", icon: IoServerOutline },
    { value: "invites", segment: "invites", icon: IoPersonAddOutline },
    { value: "email", segment: "email", icon: IoMailOutline },
    { value: "password", segment: "password", icon: IoKeyOutline },
] as const

type ProfileLayoutClientProps = {
    children: ReactNode
}

// Profile of the logged-in user. The pages are only rendered once it is loaded.
export default function ProfileLayoutClient({ children }: ProfileLayoutClientProps) {
    const t = useTranslations("ProfilePage")
    const { user, isUserLoading } = useSiteContext()

    if (isUserLoading) {
        return (
            <div className="flex justify-center py-10">
                <Spinner className="size-6" aria-label={t("loading")}/>
            </div>
        )
    }

    // Visitors are redirected by proxy.ts, this is only seen right after a logout.
    if (!user) return null

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <div className="flex items-center gap-4">
                <UserAvatar
                username={user.username}
                avatar={user.avatar}
                size="lg"
                />
                <h1 className="min-w-0 flex-1 truncate font-heading text-3xl font-extrabold italic font-stretch-condensed">
                    {user.username}
                </h1>
                <Link
                href={`/p/${user.id}`}
                className={buttonVariants({ variant: "outline" })}
                >
                    {t("viewProfile")}
                </Link>
            </div>

            <PanelSidebar
            title={t("title")}
            pages={profilePages.map(({ value, segment, icon }) => ({
                segment,
                href: segment ? `/profile/${segment}` : "/profile",
                label: t(`pages.${value}`),
                icon,
            }))}
            >
                {children}
            </PanelSidebar>
        </div>
    )
}
