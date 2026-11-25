import type { ReactNode } from "react"
import ClanIdLayoutClient from "./layout.client"










export default function Layout({ children }: Readonly<{ children: ReactNode }>) {

    return (
        <ClanIdLayoutClient>
            {children}
        </ClanIdLayoutClient>
    )
}
