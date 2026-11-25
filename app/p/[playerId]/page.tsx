import PlayerIdPageClient from "./page.client"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { buildMetadata } from "@/lib/metadata"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"










type PageProps = {
    params: Promise<{ playerId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const t = await getTranslations("Metadata")
    const parsed = objectIdSchema.safeParse((await params).playerId)

    // A database problem must not break the page: the page shows the error.
    const user = parsed.success
        ? await prisma.user.findUnique({ where: { id: parsed.data }, select: { username: true } }).catch(() => null)
        : null

    if (!user) return { title: t("playerNotFound"), robots: { index: false } }

    return buildMetadata({
        title: user.username,
        sharedTitle: user.username,
        description: t("playerDescription", { name: user.username }),
    })
}

export default function Page() {

    return (
        <PlayerIdPageClient/>
    )
}
