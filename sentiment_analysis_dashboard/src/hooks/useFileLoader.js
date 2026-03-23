// ─── START: useFileLoader Hook ────────────────────────────────────────────────
// File   : hooks/useFileLoader.js
// Role   : Custom hook — encapsulates all file-load / remove logic
// Used by: App.jsx
// State  : files[], activeIndex
// Returns: { files, active, handleFiles, removeFile, setActive }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'

// ── useFileLoader ─────────────────────────────────────────────────────────
// hook  : useFileLoader()
// does  : manages files state, parse, dedup, remove, active-tab tracking
export default function useFileLoader() {

  // files  — [{ name: string, data: object }]
  // active — selected tab index; -1 = compare view
  const [files,  setFiles]  = useState([])
  const [active, setActive] = useState(0)

  // ── handleFiles ──────────────────────────────────────────────────────────
  // fn    : handleFiles(rawFiles: File[])
  // does  : FileReader → JSON.parse → append to files (dedupes by filename)
  const handleFiles = useCallback((rawFiles) => {
    Array.from(rawFiles).forEach((file) => {

      // only accept .json extension
      if (!file.name.endsWith('.json')) {
        alert(`"${file.name}" is not a JSON file — skipped.`)
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)

          setFiles((prev) => {
            if (prev.find((f) => f.name === file.name)) return prev   // dedupe
            const updated = [...prev, { name: file.name, data }]
            setActive(updated.length - 1)                             // auto-select
            return updated
          })
        } catch {
          alert(`Cannot parse "${file.name}" — must be a valid Qwen notebook JSON output.`)
        }
      }

      reader.readAsText(file)
    })
  }, [])

  // ── removeFile ────────────────────────────────────────────────────────────
  // fn    : removeFile(index: number)
  // does  : filters out file at index, clamps active to valid range
  const removeFile = useCallback((i) => {
    setFiles((prev) => {
      const next = prev.filter((_, idx) => idx !== i)
      setActive((a) => Math.min(a, next.length - 1))
      return next
    })
  }, [])

  return { files, active, setActive, handleFiles, removeFile }
}

// ─── END: useFileLoader Hook ──────────────────────────────────────────────────
