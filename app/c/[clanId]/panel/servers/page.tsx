import ServersPageClient from "./page.client"
import { getTranslations } from "next-intl/server"










// The template in the clan layout adds the clan.
export async function generateMetadata() {
    const t = await getTranslations("ClanPanel")

    return { title: t("pages.servers") }
}

export default function Page() {

    return (
        <ServersPageClient/>
    )
}
