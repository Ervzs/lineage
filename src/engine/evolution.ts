import { EVENT_GAPS, EVO_NEEDED } from '../data/constants'
import { SPECIES } from '../data/species'
import { TRAIT_BY_ID } from '../data/traits'
import { traitCost } from './costs'
import { computeMods } from './modifiers'
import { giftCheck } from './mutations'
import { startReckoning } from './reckoning'
import { nextRandom } from './rng'
import { addLog, isBorn } from './state'
import type { GameState } from './types'

export const meter = (evoPoints: number) => Math.min(1, evoPoints / EVO_NEEDED)

export function traitOwned(s: GameState, id: string) {
  const t = TRAIT_BY_ID[id]
  return s.species[t.species].traitsBought.includes(id)
}

export function traitUnlocked(s: GameState, id: string) {
  const t = TRAIT_BY_ID[id]
  return t.requires.every(r => traitOwned(s, r)) &&
    (t.requiresAny.length === 0 || t.requiresAny.some(r => traitOwned(s, r)))
}

export function canBuyTrait(s: GameState, id: string) {
  const t = TRAIT_BY_ID[id]
  return !!t && !s.ending && isBorn(s.species[t.species]) && !traitOwned(s, id) &&
    traitUnlocked(s, id) && s.biomass >= traitCost(s, t)
}

export function buyTrait(s: GameState, id: string) {
  const t = TRAIT_BY_ID[id]
  const sp = s.species[t.species]
  s.biomass -= traitCost(s, t)
  sp.traitsBought = [...sp.traitsBought, id]
  sp.evoPoints += t.evoPoints
  giftCheck(s, computeMods(s), id)
  checkBirth(s)
}

export const randomGap = (s: GameState, speciesNumber: number) => {
  const [min, max] = EVENT_GAPS[speciesNumber]
  return min + nextRandom(s) * (max - min)
}

// At 100% the next species is born and the current one starts to decline.
export function checkBirth(s: GameState) {
  const k = s.species.findIndex(sp => sp.status === 'active')
  if (k < 0 || meter(s.species[k].evoPoints) < 1) return
  if (k === SPECIES.length - 1) {
    if (!s.reckoning) startReckoning(s)
    return
  }
  s.species[k].status = 'declining'
  s.species[k].vitality = 1
  s.species[k].declineElapsed = 0
  s.species[k + 1].status = 'active'
  addLog(s, SPECIES[k + 1].birthText, 'story')
  if (k + 1 === 1) s.nextEventIn = randomGap(s, 2)
}
