"use client"

import { useCallback, useId, useMemo, useRef, useState, type ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { RTEContext } from "./use-rte"
import {
  applyStyleToRange,
  createEmptyDocument,
  getActiveStyle,
  getLineAlign,
  getLineListType,
  setLineAlign,
  setLineListType,
  type RTEDocument,
  type RTELineListType,
  type RTERunStyle,
  type RTESelectionRange,
  type RTETextAlign,
} from "./rte-engine"

const DEFAULT_HISTORY_LIMIT = 100
const HISTORY_COALESCE_MS = 500

export type RTEProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  defaultValue?: RTEDocument
  value?: RTEDocument
  onValueChange?: (document: RTEDocument) => void
  historyLimit?: number
  maxLength?: number
}

function RTE({
  className,
  defaultValue,
  value,
  onValueChange,
  historyLimit = DEFAULT_HISTORY_LIMIT,
  maxLength,
  children,
  ...props
}: RTEProps) {
  const id = useId()
  const [uncontrolledDocument, setUncontrolledDocument] = useState<RTEDocument>(
    () => defaultValue ?? createEmptyDocument(id),
  )
  const [selection, setSelection] = useState<RTESelectionRange | null>(null)
  const [pendingStyle, setPendingStyle] = useState<RTERunStyle | null>(null)
  const [pendingStyleAnchor, setPendingStyleAnchor] = useState<number | null>(null)
  const [past, setPast] = useState<RTEDocument[]>([])
  const [future, setFuture] = useState<RTEDocument[]>([])
  const lastPushRef = useRef(0)
  const isHistoryActionRef = useRef(false)

  const document = value ?? uncontrolledDocument

  const setDocument = useCallback(
    (next: RTEDocument) => {
      if (!isHistoryActionRef.current) {
        const now = Date.now()
        if (now - lastPushRef.current > HISTORY_COALESCE_MS) {
          setPast(prev => [...prev, document].slice(-historyLimit))
        }
        lastPushRef.current = now
        setFuture([])
      }
      setUncontrolledDocument(next)
      onValueChange?.(next)
    },
    [document, onValueChange, historyLimit],
  )

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  const undo = useCallback(() => {
    if (past.length === 0) return
    const previous = past[past.length - 1]
    setPast(prev => prev.slice(0, -1))
    setFuture(prev => [document, ...prev].slice(0, historyLimit))
    setSelection(null)
    isHistoryActionRef.current = true
    setDocument(previous)
    isHistoryActionRef.current = false
  }, [past, document, setDocument, historyLimit])

  const redo = useCallback(() => {
    if (future.length === 0) return
    const next = future[0]
    setFuture(prev => prev.slice(1))
    setPast(prev => [...prev, document].slice(-historyLimit))
    setSelection(null)
    isHistoryActionRef.current = true
    setDocument(next)
    isHistoryActionRef.current = false
  }, [future, document, setDocument, historyLimit])

  const baseActiveStyle = useMemo(
    () => getActiveStyle(document, selection?.start ?? 0, selection?.end ?? 0),
    [document, selection],
  )

  const isPendingStyleActive =
    pendingStyle !== null &&
    selection !== null &&
    selection.start === selection.end &&
    selection.start === pendingStyleAnchor

  const {
    fontFamily: activeFontFamily,
    fontSize: activeFontSize,
    color: activeColor,
    markerColor: activeMarkerColor,
    format: activeFormat,
  } = isPendingStyleActive ? (pendingStyle as RTERunStyle) : baseActiveStyle

  const applyPatch = useCallback(
    (patch: Partial<RTERunStyle>) => {
      const range = selection ?? { start: 0, end: 0 }

      if (range.start === range.end) {
        const base = isPendingStyleActive ? (pendingStyle as RTERunStyle) : baseActiveStyle
        setPendingStyle({ ...base, ...patch })
        setPendingStyleAnchor(range.start)
        return
      }

      setDocument(applyStyleToRange(document, range.start, range.end, patch))
    },
    [document, selection, setDocument, isPendingStyleActive, pendingStyle, baseActiveStyle],
  )

  const applyFontFamily = useCallback(
    (fontFamily: string) => applyPatch({ fontFamily }),
    [applyPatch],
  )

  const applyFontSize = useCallback((fontSize: string) => applyPatch({ fontSize }), [applyPatch])

  const applyColor = useCallback((color: string) => applyPatch({ color }), [applyPatch])

  const applyMarkerColor = useCallback(
    (markerColor: string) => applyPatch({ markerColor }),
    [applyPatch],
  )

  const applyFormat = useCallback((format: string[]) => applyPatch({ format }), [applyPatch])

  const activeListType = useMemo(
    () => getLineListType(document, selection?.start ?? 0),
    [document, selection],
  )

  const setListType = useCallback(
    (type: RTELineListType) => {
      const range = selection ?? { start: 0, end: 0 }
      const { document: next, offsetDelta } = setLineListType(document, range.start, type)
      setDocument(next)
      setSelection({ start: range.start + offsetDelta, end: range.end + offsetDelta })
    },
    [document, selection, setDocument, setSelection],
  )

  const activeAlign = useMemo(
    () => getLineAlign(document, selection?.start ?? 0),
    [document, selection],
  )

  const setAlign = useCallback(
    (align: RTETextAlign) => {
      const range = selection ?? { start: 0, end: 0 }
      setDocument(setLineAlign(document, range.start, range.end, align))
    },
    [document, selection, setDocument],
  )

  const contextValue = useMemo(
    () => ({
      document,
      setDocument,
      selection,
      setSelection,
      pendingStyle: isPendingStyleActive ? pendingStyle : null,
      pendingStyleAnchor,
      setPendingStyleAnchor,
      activeFontFamily,
      activeFontSize,
      activeColor,
      activeMarkerColor,
      activeFormat,
      applyFontFamily,
      applyFontSize,
      applyColor,
      applyMarkerColor,
      applyFormat,
      activeListType,
      setListType,
      activeAlign,
      setAlign,
      undo,
      redo,
      canUndo,
      canRedo,
      maxLength,
    }),
    [
      document,
      setDocument,
      selection,
      isPendingStyleActive,
      pendingStyle,
      pendingStyleAnchor,
      activeFontFamily,
      activeFontSize,
      activeColor,
      activeMarkerColor,
      activeFormat,
      applyFontFamily,
      applyFontSize,
      applyColor,
      applyMarkerColor,
      applyFormat,
      activeListType,
      setListType,
      activeAlign,
      setAlign,
      undo,
      redo,
      canUndo,
      canRedo,
      maxLength,
    ],
  )

  return (
    <RTEContext.Provider value={contextValue}>
      <div data-slot="rte" className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
      </div>
    </RTEContext.Provider>
  )
}

export { RTE }
