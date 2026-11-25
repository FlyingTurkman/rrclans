import LfpPageClient from "./page.client"
import { getTranslations } from "next-intl/server"










// The template in the clan layout adds the clan.
export async function generateMetadata() {
    const t = await getTranslations("ClanPanel")

    return { title: t("pages.lfp") }
}

export default function Page() {

    return (
        <LfpPageClient/>
    )
}
