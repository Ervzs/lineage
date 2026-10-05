import type { GenomeNodeDef } from '../engine/types'

export const GENOME_NODES: GenomeNodeDef[] = [
  { id: 'g1', name: 'Hardy Ancestry', cost: 10, resist: { toughness: 20 }, requires: [], flavor: 'Survivors pass on their toughness.' },
  { id: 'g2', name: 'Thick Membranes', cost: 15, resist: { toughness: 30 }, requires: ['g1'], flavor: 'Cells seal out harm.' },
  { id: 'g3', name: 'Shared Immunity', cost: 20, resist: { immunity: 40 }, requires: ['g1'], flavor: 'Resistance spreads between lines.' },
  { id: 'g4', name: 'Repair Enzymes', cost: 25, resist: { immunity: 40 }, requires: ['g2'], flavor: 'Genes that mend damage.' },
  { id: 'g5', name: 'Swarm Instinct', cost: 25, resist: { toughness: 40 }, requires: ['g3'], flavor: 'Groups react as one.' },
  { id: 'g6', name: 'Deep Instincts', cost: 30, resist: { endurance: 50 }, requires: ['g2', 'g3'], flavor: 'Old reflexes warn of danger.' },
  { id: 'g7', name: 'Adaptive Immunity', cost: 30, resist: { immunity: 50 }, requires: ['g4'], flavor: 'Defenses learn new threats.' },
  { id: 'g8', name: 'Cold Resistance', cost: 35, resist: { endurance: 50 }, requires: ['g5'], flavor: 'Bodies survive long winters.' },
  { id: 'g9', name: 'Radiation Hardening', cost: 35, resist: { toughness: 50 }, requires: ['g6'], flavor: 'Cells shrug off harsh rays.' },
  { id: 'g10', name: 'Ancestral Memory', cost: 40, resist: { immunity: 10, toughness: 10, endurance: 10 }, requires: ['g7', 'g8'], flavor: 'Every extinction left a lesson.' },
]

export const GENOME_NODE_BY_ID: Record<string, GenomeNodeDef> = Object.fromEntries(GENOME_NODES.map(n => [n.id, n]))
