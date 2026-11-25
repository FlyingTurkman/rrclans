'use client'

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { getClanPosts } from "@/actions/clan-posts/get-clan-posts"
import ClanPostCard from "@/components/clans/ClanPostCard"
import ClanPostForm from "@/components/clans/ClanPostForm"
import ListPagination from "@/components/layout/ListPagination"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useClanContext } from "@/context/ClanContext"
import { clanPostQuerySchema } from "@/lib/schemas/clan-post-query.schema"
import type { ActionResult, ClanPostList } from "@/types"









// Result of the last request and the page it belongs to.
type LoadedPosts = {
    page: number
    result: ActionResult<ClanPostList>
}

const NEW_POST = "new"

// Wall: home page of the clan, with its blog posts.
export default function ClanIdPageClient() {
    const t = useTranslations("ClanWall")
    const searchParams = useSearchParams()
    const { clan, canManage } = useClanContext()

    const { page } = useMemo(() => clanPostQuerySchema.parse(Object.fromEntries(searchParams)), [searchParams])

    const [loaded, setLoaded] = useState<LoadedPosts | null>(null)
    // Increased to load the posts again after a change.
    const [version, setVersion] = useState(0)
    // Id of the post being edited, NEW_POST or null.
    const [editing, setEditing] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        getClanPosts(clan.id, { page })
            .catch((): ActionResult<ClanPostList> => ({ success: false }))
            .then((result) => {
                if (!cancelled) setLoaded({ page, result })
            })

        return () => {
            cancelled = true
        }
    }, [clan.id, page, version])

    const result = loaded?.page === page ? loaded.result : null

    function handleSaved() {
        setEditing(null)
        setVersion((current) => current + 1)
    }

    return (
        <>
            {canManage && editing === null && (
                <Button
                className="self-start"
                onClick={() => setEditing(NEW_POST)}
                >
                    {t("newPost")}
                </Button>
            )}

            {canManage && editing === NEW_POST && (
                <ClanPostForm
                clanId={clan.id}
                onSaved={handleSaved}
                onCancel={() => setEditing(null)}
                />
            )}

            {!result && (
                <div className="flex justify-center py-10">
                    <Spinner className="size-6" aria-label={t("loading")}/>
                </div>
            )}

            {result && !result.success && (
                <p className="text-destructive">{result.error ?? t("loadError")}</p>
            )}

            {result?.success && result.data.posts.length === 0 && editing === null && (
                <p className="text-muted-foreground">{t("empty")}</p>
            )}

            {result?.success && result.data.posts.length > 0 && (
                <ul className="flex flex-col gap-4">
                    {result.data.posts.map((post) => {

                        return (
                            <li key={post.id}>
                                {post.canEdit && editing === post.id ? (
                                    <ClanPostForm
                                    clanId={clan.id}
                                    post={post}
                                    onSaved={handleSaved}
                                    onCancel={() => setEditing(null)}
                                    />
                                ) : (
                                    <ClanPostCard
                                    post={post}
                                    onEdit={() => setEditing(post.id)}
                                    onDeleted={() => setVersion((current) => current + 1)}
                                    />
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}

            {result?.success && (
                <ListPagination
                page={page}
                pageCount={result.data.pageCount}
                />
            )}
        </>
    )
}
