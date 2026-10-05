import { EXTRA_OBJECTIVES, OBJECTIVES } from '../data/objectives'
import { GENOME_NODES } from '../data/genomeNodes'
import { SPECIES } from '../data/species'
import { TRAITS } from '../data/traits'
import type { Mods } from './modifiers'
import { canBuyNode } from './genome'
import { missing, threatName } from './reckoning'
import { activeIndex, reveal } from './state'
import type { GameState, ObjectiveDef } from './types'

export interface ObjectiveView { text: string; current?: number; target?: number }

function progress(s: GameState, o: ObjectiveDef): [number, number] | null {
  const sp = s.species[o.species]
  switch (o.check.kind) {
    case 'biomass': return [s.biomass, o.check.n]
    case 'bought': return [sp.producers[o.check.tier].bought, o.check.n]
    case 'traits': return [sp.traitsBought.length, o.check.n]
    case 'born': return null
  }
}

function done(s: GameState, o: ObjectiveDef): boolean {
  if (o.check.kind === 'born') {
    return o.species === SPECIES.length - 1 ? s.threat?.kind === 'final' : s.species[o.species + 1].status !== 'locked'
  }
  const p = progress(s, o)!
  return p[0] >= p[1]
}

export function stepObjectives(s: GameState) {
  const k = activeIndex(s)
  while (s.objectiveIndex < OBJECTIVES.length) {
    const o = OBJECTIVES[s.objectiveIndex]
    // Objectives of a species that is no longer active are skipped.
    if (k < 0 || o.species < k || done(s, o)) s.objectiveIndex++
    else break
  }
}

export function objectiveView(s: GameState, m: Mods): ObjectiveView | null {
  if (s.ending) return null
  if (s.threat && !s.threat.resolved) {
    const name = threatName(s.threat)
    const r = missing(s.threat, m)[0]
    if (!r) return { text: EXTRA_OBJECTIVES.threatHold.replace('{threat}', name) }
    const n = s.threat.requirements[r]!
    const label = r[0].toUpperCase() + r.slice(1)
    return {
      text: EXTRA_OBJECTIVES.threatRaise.replace('{resist}', label).replace('{n}', String(n)).replace('{threat}', name),
      current: m.resist[r],
      target: n,
    }
  }
  if (s.genomeNodes.length === 0 && GENOME_NODES.some(n => canBuyNode(s, n.id))) {
    return { text: EXTRA_OBJECTIVES.genomeNode }
  }
  if (s.activeEvent && s.stats.eventsResolved === 0) return { text: EXTRA_OBJECTIVES.firstEvent }
  const o = OBJECTIVES[s.objectiveIndex]
  if (!o) return null
  const p = progress(s, o)
  return p ? { text: o.text, current: Math.min(p[0], p[1]), target: p[1] } : { text: o.text }
}

// Reveal rules that would flicker if derived live (section 15.4).
export function stepReveals(s: GameState) {
  const k = activeIndex(s)
  if (k < 0) return
  const sp = SPECIES[k]
  if (s.biomass >= sp.producers[1].baseCost / 2) reveal(s, `t2-${k}`)
  if (s.biomass >= sp.producers[2].baseCost / 2) reveal(s, `t3-${k}`)
  const firstTrait = TRAITS.find(t => t.species === k && t.tier === 1)!
  if (s.biomass >= firstTrait.cost / 2) reveal(s, 'traits')
}
