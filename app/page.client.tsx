'use client'

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { getHomeDashboard } from "@/actions/home/get-home-dashboard"
import ClanCard from "@/components/clans/ClanCard"
import HomeFeatures from "@/components/home/HomeFeatures"
import HomeHero from "@/components/home/HomeHero"
import HomeServers from "@/components/home/HomeServers"
import HomeStats from "@/components/home/HomeStats"
import LfpCard from "@/components/lfg/LfpCard"
import { Spinner } from "@/components/ui/spinner"
import type { ActionResult, HomeDashboard } from "@/types"









type HomeSectionProps = {
    title: string
    href: string
    linkText: string
    children: ReactNode
}

// Part of the dashboard with a link to the full list.
function HomeSection({ title, href, linkText, children }: HomeSectionProps) {

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
                <h2 className="font-heading text-2xl font-extrabold italic uppercase font-stretch-condensed">{title}</h2>
                <Link href={href} className="text-sm text-primary hover:underline">{linkText}</Link>
            </div>
            {children}
        </section>
    )
}

// Home page: what the site does and what is happening on it.
export default function HomePageClient() {
    const t = useTranslations("HomePage")

    const [result, setResult] = useState<ActionResult<HomeDashboard> | null>(null)

    useEffect(() => {
        let cancelled = false

        getHomeDashboard()
            .catch((): ActionResult<HomeDashboard> => ({ success: false }))
            .then((newResult) => {
                if (!cancelled) setResult(newResult)
            })

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8">
            <HomeHero/>

            {!result && (
                <div className="flex justify-center py-6">
                    <Spinner className="size-6" aria-label={t("loading")}/>
                </div>
            )}

            {result && !result.success && (
                <p className="text-destructive">{result.error ?? t("loadError")}</p>
            )}

            {result?.success && <HomeStats stats={result.data.stats}/>}

            <HomeFeatures/>

            {result?.success && (
                <>
                    <HomeSection
                    title={t("newestClans")}
                    href="/clans"
                    linkText={t("allClans")}
                    >
                        {result.data.clans.length === 0 ? (
                            <p className="text-muted-foreground">{t("noClans")}</p>
                        ) : (
                            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {result.data.clans.map((clan) => {

                                    return (
                                        <li key={clan.id}>
                                            <ClanCard clan={clan}/>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </HomeSection>

                    <div className="grid gap-10 lg:grid-cols-2">
                        <HomeSection
                        title={t("activeServers")}
                        href="/profile/server"
                        linkText={t("chooseServer")}
                        >
                            <HomeServers servers={result.data.servers}/>
                        </HomeSection>

                        <HomeSection
                        title={t("latestLfp")}
                        href="/lfp"
                        linkText={t("allListings")}
                        >
                            {result.data.lfpListings.length === 0 ? (
                                <p className="text-muted-foreground">{t("noListings")}</p>
                            ) : (
                                <ul className="flex flex-col gap-4">
                                    {result.data.lfpListings.slice(0, 3).map((listing) => {

                                        return (
                                            <li key={listing.id}>
                                                <LfpCard listing={listing}/>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </HomeSection>
                    </div>
                </>
            )}
        </div>
    )
}
