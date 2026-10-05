import {
  EPOCH_SCALE, ERA_COUNTDOWN, ERA_REQ_FRACTION, FINAL_REQ_FRACTION, RESISTS, THREAT_COUNTDOWN,
} from '../data/constants'
import { ERA_THREATS } from '../data/eraThreats'
import { GENOME_NODES } from '../data/genomeNodes'
import { ENDING_TEXT, IMPACT_TEXT } from '../data/story'
import { THREAT_BY_ID, THREATS } from '../data/threats'
import { TRAITS } from '../data/traits'
import { birthNext } from './evolution'
import type { Mods } from './modifiers'
import { pickWeighted } from './rng'
import { addLog } from './state'
import type { GameState, Resist, Threat } from './types'

// Sum of one resistance from Survival Traits (level 0) of species 0..upTo, plus Genome nodes if asked.
export function maxReachable(type: Resist, upTo: number, withGenome: boolean): number {
  const traits = TRAITS.filter(t => t.species <= upTo)
    .flatMap(t => t.effects)
    .filter(e => e.target === `resist.${type}`)
    .reduce((sum, e) => sum + e.value, 0)
  const genome = withGenome ? GENOME_NODES.reduce((sum, n) => sum + (n.resist[type] ?? 0), 0) : 0
  return traits + genome
}

export function requirements(checks: Resist[], upTo: number, final: boolean, epoch: number): Partial<Record<Resist, number>> {
  const fraction = final ? FINAL_REQ_FRACTION : ERA_REQ_FRACTION
  const scale = EPOCH_SCALE ** (epoch - 1)
  return Object.fromEntries(checks.map(r => [r, Math.ceil(Math.ceil(fraction * maxReachable(r, upTo, final)) * scale)]))
}

export const eraThreatFor = (k: number) => ERA_THREATS.find(t => t.species === k)

// What the active species will face at the end of its era (shown from birth).
export function upcomingThreat(s: GameState, k: number) {
  const def = eraThreatFor(k)
  return def ? { def, requirements: requirements(def.checks, k, false, s.meta.epoch) } : null
}

export function threatName(t: Threat): string {
  return t.kind === 'era' ? eraThreatFor(t.species)!.name : THREAT_BY_ID[t.id].name
}

export function threatText(t: Threat): string {
  return t.kind === 'era' ? eraThreatFor(t.species)!.text : THREAT_BY_ID[t.id].text
}

// How close impact is, without exact numbers: the UI shows no timer.
export type ThreatStage = 'distant' | 'approaching' | 'imminent'

export function threatStage(t: Threat): ThreatStage {
  const left = t.countdown / (t.kind === 'era' ? ERA_COUNTDOWN : THREAT_COUNTDOWN)
  return left > 0.5 ? 'distant' : left > 0.15 ? 'approaching' : 'imminent'
}

export const missing = (t: Threat, m: Mods): Resist[] =>
  RESISTS.filter(r => t.requirements[r] !== undefined && m.resist[r] < t.requirements[r]!)

export function startEraThreat(s: GameState, k: number) {
  const def = eraThreatFor(k)!
  s.threat = {
    kind: 'era', id: def.id, species: k, countdown: ERA_COUNTDOWN,
    requirements: requirements(def.checks, k, false, s.meta.epoch), resolved: false,
  }
  addLog(s, def.text, 'story')
}

export function startReckoning(s: GameState) {
  const def = pickWeighted(s, THREATS, () => 1)
  s.threat = {
    kind: 'final', id: def.id, species: s.species.length - 1, countdown: THREAT_COUNTDOWN,
    requirements: requirements(def.checks, s.species.length - 1, true, s.meta.epoch), resolved: false,
  }
  addLog(s, def.text, 'story')
}

export function stepThreat(s: GameState, m: Mods, dt: number) {
  const t = s.threat
  if (!t || t.resolved) return
  t.countdown = Math.max(0, t.countdown - dt)
  if (t.countdown > 0) return
  const passed = missing(t, m).length === 0

  if (t.kind === 'era') {
    const def = eraThreatFor(t.species)!
    if (passed) {
      addLog(s, `The lineage survives the ${def.name}.`, 'story')
      s.threat = null
      birthNext(s, t.species)
    } else {
      t.resolved = true
      s.activeEvent = null
      addLog(s, def.failText, 'story')
      addLog(s, ENDING_TEXT.extinct, 'story')
      s.ending = 'extinct'
    }
    return
  }

  t.resolved = true
  s.activeEvent = null
  if (passed) {
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

// After a failed final impact, the run ends when the last species is gone.
export function checkExtinctEnding(s: GameState) {
  if (s.threat?.kind !== 'final' || !s.threat.resolved || s.ending) return
  if (s.species.some(sp => sp.status === 'active' || sp.status === 'declining')) return
  addLog(s, ENDING_TEXT.extinct, 'story')
  s.ending = 'extinct'
}
