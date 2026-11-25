import PasswordPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("profilePassword", false)
}

export default function Page() {

    return (
        <PasswordPageClient/>
    )
}
