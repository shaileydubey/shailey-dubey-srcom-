// ─── START: Utility Helpers ───────────────────────────────────────────────────
// File   : utils/helpers.js
// Role   : Pure functions — no side effects, no React imports
// Used by: All components that format labels or process JSON data
// ─────────────────────────────────────────────────────────────────────────────

// ── pretty ────────────────────────────────────────────────────────────────
// fn    : pretty(str: string) → string
// does  : snake_case → Title Case  (e.g. "polite_but_cold" → "Polite But Cold")
export const pretty = (s) =>
  s ? s.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') : ''


// ── toFixed3 ──────────────────────────────────────────────────────────────
// fn    : toFixed3(val: number|string) → string
// does  : safely formats a numeric value to 3 decimal places
export const toFixed3 = (val) => (+val || 0).toFixed(3)


// ── toPercent ─────────────────────────────────────────────────────────────
// fn    : toPercent(val: number, total: number) → number
// does  : returns integer percentage (0–100)
export const toPercent = (val, total) =>
  total > 0 ? Math.round((val / total) * 100) : 0


// ── buildEmotionBarData ────────────────────────────────────────────────────
// fn    : buildEmotionBarData(scores: object) → array
// does  : converts emotion score map → sorted array for recharts BarChart
// out   : [{ name, value, key }] — descending by value
export const buildEmotionBarData = (scores = {}) =>
  Object.entries(scores)
    .map(([key, value]) => ({ name: pretty(key), value: +value, key }))
    .sort((a, b) => b.value - a.value)


// ── buildRadarData ─────────────────────────────────────────────────────────
// fn    : buildRadarData(scores: object) → array
// does  : converts emotion score map → array for recharts RadarChart
// out   : [{ emotion, score }]
export const buildRadarData = (scores = {}) =>
  Object.entries(scores).map(([key, value]) => ({
    emotion: pretty(key),
    score:   +value,
  }))


// ── buildArcData ───────────────────────────────────────────────────────────
// fn    : buildArcData(arc: array) → array
// does  : maps raw sentiment_arc → labeled recharts LineChart data
// out   : [{ seg, time, score, emotion, sentiment }]
export const buildArcData = (arc = []) =>
  arc.map((a, i) => ({
    seg:       `Seg ${i + 1}`,
    time:      a.time,
    score:     +a.score,
    emotion:   a.primary_emotion,
    sentiment: a.sentiment,
  }))


// ── buildVocalAggregates ───────────────────────────────────────────────────
// fn    : buildVocalAggregates(segments: array) → { boolData, toneData, paceData }
// does  : aggregates vocal_characteristics across all segments
//         - boolData  : frequency % of 4 boolean signals
//         - toneData  : tone label distribution for PieChart
//         - paceData  : pace label distribution for PieChart
export const buildVocalAggregates = (segments = []) => {
  const BOOL_FIELDS = [
    'stress_detected',
    'hesitations_detected',
    'voice_breaks_detected',
    'exaggerated_politeness',
  ]

  // initialise counters
  const counts  = Object.fromEntries(BOOL_FIELDS.map((f) => [f, 0]))
  const toneMap = {}
  const paceMap = {}

  // single pass over all segments
  segments.forEach(({ vocal_characteristics: vc = {} }) => {
    BOOL_FIELDS.forEach((f) => { if (vc[f] === true) counts[f]++ })
    if (vc.tone) toneMap[vc.tone] = (toneMap[vc.tone] || 0) + 1
    if (vc.pace) paceMap[vc.pace] = (paceMap[vc.pace] || 0) + 1
  })

  const n = segments.length || 1

  const boolData = BOOL_FIELDS.map((f) => ({
    name: pretty(f.replace(/_detected$/, '').replace(/_/g, ' ')),
    pct:  Math.round((counts[f] / n) * 100),
  }))

  const toneData = Object.entries(toneMap).map(([k, v]) => ({ name: pretty(k), value: v }))
  const paceData = Object.entries(paceMap).map(([k, v]) => ({ name: pretty(k), value: v }))

  return { boolData, toneData, paceData }
}


// ── buildCompareData ───────────────────────────────────────────────────────
// fn    : buildCompareData(files: array) → array
// does  : builds grouped bar data for multi-file emotion comparison
// out   : [{ emotion, [filename]: score, ... }] — one row per emotion
export const buildCompareData = (files = []) => {
  const EMOTIONS = [
    'happy','satisfied','neutral','excited','polite_but_cold',
    'confused','not_interested','bored','anxious',
    'irritated','frustrated','angry','sad','sarcastic',
  ]

  return EMOTIONS.map((em) => {
    const row = { emotion: pretty(em) }
    files.forEach(({ name, data }) => {
      row[name] = +(data?.call_summary?.average_emotion_scores?.[em] || 0)
    })
    return row
  })
}

// ─── END: Utility Helpers ─────────────────────────────────────────────────────
