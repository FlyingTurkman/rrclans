import MembersPageClient from "./page.client"
import { getTranslations } from "next-intl/server"










// The template in the clan layout adds the clan.
export async function generateMetadata() {
    const t = await getTranslations("ClanPanel")

    return { title: t("pages.members") }
}

export default function Page() {

    return (
        <MembersPageClient/>
    )
}
