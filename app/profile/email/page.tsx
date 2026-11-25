import EmailPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("profileEmail", false)
}

export default function Page() {

    return (
        <EmailPageClient/>
    )
}
