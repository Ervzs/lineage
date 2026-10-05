import type { EventDef } from '../engine/types'

// Percent values: biomassLossPct is percent of current Biomass,
// populationLossPct is percent of current Health removed.
export const EVENTS: EventDef[] = [
  {
    id: 'nutrient-drift', name: 'Nutrient Drift', kind: 'boost', minSpecies: 2, weight: 4,
    flavor: 'A rich current passes through.',
    defaultOptionId: 'feast',
    options: [
      { id: 'feast', label: 'feast', outcomes: [{ chance: 1, biomassGainSeconds: 60, text: 'The lineage feeds well.' }] },
      { id: 'grow', label: 'grow', outcomes: [{ chance: 1, productionMult: 1.4, durationSeconds: 150, text: 'Growth quickens for a while.' }] },
    ],
  },
  {
    id: 'bloom', name: 'Bloom', kind: 'boost', minSpecies: 3, weight: 3,
    flavor: 'Warm light. Life surges.',
    defaultOptionId: 'steady',
    options: [
      { id: 'steady', label: 'steady', outcomes: [{ chance: 1, productionMult: 1.5, durationSeconds: 60, text: 'A steady bloom.' }] },
      { id: 'surge', label: 'surge', outcomes: [{ chance: 1, productionMult: 3, durationSeconds: 30, text: 'A short, wild bloom.' }] },
    ],
  },
  {
    id: 'predator-wave', name: 'Predator Wave', kind: 'loss', minSpecies: 4, weight: 4,
    flavor: 'Something large moves through the shallows.',
    defaultOptionId: 'hide',
    options: [
      { id: 'hide', label: 'hide', outcomes: [{ chance: 1, biomassLossPct: 6, populationLossPct: 5, recoverSeconds: 120, text: 'The lineage hides and waits.' }] },
      {
        id: 'fight', label: 'fight', outcomes: [
          { chance: 0.65, text: 'The predators are driven off.' },
          { chance: 0.35, biomassLossPct: 14.5, populationLossPct: 12, recoverSeconds: 120, text: 'The fight goes badly.' },
        ],
      },
    ],
  },
  {
    id: 'drought', name: 'Drought', kind: 'loss', minSpecies: 5, weight: 3,
    flavor: 'The water recedes.',
    defaultOptionId: 'migrate',
    options: [
      { id: 'endure', label: 'endure', outcomes: [{ chance: 1, populationLossPct: 40, recoverSeconds: 360, text: 'Many die waiting for rain.' }] },
      { id: 'migrate', label: 'migrate', outcomes: [{ chance: 1, biomassLossPct: 8, text: 'The lineage moves on and leaves stores behind.' }] },
      { id: 'store', label: 'store', outcomes: [{ chance: 1, biomassLossPct: 4, populationLossPct: 20, recoverSeconds: 360, text: 'Some stores, some losses.' }] },
    ],
  },
  {
    id: 'plague', name: 'Plague', kind: 'loss', minSpecies: 6, weight: 3,
    flavor: 'A sickness moves through the population. Many fall.',
    defaultOptionId: 'isolate',
    options: [
      { id: 'isolate', label: 'isolate', outcomes: [{ chance: 1, biomassLossPct: 4, populationLossPct: 15, recoverSeconds: 240, text: 'The sick are kept apart.' }] },
      {
        id: 'treat', label: 'treat', outcomes: [
          { chance: 0.65, text: 'The treatment works.' },
          { chance: 0.35, biomassLossPct: 10, populationLossPct: 40, recoverSeconds: 240, text: 'The treatment fails.' },
        ],
      },
    ],
  },
  {
    id: 'famine', name: 'Famine', kind: 'loss', minSpecies: 7, weight: 3,
    flavor: 'The harvest fails.',
    defaultOptionId: 'ration',
    options: [
      { id: 'ration', label: 'ration', outcomes: [{ chance: 1, biomassLossPct: 7, populationLossPct: 5, recoverSeconds: 180, text: 'Everyone eats a little less.' }] },
      {
        id: 'gamble', label: 'gamble', outcomes: [
          { chance: 0.575, text: 'New food is found in time.' },
          { chance: 0.425, biomassLossPct: 14, populationLossPct: 10, recoverSeconds: 180, text: 'The search finds nothing.' },
        ],
      },
    ],
  },
  {
    id: 'unrest', name: 'Unrest', kind: 'loss', minSpecies: 8, weight: 3,
    flavor: 'The people no longer agree.',
    defaultOptionId: 'appease',
    options: [
      { id: 'appease', label: 'appease', outcomes: [{ chance: 1, biomassLossPct: 8, populationLossPct: 5, recoverSeconds: 180, text: 'Concessions calm the streets.' }] },
      {
        id: 'suppress', label: 'suppress', outcomes: [
          { chance: 0.547, text: 'Order returns quickly.' },
          { chance: 0.453, biomassLossPct: 15, populationLossPct: 10, recoverSeconds: 180, text: 'The crackdown backfires.' },
        ],
      },
    ],
  },
]

export const EVENT_BY_ID: Record<string, EventDef> = Object.fromEntries(EVENTS.map(e => [e.id, e]))
