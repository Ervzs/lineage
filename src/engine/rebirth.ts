import { FOSSIL_GENOME_DIV, FOSSIL_SURVIVE_MULT } from '../data/constants'
import { FOSSIL_UPGRADE_BY_ID } from '../data/fossilUpgrades'
import { fossilEffect, fossilLevel } from './modifiers'
import { initialState, newestBorn } from './state'
import type { GameState } from './types'

// Fossils paid when the run ends: how far the lineage got, whether it survived, and its Genome.
export function fossilsForRun(s: GameState): number {
  const reached = newestBorn(s) + 1
  const base = reached ** 2 * (s.ending === 'survived' ? FOSSIL_SURVIVE_MULT : 1) + s.genomeEarned / FOSSIL_GENOME_DIV
  return Math.floor(base * (1 + fossilEffect(s, 'record')))
}

export const upgradeCost = (s: GameState, id: string) => {
  const u = FOSSIL_UPGRADE_BY_ID[id]
  return Math.ceil(u.baseCost * u.growth ** fossilLevel(s, id))
}

export function canBuyUpgrade(s: GameState, id: string) {
  const u = FOSSIL_UPGRADE_BY_ID[id]
  return !!u && (u.max === undefined || fossilLevel(s, id) < u.max) && s.meta.fossils >= upgradeCost(s, id)
}

export function buyUpgrade(s: GameState, id: string): GameState {
  const cost = upgradeCost(s, id)
  return {
    ...s,
    meta: { ...s.meta, fossils: s.meta.fossils - cost, upgrades: { ...s.meta.upgrades, [id]: fossilLevel(s, id) + 1 } },
  }
}

// Epoch after this run: surviving advances it, extinction repeats it.
export const nextEpoch = (s: GameState) => s.meta.epoch + (s.ending === 'survived' ? 1 : 0)

// A new run: everything resets except meta (Fossils and upgrades).
export function rebirth(s: GameState): GameState {
  const gain = fossilsForRun(s)
  const next = initialState(undefined, {
    ...s.meta,
    epoch: nextEpoch(s),
    fossils: s.meta.fossils + gain,
    fossilsEarned: s.meta.fossilsEarned + gain,
    bestEpoch: s.ending === 'survived' ? Math.max(s.meta.bestEpoch, s.meta.epoch) : s.meta.bestEpoch,
  })
  next.settings = s.settings
  next.log = [{ t: 0, text: `Epoch ${next.meta.epoch} begins. ${gain} Fossils carry the memory of the last world.`, kind: 'system' }, ...next.log]
  return next
}
