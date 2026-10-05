import type { ObjectiveDef } from '../engine/types'
import { SPECIES } from './species'

const SPECIES_1: ObjectiveDef[] = [
  { species: 0, text: 'Absorb nutrients until you have 10 Biomass.', check: { kind: 'biomass', n: 10 } },
  { species: 0, text: 'Buy a Membrane.', check: { kind: 'bought', tier: 0, n: 1 } },
  { species: 0, text: 'Own 5 Membranes.', check: { kind: 'bought', tier: 0, n: 5 } },
  { species: 0, text: 'Buy a Vesicle.', check: { kind: 'bought', tier: 1, n: 1 } },
  { species: 0, text: 'Buy your first Trait.', check: { kind: 'traits', n: 1 } },
  { species: 0, text: 'Own 10 Membranes.', check: { kind: 'bought', tier: 0, n: 10 } },
  { species: 0, text: 'Own 3 Traits.', check: { kind: 'traits', n: 3 } },
  { species: 0, text: 'Buy a Coacervate.', check: { kind: 'bought', tier: 2, n: 1 } },
  { species: 0, text: 'Own 6 Traits.', check: { kind: 'traits', n: 6 } },
  { species: 0, text: 'Keep adapting. Something is changing.', check: { kind: 'born' } },
]

const singular = (name: string) => name.replace(/ies$/, 'y').replace(/ches$/, 'ch').replace(/s$/, '')

const template = (k: number): ObjectiveDef[] => {
  const [t1, t2] = SPECIES[k].producers
  return [
    { species: k, text: `Buy your first ${singular(t1.name)}.`, check: { kind: 'bought', tier: 0, n: 1 } },
    { species: k, text: `Buy your first ${singular(t2.name)}.`, check: { kind: 'bought', tier: 1, n: 1 } },
    { species: k, text: 'Buy your first Trait.', check: { kind: 'traits', n: 1 } },
    { species: k, text: 'Own 3 Traits.', check: { kind: 'traits', n: 3 } },
    { species: k, text: 'Own 6 Traits.', check: { kind: 'traits', n: 6 } },
    { species: k, text: 'Keep adapting.', check: { kind: 'born' } },
  ]
}

export const OBJECTIVES: ObjectiveDef[] = [...SPECIES_1, ...[1, 2, 3, 4, 5, 6, 7].flatMap(template)]

export const EXTRA_OBJECTIVES = {
  firstEvent: 'Answer your first event.',
  genomeNode: 'Buy a Genome node.',
  threatRaise: 'Raise {resist} to {n} before the {threat}.',
  threatHold: 'Hold on until the {threat} passes.',
}
