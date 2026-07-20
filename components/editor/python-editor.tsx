"use client"

import Editor, { type OnMount } from "@monaco-editor/react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

type PythonEditorProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  readOnly?: boolean
}

export const PythonEditor = ({
  value,
  onChange,
  className,
  readOnly = false,
}: PythonEditorProps) => {
  const [theme, setTheme] = useState<"vs-light" | "vs-dark">("vs-light")

  useEffect(() => {
    const root = document.documentElement
    const syncTheme = () => {
      setTheme(root.classList.contains("dark") ? "vs-dark" : "vs-light")
    }
    syncTheme()
    const observer = new MutationObserver(syncTheme)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const handleMount: OnMount = (editor) => {
    editor.focus()
  }

  return (
    <div
      className={cn(
        "min-h-[280px] overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]",
        className
      )}
    >
      <Editor
        language="python"
        theme={theme}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        onMount={handleMount}
        loading={
          <div className="flex h-full items-center justify-center text-sm text-[var(--app-muted)]">
            Loading editor…
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 4,
          renderLineHighlight: "line",
          padding: { top: 12, bottom: 12 },
        }}
        height="100%"
      />
    </div>
  )
}
