"use client"

import type { ComponentProps } from "react"
import { Type } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRTE } from "./use-rte"

const RTE_FONT_OPTIONS = [
  { label: "Default", value: "inherit" },
  { label: "Geist", value: "var(--font-geist-sans), sans-serif" },
  { label: "Geist Mono", value: "var(--font-geist-mono), monospace" },
  { label: "Inter", value: "var(--font-inter), sans-serif" },
  { label: "Noto Sans", value: "var(--font-noto-sans), sans-serif" },
  { label: "Nunito Sans", value: "var(--font-nunito-sans), sans-serif" },
  { label: "Figtree", value: "var(--font-figtree), sans-serif" },
  { label: "Roboto", value: "var(--font-roboto), sans-serif" },
  { label: "Raleway", value: "var(--font-raleway), sans-serif" },
  { label: "DM Sans", value: "var(--font-dm-sans), sans-serif" },
  { label: "Public Sans", value: "var(--font-public-sans), sans-serif" },
  { label: "Outfit", value: "var(--font-outfit), sans-serif" },
  { label: "Oxanium", value: "var(--font-oxanium), sans-serif" },
]

export type RTEFontSelectProps = Omit<
  ComponentProps<typeof Select>,
  "value" | "onValueChange"
> & {
  options?: typeof RTE_FONT_OPTIONS
}

function RTEFontSelect({ options = RTE_FONT_OPTIONS, ...props }: RTEFontSelectProps) {
  const { activeFontFamily, applyFontFamily } = useRTE()

  return (
    <Select
      items={options}
      value={activeFontFamily}
      onValueChange={value => typeof value === "string" && applyFontFamily(value)}
      {...props}
    >
      <SelectTrigger data-slot="rte-font-select" size="sm" className="w-40">
        <Type className="size-4 text-muted-foreground" />
        <SelectValue placeholder="Font" />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { RTEFontSelect }
