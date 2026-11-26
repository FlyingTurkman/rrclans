'use client'

import { useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { useParams, useSelectedLayoutSegment } from "next/navigation"
import { useFormatter, useTranslations } from "next-intl"
import { IoSettingsOutline } from "react-icons/io5"
import { getClan } from "@/actions/clans/get-clan"
import ClanAvatar from "@/components/clans/ClanAvatar"
import ClanJoinButton from "@/components/clans/ClanJoinButton"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClanContextProvider } from "@/context/ClanContext"
import { useSiteContext } from "@/context/SiteContext"
import type { ActionResult, ClanDetail } from "@/types"









// Tabs of the clan page. `value` is the route folder ("wall" is the clan home
// page) and the translation key in the "ClanPage.tabs" namespace.
const clanTabs = [
    { value: "wall", path: "" },
    { value: "members", path: "/members" },
    { value: "servers", path: "/servers" },
    { value: "inventory", path: "/inventory" },
] as const

// Result of the last request, the clan and the user it belongs to.
type LoadedClan = {
    clanId: string
    viewerId: string | null
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
    const tl = useTranslations("ListFilters")
    const format = useFormatter()
    const { clanId } = useParams<{ clanId: string }>()
    const segment = useSelectedLayoutSegment()
    const { user, isUserLoading } = useSiteContext()
    const viewerId = user?.id ?? null

    const [loaded, setLoaded] = useState<LoadedClan | null>(null)
    // Increased to load the clan again after a change. The old data stays
    // visible meanwhile.
    const [version, setVersion] = useState(0)

    const reload = useCallback(() => setVersion((current) => current + 1), [])

    // Permissions and member posts depend on the user: after a login or logout
    // the tabs are removed and loaded again.
    useEffect(() => {
        if (isUserLoading) return

        let cancelled = false

        getClan(clanId)
            .catch((): ActionResult<ClanDetail> => ({ success: false }))
            .then((result) => {
                if (!cancelled) setLoaded({ clanId, viewerId, result })
            })

        return () => {
            cancelled = true
        }
    }, [clanId, viewerId, isUserLoading, version])

    const result = loaded?.clanId === clanId && loaded.viewerId === viewerId ? loaded.result : null

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
                    <div className="flex flex-wrap items-center gap-4">
                        <ClanAvatar
                        clanName={result.data.clan.clanName}
                        avatar={result.data.clan.avatar}
                        size="lg"
                        className="size-20 data-[size=lg]:size-20 *:text-3xl"
                        />
                        <div className="min-w-0 flex-1">
                            <h1 className="font-heading text-3xl font-extrabold italic font-stretch-condensed">
                                <span className="text-primary">[{result.data.clan.clanTag}]</span> {result.data.clan.clanName}
                            </h1>
                            <p>{tl(`regions.${result.data.clan.region}`)} · {tc("members", { count: result.data.clan.memberCount })}</p>
                            <p className="text-sm text-muted-foreground">
                                {t("created", { date: format.dateTime(result.data.clan.createdAt, { dateStyle: "long" }) })}
                            </p>
                        </div>
                        <div className="flex items-start gap-2">
                            <ClanJoinButton/>
                            {result.data.canManage && (
                                <Link
                                href={`/c/${clanId}/panel`}
                                className={buttonVariants({ variant: "outline", size: "icon" })}
                                aria-label={t("panel")}
                                title={t("panel")}
                                >
                                    <IoSettingsOutline/>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* The panel is not a tab: there no tab is active. */}
                    <Tabs value={segment === "panel" ? null : segment ?? "wall"}>
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
