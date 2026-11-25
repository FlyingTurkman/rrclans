import "server-only"
import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

export const SITE_NAME = "RR Clans"

// Pages with a text in "Metadata.pages" of the message files.
type MetadataPage =
    | "clans" | "players" | "lfc" | "lfp"
    | "login" | "register" | "profile" | "notifications"
    | "profileServer" | "profileInvites" | "profileEmail" | "profilePassword"

type BuildMetadataInput = {
    title?: Metadata["title"]
    // Title on shared links, without the site name.
    sharedTitle: string
    description: string
    // False for private pages: search engines must not list them.
    isIndexed?: boolean
}

/** Metadata of a page in the active language, with data for shared links. */
export async function buildMetadata({ title, sharedTitle, description, isIndexed = true }: BuildMetadataInput): Promise<Metadata> {
    const locale = await getLocale()

    return {
        ...(title !== undefined && { title }),
        description,
        ...(!isIndexed && { robots: { index: false, follow: false } }),
        openGraph: { type: "website", siteName: SITE_NAME, locale, title: sharedTitle, description },
        twitter: { card: "summary", title: sharedTitle, description },
    }
}

/** Metadata of a fixed page. */
export async function getPageMetadata(page: MetadataPage, isIndexed = true): Promise<Metadata> {
    const t = await getTranslations("Metadata")
    const title = t(`pages.${page}.title`)

    return buildMetadata({ title, sharedTitle: title, description: t(`pages.${page}.description`), isIndexed })
}
