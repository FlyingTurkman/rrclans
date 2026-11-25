'use client'

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import RichTextContent from "@/components/editor/RichTextContent"
import { Button } from "@/components/ui/button"









type RichTextPreviewProps = {
    html: string
}

// First 3 lines of a rich text. Longer texts can be opened and closed.
export default function RichTextPreview({ html }: RichTextPreviewProps) {
    const t = useTranslations("Editor")

    const ref = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isCut, setIsCut] = useState(false)

    // The number of lines depends on the width, so measure again on resize.
    // While open nothing is cut, the last measurement is kept.
    useEffect(() => {
        const element = ref.current

        if (!element || isOpen) return

        const observer = new ResizeObserver(() => setIsCut(element.scrollHeight > element.clientHeight + 1))

        observer.observe(element)

        return () => observer.disconnect()
    }, [html, isOpen])

    return (
        <div className="flex flex-col items-start gap-1">
            <div
            ref={ref}
            className={isOpen ? "w-full" : "line-clamp-3 w-full"}
            >
                <RichTextContent html={html}/>
            </div>
            {isCut && (
                <Button
                variant="link"
                className="px-0"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((current) => !current)}
                >
                    {isOpen ? t("readLess") : t("readMore")}
                </Button>
            )}
        </div>
    )
}
