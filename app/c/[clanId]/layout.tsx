import type { ReactNode } from "react"
import ClanIdLayoutClient from "./layout.client"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { buildMetadata, SITE_NAME } from "@/lib/metadata"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"










type LayoutProps = {
    params: Promise<{ clanId: string }>
    children: ReactNode
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
    const t = await getTranslations("Metadata")
    const parsed = objectIdSchema.safeParse((await params).clanId)

    // A database problem must not break the page: the layout shows the error.
    const clan = parsed.success
        ? await prisma.clan.findUnique({ where: { id: parsed.data }, select: { clanName: true, clanTag: true } }).catch(() => null)
        : null

    if (!clan) return { title: t("clanNotFound"), robots: { index: false } }

    const name = `[${clan.clanTag}] ${clan.clanName}`

    return buildMetadata({
        // Pages of the clan: "Members · [TAG] Clan | RR Clans".
        title: { default: name, template: `%s · ${name} | ${SITE_NAME}` },
        sharedTitle: name,
        description: t("clanDescription", { name }),
    })
}

export default function Layout({ children }: Readonly<LayoutProps>) {

    return (
        <ClanIdLayoutClient>
            {children}
        </ClanIdLayoutClient>
    )
}
