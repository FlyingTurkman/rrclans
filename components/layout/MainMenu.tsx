import Link from "next/link"
import MainMenuSearchBar from "./MainMenuSearchBar"
import MainMenuAuth from "./MainMenuAuth"
import MainMenuLanguage from "./MainMenuLanguage"
import { useTranslations } from "next-intl"

// Main navigation links shown in the top bar.
// `label` is a translation key in the "MainMenu" namespace.
const menuItems = [
    { label: "clans", href: "/clans" },
    { label: "players", href: "/players" },
] as const

export default function MainMenu() {
    const t = useTranslations("MainMenu")

    return (
        <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
            <nav className="flex items-center gap-6 px-4 py-3">
                <Link
                    href="/"
                    className="font-heading text-2xl font-extrabold italic uppercase font-stretch-condensed"
                >
                    RR Clans
                </Link>

                <ul className="flex items-center gap-4">
                    {menuItems.map((item) => {

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="text-sm font-medium opacity-80 transition-opacity hover:opacity-100"
                                >
                                    {t(item.label)}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
                <MainMenuSearchBar/>
                <div className="ml-auto flex items-center gap-4">
                    <MainMenuAuth/>
                    <MainMenuLanguage/>
                </div>
            </nav>
        </header>
    )
}
