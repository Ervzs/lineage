import type { MutationType, Rarity } from '../engine/types'

export const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']

// Base odds in percent
export const RARITY_ODDS: Record<Rarity, number> = {
  common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 0.9, mythic: 0.1,
}

export const COMMON_ODDS_FLOOR = 30

export const MUTATION_TYPES: MutationType[] = ['production', 'chain', 'defense', 'luck']

export const MUTATION_WEIGHTS: Record<MutationType, number> = {
  production: 35, chain: 30, defense: 20, luck: 15,
}

// Production and Chain are fractions (0.02 = +2%). Defense and Luck are points.
export const MUTATION_VALUES: Record<MutationType, Record<Rarity, number>> = {
  production: { common: 0.02, uncommon: 0.05, rare: 0.12, epic: 0.3, legendary: 0.75, mythic: 2 },
  chain: { common: 0.05, uncommon: 0.12, rare: 0.3, epic: 0.75, legendary: 1.9, mythic: 5 },
  defense: { common: 2, uncommon: 4, rare: 8, epic: 16, legendary: 30, mythic: 60 },
  luck: { common: 1, uncommon: 2, rare: 3, epic: 5, legendary: 8, mythic: 12 },
}
