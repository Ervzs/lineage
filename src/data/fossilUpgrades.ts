// Permanent upgrades bought with Fossils. Every one is repeatable.
export interface FossilUpgradeDef {
  id: string
  name: string
  flavor: string
  baseCost: number
  growth: number
  perLevel: number
  max?: number          // level cap, if any
}

export const FOSSIL_UPGRADES: FossilUpgradeDef[] = [
  { id: 'vigor', name: 'Ancestral Vigor', flavor: 'Old strength runs in every line.', baseCost: 5, growth: 1.6, perLevel: 0.25 },
  { id: 'hide', name: 'Thick Hide', flavor: 'Each lineage starts a little tougher.', baseCost: 8, growth: 1.7, perLevel: 0.05 },
  { id: 'adapt', name: 'Quick Adaptation', flavor: 'Change comes easier the second time.', baseCost: 10, growth: 1.8, perLevel: 0.04, max: 12 },
  { id: 'luck', name: 'Lucky Genes', flavor: 'Fortune favors an old bloodline.', baseCost: 6, growth: 1.7, perLevel: 2 },
  { id: 'record', name: 'Fossil Record', flavor: 'More of the past is preserved.', baseCost: 12, growth: 2, perLevel: 0.1 },
]

export const FOSSIL_UPGRADE_BY_ID: Record<string, FossilUpgradeDef> = Object.fromEntries(FOSSIL_UPGRADES.map(u => [u.id, u]))
