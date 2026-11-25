import { cookies, headers } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config"

// Picks the first supported language from the browser's Accept-Language header.
function localeFromAcceptLanguage(header: string | null): Locale | undefined {
    if (!header) return undefined

    const languages = header
        .split(",")
        .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase())

    return languages.find(isLocale)
}

// Locale is resolved without URL prefixes:
// 1. the NEXT_LOCALE cookie, 2. the browser language, 3. the default locale.
export default getRequestConfig(async () => {
    const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value
    const browserLocale = localeFromAcceptLanguage((await headers()).get("accept-language"))

    const locale: Locale = isLocale(cookieLocale)
        ? cookieLocale
        : browserLocale ?? defaultLocale

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    }
})
