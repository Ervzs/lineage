import { ABSORB_AMOUNT } from '../data/constants'
import { SPECIES } from '../data/species'
import { buyCount, producerCost } from './costs'
import { buyTrait, canBuyTrait, canLevelTrait, levelTrait } from './evolution'
import { resolveEvent } from './events'
import { buyNode, canBuyNode } from './genome'
import { computeMods } from './modifiers'
import { stepObjectives, stepReveals } from './objectives'
import { buyUpgrade, canBuyUpgrade, rebirth } from './rebirth'
import { importSave } from './save'
import { draft, initialState } from './state'
import { tick } from './tick'
import type { Action, GameState } from './types'

// Runs a change on a draft so the incoming state is never mutated.
function edit(state: GameState, fn: (s: GameState) => void): GameState {
  const s = draft(state)
  fn(s)
  stepObjectives(s)
  stepReveals(s)
  return s
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TICK':
      return tick(state, action.dt)

    case 'ABSORB':
      if (state.species[0].status !== 'active' || state.ending) return state
      return edit(state, s => {
        s.biomass += ABSORB_AMOUNT
        s.stats.totalBiomass += ABSORB_AMOUNT
      })

    case 'BUY_PRODUCER': {
      const sp = state.species[action.species]
      if (!sp || sp.status !== 'active' || state.ending) return state
      const def = SPECIES[action.species].producers[action.tier]
      const n = buyCount(def, sp.producers[action.tier].bought, state.biomass, state.settings.buyMode)
      if (n <= 0) return state
      return edit(state, s => {
        const q = s.species[action.species].producers[action.tier]
        s.biomass -= producerCost(def, q.bought, n)
        q.bought += n
        q.amount += n
      })
    }

    case 'BUY_TRAIT':
      if (!canBuyTrait(state, action.traitId)) return state
      return edit(state, s => buyTrait(s, action.traitId))

    case 'LEVEL_TRAIT':
      if (!canLevelTrait(state, action.traitId)) return state
      return edit(state, s => levelTrait(s, action.traitId))

    case 'BUY_FOSSIL_UPGRADE':
      return canBuyUpgrade(state, action.id) ? buyUpgrade(state, action.id) : state

    case 'REBIRTH':
      return state.ending ? rebirth(state) : state

    case 'BUY_GENOME_NODE':
      if (state.ending || !canBuyNode(state, action.nodeId)) return state
      return edit(state, s => buyNode(s, action.nodeId))

    case 'RESOLVE_EVENT':
      if (!state.activeEvent) return state
      return edit(state, s => resolveEvent(s, computeMods(s), action.optionId, true))

    case 'SET_BUY_MODE':
      return { ...state, settings: { ...state.settings, buyMode: action.mode } }

    case 'IMPORT_SAVE':
      return importSave(action.data) ?? state

    case 'HARD_RESET':
      return initialState()
  }
}
