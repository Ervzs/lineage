import { LOG_MAX, SAVE_VERSION } from '../data/constants'
import { SPECIES } from '../data/species'
import type { GameState, LogEntry, Meta, SpeciesState } from './types'

const newSpecies = (active: boolean): SpeciesState => ({
  status: active ? 'active' : 'locked',
  producers: [{ bought: 0, amount: 0 }, { bought: 0, amount: 0 }, { bought: 0, amount: 0 }],
  traitsBought: [],
  evoPoints: 0,
  vitality: 1,
  declineElapsed: 0,
  peakPopulation: 0,
  genomePaid: false,
})

export const newMeta = (): Meta => ({ epoch: 1, fossils: 0, fossilsEarned: 0, bestEpoch: 0, upgrades: {} })

export function initialState(seed = (Date.now() % 2147483647) | 0, meta: Meta = newMeta()): GameState {
  return {
    version: SAVE_VERSION,
    seed,
    rngState: seed,
    playTime: 0,
    biomass: 0,
    genome: 0,
    genomeEarned: 0,
    genomeNodes: [],
    species: SPECIES.map((_, i) => newSpecies(i === 0)),
    mutations: [],
    health: 1,
    healthRecoverRate: 0,
    activeEvent: null,
    nextEventIn: 0,
    tempEffects: [],
    threat: null,
    traitLevels: {},
    meta,
    objectiveIndex: 0,
    revealed: [],
    log: [{ t: 0, text: SPECIES[0].birthText, kind: 'story' }],
    ending: null,
    stats: { totalBiomass: 0, eventsSeen: 0, eventsResolved: 0, biomassLost: 0 },
    settings: { buyMode: 1 },
  }
}

// Shallow copy of everything a tick or purchase may change in place.
// Arrays that only grow (log, mutations, genomeNodes, revealed, traitsBought)
// are replaced, never pushed, so untouched ones keep their identity.
export function draft(s: GameState): GameState {
  return {
    ...s,
    species: s.species.map(sp => ({
      ...sp,
      producers: sp.producers.map(p => ({ ...p })) as SpeciesState['producers'],
    })),
    tempEffects: s.tempEffects.map(e => ({ ...e })),
    activeEvent: s.activeEvent && { ...s.activeEvent },
    threat: s.threat && { ...s.threat },
    stats: { ...s.stats },
  }
}

export function addLog(s: GameState, text: string, kind: LogEntry['kind']) {
  s.log = [{ t: s.playTime, text, kind }, ...s.log].slice(0, LOG_MAX)
}

export function reveal(s: GameState, key: string) {
  if (!s.revealed.includes(key)) s.revealed = [...s.revealed, key]
}

export const isLiving = (sp: SpeciesState) => sp.status === 'active' || sp.status === 'declining'
export const isBorn = (sp: SpeciesState) => sp.status !== 'locked'

export const activeIndex = (s: GameState) => s.species.findIndex(sp => sp.status === 'active')

export function newestBorn(s: GameState): number {
  for (let i = s.species.length - 1; i >= 0; i--) if (isBorn(s.species[i])) return i
  return 0
}
