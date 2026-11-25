import type { Metadata, Viewport } from "next"
import { Geist_Mono, Saira } from "next/font/google"
import "./globals.css"
import MainMenu from "@/components/layout/MainMenu"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getTranslations } from "next-intl/server"
import { buildMetadata, SITE_NAME } from "@/lib/metadata"
import { SiteContextProvider } from "@/context/SiteContext"

// Saira: bold, squared geometric sans close to the ROB RUN logo lettering.
// latin-ext is required for Turkish characters (ğ, ş, ı, İ).
const saira = Saira({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  // Width axis: enables condensed text (font-stretch-*), like the in-game menu.
  axes: ["wdth"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const viewport: Viewport = {
  themeColor: "#1b1b1b",
  colorScheme: "dark",
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")
  const title = `${SITE_NAME} - ${t("tagline")}`

  return {
    applicationName: SITE_NAME,
    ...await buildMetadata({
      title: { default: title, template: `%s | ${SITE_NAME}` },
      sharedTitle: title,
      description: t("description"),
    }),
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html lang={locale} className={`dark ${saira.variable} ${geistMono.variable}`}>
      <body
        className="antialiased"
      >
        <NextIntlClientProvider>
          <SiteContextProvider>
            <MainMenu/>
            {children}
          </SiteContextProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
