'use client'

import Link from "next/link"
import { useTranslations } from "next-intl"
import { IoChatbubblesOutline, IoCubeOutline, IoMegaphoneOutline, IoNotificationsOutline, IoPeopleOutline, IoServerOutline } from "react-icons/io5"









// Features of the site. `key` is the translation key in "HomePage.features".
const features = [
    { key: "clans", href: "/clans", icon: IoPeopleOutline },
    { key: "lfg", href: "/lfp", icon: IoMegaphoneOutline },
    { key: "servers", href: "/profile/server", icon: IoServerOutline },
    { key: "inventory", href: "/clans", icon: IoCubeOutline },
    { key: "wall", href: "/clans", icon: IoChatbubblesOutline },
    { key: "notifications", href: "/notifications", icon: IoNotificationsOutline },
] as const

// Short description of every feature, each links to where it is used.
export default function HomeFeatures() {
    const t = useTranslations("HomePage")

    return (
        <section className="flex flex-col gap-4">
            <h2 className="font-heading text-2xl font-extrabold italic uppercase font-stretch-condensed">{t("featuresTitle")}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {features.map(({ key, href, icon: Icon }) => {

                    return (
                        <li key={key}>
                            <Link
                            href={href}
                            className="flex h-full flex-col gap-2 rounded-xl border bg-card p-5 transition-colors hover:bg-accent"
                            >
                                <Icon className="size-6 text-primary" aria-hidden/>
                                <span className="font-semibold">{t(`features.${key}.title`)}</span>
                                <span className="text-sm text-muted-foreground">{t(`features.${key}.description`)}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
