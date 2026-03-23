// ─── START: SentimentArc ──────────────────────────────────────────────────────
// File   : components/charts/SentimentArc.jsx
// Role   : Line chart — sentiment score over time across all segments
// Props  : arc (array) — raw sentiment_arc from call_summary
// Lib    : recharts — LineChart, Line, ReferenceLine, XAxis, YAxis, Tooltip
// Notes  : Dot color driven by sentiment (positive/negative/neutral/mixed)
//          ReferenceLine at y=0 marks the neutral boundary
// ─────────────────────────────────────────────────────────────────────────────

import {
  LineChart, Line, ReferenceLine,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { buildArcData }    from '../../utils/helpers'
import { SENTIMENT_COLOR, EMOTION_COLORS } from '../../constants/colors'
import { pretty, toFixed3 } from '../../utils/helpers'

// ── ArcTooltip ────────────────────────────────────────────────────────────
// fn    : ArcTooltip({ active, payload })
// does  : custom tooltip showing time, score, emotion, sentiment for each point
function ArcTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload

  return (
    <div className="glass-panel rounded-xl p-3 text-xs shadow-xl">
      {/* Segment time label */}
      <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]
        mb-2 pb-2 border-b border-indigo-500/20">
        {d.time}
      </p>
      <p style={{ color: '#6366f1' }}>
        Score: <strong>{toFixed3(d.score)}</strong>
      </p>
      <p style={{ color: EMOTION_COLORS[d.emotion] || '#94a3b8' }}>
        Emotion: <strong>{pretty(d.emotion)}</strong>
      </p>
      <p style={{ color: SENTIMENT_COLOR[d.sentiment] || '#94a3b8' }}>
        Sentiment: <strong>{d.sentiment}</strong>
      </p>
    </div>
  )
}

// ── SentimentArc ──────────────────────────────────────────────────────────
// fn    : SentimentArc({ arc })
// does  : maps arc array → LineChart; dots colored per sentiment value
//         shows empty-state message if arc data is absent
export default function SentimentArc({ arc }) {

  // empty state guard
  if (!arc?.length)
    return <p className="text-xs text-center py-10 text-[#94A3B8]">No arc data available</p>

  // transform raw arc → recharts-ready array
  const data = buildArcData(arc)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />

        {/* Segment labels on X */}
        <XAxis dataKey="seg" tick={{ fill: '#94A3B8', fontSize: 11 }} />

        {/* Score range -1 to +1 */}
        <YAxis domain={[-1, 1]} tick={{ fill: '#64748b', fontSize: 10 }} />

        {/* Neutral boundary marker */}
        <ReferenceLine y={0} stroke="rgba(99,102,241,0.3)" strokeDasharray="4 4" />

        <Tooltip content={<ArcTooltip />} />

        {/* Line — dot color driven by sentiment of that segment */}
        <Line
          type="monotone"
          dataKey="score"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={(props) => {
            const { cx, cy, payload } = props
            return (
              <circle
                key={props.key}
                cx={cx} cy={cy} r={5}
                fill={SENTIMENT_COLOR[payload.sentiment] || '#6366f1'}
                stroke="rgba(2,6,23,0.8)"
                strokeWidth={2}
              />
            )
          }}
        />

      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── END: SentimentArc ────────────────────────────────────────────────────────
