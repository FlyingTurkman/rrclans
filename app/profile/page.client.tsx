'use client'

import Link from "next/link"
import { useTranslations } from "next-intl"
import ChangeEmailForm from "@/components/profile/ChangeEmailForm"
import ChangePasswordForm from "@/components/profile/ChangePasswordForm"
import ProfileForm from "@/components/profile/ProfileForm"
import ProfileInvites from "@/components/profile/ProfileInvites"
import ProfileServer from "@/components/profile/ProfileServer"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import UserAvatar from "@/components/user/UserAvatar"
import { useSiteContext } from "@/context/SiteContext"









export default function ProfilePageClient() {
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

            <ProfileInvites key={`${user.id}-invites`}/>

            <div className="grid items-start gap-6 md:grid-cols-2">
                <ProfileForm
                key={user.id}
                user={user}
                />
                <ProfileServer key={`${user.id}-server`}/>
                <ChangeEmailForm user={user}/>
                <ChangePasswordForm/>
            </div>
        </div>
    )
}
