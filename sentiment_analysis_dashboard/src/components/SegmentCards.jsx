// ─── START: SegmentCards ──────────────────────────────────────────────────────
// File   : components/SegmentCards.jsx
// Role   : Accordion list — one collapsible card per audio segment
// Props  : segments (array) — raw segment_details from JSON
// State  : expanded (int|null) — index of currently open card
// Children: per-card expanded body with emotion bar + vocal table + sarcasm alert
// ─────────────────────────────────────────────────────────────────────────────

import { useState }                        from 'react'
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { pretty, buildEmotionBarData }     from '../utils/helpers'
import { EMOTION_COLORS, RISK_COLOR }      from '../constants/colors'
import { CustomTooltip }                   from './ui/Primitives'

// ── SegmentCards ──────────────────────────────────────────────────────────
// fn    : SegmentCards({ segments })
// does  : renders collapsed row headers; expands selected card on click
//         expanded body: audio_reasoning quote, emotion bar, vocal table, sarcasm alert
export default function SegmentCards({ segments }) {

  // expanded — index of open card; null = all closed
  const [expanded, setExpanded] = useState(null)

  // ── toggle ─────────────────────────────────────────────────────────────
  // fn    : toggle(i)
  // does  : opens clicked card; closes it if already open
  const toggle = (i) => setExpanded((prev) => (prev === i ? null : i))

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      {segments.map((seg, i) => {

        const isOpen  = expanded === i
        const emotion = seg.primary_emotion || 'unknown'
        const color   = EMOTION_COLORS[emotion] || '#6366f1'
        const risk    = seg.call_quality_indicators?.escalation_risk || 'low'

        return (
          <div
            key={i}
            className="glass-panel rounded-xl overflow-hidden transition-all duration-200"
            style={{ borderLeft: `3px solid ${color}` }}
          >

            {/* ── Collapsed row header ── */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer
                hover:bg-white/[0.02] transition-colors flex-wrap"
              onClick={() => toggle(i)}
            >
              {/* Segment number */}
              <span className="text-[10px] text-[#94A3B8] font-mono min-w-[46px]">
                Seg {i + 1}
              </span>

              {/* Time range — hidden on mobile */}
              <span className="text-[10px] text-[#94A3B8] font-mono min-w-[110px] hidden sm:block">
                {seg.segment_start_sec?.toFixed(1)}s – {seg.segment_end_sec?.toFixed(1)}s
              </span>

              {/* Primary emotion */}
              <span className="font-semibold text-sm flex-1" style={{ color }}>
                {pretty(emotion)}
              </span>

              {/* Escalation risk */}
              <span
                className="text-[10px] uppercase tracking-wide"
                style={{ color: RISK_COLOR[risk] }}
              >
                {risk} risk
              </span>

              {/* Confidence score */}
              <span className="text-[10px] text-[#94A3B8] font-mono min-w-[58px] text-right">
                {((seg.confidence || 0) * 100).toFixed(0)}% conf
              </span>

              {/* Chevron — flips on expand */}
              <svg
                className={`w-3 h-3 text-[#94A3B8] transition-transform duration-200
                  ${isOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* ── Expanded body ── */}
            {isOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-indigo-500/10">

                {/* Audio reasoning quote */}
                {seg.audio_reasoning && (
                  <p
                    className="text-xs text-[#94A3B8] italic leading-relaxed
                      px-3 py-3 rounded-lg mb-4 border-l-2 border-indigo-500/40"
                    style={{ background: 'rgba(99,102,241,0.05)' }}
                  >
                    "{seg.audio_reasoning}"
                  </p>
                )}

                {/* Two-column: emotion bar | vocal table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* ── Emotion scores mini bar ── */}
                  <SegmentEmotionBar scores={seg.emotion_scores} />

                  {/* ── Vocal table + sarcasm alert ── */}
                  <VocalTable
                    characteristics={seg.vocal_characteristics}
                    sarcasm={seg.sarcasm_indicators}
                  />

                </div>
              </div>
            )}

          </div>
        )
      })}
    </div>
  )
}


// ── SegmentEmotionBar ──────────────────────────────────────────────────────
// fn    : SegmentEmotionBar({ scores })
// does  : mini horizontal bar chart for a single segment's emotion_scores
function SegmentEmotionBar({ scores }) {
  const data = buildEmotionBarData(scores)

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-3">
        Emotion Scores
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10 }}>
          <XAxis type="number" domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 9 }} />
          <YAxis type="category" dataKey="name" width={105} tick={{ fill: '#94A3B8', fontSize: 9 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {data.map((d, j) => (
              <Cell key={j} fill={EMOTION_COLORS[d.key] || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


// ── VocalTable ─────────────────────────────────────────────────────────────
// fn    : VocalTable({ characteristics, sarcasm })
// does  : renders vocal_characteristics as a key-value table
//         boolean fields get color-coded Yes/No badges
//         appends SarcasmAlert if sarcasm.detected === true
function VocalTable({ characteristics = {}, sarcasm }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-3">
        Vocal Characteristics
      </p>

      {/* Key-value table */}
      <table className="w-full text-xs border-collapse">
        <tbody>
          {Object.entries(characteristics).map(([k, v]) => (
            <tr key={k} className="border-b border-indigo-500/10 last:border-0">
              <td className="py-1.5 pr-3 text-[#94A3B8]">{pretty(k)}</td>
              <td className="py-1.5">
                {typeof v === 'boolean' ? (
                  // Boolean → colored badge
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold
                    ${v ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/12 text-emerald-400'}`}>
                    {v ? 'Yes' : 'No'}
                  </span>
                ) : (
                  // String value → indigo badge
                  <span
                    className="px-2 py-0.5 rounded text-[10px] text-indigo-300"
                    style={{ background: 'rgba(99,102,241,0.1)' }}
                  >
                    {pretty(String(v))}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sarcasm alert — only rendered when detected */}
      {sarcasm?.detected && <SarcasmAlert sarcasm={sarcasm} />}
    </div>
  )
}


// ── SarcasmAlert ───────────────────────────────────────────────────────────
// fn    : SarcasmAlert({ sarcasm })
// does  : renders purple alert box with confidence % and signal list
function SarcasmAlert({ sarcasm }) {
  return (
    <div
      className="mt-3 p-3 rounded-xl border border-purple-500/25 text-xs"
      style={{ background: 'rgba(232,121,249,0.06)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between text-purple-400 font-semibold mb-2">
        <span>⚠ Sarcasm Detected</span>
        <span>{((sarcasm.confidence || 0) * 100).toFixed(0)}% conf</span>
      </div>

      {/* Signal list */}
      {sarcasm.signals?.length > 0 && (
        <ul className="list-disc list-inside text-[#94A3B8] space-y-1">
          {sarcasm.signals.map((s, si) => (
            <li key={si} className="text-[10px]">{s}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── END: SegmentCards ────────────────────────────────────────────────────────
