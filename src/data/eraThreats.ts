import type { EraThreatDef } from '../engine/types'

// The Threat that ends each era (species 1-7). Surviving it births the next species.
export const ERA_THREATS: EraThreatDef[] = [
  {
    species: 0, id: 'hydrothermal-collapse', name: 'Hydrothermal Collapse', checks: ['toughness'],
    text: 'The vents shift. Boiling water tears through the shallows.',
    failText: 'The shells break apart. The chemistry stops.',
  },
  {
    species: 1, id: 'oxygen-catastrophe', name: 'Oxygen Catastrophe', checks: ['immunity', 'endurance'],
    text: 'A new gas fills the water. To most cells it is poison.',
    failText: 'The oxygen burns through every colony. Nothing divides again.',
  },
  {
    species: 2, id: 'snowball-earth', name: 'Snowball Earth', checks: ['endurance', 'toughness'],
    text: 'Ice spreads from the poles toward the equator.',
    failText: 'The seas freeze over. The reefs fall silent under the ice.',
  },
  {
    species: 3, id: 'ocean-anoxia', name: 'Ocean Anoxia', checks: ['endurance', 'toughness'],
    text: 'The deep water loses its breath. Dead zones spread upward.',
    failText: 'The water turns still and dark. The schools never surface.',
  },
  {
    species: 4, id: 'great-dying', name: 'The Great Dying', checks: ['immunity', 'endurance'],
    text: 'The air turns acid. Sickness follows the heat.',
    failText: 'Nine in ten species vanish. This lineage is one of them.',
  },
  {
    species: 5, id: 'impact-winter', name: 'Impact Winter', checks: ['toughness', 'endurance'],
    text: 'A rock from the sky. Dust hides the sun for years.',
    failText: 'The long night does not end in time. The burrows go cold.',
  },
  {
    species: 6, id: 'toba-eruption', name: 'Toba Eruption', checks: ['endurance', 'immunity'],
    text: 'A mountain explodes. Ash falls across half the world.',
    failText: 'The ash settles on every camp. No one walks out of the winter.',
  },
]
