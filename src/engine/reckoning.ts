import { THREAT_COUNTDOWN, THREAT_LEVEL } from '../data/constants'
import { ENDING_TEXT, IMPACT_TEXT } from '../data/story'
import { THREATS } from '../data/threats'
import type { Mods } from './modifiers'
import { pickWeighted } from './rng'
import { addLog } from './state'
import type { GameState } from './types'

export function startReckoning(s: GameState) {
  const threat = pickWeighted(s, THREATS, () => 1)
  s.reckoning = { started: true, threatId: threat.id, level: THREAT_LEVEL, countdown: THREAT_COUNTDOWN, resolved: false }
  addLog(s, threat.text, 'story')
}

export function stepReckoning(s: GameState, m: Mods, dt: number) {
  const r = s.reckoning
  if (!r || r.resolved) return
  r.countdown = Math.max(0, r.countdown - dt)
  if (r.countdown > 0) return
  r.resolved = true
  s.activeEvent = null
  if (m.defense >= r.level) {
    addLog(s, IMPACT_TEXT.survived, 'story')
    addLog(s, ENDING_TEXT.survived, 'story')
    s.ending = 'survived'
    return
  }
  addLog(s, IMPACT_TEXT.extinct, 'story')
  for (const sp of s.species) {
    if (sp.status !== 'active') continue
    sp.status = 'declining'
    sp.vitality = 1
    sp.declineElapsed = 0
  }
}

// After a failed impact, the run ends when the last species is gone.
export function checkExtinctEnding(s: GameState) {
  if (!s.reckoning?.resolved || s.ending) return
  if (s.species.some(sp => sp.status === 'active' || sp.status === 'declining')) return
  addLog(s, ENDING_TEXT.extinct, 'story')
  s.ending = 'extinct'
}
