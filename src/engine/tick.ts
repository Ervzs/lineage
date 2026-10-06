import { checkEvolve, stepDisaster } from './disaster'
import { stepEcology } from './ecology'
import { draft } from './state'
import { stepStory } from './story'
import type { GameState } from './types'

function step(s: GameState, dt: number) {
  s.playTime += dt
  s.stageTime += dt
  stepEcology(s, dt)
  stepStory(s, dt)
  stepDisaster(s, dt)
  checkEvolve(s)
}

// Large dt (a throttled background tab) runs in steps of at most 1 s.
export function tick(state: GameState, dt: number): GameState {
  if (state.ending || !(dt > 0)) return state
  const s = draft(state)
  let left = dt
  while (left > 0 && !s.ending) {
    const d = Math.min(1, left)
    step(s, d)
    left -= d
  }
  return s
}
