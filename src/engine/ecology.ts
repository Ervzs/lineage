import { BIRTH, DEATH, GATHER_AMOUNT, MIN_POP, SPARK_COST, STAGE_SCALE, STARVE, STORE_SHARE } from '../data/constants'
import { STAGES, adaptCost, adaptMinPop, resBase, startPop } from '../data/stages'
import type { Cond, GameState, ResourceDef } from './types'

export interface Mods {
  land: Record<string, number>
  need: Record<string, number>
  birth: number
  death: number
  share: number
}

// Adaptations of the current stage and running life events.
export function computeMods(s: GameState): Mods {
  const st = STAGES[s.stage]
  const m: Mods = { land: {}, need: {}, birth: 1, death: 1, share: STORE_SHARE }
  for (const r of st.resources) { m.land[r.id] = 1; m.need[r.id] = 1 }
  for (const a of st.adaptations) {
    if (!s.owned.includes(a.id)) continue
    for (const e of a.effects) {
      if (e.kind === 'land') m.land[e.res] *= e.mul
      else if (e.kind === 'need') m.need[e.res] *= e.mul
      else if (e.kind === 'birth') m.birth *= e.mul
      else if (e.kind === 'death') m.death *= e.mul
      else m.share += e.add
    }
  }
  for (const e of s.effects) {
    m.birth *= e.birth
    m.death *= e.death
    for (const r of st.resources) m.land[r.id] *= e.land
  }
  return m
}

export interface ResFlow {
  def: ResourceDef
  cap: number
  wild: number
  grown: number
  gathered: number
  eaten: number
  stored: number
  enough: number     // 0..1, food only
}

export interface Flows {
  res: ResFlow[]
  fed: number
  limiting: string   // name of the scarcest food
  births: number
  natural: number
  hunger: number
}

// Everything that happens over dt, without changing the state.
export function flows(s: GameState, m: Mods, dt: number): Flows {
  const k = s.stage
  let fed = 1
  let limiting = ''
  const res = STAGES[k].resources.map(def => {
    const b = resBase(k, def)
    const cap = b.cap * m.land[def.id]
    const wild = Math.min(s.wild[def.id] ?? 0, cap)
    const grown = Math.min(cap - wild, b.regen * m.land[def.id] * (1 - wild / cap) * dt)
    const gathered = Math.min(s.pop * b.gather * dt, wild + grown)
    let eaten = 0
    let enough = 1
    if (def.food) {
      const needed = s.pop * b.need * m.need[def.id] * dt
      eaten = Math.min(gathered * (1 - m.share), needed)
      enough = needed > 0 ? eaten / needed : 1
      if (enough < fed) { fed = enough; limiting = def.name }
    }
    return { def, cap, wild, grown, gathered, eaten, stored: gathered - eaten, enough }
  })
  return {
    res,
    fed,
    limiting,
    births: s.pop * BIRTH * m.birth * fed * fed * dt,
    natural: s.pop * DEATH * m.death * dt,
    hunger: s.pop * STARVE * (1 - fed) * dt,
  }
}

export function stepEcology(s: GameState, dt: number) {
  const f = flows(s, computeMods(s), dt)
  for (const r of f.res) {
    s.wild = { ...s.wild, [r.def.id]: r.wild + r.grown - r.gathered }
    s.store = { ...s.store, [r.def.id]: (s.store[r.def.id] ?? 0) + r.stored }
  }
  if (s.pop === 0) return   // no life yet: only the wild regrows
  s.pop = Math.max(MIN_POP, s.pop + f.births - f.natural - f.hunger)
  s.peakPop = Math.max(s.peakPop, s.pop)
}

// Per-second view for the UI and the story conditions.
export const perSecond = (s: GameState) => flows(s, computeMods(s), 1)

export function conditions(s: GameState, f: Flows = perSecond(s)): Set<Cond> {
  const c = new Set<Cond>()
  const deaths = f.natural + f.hunger
  if (f.births > deaths * 1.05) c.add('growing')
  if (deaths > f.births * 1.05) c.add('shrinking')
  if (f.fed < 0.85) c.add('hungry')
  if (f.fed > 0.999 && f.res.every(r => r.wild > r.cap * 0.5)) c.add('plenty')
  if (f.res.some(r => r.wild < r.cap * 0.15)) c.add('lowWild')
  return c
}

export function canBuy(s: GameState, id: string): boolean {
  const a = STAGES[s.stage].adaptations.find(x => x.id === id)
  if (!a || s.ending || s.pop === 0 || s.owned.includes(id) || s.pop < adaptMinPop(s.stage, a)) return false
  return Object.entries(adaptCost(s.stage, a)).every(([r, n]) => (s.store[r] ?? 0) >= n)
}

// ---------- stage 1 opening: gather by hand, then spark life ----------

export const canGather = (s: GameState) => !!STAGES[s.stage].spark && !s.ending
export const sparkCost = (k: number) => SPARK_COST * STAGE_SCALE[k]
export const canSpark = (s: GameState) =>
  canGather(s) && s.pop === 0 && STAGES[s.stage].resources.every(r => (s.store[r.id] ?? 0) >= sparkCost(s.stage))

// Each click takes a little of every resource from the wild.
export function gather(s: GameState) {
  for (const r of STAGES[s.stage].resources) {
    const n = Math.min(GATHER_AMOUNT * STAGE_SCALE[s.stage], s.wild[r.id] ?? 0)
    s.wild = { ...s.wild, [r.id]: s.wild[r.id] - n }
    s.store = { ...s.store, [r.id]: (s.store[r.id] ?? 0) + n }
  }
}

export function spark(s: GameState) {
  const cost = sparkCost(s.stage)
  s.store = Object.fromEntries(Object.entries(s.store).map(([r, n]) => [r, n - cost]))
  s.pop = startPop(s.stage)
  s.peakPop = s.pop
  s.nextLineIn = 12
}
