import type { ReactNode } from "react"
import PanelLayoutClient from "./layout.client"
import type { Metadata } from "next"










// Private area: search engines must not list it.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
}

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {

    return (
        <PanelLayoutClient>
            {children}
        </PanelLayoutClient>
    )
}
