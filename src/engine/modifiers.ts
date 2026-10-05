import {
  GIFT_BASE, GIFT_CAP, LOSS_MULT_FLOOR, LUCK_CAP, MILESTONES, MUTATION_DEFENSE_CAP, NUMBER_CLAMP, RISK_CAP,
} from '../data/constants'
import { GENOME_NODE_BY_ID } from '../data/genomeNodes'
import { TRAIT_BY_ID } from '../data/traits'
import type { GameState } from './types'

// The modifier pipeline. Every production multiplier lives here (PLAN.md section 8).
export interface Mods {
  tierMult: number[][]        // [species][tier] = milestone × Growth Traits
  chainBonus: number[]        // per species, sum of chain Mutations
  productionBonus: number     // sum of production Mutations
  tempMult: number            // product of boost events
  health: number
  defenseTraits: number
  defenseGenome: number
  defenseMutations: number    // capped
  defense: number
  luck: number
  lossMult: number
  riskBonus: number           // percentage points
  giftChance: number          // percent
}

export const milestoneMult = (bought: number) => 2 ** MILESTONES.filter(m => bought >= m).length

export const nextMilestone = (bought: number) => MILESTONES.find(m => bought < m) ?? null

export function computeMods(s: GameState): Mods {
  const traitMult = s.species.map(() => [1, 1, 1])
  let defenseTraits = 0
  let luck = 0
  let lossMult = 1
  let riskBonus = 0
  let giftBonus = 0
  for (const sp of s.species) {
    for (const id of sp.traitsBought) {
      const t = TRAIT_BY_ID[id]
      for (const e of t.effects) {
        switch (e.target) {
          case 'tier1.output': traitMult[t.species][0] *= e.value; break
          case 'tier2.output': traitMult[t.species][1] *= e.value; break
          case 'tier3.output': traitMult[t.species][2] *= e.value; break
          case 'defense.flat': defenseTraits += e.value; break
          case 'event.lossMult': lossMult *= e.value; break
          case 'luck.points': luck += e.value; break
          case 'event.riskSuccess': riskBonus += e.value; break
          case 'gift.chance': giftBonus += e.value; break
        }
      }
    }
  }

  const chainBonus = s.species.map(() => 0)
  let productionBonus = 0
  let defenseMutations = 0
  for (const m of s.mutations) {
    if (m.type === 'production') productionBonus += m.value
    else if (m.type === 'chain' && m.species !== undefined) chainBonus[m.species] += m.value
    else if (m.type === 'defense') defenseMutations += m.value
    else if (m.type === 'luck') luck += m.value
  }
  defenseMutations = Math.min(MUTATION_DEFENSE_CAP, defenseMutations)

  const defenseGenome = s.genomeNodes.reduce((sum, id) => sum + GENOME_NODE_BY_ID[id].defense, 0)

  return {
    tierMult: s.species.map((sp, k) => sp.producers.map((p, t) => milestoneMult(p.bought) * traitMult[k][t])),
    chainBonus,
    productionBonus,
    tempMult: s.tempEffects.reduce((m, e) => m * e.productionMult, 1),
    health: s.health,
    defenseTraits,
    defenseGenome,
    defenseMutations,
    defense: defenseTraits + defenseGenome + defenseMutations,
    luck: Math.min(LUCK_CAP, luck),
    lossMult: Math.max(LOSS_MULT_FLOOR, lossMult),
    riskBonus: Math.min(RISK_CAP, riskBonus),
    giftChance: Math.min(GIFT_CAP, GIFT_BASE + giftBonus),
  }
}

// Global multipliers: apply to final Biomass income only (section 8.3).
export const globalMult = (m: Mods) => (1 + m.productionBonus) * m.tempMult * m.health

// Final income of one species from its raw Tier 1 output.
export const speciesIncome = (raw: number, k: number, m: Mods) =>
  Math.min(NUMBER_CLAMP, raw * (1 + m.chainBonus[k]) * globalMult(m))
