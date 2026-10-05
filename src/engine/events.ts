import { EVENT_WINDOW, HEALTH_FLOOR, MAX_BIOMASS_LOSS_PCT, MAX_HEALTH_DROP_PCT } from '../data/constants'
import { EVENT_BY_ID, EVENTS } from '../data/events'
import { randomGap } from './evolution'
import type { Mods } from './modifiers'
import { totalIncome } from './production'
import { pickWeighted } from './rng'
import { addLog, newestBorn } from './state'
import type { EventOption, GameState, Outcome } from './types'

// Outcome chances after the Cunning risk bonus: the first outcome is the success.
export function adjustedOutcomes(option: EventOption, riskBonus: number): Outcome[] {
  if (option.outcomes.length < 2) return option.outcomes
  const shift = Math.min(riskBonus / 100, option.outcomes[option.outcomes.length - 1].chance)
  return option.outcomes.map((o, i) => ({
    ...o,
    chance: i === 0 ? o.chance + shift : i === option.outcomes.length - 1 ? o.chance - shift : o.chance,
  }))
}

// Loss amounts after Survival Traits and caps.
export const biomassLossPct = (o: Outcome, m: Mods) => Math.min(MAX_BIOMASS_LOSS_PCT, (o.biomassLossPct ?? 0) * m.lossMult)
export const populationLossPct = (o: Outcome, m: Mods) => Math.min(MAX_HEALTH_DROP_PCT, (o.populationLossPct ?? 0) * m.lossMult)

export function stepEvents(s: GameState, m: Mods, dt: number) {
  // Health recovers linearly to 1.
  if (s.health < 1) s.health = Math.min(1, s.health + s.healthRecoverRate * dt)

  // Boost durations.
  if (s.tempEffects.length) {
    for (const e of s.tempEffects) e.remaining -= dt
    s.tempEffects = s.tempEffects.filter(e => e.remaining > 0)
  }

  if (s.reckoning?.resolved) return
  const newest = newestBorn(s)
  if (newest < 1) return

  if (s.activeEvent) {
    s.activeEvent.remaining -= dt
    if (s.activeEvent.remaining <= 0) resolveEvent(s, m, EVENT_BY_ID[s.activeEvent.id].defaultOptionId, false)
    return
  }

  s.nextEventIn -= dt
  if (s.nextEventIn > 0) return
  const pool = EVENTS.filter(e => e.minSpecies <= newest + 1)
  const def = pickWeighted(s, pool, e => e.weight)
  s.activeEvent = { id: def.id, remaining: EVENT_WINDOW }
  s.stats.eventsSeen++
}

export function resolveEvent(s: GameState, m: Mods, optionId: string, answered: boolean) {
  if (!s.activeEvent) return
  const def = EVENT_BY_ID[s.activeEvent.id]
  const option = def.options.find(o => o.id === optionId)
  if (!option) return
  const outcomes = adjustedOutcomes(option, m.riskBonus)
  const o = pickWeighted(s, outcomes, x => x.chance)

  const parts: string[] = []
  if (o.biomassLossPct) {
    const pct = biomassLossPct(o, m)
    const loss = s.biomass * pct / 100
    s.biomass -= loss
    s.stats.biomassLost += loss
    parts.push(`-${Math.round(pct * 10) / 10}% biomass`)
  }
  if (o.populationLossPct) {
    const pct = populationLossPct(o, m)
    s.health = Math.max(HEALTH_FLOOR, s.health * (1 - pct / 100))
    s.healthRecoverRate = (1 - s.health) / (o.recoverSeconds ?? 120)
    parts.push(`-${Math.round(pct * 10) / 10}% population`)
  }
  if (o.biomassGainSeconds) s.biomass += totalIncome(s, m) * o.biomassGainSeconds
  if (o.productionMult && o.durationSeconds) {
    s.tempEffects = [...s.tempEffects, { id: def.id, productionMult: o.productionMult, remaining: o.durationSeconds }]
  }

  const how = answered ? '' : ' (auto)'
  addLog(s, `${def.name}${how}: ${o.text}${parts.length ? ` ${parts.join(', ')}.` : ''}`, 'event')
  if (answered) s.stats.eventsResolved++
  s.activeEvent = null
  s.nextEventIn = randomGap(s, newestBorn(s) + 1)
}
