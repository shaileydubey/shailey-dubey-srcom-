// ─── START: FileView ──────────────────────────────────────────────────────────
// File   : components/FileView.jsx
// Role   : Full analysis view for a single loaded JSON file
// Props  : file ({ name, data }) — selected file object
// Layout : MetaBar → StatCards → Radar+Bar grid → SentimentArc → VocalCharts → SegmentCards
// ─────────────────────────────────────────────────────────────────────────────

import { StatCard, Section }  from './ui/Primitives'
import EmotionRadar           from './charts/EmotionRadar'
import EmotionBar             from './charts/EmotionBar'
import SentimentArc           from './charts/SentimentArc'
import VocalCharts            from './charts/VocalCharts'
import SegmentCards           from './SegmentCards'
import { pretty }             from '../utils/helpers'
import {
  EMOTION_COLORS,
  SENTIMENT_COLOR,
  RISK_COLOR,
} from '../constants/colors'

// ── FileView ──────────────────────────────────────────────────────────────
// fn    : FileView({ file })
// does  : destructures call_summary, metadata, segment_details from file.data
//         renders all chart sections + stat cards in a vertical stack
export default function FileView({ file }) {

  // destructure JSON structure from notebook output
  const summary  = file.data?.call_summary
  const metadata = file.data?.metadata
  const segments = file.data?.segment_details || []

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 flex flex-col gap-5 pb-16">

      {/* ── MetaBar — file metadata row ── */}
      {metadata && (
        <div className="glass-panel rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-1
          text-[11px] text-[#94A3B8]">
          {[
            ['📁', metadata.source_file?.split('/').pop() || file.name],
            ['🤖', metadata.model_used?.split('/').pop()],
            ['⏱',  `${metadata.call_duration_sec?.toFixed(1)}s`],
            ['🔢', `${metadata.num_segments_analyzed} segments`],
            ['📅', metadata.analyzed_at?.slice(0, 10)],
          ].map(([icon, val]) => val && (
            <span key={icon} className="flex items-center gap-1.5">{icon} {val}</span>
          ))}
        </div>
      )}

      {/* ── Stat Cards — 5 KPI tiles ── */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="Dominant Emotion"
            value={pretty(summary.dominant_emotion)}
            accent={EMOTION_COLORS[summary.dominant_emotion] || '#6366f1'}
          />
          <StatCard
            label="Overall Sentiment"
            value={summary.overall_sentiment}
            accent={SENTIMENT_COLOR[summary.overall_sentiment] || '#6366f1'}
            sub={`Score: ${(summary.sentiment_score || 0).toFixed(3)}`}
          />
          <StatCard
            label="Escalation Risk"
            value={(summary.highest_escalation_risk || '—').toUpperCase()}
            accent={RISK_COLOR[summary.highest_escalation_risk] || '#94a3b8'}
          />
          <StatCard
            label="Sarcasm"
            value={summary.sarcasm_detected ? 'DETECTED' : 'None'}
            accent={summary.sarcasm_detected ? '#e879f9' : '#22d3a0'}
          />
          <StatCard
            label="Segments"
            value={segments.length}
            accent="#fbbf24"
          />
        </div>
      )}

      {/* ── Charts Row: Radar + Ranked Bar — side by side on lg screens ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Emotion Radar — Call Average">
          <EmotionRadar scores={summary?.average_emotion_scores} />
        </Section>
        <Section title="Emotion Scores — Ranked">
          <EmotionBar scores={summary?.average_emotion_scores} />
        </Section>
      </div>

      {/* ── Sentiment Arc — full width timeline ── */}
      <Section title="Sentiment Arc — Timeline">
        <SentimentArc arc={summary?.sentiment_arc} />
      </Section>

      {/* ── Vocal Characteristics — 3-panel aggregate ── */}
      {segments.length > 0 && (
        <Section title="Vocal Characteristics — Aggregate">
          <VocalCharts segments={segments} />
        </Section>
      )}

      {/* ── Segment Cards — scrollable accordion list ── */}
      {segments.length > 0 && (
        <Section title={`Segment Details — ${segments.length} segments`}>
          {/* scrollbar-visible: enforces visible scrollbar per global CSS */}
          <div className="scrollbar-visible max-h-[600px] overflow-y-auto pr-1">
            <SegmentCards segments={segments} />
          </div>
        </Section>
      )}

    </div>
  )
}

// ─── END: FileView ────────────────────────────────────────────────────────────
