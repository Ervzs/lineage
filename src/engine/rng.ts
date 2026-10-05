// mulberry32. Advances the rngState stored on the (draft) state.
export function nextRandom(s: { rngState: number }): number {
  let t = (s.rngState = (s.rngState + 0x6d2b79f5) | 0)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function pickWeighted<T>(s: { rngState: number }, items: T[], weight: (item: T) => number): T {
  const total = items.reduce((sum, it) => sum + weight(it), 0)
  let r = nextRandom(s) * total
  for (const it of items) {
    r -= weight(it)
    if (r < 0) return it
  }
  return items[items.length - 1]
}
