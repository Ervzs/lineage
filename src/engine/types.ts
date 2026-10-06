// ---------- stage data ----------

// Conditions an ambient log line can wait for.
export type Cond = 'growing' | 'shrinking' | 'hungry' | 'plenty' | 'lowWild'

export interface ResourceDef {
  id: string
  name: string
  food: boolean            // eaten by the population; otherwise a material that is only stored
  size?: number            // relative amount in the wild (default 1)
}

export type AdaptEffect =
  | { kind: 'land'; res: string; mul: number }   // more of this resource in the wild
  | { kind: 'need'; res: string; mul: number }   // each individual needs less of it
  | { kind: 'birth'; mul: number }
  | { kind: 'death'; mul: number }
  | { kind: 'share'; add: number }               // more of what is gathered is saved

export interface AdaptationDef {
  id: string
  name: string
  role: 'key' | 'protect' | 'help'
  blurb: string            // what it is in real life
  story: string            // log line when bought
  cost: Record<string, number>
  minPop?: number
  effects: AdaptEffect[]
}

export interface AmbientLine { text: string; when?: Cond; has?: string }

export interface LifeEventDef {
  text: string
  label: string            // short name shown in "why population is changing"
  seconds?: number
  birth?: number
  death?: number
  land?: number
  popLoss?: number         // fraction lost at once
  landGain?: number        // fraction of each wild cap added at once
}

export interface DisasterDef {
  clues: [string, string, string, string]
  strike: string
  survive: string
  fail: string
  seconds: number
}

export interface StageDef {
  index: number
  name: string
  youAre: string
  unit: string             // plural noun for the population: cells, fish, people
  about: string            // what is happening, in plain words
  evolveText: string       // logged when moving to the next stage
  resources: ResourceDef[]
  adaptations: AdaptationDef[]
  disaster: DisasterDef
  ambient: AmbientLine[]
  events: LifeEventDef[]
}

// ---------- game state ----------

export interface LogEntry { t: number; text: string; kind: 'story' | 'event' | 'system' }

export interface ActiveEffect { label: string; birth: number; death: number; land: number; remaining: number }

export interface StageRecord { stage: number; peak: number; seconds: number }

export interface Disaster { elapsed: number; clues: number; struck: boolean }

export interface GameState {
  version: number
  seed: number
  rngState: number
  playTime: number
  stage: number
  stageTime: number
  pop: number
  peakPop: number
  wild: Record<string, number>
  store: Record<string, number>
  owned: string[]
  disaster: Disaster | null
  effects: ActiveEffect[]
  nextLineIn: number
  nextEventIn: number
  recent: string[]
  flags: string[]
  history: StageRecord[]
  log: LogEntry[]          // newest first
  ending: null | 'survived' | 'extinct'
  best: number             // furthest stage reached in any run (1-based)
}

export type Action =
  | { type: 'TICK'; dt: number }
  | { type: 'BUY_ADAPTATION'; id: string }
  | { type: 'NEW_RUN' }
  | { type: 'IMPORT_SAVE'; data: string }
  | { type: 'HARD_RESET' }
