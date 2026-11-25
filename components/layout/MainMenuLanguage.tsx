'use client'

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import ReactCountryFlag from "react-country-flag"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { setLocale } from "@/i18n/actions"
import { locales, type Locale } from "@/i18n/config"









// Country flag (ISO 3166 code) of each language.
const flags: Record<Locale, string> = {
    en: "GB",
    tr: "TR",
}

// Language select of the main menu.
export default function MainMenuLanguage() {
    const t = useTranslations("Language")
    const locale = useLocale()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    function handleChange(newLocale: Locale) {
        if (newLocale === locale) return

        startTransition(async () => {
            await setLocale(newLocale)
            router.refresh()
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
            className="flex items-center text-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            aria-label={t("label", { language: t(locale) })}
            disabled={isPending}
            >
                {isPending ? (
                    <Spinner className="size-5" aria-label={t("loading")}/>
                ) : (
                    <ReactCountryFlag
                    countryCode={flags[locale]}
                    svg
                    alt=""
                    />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
            align="end"
            className="w-36"
            >
                <DropdownMenuRadioGroup
                value={locale}
                onValueChange={handleChange}
                >
                    {locales.map((item) => {

                        return (
                            <DropdownMenuRadioItem
                            key={item}
                            value={item}
                            closeOnClick
                            >
                                <ReactCountryFlag
                                countryCode={flags[item]}
                                svg
                                alt=""
                                />
                                {t(item)}
                            </DropdownMenuRadioItem>
                        )
                    })}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
