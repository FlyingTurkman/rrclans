"use client"

import type { ComponentProps } from "react"
import { ALargeSmall } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRTE } from "./use-rte"

const RTE_FONT_SIZE_OPTIONS = [
  { label: "Small", value: "12px" },
  { label: "Default", value: "inherit" },
  { label: "Medium", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "X-Large", value: "24px" },
]

export type RTEFontSizeSelectProps = Omit<
  ComponentProps<typeof Select>,
  "value" | "onValueChange"
> & {
  options?: typeof RTE_FONT_SIZE_OPTIONS
}

function RTEFontSizeSelect({
  options = RTE_FONT_SIZE_OPTIONS,
  ...props
}: RTEFontSizeSelectProps) {
  const { activeFontSize, applyFontSize } = useRTE()

  return (
    <Select
      items={options}
      value={activeFontSize}
      onValueChange={value => typeof value === "string" && applyFontSize(value)}
      {...props}
    >
      <SelectTrigger data-slot="rte-font-size-select" size="sm" className="w-28">
        <ALargeSmall className="size-4 text-muted-foreground" />
        <SelectValue placeholder="Size" />
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

export { RTEFontSizeSelect }
