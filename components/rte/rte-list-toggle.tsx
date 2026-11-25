"use client"

import type { ComponentProps } from "react"
import { List, ListOrdered } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useRTE } from "./use-rte"
import type { RTELineListType } from "./rte-engine"

export type RTEListToggleProps = Omit<
  ComponentProps<typeof ToggleGroup>,
  "multiple" | "value" | "onValueChange" | "defaultValue"
> & {
  isBulletActive?: boolean
  isNumberActive?: boolean
}

function RTEListToggle({
  isBulletActive = true,
  isNumberActive = true,
  ...props
}: RTEListToggleProps) {
  const { activeListType, setListType } = useRTE()

  return (
    <ToggleGroup
      value={activeListType === "none" ? [] : [activeListType]}
      onValueChange={([value]) => setListType((value ?? "none") as RTELineListType)}
      data-slot="rte-list-toggle"
      {...props}
    >
      {isBulletActive && (
        <ToggleGroupItem value="bullet" aria-label="Bulleted list">
          <List className="size-4" />
        </ToggleGroupItem>
      )}
      {isNumberActive && (
        <ToggleGroupItem value="number" aria-label="Numbered list">
          <ListOrdered className="size-4" />
        </ToggleGroupItem>
      )}
    </ToggleGroup>
  )
}

export { RTEListToggle }
