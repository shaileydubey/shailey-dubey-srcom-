// ─── START: Header ────────────────────────────────────────────────────────────
// File   : components/Header.jsx
// Role   : Top navigation bar — logo, title, "+ Add Files" trigger
// Props  : onAddFiles(files: File[])
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from 'react'

// ── Header ────────────────────────────────────────────────────────────────
// fn    : Header({ onAddFiles })
// does  : renders sticky navbar; hidden file input triggered by label click
export default function Header({ onAddFiles }) {

  const inputRef = useRef()

  // ── handleChange ──────────────────────────────────────────────────────────
  // fn    : handleChange(e)
  // does  : extracts FileList from input, forwards array to onAddFiles prop
  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) onAddFiles(files)
    e.target.value = ''   // reset so same file can be re-added after removal
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <header className="glass-panel sticky top-0 z-50 flex items-center justify-between px-6 py-4">

      {/* ── Brand ── */}
      <div className="flex items-center gap-3">
        {/* Logo mark — indigo→violet gradient square */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <span className="text-white font-bold text-xs">SA</span>
        </div>

        {/* Title block */}
        <div>
          <h1 className="brand-text-gradient font-bold text-lg leading-tight">
            Sentiment Analytics
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[#94A3B8]">
            Qwen2.5-Omni · Audio Intelligence
          </p>
        </div>
      </div>

      {/* ── File upload trigger ── */}
      <label
        className="cursor-pointer px-4 py-2 rounded-lg border border-indigo-500/30
          text-[#94A3B8] text-xs hover:border-indigo-400 hover:text-indigo-300
          transition-all duration-200"
        style={{ background: 'rgba(99,102,241,0.05)' }}
      >
        {/* Hidden input — accepts multiple .json files */}
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          multiple
          className="hidden"
          onChange={handleChange}
        />
        + Add Files
      </label>

    </header>
  )
}

// ─── END: Header ──────────────────────────────────────────────────────────────
