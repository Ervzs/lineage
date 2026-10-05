import { createContext, useContext, useEffect, useReducer, useRef, type Dispatch, type ReactNode } from 'react'
import { AUTOSAVE_MS, TICK_MS } from '../data/constants'
import { gameReducer } from '../engine/reducer'
import { clearLocal, loadLocal, saveLocal } from '../engine/save'
import { initialState } from '../engine/state'
import type { Action, GameState } from '../engine/types'

const GameStateContext = createContext<GameState | null>(null)
const GameDispatchContext = createContext<Dispatch<Action> | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => loadLocal() ?? initialState())
  const latest = useRef(state)
  latest.current = state

  // 100 ms loop. dt comes from Date.now(), so a throttled background tab
  // receives the whole elapsed time on its next tick.
  useEffect(() => {
    let last = Date.now()
    const id = setInterval(() => {
      const now = Date.now()
      dispatch({ type: 'TICK', dt: (now - last) / 1000 })
      last = now
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  // Autosave every 10 s and when the tab is hidden.
  useEffect(() => {
    const save = () => saveLocal(latest.current)
    const id = setInterval(save, AUTOSAVE_MS)
    const onVis = () => { if (document.visibilityState === 'hidden') save() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <GameDispatchContext.Provider value={dispatch}>
      <GameStateContext.Provider value={state}>{children}</GameStateContext.Provider>
    </GameDispatchContext.Provider>
  )
}

export function useGameState() {
  const s = useContext(GameStateContext)
  if (!s) throw new Error('useGameState outside GameProvider')
  return s
}

export function useGameDispatch() {
  const d = useContext(GameDispatchContext)
  if (!d) throw new Error('useGameDispatch outside GameProvider')
  return d
}

export function hardReset(dispatch: Dispatch<Action>) {
  clearLocal()
  dispatch({ type: 'HARD_RESET' })
}

export const saveNow = (s: GameState) => saveLocal(s)
