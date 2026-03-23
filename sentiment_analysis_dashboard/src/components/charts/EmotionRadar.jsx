// ─── START: EmotionRadar ──────────────────────────────────────────────────────
// File   : components/charts/EmotionRadar.jsx
// Role   : Radar / spider chart of 14 emotion scores averaged over the call
// Props  : scores (object) — { emotion_key: float, ... }
// Lib    : recharts — RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
// ─────────────────────────────────────────────────────────────────────────────

import {
  RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { buildRadarData } from '../../utils/helpers'

// ── EmotionRadar ──────────────────────────────────────────────────────────
// fn    : EmotionRadar({ scores })
// does  : transforms scores map → radar data via buildRadarData util
//         renders indigo-filled spider chart, domain 0–1
export default function EmotionRadar({ scores }) {

  // transform: { happy: 0.3, ... } → [{ emotion: 'Happy', score: 0.3 }, ...]
  const data = buildRadarData(scores)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>

        {/* Grid lines */}
        <PolarGrid stroke="rgba(99,102,241,0.15)" />

        {/* Emotion labels around the ring */}
        <PolarAngleAxis
          dataKey="emotion"
          tick={{ fill: '#94A3B8', fontSize: 10 }}
        />

        {/* Radial scale 0–1 */}
        <PolarRadiusAxis
          angle={30}
          domain={[0, 1]}
          tick={{ fill: '#64748b', fontSize: 9 }}
        />

        {/* Filled radar shape — indigo stroke + translucent fill */}
        <Radar
          name="Score"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ─── END: EmotionRadar ────────────────────────────────────────────────────────
