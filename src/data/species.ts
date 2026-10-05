import type { SpeciesDef } from '../engine/types'
import {
  ANCHORS, CHAIN_RATE, DECLINE_SECONDS, DEFENSE_UNITS, PRODUCER_COST_MULT, PRODUCER_GROWTH,
  SPECIES_PACE, TIER1_PAYBACK, UNIT_SCALES,
} from './constants'
import { BIRTH_TEXT, EXTINCT_TEXT } from './story'

const ROWS: [string, string, string, string, string][] = [
  ['Protocells', 'Primordial', 'Membranes', 'Vesicles', 'Coacervates'],
  ['Bacteria', 'Microbial', 'Colonies', 'Biofilms', 'Microbial Mats'],
  ['Sponges', 'Multicellular', 'Sponge Cells', 'Sponge Clusters', 'Sponge Reefs'],
  ['Fish', 'Aquatic', 'Fry', 'Schools', 'Shoals'],
  ['Reptiles', 'Terrestrial', 'Hatchlings', 'Clutches', 'Territories'],
  ['Mammals', 'Warm-blooded', 'Litters', 'Herds', 'Ranges'],
  ['Hominids', 'Tool-making', 'Bands', 'Clans', 'Tribes'],
  ['Humans', 'Civilization', 'Villages', 'Cities', 'Nations'],
]

export const SPECIES: SpeciesDef[] = ROWS.map(([name, era, t1, t2, t3], i) => {
  const b = ANCHORS[i]
  const producer = (tier: number, pname: string) => ({
    name: pname,
    baseCost: PRODUCER_COST_MULT[tier] * b,
    growth: PRODUCER_GROWTH[tier],
    baseRate: (tier === 0 ? b / TIER1_PAYBACK : CHAIN_RATE) / SPECIES_PACE[i],
  })
  return {
    index: i,
    id: name.toLowerCase(),
    name,
    era,
    producers: [producer(0, t1), producer(1, t2), producer(2, t3)],
    anchor: b,
    unitScale: UNIT_SCALES[i],
    declineSeconds: DECLINE_SECONDS[i],
    defenseUnit: DEFENSE_UNITS[i],
    birthText: BIRTH_TEXT[i],
    extinctText: EXTINCT_TEXT[i],
  }
})
