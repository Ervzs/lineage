import { POP_WEIGHTS } from '../data/constants'
import { SPECIES } from '../data/species'
import { isLiving } from './state'
import type { GameState } from './types'

// Raw population: Vitality and Health ignored. Peak Population uses this.
export function rawPopulation(s: GameState, k: number): number {
  const p = s.species[k].producers
  return SPECIES[k].unitScale * (p[0].amount * POP_WEIGHTS[0] + p[1].amount * POP_WEIGHTS[1] + p[2].amount * POP_WEIGHTS[2])
}

export const speciesPopulation = (s: GameState, k: number) =>
  isLiving(s.species[k]) ? rawPopulation(s, k) * s.species[k].vitality * s.health : 0

export const totalPopulation = (s: GameState) =>
  s.species.reduce((sum, _, k) => sum + speciesPopulation(s, k), 0)

export function updatePeaks(s: GameState) {
  s.species.forEach((sp, k) => {
    if (isLiving(sp)) sp.peakPopulation = Math.max(sp.peakPopulation, rawPopulation(s, k))
  })
}
