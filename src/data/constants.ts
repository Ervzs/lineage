// All tuning knobs. `npm run balance` checks them.

export const SAVE_KEY = 'lineage-save-v2'
export const SAVE_VERSION = 3
export const TICK_MS = 100
export const AUTOSAVE_MS = 10_000
export const LOG_MAX = 200

// Ecology, per individual per second, before the stage scale.
export const BASE_REGEN = 10        // wild regrowth per second when the land is empty
export const CAP_SECONDS = 200      // wild cap = regen x this
export const MAT_REGEN = 4          // materials (stone, shells) regrow slower
export const GATHER = 0.25
export const MAT_GATHER = 0.05
export const NEED = 0.1
export const STORE_SHARE = 0.25     // part of gathered food saved before eating
export const BIRTH = 0.04
export const DEATH = 0.01
export const STARVE = 0.05
export const START_POP = 10
export const MIN_POP = 2

// Per stage: size of all numbers (cosmetic) and how slow the stage is (costs x pace).
export const STAGE_SCALE = [100, 1000, 50, 20, 10, 10, 20, 30, 10]
export const STAGE_PACE = [1.25, 0.97, 1.14, 1.93, 1.67, 2, 2.24, 3.2, 3.5]

// Story pacing (seconds).
export const LINE_GAP: [number, number] = [20, 45]
export const EVENT_GAP: [number, number] = [120, 240]
export const RECENT_MAX = 14
export const CLUE_AT = [0, 0.35, 0.65, 0.88]   // fraction of the disaster timer
export const SURVIVE_LOSS = 0.3
export const POP_MILESTONES = [2, 3, 4, 5, 6, 7].flatMap(p => [1, 2.5, 5].map(m => m * 10 ** p))
