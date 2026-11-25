'use client'

import { useEffect, useState, useTransition } from "react"
import { useFormatter, useTranslations } from "next-intl"
import { IoTrash } from "react-icons/io5"
import { getProfileServers } from "@/actions/profile/get-profile-servers"
import { removeProfileServer } from "@/actions/profile/remove-profile-server"
import { setProfileServer } from "@/actions/profile/set-profile-server"
import { searchServers } from "@/actions/servers/search-servers"
import ServerHistory from "@/components/players/ServerHistory"
import ServerSearch from "@/components/servers/ServerSearch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import type { ActionResult, PlayerServers } from "@/types"









// Server of the logged-in user: choose, change and leave the
// active server, the others are history.
export default function ProfileServer() {
    const t = useTranslations("ProfilePage")
    const te = useTranslations("AuthErrors")
    const format = useFormatter()

    const [result, setResult] = useState<ActionResult<PlayerServers> | null>(null)
    // Increased to load the servers again after a change. The old list stays
    // visible meanwhile.
    const [version, setVersion] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        let cancelled = false

        getProfileServers()
            .catch((): ActionResult<PlayerServers> => ({ success: false }))
            .then((newResult) => {
                if (!cancelled) setResult(newResult)
            })

        return () => {
            cancelled = true
        }
    }, [version])

    function handleChange(action: () => Promise<ActionResult>) {
        setError(null)

        startTransition(async () => {
            try {
                const changed = await action()

                if (!changed.success) setError(changed.error ?? te("unknown"))

                setVersion((current) => current + 1)
            } catch {
                setError(te("unknown"))
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("server")}</CardTitle>
                <CardDescription>{t("serverDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {!result && (
                    <div className="flex justify-center py-4">
                        <Spinner className="size-6" aria-label={t("loading")}/>
                    </div>
                )}

                {result && !result.success && (
                    <p className="text-destructive">{result.error ?? te("unknown")}</p>
                )}

                {result?.success && (
                    <>
                        <ServerSearch
                        triggerText={result.data.server?.serverName ?? t("chooseServer")}
                        search={searchServers}
                        selectedId={result.data.server?.id}
                        disabled={isPending}
                        onSelect={(server) => {
                            if (server.id !== result.data.server?.id) handleChange(() => setProfileServer(server.id))
                        }}
                        />

                        {error && <p className="text-destructive">{error}</p>}

                        {result.data.server && (
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-muted-foreground">
                                    {t("serverEnds", { date: format.dateTime(result.data.server.endsAt, { dateStyle: "long", timeStyle: "short" }) })}
                                </p>
                                <Button
                                variant="ghost"
                                disabled={isPending}
                                onClick={() => handleChange(removeProfileServer)}
                                >
                                    <IoTrash/> {t("removeServer")}
                                </Button>
                            </div>
                        )}

                        <h3 className="font-medium">{t("serverHistory")}</h3>

                        <ServerHistory servers={result.data.history}/>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
