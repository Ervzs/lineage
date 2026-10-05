export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type Branch = 'growth' | 'survival' | 'cunning'
export type SpeciesStatus = 'locked' | 'active' | 'declining' | 'extinct'
export type MutationType = 'production' | 'chain' | 'defense' | 'luck'
export type BuyMode = 1 | 10 | 'max'
export type Resist = 'immunity' | 'toughness' | 'endurance'

export type EffectTarget =
  | 'tier1.output' | 'tier2.output' | 'tier3.output'
  | 'resist.immunity' | 'resist.toughness' | 'resist.endurance'
  | 'event.lossMult'
  | 'luck.points'
  | 'event.riskSuccess'
  | 'gift.chance'

export interface Effect { target: EffectTarget; op: 'mul' | 'add'; value: number }

export interface ProducerDef {
  name: string
  baseCost: number
  growth: number
  baseRate: number
}

export interface SpeciesDef {
  index: number
  id: string
  name: string
  era: string
  producers: [ProducerDef, ProducerDef, ProducerDef]
  anchor: number
  unitScale: number
  declineSeconds: number
  defenseUnit: number
  birthText: string
  extinctText: string
}

export interface TraitDef {
  id: string
  species: number
  branch: Branch
  tier: 1 | 2 | 3
  name: string
  flavor: string
  cost: number
  evoPoints: number
  requires: string[]       // all of these
  requiresAny: string[]    // at least one of these (tier 3 cross link)
  effects: Effect[]
}

export interface GenomeNodeDef {
  id: string; name: string; cost: number; resist: Partial<Record<Resist, number>>; requires: string[]; flavor: string
}

export interface MutationInstance {
  id: string
  type: MutationType
  rarity: Rarity
  value: number
  traitId: string
  species?: number
  resist?: Resist             // defense type only
}

export interface Outcome {
  chance: number
  biomassLossPct?: number
  biomassGainSeconds?: number
  productionMult?: number
  durationSeconds?: number
  populationLossPct?: number
  recoverSeconds?: number
  text: string
}

export interface EventOption {
  id: string
  label: string
  outcomes: Outcome[]
}

export interface EventDef {
  id: string
  name: string
  kind: 'boost' | 'loss'
  minSpecies: number       // 1-based species number
  weight: number
  options: EventOption[]
  defaultOptionId: string
  flavor: string
}

export interface ThreatDef { id: string; name: string; text: string; checks: Resist[] }

export interface EraThreatDef { species: number; id: string; name: string; text: string; failText: string; checks: Resist[] }

export type ObjectiveCheck =
  | { kind: 'biomass'; n: number }
  | { kind: 'bought'; tier: 0 | 1 | 2; n: number }
  | { kind: 'traits'; n: number }
  | { kind: 'born' }

export interface ObjectiveDef { species: number; text: string; check: ObjectiveCheck }

export interface ActiveEvent { id: string; remaining: number }

export interface ProducerState { bought: number; amount: number }

export interface SpeciesState {
  status: SpeciesStatus
  producers: [ProducerState, ProducerState, ProducerState]
  traitsBought: string[]
  evoPoints: number
  vitality: number
  declineElapsed: number
  peakPopulation: number
  genomePaid: boolean
}

export interface LogEntry { t: number; text: string; kind: 'story' | 'event' | 'system' }

// An era Threat (end of species 1-7) or the final Reckoning (species 8).
export interface Threat {
  kind: 'era' | 'final'
  id: string
  species: number
  countdown: number
  requirements: Partial<Record<Resist, number>>
  resolved: boolean
}

export interface Meta {
  epoch: number
  fossils: number
  fossilsEarned: number
  bestEpoch: number           // highest Epoch survived (0 = none)
  upgrades: Record<string, number>
}

export interface GameState {
  version: number
  seed: number
  rngState: number
  playTime: number
  biomass: number
  genome: number
  genomeEarned: number
  genomeNodes: string[]
  species: SpeciesState[]
  mutations: MutationInstance[]
  health: number
  healthRecoverRate: number
  activeEvent: ActiveEvent | null
  nextEventIn: number
  tempEffects: { id: string; productionMult: number; remaining: number }[]
  threat: Threat | null
  traitLevels: Record<string, number>
  meta: Meta
  objectiveIndex: number
  revealed: string[]
  log: LogEntry[]          // newest first
  ending: null | 'survived' | 'extinct'
  stats: { totalBiomass: number; eventsSeen: number; eventsResolved: number; biomassLost: number }
  settings: { buyMode: BuyMode }
}

export type Action =
  | { type: 'TICK'; dt: number }
  | { type: 'ABSORB' }
  | { type: 'BUY_PRODUCER'; species: number; tier: 0 | 1 | 2 }
  | { type: 'BUY_TRAIT'; traitId: string }
  | { type: 'LEVEL_TRAIT'; traitId: string }
  | { type: 'BUY_FOSSIL_UPGRADE'; id: string }
  | { type: 'REBIRTH' }
  | { type: 'BUY_GENOME_NODE'; nodeId: string }
  | { type: 'RESOLVE_EVENT'; optionId: string }
  | { type: 'SET_BUY_MODE'; mode: BuyMode }
  | { type: 'IMPORT_SAVE'; data: string }
  | { type: 'HARD_RESET' }
