import { CLUE_AT, STAGE_PACE, SURVIVE_LOSS } from '../data/constants'
import { STAGES } from '../data/stages'
import { addLog, enterStage } from './state'
import type { GameState } from './types'

export const keySteps = (k: number) => STAGES[k].adaptations.filter(a => a.role === 'key')
export const keysOwned = (s: GameState) => keySteps(s.stage).filter(a => s.owned.includes(a.id)).length

// Starts quietly once half the evolution steps are owned. The log is the only warning.
export function stepDisaster(s: GameState, dt: number) {
  const st = STAGES[s.stage]
  if (!s.disaster) {
    if (keysOwned(s) >= Math.ceil(keySteps(s.stage).length / 2)) s.disaster = { elapsed: 0, clues: 0, struck: false }
    return
  }
  const d = s.disaster
  if (d.struck) return
  d.elapsed += dt
  const total = st.disaster.seconds * STAGE_PACE[s.stage]
  while (d.clues < CLUE_AT.length && d.elapsed >= CLUE_AT[d.clues] * total) {
    addLog(s, st.disaster.clues[d.clues], 'story')
    d.clues++
    s.nextLineIn = Math.max(s.nextLineIn, 15)
  }
  if (d.elapsed < total) return
  d.struck = true
  addLog(s, st.disaster.strike, 'event')
  const safe = st.adaptations.filter(a => a.role === 'protect').every(a => s.owned.includes(a.id))
  if (!safe) {
    addLog(s, st.disaster.fail, 'event')
    s.ending = 'extinct'
    return
  }
  addLog(s, st.disaster.survive, 'story')
  s.pop *= 1 - SURVIVE_LOSS
  s.wild = Object.fromEntries(Object.entries(s.wild).map(([r, n]) => [r, n * 0.5]))
}

// Disaster survived and every evolution step owned: on to the next stage.
export function checkEvolve(s: GameState) {
  if (s.ending || !s.disaster?.struck || keysOwned(s) < keySteps(s.stage).length) return
  const st = STAGES[s.stage]
  s.history = [...s.history, { stage: s.stage, peak: s.peakPop, seconds: s.stageTime }]
  addLog(s, st.evolveText, 'event')
  if (s.stage === STAGES.length - 1) s.ending = 'survived'
  else enterStage(s, s.stage + 1)
}
