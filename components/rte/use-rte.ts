"use client"

import { createContext, useContext } from "react"
import type {
  RTEDocument,
  RTELineListType,
  RTERunStyle,
  RTESelectionRange,
  RTETextAlign,
} from "./rte-engine"

export type RTEContextValue = {
  document: RTEDocument
  setDocument: (document: RTEDocument) => void
  selection: RTESelectionRange | null
  setSelection: (selection: RTESelectionRange | null) => void
  pendingStyle: RTERunStyle | null
  pendingStyleAnchor: number | null
  setPendingStyleAnchor: (offset: number | null) => void
  activeFontFamily: string
  activeFontSize: string
  activeColor: string
  activeMarkerColor: string
  activeFormat: string[]
  applyFontFamily: (fontFamily: string) => void
  applyFontSize: (fontSize: string) => void
  applyColor: (color: string) => void
  applyMarkerColor: (markerColor: string) => void
  applyFormat: (format: string[]) => void
  activeListType: RTELineListType
  setListType: (type: RTELineListType) => void
  activeAlign: RTETextAlign
  setAlign: (align: RTETextAlign) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  maxLength: number | undefined
}

export const RTEContext = createContext<RTEContextValue | null>(null)

export function useRTE() {
  const context = useContext(RTEContext)

  if (!context) {
    throw new Error("useRTE must be used within an <RTE> component.")
  }

  return context
}
