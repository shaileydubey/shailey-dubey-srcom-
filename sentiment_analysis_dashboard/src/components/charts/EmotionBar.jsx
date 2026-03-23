// ─── START: EmotionBar ────────────────────────────────────────────────────────
// File   : components/charts/EmotionBar.jsx
// Role   : Horizontal bar chart — all 14 emotions ranked high → low
// Props  : scores (object) — { emotion_key: float, ... }
// Lib    : recharts — BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip
// ─────────────────────────────────────────────────────────────────────────────

import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { buildEmotionBarData }   from '../../utils/helpers'
import { EMOTION_COLORS }        from '../../constants/colors'
import { CustomTooltip }         from '../ui/Primitives'

// ── EmotionBar ────────────────────────────────────────────────────────────
// fn    : EmotionBar({ scores })
// does  : sorts emotions descending, assigns per-emotion color via Cell
export default function EmotionBar({ scores }) {

  // transform + sort: [{ name, value, key }] descending
  const data = buildEmotionBarData(scores)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 20 }}>

        {/* Vertical grid lines only */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(99,102,241,0.08)"
          horizontal={false}
        />

        {/* X-axis: 0–1 score */}
        <XAxis
          type="number"
          domain={[0, 1]}
          tick={{ fill: '#64748b', fontSize: 10 }}
        />

        {/* Y-axis: emotion names */}
        <YAxis
          type="category"
          dataKey="name"
          width={115}
          tick={{ fill: '#94A3B8', fontSize: 10 }}
        />

        <Tooltip content={<CustomTooltip />} />

        {/* Bar — each bar gets its emotion-specific color via Cell */}
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={EMOTION_COLORS[d.key] || '#6366f1'} />
          ))}
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── END: EmotionBar ──────────────────────────────────────────────────────────
