// ─── START: UploadZone ────────────────────────────────────────────────────────
// File   : components/UploadZone.jsx
// Role   : Empty-state drag-and-drop area shown when no files are loaded
// Props  : onFiles(files: File[])
// State  : dragging (bool) — controls hover highlight
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react'

// ── UploadZone ────────────────────────────────────────────────────────────
// fn    : UploadZone({ onFiles })
// does  : handles drag-over / drag-leave / drop, click-to-browse
//         accepts only .json files, forwards File[] to onFiles prop
export default function UploadZone({ onFiles }) {

  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  // ── handleDrop ────────────────────────────────────────────────────────────
  // fn    : handleDrop(e: DragEvent)
  // does  : prevents default browser open, filters .json, calls onFiles
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith('.json'))
    if (files.length) onFiles(files)
  }, [onFiles])

  // ── handleChange ──────────────────────────────────────────────────────────
  // fn    : handleChange(e: InputEvent)
  // does  : reads file input selection, forwards to onFiles
  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) onFiles(files)
    e.target.value = ''
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`glass-panel rounded-2xl flex flex-col items-center justify-center gap-5
        p-16 cursor-pointer w-full max-w-lg mx-auto border-2 border-dashed
        transition-all duration-300
        ${dragging
          ? 'border-indigo-400 shadow-2xl shadow-indigo-500/20 scale-[1.02]'
          : 'border-indigo-500/30 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10'
        }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {/* Upload icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center border border-indigo-500/25"
        style={{ background: 'rgba(99,102,241,0.08)' }}
      >
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      {/* Copy */}
      <div className="text-center">
        <p className="text-white font-semibold text-lg mb-1">Drop JSON files here</p>
        <p className="text-[#94A3B8] text-sm">or click to browse · multiple files supported</p>
      </div>

      {/* Hint */}
      <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(99,102,241,0.5)' }}>
        Output from Qwen2.5-Omni Sentiment Notebook
      </p>
    </div>
  )
}

// ─── END: UploadZone ──────────────────────────────────────────────────────────
