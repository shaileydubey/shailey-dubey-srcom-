// ─── START: FileTabs ──────────────────────────────────────────────────────────
// File   : components/FileTabs.jsx
// Role   : Tab navigation bar for loaded files + Compare All tab
// Props  : files[], active (int), onSetActive(i), onRemoveFile(i)
// Notes  : Compare All tab appears only when files.length > 1
//          active === -1 means compare view is selected
// ─────────────────────────────────────────────────────────────────────────────

// ── FileTabs ──────────────────────────────────────────────────────────────
// fn    : FileTabs({ files, active, onSetActive, onRemoveFile })
// does  : renders horizontally scrollable tab list, highlights active tab
//         close button removes file without propagating to tab click
export default function FileTabs({ files, active, onSetActive, onRemoveFile }) {

  // ── Tab style helper ──────────────────────────────────────────────────────
  // fn    : tabClass(isActive: bool) → string
  // does  : returns Tailwind class string for active vs inactive tab state
  const tabClass = (isActive) =>
    `flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs whitespace-nowrap
     transition-all duration-200 border border-transparent border-b-0 flex-shrink-0
     ${isActive
       ? 'text-white'
       : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.03]'}`

  const activeStyle = {
    background:   'var(--brand-bg)',
    borderColor:  'rgba(99,102,241,0.2)',
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <nav
      className="flex gap-1 px-5 pt-3 overflow-x-auto scrollbar-visible flex-shrink-0"
      style={{ background: 'rgba(15,23,42,0.6)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}
    >
      {/* ── File tabs — one per loaded file ── */}
      {files.map((f, i) => (
        <button
          key={f.name}
          className={tabClass(i === active)}
          style={i === active ? activeStyle : {}}
          onClick={() => onSetActive(i)}
        >
          <span>📄</span>

          {/* Truncate long filenames */}
          <span className="max-w-[160px] overflow-hidden text-ellipsis">
            {f.name.replace('_sentiment.json', '').replace(/_/g, ' ')}
          </span>

          {/* Close — stopPropagation prevents tab switch on remove */}
          <span
            className="text-[#94A3B8] hover:text-red-400 ml-1 text-sm leading-none transition-colors"
            onClick={(e) => { e.stopPropagation(); onRemoveFile(i) }}
          >
            ×
          </span>
        </button>
      ))}

      {/* ── Compare All tab — shown only when 2+ files loaded ── */}
      {files.length > 1 && (
        <button
          className={tabClass(active === -1)}
          style={active === -1 ? { ...activeStyle, color: '#818cf8' } : {}}
          onClick={() => onSetActive(-1)}
        >
          <span>⚡</span>
          <span>Compare All</span>
        </button>
      )}
    </nav>
  )
}

// ─── END: FileTabs ────────────────────────────────────────────────────────────
