import { STAGES, adaptCost } from '../data/stages'
import { canBuy, canGather, canSpark, gather, spark } from './ecology'
import { importSave } from './save'
import { addFlag, addLog, draft, initialState } from './state'
import { tick } from './tick'
import type { Action, GameState } from './types'

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TICK':
      return tick(state, action.dt)

    case 'GATHER': {
      if (!canGather(state)) return state
      const s = draft(state)
      gather(s)
      if (!s.flags.includes('gathered')) {
        addFlag(s, 'gathered')
        addLog(s, 'You scoop up minerals and heat from around the vents. Gather enough of both and the chemicals may come together into something new.', 'story')
      }
      return s
    }

    case 'SPARK': {
      if (!canSpark(state)) return state
      const s = draft(state)
      spark(s)
      addLog(s, STAGES[s.stage].spark!.story, 'event')
      return s
    }

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
