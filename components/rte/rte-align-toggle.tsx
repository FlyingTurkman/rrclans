"use client"

import type { ComponentProps } from "react"
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useRTE } from "./use-rte"
import type { RTETextAlign } from "./rte-engine"

const RTE_ALIGN_OPTIONS = [
  { value: "left", label: "Align left", icon: AlignLeft },
  { value: "center", label: "Align center", icon: AlignCenter },
  { value: "right", label: "Align right", icon: AlignRight },
  { value: "justify", label: "Justify", icon: AlignJustify },
] as const

export type RTEAlignToggleProps = Omit<
  ComponentProps<typeof ToggleGroup>,
  "multiple" | "value" | "onValueChange" | "defaultValue"
> & {
  isLeftActive?: boolean
  isCenterActive?: boolean
  isRightActive?: boolean
  isJustifyActive?: boolean
}

function RTEAlignToggle({
  isLeftActive = true,
  isCenterActive = true,
  isRightActive = true,
  isJustifyActive = true,
  ...props
}: RTEAlignToggleProps) {
  const { activeAlign, setAlign } = useRTE()

  const visibility: Record<(typeof RTE_ALIGN_OPTIONS)[number]["value"], boolean> = {
    left: isLeftActive,
    center: isCenterActive,
    right: isRightActive,
    justify: isJustifyActive,
  }

  return (
    <ToggleGroup
      value={[activeAlign]}
      onValueChange={([value]) => value && setAlign(value as RTETextAlign)}
      data-slot="rte-align-toggle"
      {...props}
    >
      {RTE_ALIGN_OPTIONS.filter(option => visibility[option.value]).map(
        ({ value, label, icon: Icon }) => (
          <ToggleGroupItem key={value} value={value} aria-label={label}>
            <Icon className="size-4" />
          </ToggleGroupItem>
        ),
      )}
    </ToggleGroup>
  )
}

export { RTEAlignToggle }
