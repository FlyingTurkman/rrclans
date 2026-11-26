import InventoryPageClient from "./page.client"
import { getTranslations } from "next-intl/server"










// The template in the clan layout adds the clan.
export async function generateMetadata() {
    const t = await getTranslations("ClanPage")

    return { title: t("tabs.inventory") }
}

export default function Page() {

    return (
        <InventoryPageClient/>
    )
}
