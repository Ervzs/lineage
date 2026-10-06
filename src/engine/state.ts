import { LOG_MAX, SAVE_VERSION } from '../data/constants'
import { STAGES, resBase, startPop } from '../data/stages'
import type { GameState, LogEntry } from './types'

export function initialState(seed = (Date.now() % 2147483647) | 0, best = 1): GameState {
  const s: GameState = {
    version: SAVE_VERSION,
    seed,
    rngState: seed,
    playTime: 0,
    stage: 0,
    stageTime: 0,
    pop: 0,
    peakPop: 0,
    wild: {},
    store: {},
    owned: [],
    disaster: null,
    effects: [],
    nextLineIn: 0,
    nextEventIn: 0,
    recent: [],
    flags: [],
    history: [],
    log: [],
    ending: null,
    best,
  }
  enterStage(s, 0)
  return s
}

// Fresh land, a small founding population, and the stage told in the log.
export function enterStage(s: GameState, k: number) {
  const st = STAGES[k]
  s.stage = k
  s.stageTime = 0
  s.pop = startPop(k)
  s.peakPop = s.pop
  s.wild = Object.fromEntries(st.resources.map(r => [r.id, resBase(k, r).cap]))
  s.store = Object.fromEntries(st.resources.map(r => [r.id, 0]))
  s.disaster = null
  s.effects = []
  s.flags = []
  s.recent = []
  s.nextLineIn = 15
  s.nextEventIn = 100
  s.best = Math.max(s.best, k + 1)
  addLog(s, `Stage ${k + 1} of ${STAGES.length}: ${st.name}. ${st.about}`, 'event')
  addLog(s, `You are: ${st.youAre}`, 'story')
}

// Shallow copy of everything a tick or purchase may change in place.
// Records (wild, store) and arrays are replaced, never mutated.
export function draft(s: GameState): GameState {
  return {
    ...s,
    disaster: s.disaster && { ...s.disaster },
    effects: s.effects.map(e => ({ ...e })),
  }
}

export function addLog(s: GameState, text: string, kind: LogEntry['kind']) {
  s.log = [{ t: s.playTime, text, kind }, ...s.log].slice(0, LOG_MAX)
}

export const addFlag = (s: GameState, f: string) => { s.flags = [...s.flags, f] }
