// ─── START: CompareView ───────────────────────────────────────────────────────
// File   : components/CompareView.jsx
// Role   : Side-by-side multi-file comparison — grouped bar + summary cards
// Props  : files (array), onSetActive(i) — click card to jump to single-file view
// ─────────────────────────────────────────────────────────────────────────────

import { Section }               from './ui/Primitives'
import CompareChart              from './charts/CompareChart'
import { pretty }                from '../utils/helpers'
import {
  EMOTION_COLORS,
  SENTIMENT_COLOR,
  RISK_COLOR,
} from '../constants/colors'

// ── CompareView ───────────────────────────────────────────────────────────
// fn    : CompareView({ files, onSetActive })
// does  : renders CompareChart at top + grid of summary cards below
//         clicking a summary card navigates to that file's FileView
export default function CompareView({ files, onSetActive }) {

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 flex flex-col gap-5 pb-16">

      {/* ── Grouped comparison bar chart ── */}
      <Section title="Multi-File Emotion Score Comparison">
        <CompareChart files={files} />
      </Section>

      {/* ── Summary card grid — one card per file ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((f, i) => {
          const s = f.data?.call_summary

          return (
            <div
              key={i}
              className="glass-panel rounded-xl p-4 cursor-pointer flex flex-col gap-2
                transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => onSetActive(i)}    // navigate to single-file view
            >
              {/* Filename header */}
              <p className="font-semibold text-sm text-white pb-2 border-b border-indigo-500/15 truncate">
                {f.name.replace('_sentiment.json', '')}
              </p>

              {/* 4 key metrics */}
              {[
                ['Dominant',   pretty(s?.dominant_emotion),
                               EMOTION_COLORS[s?.dominant_emotion]],
                ['Sentiment',  `${s?.overall_sentiment} (${(s?.sentiment_score || 0).toFixed(3)})`,
                               SENTIMENT_COLOR[s?.overall_sentiment]],
                ['Escalation', s?.highest_escalation_risk,
                               RISK_COLOR[s?.highest_escalation_risk]],
                ['Sarcasm',    s?.sarcasm_detected ? 'Detected' : 'None',
                               s?.sarcasm_detected ? '#e879f9' : '#22d3a0'],
              ].map(([lbl, val, clr]) => (
                <p key={lbl} className="text-xs">
                  <span className="text-[#94A3B8]">{lbl}: </span>
                  <strong style={{ color: clr }}>{val}</strong>
                </p>
              ))}
            </div>
          )
        })}
      </div>

    </div>
  )
}

// ─── END: CompareView ─────────────────────────────────────────────────────────
