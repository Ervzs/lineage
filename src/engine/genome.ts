import { GENOME_FACTOR } from '../data/constants'
import { GENOME_NODE_BY_ID } from '../data/genomeNodes'
import type { GameState } from './types'

export const genomeGain = (peakPopulation: number) =>
  Math.round(GENOME_FACTOR * Math.log10(Math.max(peakPopulation, 1)))

export function canBuyNode(s: GameState, id: string): boolean {
  const n = GENOME_NODE_BY_ID[id]
  return !!n && !s.genomeNodes.includes(id) && n.requires.every(r => s.genomeNodes.includes(r)) && s.genome >= n.cost
}

export function buyNode(s: GameState, id: string) {
  s.genome -= GENOME_NODE_BY_ID[id].cost
  s.genomeNodes = [...s.genomeNodes, id]
}
