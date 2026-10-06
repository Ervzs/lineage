const NAMES = [
  'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion',
  'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion',
  'quattuordecillion', 'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion',
  'novemdecillion', 'vigintillion',
]

const thousands = (n: number) => Math.round(n).toLocaleString('en-US')

// Plain words, no scientific notation: 950, 1.5, 34,000, 1.24 million, 812 trillion.
export function fmt(n: number): string {
  if (!Number.isFinite(n)) return '0'
  const sign = n < 0 ? '-' : ''
  const a = Math.abs(n)
  if (a < 1000) {
    const r = Math.round(a * 100) / 100
    return sign + (r >= 1000 ? '1,000' : String(r))
  }
  if (a < 1e6) return sign + thousands(a)
  let group = Math.floor(Math.log10(a) / 3)
  let v = a / 10 ** (group * 3)
  if (Number(v.toPrecision(3)) >= 1000) {
    group++
    v /= 1000
  }
  const idx = group - 2
  if (idx >= NAMES.length) {
    const last = NAMES.length - 1
    return `${sign}${thousands(a / 10 ** ((last + 2) * 3))} ${NAMES[last]}`
  }
  return `${sign}${Number(v.toPrecision(3))} ${NAMES[idx]}`
}

export const fmtPct = (fraction: number) => `${Math.round(fraction * 100)}%`

// Whole numbers, so the width does not jump between 1 and 2 decimals: 12, 1,234, 1.24 million.
export const fmtInt = (n: number) => (Math.abs(n) < 1e6 ? thousands(Math.floor(n)) : fmt(n))

// Rates always carry one decimal below 100: 0.4, 12.0, 340.
export const fmtRate = (n: number) => (Math.abs(n) < 100 ? n.toFixed(1) : fmtInt(n))

const pad = (n: number) => String(n).padStart(2, '0')

// 1h 02m 03s
export function fmtTime(seconds: number): string {
  const t = Math.max(0, Math.floor(seconds))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`
  if (m > 0) return `${m}m ${pad(s)}s`
  return `${s}s`
}
