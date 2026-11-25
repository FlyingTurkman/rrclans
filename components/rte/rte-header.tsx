"use client"

import { Fragment, type ComponentProps, type MouseEvent, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { RTEUndo } from "./rte-undo"
import { RTERedo } from "./rte-redo"
import { RTEFontSizeSelect } from "./rte-font-size-select"
import { RTEFormatToggle } from "./rte-format-toggle"
import { RTEListToggle } from "./rte-list-toggle"
import { RTEAlignToggle } from "./rte-align-toggle"
import { RTESeparator } from "./rte-separator"

export type RTEToolbarItem =
  | "undo"
  | "redo"
  | "fontSize"
  | "format"
  | "list"
  | "align"
  | "separator"

const RTE_TOOLBAR_ITEMS: Record<RTEToolbarItem, () => ReactNode> = {
  undo: () => <RTEUndo />,
  redo: () => <RTERedo />,
  fontSize: () => <RTEFontSizeSelect />,
  format: () => <RTEFormatToggle />,
  list: () => <RTEListToggle />,
  align: () => <RTEAlignToggle />,
  separator: () => <RTESeparator />,
}

export type RTEHeaderProps = ComponentProps<"div"> & {
  toolbar?: RTEToolbarItem[]
}

function RTEHeader({ className, onMouseDown, toolbar, children, ...props }: RTEHeaderProps) {
  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    // Keep the selection in the editor. Events from portaled popovers also
    // bubble here in React, their inputs must stay focusable.
    if (event.currentTarget.contains(event.target as Node)) event.preventDefault()
    onMouseDown?.(event)
  }

  return (
    <div
      data-slot="rte-header"
      onMouseDown={handleMouseDown}
      className={cn(
        "flex flex-wrap items-center gap-1 border-b border-border pb-2",
        className,
      )}
      {...props}
    >
      {children ??
        toolbar?.map((item, index) => (
          <Fragment key={`${item}-${index}`}>{RTE_TOOLBAR_ITEMS[item]()}</Fragment>
        ))}
    </div>
  )
}

export { RTEHeader }
