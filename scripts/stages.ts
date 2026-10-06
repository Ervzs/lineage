// npm run balance -- stages: plays each stage on its own with the careful bot and prints buy times.
// npm run stages: plays each stage on its own with the careful bot and prints buy times.
import { fmtTime } from '../src/engine/format'
import { canBuy, gameReducer } from '../src/engine/reducer'
import { enterStage, initialState } from '../src/engine/state'
import type { GameState } from '../src/engine/types'


// Buys in list order, but once the clues start it saves for the protective adaptations first.
function plan(s: GameState) {
  const list = STAGES[s.stage].adaptations
  const clued = s.disaster && s.disaster.clues > 0 && !s.disaster.struck
  return clued ? [...list.filter(a => a.role === 'protect'), ...list.filter(a => a.role !== 'protect')] : list
}

for (let k = 0; k < STAGES.length; k++) {
  let s = initialState(12345)
  enterStage(s, k)
  const buys: string[] = []
  let clue = ''
  while (!s.ending && s.stage === k && s.stageTime < 4 * 3600) {
    for (const a of plan(s)) {
      if (s.owned.includes(a.id)) continue
      if (canBuy(s, a.id)) {
        s = gameReducer(s, { type: 'BUY_ADAPTATION', id: a.id })
        buys.push(`${a.role[0]}${Math.round(s.stageTime / 60)}`)
      }
      break
    }
    s = gameReducer(s, { type: 'TICK', dt: 0.5 })
    if (s.disaster && !clue) clue = `clue@${Math.round(s.stageTime / 60)}`
  }
  const t = s.history.at(-1)?.seconds ?? s.stageTime
  console.log(`${k + 1} ${STAGES[k].name.padEnd(22)} ${(s.ending ?? 'ok').padEnd(8)} ${fmtTime(t).padEnd(10)} ${clue} | ${buys.join(' ')}`)
}
