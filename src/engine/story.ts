import { EVENT_GAP, LINE_GAP, POP_MILESTONES, RECENT_MAX } from '../data/constants'
import { STAGES, startPop } from '../data/stages'
import { conditions, perSecond } from './ecology'
import { fmtInt } from './format'
import { nextRandom, pickWeighted } from './rng'
import { addFlag, addLog } from './state'
import type { GameState } from './types'

const between = (s: GameState, [a, b]: [number, number]) => a + nextRandom(s) * (b - a)

function remember(s: GameState, id: string) {
  s.recent = [id, ...s.recent].slice(0, RECENT_MAX)
}

export function fill(s: GameState, text: string) {
  return text.replace('{n}', fmtInt(s.pop)).replace('{unit}', STAGES[s.stage].unit)
}

// An ambient line that fits what is happening right now.
function ambient(s: GameState) {
  const st = STAGES[s.stage]
  const c = conditions(s)
  const fits = st.ambient
    .map((line, i) => ({ line, id: `a${s.stage}:${i}` }))
    .filter(({ line }) => (!line.when || c.has(line.when)) && (!line.has || s.owned.includes(line.has)))
  if (!fits.length) return
  // Skip recent lines; if every fitting line is recent, repeat the oldest one.
  const fresh = fits.filter(p => !s.recent.includes(p.id))
  const pool = fresh.length ? fresh : [fits.reduce((a, b) => (s.recent.indexOf(b.id) > s.recent.indexOf(a.id) ? b : a))]
  // Lines about the current situation or a new ability are more likely.
  const pick = pickWeighted(s, pool, p => (p.line.when ? 3 : p.line.has ? 2 : 1))
  remember(s, pick.id)
  addLog(s, fill(s, pick.line.text), 'story')
}

function lifeEvent(s: GameState) {
  const st = STAGES[s.stage]
  const pool = st.events.map((ev, i) => ({ ev, id: `e${s.stage}:${i}` })).filter(p => !s.recent.includes(p.id))
  if (!pool.length) return
  const { ev, id } = pool[Math.floor(nextRandom(s) * pool.length)]
  remember(s, id)
  if (ev.popLoss) s.pop *= 1 - ev.popLoss
  if (ev.landGain) {
    const f = perSecond(s)
    s.wild = Object.fromEntries(f.res.map(r => [r.def.id, Math.min(r.cap, r.wild + r.cap * ev.landGain!)]))
  }
  if (ev.seconds) {
    s.effects = [...s.effects, { label: ev.label, birth: ev.birth ?? 1, death: ev.death ?? 1, land: ev.land ?? 1, remaining: ev.seconds }]
  }
  addLog(s, ev.text, 'event')
}

// Population records and the land running out, each told once until it changes.
function milestones(s: GameState) {
  for (const n of POP_MILESTONES) {
    const flag = `pop${n}`
    if (n > startPop(s.stage) * 2 && s.pop >= n && !s.flags.includes(flag)) {
      addFlag(s, flag)
      addLog(s, `There are now more than ${fmtInt(n)} ${STAGES[s.stage].unit}.`, 'system')
    }
  }
  for (const r of perSecond(s).res) {
    const flag = `low:${r.def.id}`
    const low = s.flags.includes(flag)
    if (!low && r.wild < r.cap * 0.1) {
      addFlag(s, flag)
      addLog(s, `Wild ${r.def.name} is nearly gone. The ${STAGES[s.stage].unit} are using it faster than it comes back.`, 'system')
    } else if (low && r.wild > r.cap * 0.5) {
      s.flags = s.flags.filter(f => f !== flag)
      addLog(s, `${r.def.name} is plentiful again.`, 'system')
    }
  }
}

export function stepStory(s: GameState, dt: number) {
  if (s.effects.length) {
    s.effects = s.effects.map(e => ({ ...e, remaining: e.remaining - dt })).filter(e => e.remaining > 0)
  }
  s.nextLineIn -= dt
  if (s.nextLineIn <= 0) {
    ambient(s)
    s.nextLineIn = between(s, LINE_GAP)
  }
  s.nextEventIn -= dt
  if (s.nextEventIn <= 0) {
    lifeEvent(s)
    s.nextEventIn = between(s, EVENT_GAP)
  }
  milestones(s)
}
