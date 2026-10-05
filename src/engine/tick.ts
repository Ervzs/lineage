import { checkExtinctions, rescueIfStuck, stepDecline } from './decline'
import { stepEvents } from './events'
import { checkBirth } from './evolution'
import { computeMods } from './modifiers'
import { stepObjectives, stepReveals } from './objectives'
import { updatePeaks } from './population'
import { stepProduction } from './production'
import { checkExtinctEnding, stepThreat } from './reckoning'
import { draft } from './state'
import type { GameState } from './types'

function step(s: GameState, dt: number) {
  s.playTime += dt
  stepEvents(s, computeMods(s), dt)          // 1. event timers
  stepDecline(s, dt)                          // 2. Decline
  stepProduction(s, computeMods(s), dt)       // 3. production chain
  updatePeaks(s)                              // 4. peak Population
  checkExtinctions(s)                         // 5. extinction and Genome
  rescueIfStuck(s)
  checkBirth(s)                               // 6. birth
  stepThreat(s, computeMods(s), dt)           // 7. era Threat or Reckoning
  checkExtinctEnding(s)
  stepObjectives(s)                           // 8. objectives
  stepReveals(s)
}

// Large dt (a throttled background tab) runs in substeps of max(1 s, dt / 3600).
export function tick(state: GameState, dt: number): GameState {
  if (state.ending || !(dt > 0)) return state
  const s = draft(state)
  const size = Math.max(1, dt / 3600)
  let left = dt
  while (left > 0 && !s.ending) {
    const d = Math.min(size, left)
    step(s, d)
    left -= d
  }
  return s
}
