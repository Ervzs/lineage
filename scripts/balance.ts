// npm run balance: plays full runs with simple bots and reports pacing.
import { writeFileSync } from 'node:fs'
import { STAGES, adaptCost } from '../src/data/stages'
import { fmtInt, fmtTime } from '../src/engine/format'
import { canBuy, canSpark, perSecond } from '../src/engine/ecology'
import { gameReducer } from '../src/engine/reducer'
import { initialState } from '../src/engine/state'
import type { GameState } from '../src/engine/types'

// Buys in list order, but once the clues start it saves for the protective adaptations first.
function plan(s: GameState) {
  const list = STAGES[s.stage].adaptations
  const clued = s.disaster && s.disaster.clues > 0 && !s.disaster.struck
  return clued ? [...list.filter(a => a.role === 'protect'), ...list.filter(a => a.role !== 'protect')] : list
}

const STEP = 0.5
const MAX_TIME = 24 * 3600
const SEED = 12345
const CLICKS_PER_STEP = 2   // 4 clicks a second before life starts

interface Policy { name: string; protects: boolean }
const POLICIES: Policy[] = [
  { name: 'careful', protects: true },
  { name: 'careless (never protects)', protects: false },
]

interface StageReport { stage: number; seconds: number; firstBuy: number; minPop: number; maxPop: number; buys: string[]; income: Record<string, number> }

function run(p: Policy) {
  let s: GameState = initialState(SEED)
  const stages: StageReport[] = []
  let cur: StageReport = { stage: 0, seconds: 0, firstBuy: -1, minPop: s.pop, maxPop: s.pop, buys: [], income: {} }
  let lastLogT = 0
  let lastTop = s.log[0]
  let maxGap = 0
  let lines = 0
  let lifeAt = -1
  while (!s.ending && s.playTime < MAX_TIME) {
    // Stage 1 opening: click until the first cell can be sparked.
    if (s.pop === 0) {
      for (let i = 0; i < CLICKS_PER_STEP; i++) s = gameReducer(s, { type: 'GATHER' })
      if (canSpark(s)) {
        s = gameReducer(s, { type: 'SPARK' })
        lifeAt = s.playTime
      }
    }
    // Buy in list order; protective ones only if the policy cares.
    for (const a of plan(s)) {
      if (!p.protects && a.role === 'protect') continue
      if (s.owned.includes(a.id)) continue
      if (canBuy(s, a.id)) {
        s = gameReducer(s, { type: 'BUY_ADAPTATION', id: a.id })
        if (cur.firstBuy < 0) cur.firstBuy = s.stageTime
        cur.buys.push(`${a.name} @ ${fmtTime(s.stageTime)}`)
      }
      break
    }
    for (const r of perSecond(s).res) cur.income[r.def.id] = (cur.income[r.def.id] ?? 0) + r.stored * STEP
    const before = s.stage
    s = gameReducer(s, { type: 'TICK', dt: STEP })
    if (s.log[0] !== lastTop) {
      lines++
      maxGap = Math.max(maxGap, s.playTime - lastLogT)
      lastLogT = s.playTime
      lastTop = s.log[0]
    }
    if (s.stage === before) {
      cur.minPop = Math.min(cur.minPop, s.pop)
      cur.maxPop = Math.max(cur.maxPop, s.pop)
    }
    if (s.stage !== before || s.ending) {
      cur.seconds = s.history.at(-1)?.stage === before ? s.history.at(-1)!.seconds : s.stageTime
      stages.push(cur)
      cur = { stage: s.stage, seconds: 0, firstBuy: -1, minPop: s.pop, maxPop: s.pop, buys: [], income: {} }
    }
  }
  if (!s.ending) stages.push({ ...cur, seconds: s.stageTime })
  return { s, stages, maxGap, linesPerMin: lines / (s.playTime / 60), lifeAt }
}

const out: string[] = ['# Balance report', '']
for (const p of POLICIES) {
  const r = run(p)
  out.push(`## ${p.name}`, '')
  out.push(`Result: **${r.s.ending ?? 'timeout'}** at stage ${r.s.stage + 1} after ${fmtTime(r.s.playTime)}`)
  out.push(`Life started after ${fmtTime(r.lifeAt)} of clicking`)
  out.push(`Log: ${r.linesPerMin.toFixed(1)} lines/min, longest gap ${r.maxGap.toFixed(0)} s`, '')
  out.push('| stage | time | first buy | pop min | pop max |', '|---|---|---|---|---|')
  for (const st of r.stages) {
    out.push(`| ${st.stage + 1} ${STAGES[st.stage].name} | ${fmtTime(st.seconds)} | ${st.firstBuy < 0 ? '-' : fmtTime(st.firstBuy)} | ${fmtInt(st.minPop)} | ${fmtInt(st.maxPop)} |`)
  }
  out.push('')
  for (const st of r.stages) {
    const total: Record<string, number> = {}
    for (const a of STAGES[st.stage].adaptations) for (const [k, n] of Object.entries(adaptCost(st.stage, a))) total[k] = (total[k] ?? 0) + n
    const inc = Object.entries(st.income).map(([k, n]) => `${k} ${fmtInt(n / Math.max(1, st.seconds))}/s (all costs ${fmtInt(total[k] ?? 0)})`).join('; ')
    out.push(`- Stage ${st.stage + 1}: ${inc}`, `  - ${st.buys.join(', ')}`)
  }
  out.push('')
}
writeFileSync('balance-report.md', out.join('\n'))
console.log(out.join('\n'))
