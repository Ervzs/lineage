import { NUMBER_CLAMP } from '../data/constants'
import { SPECIES } from '../data/species'
import { speciesIncome, type Mods } from './modifiers'
import { isLiving } from './state'
import type { GameState } from './types'

// Biomass per second of each species, after every multiplier.
export function incomeBySpecies(s: GameState, m: Mods): number[] {
  return s.species.map((sp, k) => {
    if (!isLiving(sp)) return 0
    const raw = sp.producers[0].amount * SPECIES[k].producers[0].baseRate * m.tierMult[k][0] * sp.vitality
    return speciesIncome(raw, k, m)
  })
}

export const totalIncome = (s: GameState, m: Mods) => incomeBySpecies(s, m).reduce((a, b) => a + b, 0)

// Units per second a chain tier adds to the tier below it (tier 1 or 2).
export const chainRate = (s: GameState, m: Mods, k: number, tier: 1 | 2) => {
  const sp = s.species[k]
  return sp.producers[tier].amount * SPECIES[k].producers[tier].baseRate * m.tierMult[k][tier] * sp.vitality
}

export function stepProduction(s: GameState, m: Mods, dt: number) {
  const income = totalIncome(s, m)
  s.species.forEach((sp, k) => {
    if (!isLiving(sp)) return
    const add2 = chainRate(s, m, k, 2) * dt
    const add1 = chainRate(s, m, k, 1) * dt
    sp.producers[1].amount = Math.min(NUMBER_CLAMP, sp.producers[1].amount + add2)
    sp.producers[0].amount = Math.min(NUMBER_CLAMP, sp.producers[0].amount + add1)
  })
  s.biomass = Math.min(NUMBER_CLAMP, s.biomass + income * dt)
  s.stats.totalBiomass = Math.min(NUMBER_CLAMP, s.stats.totalBiomass + income * dt)
}
