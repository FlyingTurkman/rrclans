'use client'

import { useTranslations } from "next-intl"
import {
    RTE,
    RTEAlignToggle,
    RTECharacterCount,
    RTEContent,
    RTEFontSizeSelect,
    RTEFooter,
    RTEFormatToggle,
    RTEHeader,
    RTEListToggle,
    RTERedo,
    RTEUndo,
    type RTEDocument,
} from "@/components/rte"
import { editorFontSizes } from "@/lib/src/editorOptions"









// Translation keys of the options in lib/src/editorOptions.ts.
const sizeLabels = {
    "12px": "sizeSmall",
    "inherit": "sizeDefault",
    "16px": "sizeMedium",
    "20px": "sizeLarge",
    "24px": "sizeXLarge",
} as const satisfies Record<(typeof editorFontSizes)[number], string>

type RichTextEditorProps = {
    value: RTEDocument
    onValueChange: (value: RTEDocument) => void
    maxLength: number
    invalid?: boolean
    label: string
}

// Rich text editor (https://rte-shadcn.vercel.app) with the options the server
// accepts. There are no font family and color options on purpose.
export default function RichTextEditor({ value, onValueChange, maxLength, invalid, label }: RichTextEditorProps) {
    const t = useTranslations("Editor")

    return (
        <RTE
        value={value}
        onValueChange={onValueChange}
        maxLength={maxLength}
        >
            <RTEHeader>
                <RTEUndo/>
                <RTERedo/>
                <RTEFontSizeSelect options={editorFontSizes.map((size) => ({ value: size, label: t(sizeLabels[size]) }))}/>
                <RTEFormatToggle isStrikethroughActive/>
                <RTEListToggle/>
                <RTEAlignToggle/>
            </RTEHeader>
            <RTEContent
            role="textbox"
            aria-multiline
            aria-label={label}
            aria-invalid={invalid}
            className="min-h-48"
            />
            <RTEFooter>
                <RTECharacterCount className="text-xs text-muted-foreground"/>
            </RTEFooter>
        </RTE>
    )
}
