// ─── START: Constants ─────────────────────────────────────────────────────────
// File   : constants/colors.js
// Role   : Centralised color maps — imported by chart components
// Keys   : emotion names (snake_case), sentiment strings, risk levels
// ─────────────────────────────────────────────────────────────────────────────

// ── EMOTION_COLORS ─────────────────────────────────────────────────────────
// map  : 14 emotion labels → hex color
// used : bar charts, radar, segment card accent, cell fills
export const EMOTION_COLORS = {
  happy:           '#22d3a0',
  satisfied:       '#38bdf8',
  neutral:         '#94a3b8',
  excited:         '#fbbf24',
  polite_but_cold: '#a78bfa',
  confused:        '#fb923c',
  not_interested:  '#64748b',
  bored:           '#6b7280',
  anxious:         '#f97316',
  irritated:       '#fb7185',
  frustrated:      '#f43f5e',
  angry:           '#ef4444',
  sad:             '#818cf8',
  sarcastic:       '#e879f9',
}

// ── SENTIMENT_COLOR ────────────────────────────────────────────────────────
// map  : overall_sentiment string → hex color
// used : stat card accent, arc line dot colors
export const SENTIMENT_COLOR = {
  positive: '#22d3a0',
  negative: '#f43f5e',
  neutral:  '#94a3b8',
  mixed:    '#fbbf24',
}

// ── RISK_COLOR ─────────────────────────────────────────────────────────────
// map  : escalation_risk level → hex color
// used : segment card, stat card, compare card
export const RISK_COLOR = {
  low:    '#22d3a0',
  medium: '#fbbf24',
  high:   '#ef4444',
}

// ── MULTI_COLORS ───────────────────────────────────────────────────────────
// array : rotating palette for multi-file grouped bar chart
// index : file index mod length
export const MULTI_COLORS = [
  '#6366f1', '#22d3a0', '#fbbf24',
  '#e879f9', '#fb7185', '#a78bfa', '#38bdf8',
]

// ── PIE_COLORS ─────────────────────────────────────────────────────────────
// array : rotating palette for tone / pace pie charts
export const PIE_COLORS = [
  '#6366f1', '#22d3a0', '#fbbf24',
  '#e879f9', '#fb7185', '#a78bfa',
]

// ── RECHARTS_TOOLTIP_STYLE ─────────────────────────────────────────────────
// obj  : shared contentStyle prop for recharts <Tooltip>
// used : all charts that don't use CustomTooltip component
export const RECHARTS_TOOLTIP_STYLE = {
  background:   'rgba(15,23,42,0.95)',
  border:       '1px solid rgba(99,102,241,0.25)',
  borderRadius: 10,
  fontSize:     11,
  color:        '#e2e8f0',
}

// ─── END: Constants ───────────────────────────────────────────────────────────
