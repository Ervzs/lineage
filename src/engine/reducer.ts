import { STAGES, adaptCost, adaptMinPop } from '../data/stages'
import { importSave } from './save'
import { addLog, draft, initialState } from './state'
import { tick } from './tick'
import type { Action, GameState } from './types'

export function canBuy(s: GameState, id: string): boolean {
  const a = STAGES[s.stage].adaptations.find(x => x.id === id)
  if (!a || s.ending || s.owned.includes(id) || s.pop < adaptMinPop(s.stage, a)) return false
  return Object.entries(adaptCost(s.stage, a)).every(([r, n]) => (s.store[r] ?? 0) >= n)
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TICK':
      return tick(state, action.dt)

    case 'BUY_ADAPTATION': {
      if (!canBuy(state, action.id)) return state
      const s = draft(state)
      const a = STAGES[s.stage].adaptations.find(x => x.id === action.id)!
      const cost = adaptCost(s.stage, a)
      s.store = Object.fromEntries(Object.entries(s.store).map(([r, n]) => [r, n - (cost[r] ?? 0)]))
      s.owned = [...s.owned, a.id]
      addLog(s, a.story, 'story')
      return s
    }

    case 'NEW_RUN':
      return initialState(undefined, state.best)

    case 'IMPORT_SAVE':
      return importSave(action.data) ?? state

    case 'HARD_RESET':
      return initialState()
  }
}
