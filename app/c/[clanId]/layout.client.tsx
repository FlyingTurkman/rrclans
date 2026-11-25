'use client'

import { useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useParams, useSelectedLayoutSegment } from "next/navigation"
import { useFormatter, useTranslations } from "next-intl"
import { getClan } from "@/actions/clans/get-clan"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClanContextProvider } from "@/context/ClanContext"
import type { ActionResult, ClanDetail } from "@/types"









// Tabs of the clan page. `value` is the route folder ("wall" is the clan home
// page) and the translation key in the "ClanPage.tabs" namespace.
const clanTabs = [
    { value: "wall", path: "" },
    { value: "members", path: "/members" },
    { value: "servers", path: "/servers" },
] as const

// Result of the last request and the clan it belongs to.
type LoadedClan = {
    clanId: string
    result: ActionResult<ClanDetail>
}

type ClanIdLayoutClientProps = {
    children: ReactNode
}

// Clan header and tabs. The clan is loaded once here, the tabs read it with
// useClanContext.
export default function ClanIdLayoutClient({ children }: ClanIdLayoutClientProps) {
    const t = useTranslations("ClanPage")
    const tc = useTranslations("ClansPage")
    const format = useFormatter()
    const { clanId } = useParams<{ clanId: string }>()
    const segment = useSelectedLayoutSegment()

    const [loaded, setLoaded] = useState<LoadedClan | null>(null)
    // Increased to load the clan again after a change. The old data stays
    // visible meanwhile.
    const [version, setVersion] = useState(0)

    const reload = useCallback(() => setVersion((current) => current + 1), [])

    useEffect(() => {
        let cancelled = false

        getClan(clanId)
            .catch((): ActionResult<ClanDetail> => ({ success: false }))
            .then((result) => {
                if (!cancelled) setLoaded({ clanId, result })
            })

        return () => {
            cancelled = true
        }
    }, [clanId, version])

    const result = loaded?.clanId === clanId ? loaded.result : null

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            {!result && (
                <div className="flex justify-center py-10">
                    <Spinner className="size-6" aria-label={t("loading")}/>
                </div>
            )}

            {result && !result.success && (
                <p className="text-destructive">{result.error ?? t("loadError")}</p>
            )}

            {result?.success && (
                <ClanContextProvider
                detail={result.data}
                reload={reload}
                >
                    <div>
                        <h1 className="font-heading text-3xl font-extrabold italic font-stretch-condensed">
                            <span className="text-primary">[{result.data.clan.clanTag}]</span> {result.data.clan.clanName}
                        </h1>
                        <p>{tc(`regions.${result.data.clan.region}`)} · {tc("members", { count: result.data.clan.memberCount })}</p>
                        <p className="text-sm text-muted-foreground">
                            {t("created", { date: format.dateTime(result.data.clan.createdAt, { dateStyle: "long" }) })}
                        </p>
                    </div>

                    <Tabs value={segment ?? "wall"}>
                        <TabsList>
                            {clanTabs.map((tab) => {

                                return (
                                    <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="px-4"
                                    nativeButton={false}
                                    render={<Link href={`/c/${clanId}${tab.path}`}/>}
                                    >
                                        {t(`tabs.${tab.value}`)}
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>
                    </Tabs>

                    {children}
                </ClanContextProvider>
            )}
        </div>
    )
}
