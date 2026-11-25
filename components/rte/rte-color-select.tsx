"use client"

import { useMemo, useState, type ComponentProps, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useRTE } from "./use-rte"

function cssColorToHex(value: string): string {
  if (typeof document === "undefined") return "#000000"

  const probe = document.createElement("div")
  probe.style.color = value
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe).color
  document.body.removeChild(probe)

  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return "#000000"

  const [, r, g, b] = match
  return `#${[r, g, b].map(n => Number(n).toString(16).padStart(2, "0")).join("")}`
}

export type RTEColorSelectProps = ComponentProps<typeof PopoverContent>

function RTEColorSelect({ className, ...props }: RTEColorSelectProps) {
  const { activeColor, applyColor } = useRTE()
  const [customColor, setCustomColor] = useState("")
  const hexColor = useMemo(() => cssColorToHex(activeColor), [activeColor])

  const applyCustomColor = () => {
    const value = customColor.trim()
    if (!value) return
    applyColor(value)
  }

  const handleCustomColorKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      applyCustomColor()
    }
  }

  return (
    <Popover>
      <PopoverTrigger render={<Button data-slot="rte-color-select" type="button" variant="outline" size="sm" aria-label="Text color" className="w-9 p-0" />}><span
                      aria-hidden
                      className="size-4 rounded-full border border-border"
                      style={{ backgroundColor: hexColor }}
                    /></PopoverTrigger>
      <PopoverContent className={cn("w-56", className)} {...props}>
        <input
          type="color"
          aria-label="Pick a text color"
          value={hexColor}
          onChange={event => applyColor(event.target.value)}
          className="h-32 w-full cursor-pointer rounded-md border border-border p-1"
        />
        <div className="mt-3 flex items-center gap-2">
          <Input
            value={customColor}
            onChange={event => setCustomColor(event.target.value)}
            onKeyDown={handleCustomColorKeyDown}
            placeholder="rgb(0, 0, 0) or #000000"
            className="h-8"
          />
          <Button type="button" size="sm" onClick={applyCustomColor}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { RTEColorSelect }
