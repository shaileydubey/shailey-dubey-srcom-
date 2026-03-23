// ─── START: CompareChart ──────────────────────────────────────────────────────
// File   : components/charts/CompareChart.jsx
// Role   : Grouped bar chart comparing 14 emotion scores across multiple files
// Props  : files (array) — [{ name, data }]
// Lib    : recharts — BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid
// ─────────────────────────────────────────────────────────────────────────────

import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { buildCompareData }                    from '../../utils/helpers'
import { MULTI_COLORS }                        from '../../constants/colors'
import { CustomTooltip }                       from '../ui/Primitives'

// ── CompareChart ──────────────────────────────────────────────────────────
// fn    : CompareChart({ files })
// does  : builds grouped bar data via buildCompareData util
//         renders one <Bar> per file, each using a distinct color from MULTI_COLORS
export default function CompareChart({ files }) {

  // rows: [{ emotion: 'Happy', 'file1.json': 0.4, 'file2.json': 0.6, ... }]
  const data = buildCompareData(files)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ left: 0, right: 20, bottom: 60 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />

        {/* Emotion labels — angled to avoid overlap */}
        <XAxis
          dataKey="emotion"
          tick={{ fill: '#94A3B8', fontSize: 10 }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />

        {/* Score axis 0–1 */}
        <YAxis domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 10 }} />

        <Tooltip content={<CustomTooltip />} />

        <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 11, paddingTop: 8 }} />

        {/* One bar series per file — color rotates through MULTI_COLORS */}
        {files.map((f, i) => (
          <Bar
            key={f.name}
            dataKey={f.name}
            fill={MULTI_COLORS[i % MULTI_COLORS.length]}
            radius={[3, 3, 0, 0]}
          />
        ))}

      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── END: CompareChart ────────────────────────────────────────────────────────
