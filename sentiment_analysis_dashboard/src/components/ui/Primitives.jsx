// ─── START: Shared UI Primitives ──────────────────────────────────────────────
// File   : components/ui/Primitives.jsx
// Role   : Reusable atomic components used across all chart panels
// Exports: StatCard, Section, CustomTooltip
// ─────────────────────────────────────────────────────────────────────────────

import { pretty } from '../../utils/helpers'

// ── StatCard ──────────────────────────────────────────────────────────────
// fn    : StatCard({ label, value, accent, sub })
// does  : single KPI card with colored left border, label, value, optional sub-text
// props : accent (hex) — drives border color and value text color
export function StatCard({ label, value, accent, sub }) {
  return (
    <div
      className="glass-panel rounded-xl p-4 flex flex-col gap-1
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      {/* Field label */}
      <span className="text-[10px] uppercase tracking-widest text-[#94A3B8]">
        {label}
      </span>

      {/* Primary value */}
      <span className="text-xl font-bold leading-tight" style={{ color: accent }}>
        {value}
      </span>

      {/* Optional sub-text (e.g. raw score beneath sentiment label) */}
      {sub && (
        <span className="text-[11px] text-[#94A3B8]">{sub}</span>
      )}
    </div>
  )
}


// ── Section ───────────────────────────────────────────────────────────────
// fn    : Section({ title, children, className })
// does  : chart-container wrapper with consistent title bar
// used  : wraps every chart panel in FileView and CompareView
export function Section({ title, children, className = '' }) {
  return (
    <div className={`chart-container p-5 ${className}`}>
      {/* Section header */}
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8]
        mb-4 pb-3 border-b border-indigo-500/15">
        {title}
      </h3>
      {children}
    </div>
  )
}


// ── CustomTooltip ─────────────────────────────────────────────────────────
// fn    : CustomTooltip({ active, payload, label })
// does  : recharts custom tooltip — glass-panel styled, shows all payload entries
// used  : passed as content prop to recharts <Tooltip>
export function CustomTooltip({ active, payload, label }) {

  // recharts calls this even when not hovering — early return
  if (!active || !payload?.length) return null

  return (
    <div className="glass-panel rounded-xl p-3 text-xs shadow-xl min-w-[140px]">
      {/* Tooltip header */}
      <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]
        mb-2 pb-2 border-b border-indigo-500/20">
        {label}
      </p>

      {/* One row per data series */}
      {payload.map((p, i) => (
        <p key={i} className="mt-1" style={{ color: p.color || p.fill }}>
          {pretty(p.name)}: <strong>{(+p.value).toFixed(3)}</strong>
        </p>
      ))}
    </div>
  )
}

// ─── END: Shared UI Primitives ────────────────────────────────────────────────
