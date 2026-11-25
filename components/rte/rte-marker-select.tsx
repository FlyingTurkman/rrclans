"use client"

import { useMemo, useState, type ComponentProps, type KeyboardEvent } from "react"
import { Highlighter } from "lucide-react"
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
  if (typeof document === "undefined") return "#ffff00"

  const probe = document.createElement("div")
  probe.style.color = value
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe).color
  document.body.removeChild(probe)

  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return "#ffff00"

  const [, r, g, b] = match
  return `#${[r, g, b].map(n => Number(n).toString(16).padStart(2, "0")).join("")}`
}

export type RTEMarkerSelectProps = ComponentProps<typeof PopoverContent>

function RTEMarkerSelect({ className, ...props }: RTEMarkerSelectProps) {
  const { activeMarkerColor, applyMarkerColor } = useRTE()
  const [customColor, setCustomColor] = useState("")
  const hexColor = useMemo(
    () => cssColorToHex(activeMarkerColor === "transparent" ? "#ffff00" : activeMarkerColor),
    [activeMarkerColor],
  )

  const applyCustomColor = () => {
    const value = customColor.trim()
    if (!value) return
    applyMarkerColor(value)
  }

  const handleCustomColorKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      applyCustomColor()
    }
  }

  return (
    <Popover>
      <PopoverTrigger render={<Button data-slot="rte-marker-select" type="button" variant="outline" size="sm" aria-label="Marker color" className="w-9 p-0" />}><Highlighter
                      className="size-4"
                      style={{
                        color: activeMarkerColor === "transparent" ? undefined : activeMarkerColor,
                      }}
                    /></PopoverTrigger>
      <PopoverContent className={cn("w-56", className)} {...props}>
        <input
          type="color"
          aria-label="Pick a marker color"
          value={hexColor}
          onChange={event => applyMarkerColor(event.target.value)}
          className="h-32 w-full cursor-pointer rounded-md border border-border p-1"
        />
        <div className="mt-3 flex items-center gap-2">
          <Input
            value={customColor}
            onChange={event => setCustomColor(event.target.value)}
            onKeyDown={handleCustomColorKeyDown}
            placeholder="rgb(255, 255, 0) or #ffff00"
            className="h-8"
          />
          <Button type="button" size="sm" onClick={applyCustomColor}>
            Apply
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          onClick={() => applyMarkerColor("transparent")}
        >
          Clear highlight
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export { RTEMarkerSelect }
