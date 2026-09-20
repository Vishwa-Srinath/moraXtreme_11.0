"use client"

import React from "react"

type DevJsonPanelProps = {
  value: unknown
  label?: string
  collapsed?: boolean
  maxHeight?: number | string // e.g. 300 or "40vh"
}

function isDevEnv(): boolean {
  // CRA/Next/Webpack
  return process.env.NODE_ENV === "development"
}

export const JSONDebug: React.FC<DevJsonPanelProps> = ({
  value,
  label = "JSON",
  collapsed = false,
  maxHeight = 320,
}) => {
  const isDev = isDevEnv()

  const [open, setOpen] = React.useState(!collapsed)

  const pretty = React.useMemo(() => {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }, [value])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pretty)
    } catch {
      console.warn("Clipboard copy failed")
    }
  }
  if (!isDev) return null

  return (
    <div className="my-20 rounded-lg border border-black/10 bg-background font-mono text-xs shadow-md">
      <div className="bg-card-secondary-background flex items-center gap-2 border-b border-black/10 px-3 py-2">
        <strong className="font-semibold">{label}</strong>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            title={open ? "Collapse" : "Expand"}
            className="rounded-md border border-black/20 bg-background px-2 py-0.5 hover:bg-gray-50"
          >
            {open ? "▾" : "▸"}
          </button>
          <button
            onClick={copy}
            title="Copy JSON"
            className="rounded-md border border-black/20 bg-background px-2 py-0.5 hover:bg-gray-50"
          >
            Copy
          </button>
        </div>
      </div>
      {open && (
        <pre
          className="m-0 overflow-auto p-3 whitespace-pre"
          style={{ maxHeight }}
        >
          {pretty}
        </pre>
      )}
    </div>
  )
}
