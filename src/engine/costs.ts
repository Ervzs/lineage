import { LATE_TRAIT_FACTOR, NUMBER_CLAMP } from '../data/constants'
import type { BuyMode, GameState, ProducerDef, TraitDef } from './types'
import { newestBorn } from './state'

const clamp = (x: number) => Math.min(x, NUMBER_CLAMP)

// Cost of buying n units starting at `bought` (geometric sum).
export function producerCost(def: ProducerDef, bought: number, n = 1): number {
  const g = def.growth
  return clamp(def.baseCost * g ** bought * (g ** n - 1) / (g - 1))
}

export function maxAffordable(def: ProducerDef, bought: number, biomass: number): number {
  const first = def.baseCost * def.growth ** bought
  if (biomass < first) return 0
  const n = Math.floor(Math.log(1 + biomass * (def.growth - 1) / first) / Math.log(def.growth))
  // guard against floating point at the edge
  return producerCost(def, bought, n) > biomass ? n - 1 : n
}

// How many units a buy press purchases (0 = not affordable).
export function buyCount(def: ProducerDef, bought: number, biomass: number, mode: BuyMode): number {
  if (mode === 'max') return maxAffordable(def, bought, biomass)
  return producerCost(def, bought, mode) <= biomass ? mode : 0
}

// Units shown on the row's cost line for the current mode.
export const displayCount = (def: ProducerDef, bought: number, biomass: number, mode: BuyMode) =>
  mode === 'max' ? Math.max(1, maxAffordable(def, bought, biomass)) : mode

// Late adaptation: base × 250^n, n = species born after the Trait's species.
export function traitCost(s: GameState, t: TraitDef): number {
  const n = Math.max(0, newestBorn(s) - t.species)
  return clamp(t.cost * LATE_TRAIT_FACTOR ** n)
}
