// ─── START: VocalCharts ───────────────────────────────────────────────────────
// File   : components/charts/VocalCharts.jsx
// Role   : 3-panel vocal characteristics aggregate view
//          Panel 1 — Signal Frequency bar (stress, hesitations, voice breaks, exag. politeness)
//          Panel 2 — Tone Distribution pie
//          Panel 3 — Pace Distribution pie
// Props  : segments (array) — raw segment_details from JSON
// Lib    : recharts — BarChart, PieChart, Pie, Cell
// ─────────────────────────────────────────────────────────────────────────────

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { buildVocalAggregates }    from '../../utils/helpers'
import { PIE_COLORS, RECHARTS_TOOLTIP_STYLE } from '../../constants/colors'

// ── VocalCharts ───────────────────────────────────────────────────────────
// fn    : VocalCharts({ segments })
// does  : calls buildVocalAggregates util, renders 3 sub-charts in a grid
export default function VocalCharts({ segments }) {

  // aggregate vocal data from all segments in one pass
  const { boolData, toneData, paceData } = buildVocalAggregates(segments)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      {/* ── Panel 1: Signal Frequency bar chart ── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-3">
          Signal Frequency
        </p>
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={boolData} margin={{ left: 0, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
            <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 9 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} unit="%" />
            <Tooltip
              formatter={(v) => [`${v}%`, 'Frequency']}
              contentStyle={RECHARTS_TOOLTIP_STYLE}
            />
            {/* Red bars — high frequency = problem signal */}
            <Bar dataKey="pct" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Panel 2: Tone Distribution pie ── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-3">
          Tone Distribution
        </p>
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie
              data={toneData}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius={60}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {toneData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ── Panel 3: Pace Distribution pie ── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-3">
          Pace Distribution
        </p>
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie
              data={paceData}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius={60}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {/* Offset PIE_COLORS by 2 to differentiate from tone chart */}
              {paceData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

// ─── END: VocalCharts ─────────────────────────────────────────────────────────
