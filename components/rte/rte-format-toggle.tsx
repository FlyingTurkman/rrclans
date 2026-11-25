"use client"

import type { ComponentProps, SVGProps } from "react"
import { Bold, Italic, Underline, Strikethrough } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useRTE } from "./use-rte"

function Overline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 20v-6a6 6 0 0 1 12 0v6" />
      <line x1="4" x2="20" y1="4" y2="4" />
    </svg>
  )
}

const RTE_MARKS = {
  bold: { label: "Bold", icon: Bold },
  italic: { label: "Italic", icon: Italic },
  underline: { label: "Underline", icon: Underline },
  strikethrough: { label: "Strikethrough", icon: Strikethrough },
  overline: { label: "Overline", icon: Overline },
} as const

export type RTEFormatToggleProps = Omit<
  ComponentProps<typeof ToggleGroup>,
  "multiple" | "value" | "onValueChange" | "defaultValue"
> & {
  isBoldActive?: boolean
  isItalicActive?: boolean
  isUnderlineActive?: boolean
  isStrikethroughActive?: boolean
  isOverlineActive?: boolean
}

function RTEFormatToggle({
  isBoldActive = true,
  isItalicActive = true,
  isUnderlineActive = true,
  isStrikethroughActive = false,
  isOverlineActive = false,
  ...props
}: RTEFormatToggleProps) {
  const { activeFormat, applyFormat } = useRTE()

  const visibleMarks = (
    [
      ["bold", isBoldActive],
      ["italic", isItalicActive],
      ["underline", isUnderlineActive],
      ["strikethrough", isStrikethroughActive],
      ["overline", isOverlineActive],
    ] as const
  ).filter(([, active]) => active)

  return (
    <ToggleGroup
      multiple
      value={activeFormat}
      onValueChange={applyFormat}
      data-slot="rte-format-toggle"
      {...props}
    >
      {visibleMarks.map(([mark]) => {
        const { label, icon: Icon } = RTE_MARKS[mark]
        return (
          <ToggleGroupItem key={mark} value={mark} aria-label={label}>
            <Icon className="size-4" />
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}

export { RTEFormatToggle }
