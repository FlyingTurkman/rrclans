'use client'

import Link from "next/link"
import { useTranslations } from "next-intl"
import { buttonVariants } from "@/components/ui/button"
import { useSiteContext } from "@/context/SiteContext"









// Title of the home page with the next step for visitors and players.
export default function HomeHero() {
    const t = useTranslations("HomePage")
    const { user, isUserLoading } = useSiteContext()

    return (
        <section className="flex flex-col gap-4 rounded-2xl border bg-card px-6 py-10 md:px-10">
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">{t("eyebrow")}</p>
            <h1 className="max-w-3xl font-heading text-4xl font-extrabold italic uppercase font-stretch-condensed md:text-5xl">
                {t("title")}
            </h1>
            <p className="max-w-2xl text-muted-foreground">{t("intro")}</p>
            {!isUserLoading && (
                <div className="flex flex-wrap gap-2">
                    {user ? (
                        <Link href="/profile/server" className={buttonVariants()}>{t("chooseServer")}</Link>
                    ) : (
                        <Link href="/auth/register" className={buttonVariants()}>{t("register")}</Link>
                    )}
                    <Link href="/lfp" className={buttonVariants({ variant: "outline" })}>{t("findClan")}</Link>
                    <Link href="/clans" className={buttonVariants({ variant: "outline" })}>{t("browseClans")}</Link>
                </div>
            )}
        </section>
    )
}
