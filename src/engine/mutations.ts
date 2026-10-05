import { COMMON_ODDS_FLOOR, MUTATION_TYPES, MUTATION_VALUES, MUTATION_WEIGHTS, RARITIES, RARITY_ODDS } from '../data/mutations'
import { TRAIT_BY_ID } from '../data/traits'
import type { Mods } from './modifiers'
import { nextRandom, pickWeighted } from './rng'
import { addLog, reveal } from './state'
import type { GameState, MutationInstance, MutationType, Rarity } from './types'

// Rarity odds in percent after Luck (section 12.5).
export function rarityOdds(luck: number): Record<Rarity, number> {
  const common = Math.max(COMMON_ODDS_FLOOR, RARITY_ODDS.common - luck)
  const freed = RARITY_ODDS.common - common
  const rest = 100 - RARITY_ODDS.common
  const odds = { ...RARITY_ODDS, common }
  for (const r of RARITIES.slice(1)) odds[r] = RARITY_ODDS[r] + freed * RARITY_ODDS[r] / rest
  return odds
}

export function rollRarity(rng: { rngState: number }, luck: number): Rarity {
  const odds = rarityOdds(luck)
  return pickWeighted(rng, RARITIES, r => odds[r])
}

export const rollType = (rng: { rngState: number }): MutationType =>
  pickWeighted(rng, MUTATION_TYPES, t => MUTATION_WEIGHTS[t])

export function describeMutation(m: MutationInstance): string {
  const v = m.type === 'production' || m.type === 'chain' ? `+${Math.round(m.value * 100)}%` : `+${m.value}`
  return `${m.rarity} ${m.type} ${v}`
}

// One gift check per Trait purchase, after the Trait's own effect applies.
export function giftCheck(s: GameState, m: Mods, traitId: string) {
  if (nextRandom(s) * 100 >= m.giftChance) return
  const t = TRAIT_BY_ID[traitId]
  const rarity = rollRarity(s, m.luck)
  const type = rollType(s)
  const mutation: MutationInstance = {
    id: `m${s.mutations.length + 1}`,
    type,
    rarity,
    value: MUTATION_VALUES[type][rarity],
    traitId,
    species: type === 'chain' ? t.species : undefined,
  }
  s.mutations = [...s.mutations, mutation]
  reveal(s, 'mutations')
  addLog(s, `Gifted: ${t.name} — ${describeMutation(mutation)}`, 'system')
}
