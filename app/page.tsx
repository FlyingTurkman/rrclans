import HomePageClient from "./page.client"
import { getTranslations } from "next-intl/server"
import { buildMetadata, SITE_NAME } from "@/lib/metadata"










// The default title of the root layout is used, it already names the site.
export async function generateMetadata() {
    const t = await getTranslations("Metadata")

    return buildMetadata({ sharedTitle: `${SITE_NAME} - ${t("tagline")}`, description: t("description") })
}

export default function Page() {

    return (
        <HomePageClient/>
    )
}
