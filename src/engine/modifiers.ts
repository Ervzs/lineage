import {
  GIFT_BASE, GIFT_CAP, LEVEL_GIFT, LEVEL_GROWTH_STEP, LEVEL_LOSS_STEP, LEVEL_LUCK, LEVEL_RISK, LOSS_MULT_FLOOR,
  LUCK_CAP, MILESTONES, MUTATION_DEFENSE_CAP, NUMBER_CLAMP, RESISTS, RISK_CAP,
} from '../data/constants'
import { FOSSIL_UPGRADE_BY_ID } from '../data/fossilUpgrades'
import { GENOME_NODE_BY_ID } from '../data/genomeNodes'
import { TRAIT_BY_ID } from '../data/traits'
import type { Effect, GameState, Resist } from './types'

// The modifier pipeline. Every production multiplier lives here (PLAN.md section 8).
export interface Mods {
  tierMult: number[][]        // [species][tier] = milestone × Growth Traits
  chainBonus: number[]        // per species, sum of chain Mutations
  productionBonus: number     // sum of production Mutations
  fossilMult: number          // Ancestral Vigor
  tempMult: number            // product of boost events
  health: number
  resistTraits: Record<Resist, number>
  resistGenome: Record<Resist, number>
  resistMutations: Record<Resist, number>   // capped per type
  resist: Record<Resist, number>            // total, after Thick Hide
  luck: number
  lossMult: number
  riskBonus: number           // percentage points
  giftChance: number          // percent
}

export const milestoneMult = (bought: number) => 2 ** MILESTONES.filter(m => bought >= m).length

export const nextMilestone = (bought: number) => MILESTONES.find(m => bought < m) ?? null

export const fossilLevel = (s: GameState, id: string) => s.meta.upgrades[id] ?? 0

export function fossilEffect(s: GameState, id: string): number {
  const u = FOSSIL_UPGRADE_BY_ID[id]
  return Math.min(fossilLevel(s, id), u.max ?? Infinity) * u.perLevel
}

// Trait effect strength at a given level (level 0 = just bought).
export function effectAtLevel(e: Effect, level: number): number {
  switch (e.target) {
    case 'tier1.output':
    case 'tier2.output':
    case 'tier3.output': return e.value * LEVEL_GROWTH_STEP ** level
    case 'resist.immunity':
    case 'resist.toughness':
    case 'resist.endurance': return e.value * 2 ** level
    case 'event.lossMult': return e.value * LEVEL_LOSS_STEP ** level
    case 'luck.points': return e.value + LEVEL_LUCK * level
    case 'event.riskSuccess': return e.value + LEVEL_RISK * level
    case 'gift.chance': return e.value + LEVEL_GIFT * level
  }
}

const zero = (): Record<Resist, number> => ({ immunity: 0, toughness: 0, endurance: 0 })

export function computeMods(s: GameState): Mods {
  const traitMult = s.species.map(() => [1, 1, 1])
  const resistTraits = zero()
  let luck = 0
  let lossMult = 1
  let riskBonus = 0
  let giftBonus = 0
  for (const sp of s.species) {
    for (const id of sp.traitsBought) {
      const t = TRAIT_BY_ID[id]
      const level = s.traitLevels[id] ?? 0
      for (const e of t.effects) {
        const v = effectAtLevel(e, level)
        switch (e.target) {
          case 'tier1.output': traitMult[t.species][0] *= v; break
          case 'tier2.output': traitMult[t.species][1] *= v; break
          case 'tier3.output': traitMult[t.species][2] *= v; break
          case 'resist.immunity': resistTraits.immunity += v; break
          case 'resist.toughness': resistTraits.toughness += v; break
          case 'resist.endurance': resistTraits.endurance += v; break
          case 'event.lossMult': lossMult *= v; break
          case 'luck.points': luck += v; break
          case 'event.riskSuccess': riskBonus += v; break
          case 'gift.chance': giftBonus += v; break
        }
      }
    }
  }

  const chainBonus = s.species.map(() => 0)
  let productionBonus = 0
  const resistMutations = zero()
  for (const m of s.mutations) {
    if (m.type === 'production') productionBonus += m.value
    else if (m.type === 'chain' && m.species !== undefined) chainBonus[m.species] += m.value
    else if (m.type === 'defense' && m.resist) resistMutations[m.resist] += m.value
    else if (m.type === 'luck') luck += m.value
  }

  const resistGenome = zero()
  for (const id of s.genomeNodes) {
    const r = GENOME_NODE_BY_ID[id].resist
    for (const k of RESISTS) resistGenome[k] += r[k] ?? 0
  }

  const hide = 1 + fossilEffect(s, 'hide')
  const resist = zero()
  for (const k of RESISTS) {
    resistMutations[k] = Math.min(MUTATION_DEFENSE_CAP, resistMutations[k])
    resist[k] = Math.floor((resistTraits[k] + resistGenome[k] + resistMutations[k]) * hide)
  }

  return {
    tierMult: s.species.map((sp, k) => sp.producers.map((p, t) => milestoneMult(p.bought) * traitMult[k][t])),
    chainBonus,
    productionBonus,
    fossilMult: 1 + fossilEffect(s, 'vigor'),
    tempMult: s.tempEffects.reduce((m, e) => m * e.productionMult, 1),
    health: s.health,
    resistTraits,
    resistGenome,
    resistMutations,
    resist,
    luck: Math.min(LUCK_CAP, luck),
    lossMult: Math.max(LOSS_MULT_FLOOR, lossMult),
    riskBonus: Math.min(RISK_CAP, riskBonus),
    giftChance: Math.min(GIFT_CAP, GIFT_BASE + giftBonus + fossilEffect(s, 'luck')),
  }
}

// Global multipliers: apply to final Biomass income only (section 8.3).
export const globalMult = (m: Mods) => (1 + m.productionBonus) * m.fossilMult * m.tempMult * m.health

// Final income of one species from its raw Tier 1 output.
export const speciesIncome = (raw: number, k: number, m: Mods) =>
  Math.min(NUMBER_CLAMP, raw * (1 + m.chainBonus[k]) * globalMult(m))
