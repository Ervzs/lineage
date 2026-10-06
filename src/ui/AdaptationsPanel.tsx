import { memo } from 'react'
import { STAGES, adaptCost, adaptMinPop } from '../data/stages'
import { fmtInt } from '../engine/format'
import type { AdaptEffect, GameState } from '../engine/types'

interface Props { state: GameState; onBuy: (id: string) => void }

function effectText(e: AdaptEffect, names: Record<string, string>) {
  const pct = (m: number) => `${m > 1 ? '+' : '-'}${Math.round(Math.abs(m - 1) * 100)}%`
  switch (e.kind) {
    case 'land': return `${pct(e.mul)} wild ${names[e.res]}`
    case 'need': return `${pct(e.mul)} ${names[e.res]} needed to live`
    case 'birth': return `${pct(e.mul)} births`
    case 'death': return `${pct(e.mul)} deaths`
    case 'share': return `+${Math.round(e.add * 100)}% of food saved`
  }
}

export const AdaptationsPanel = memo(function AdaptationsPanel({ state: s, onBuy }: Props) {
  const st = STAGES[s.stage]
  const names = Object.fromEntries(st.resources.map(r => [r.id, r.name]))
  const keys = st.adaptations.filter(a => a.role === 'key')
  const done = keys.filter(a => s.owned.includes(a.id)).length
  return (
    <section className="stack">
      <p className="muted">
        Evolution: <span className="num">{done} of {keys.length}</span> steps. Buy every evolution step, and survive, to move on to the next stage.
        Adaptations are paid for with what your {st.unit} have saved.
      </p>
      <div className="adaptations">
        {st.adaptations.map(a => {
          const owned = s.owned.includes(a.id)
          const cost = adaptCost(s.stage, a)
          const minPop = adaptMinPop(s.stage, a)
          const popOk = s.pop >= minPop
          const affordable = Object.entries(cost).every(([r, n]) => (s.store[r] ?? 0) >= n)
          return (
            <article key={a.id} className={`adaptation${owned ? ' adaptation-owned' : ''}${a.role === 'key' ? ' adaptation-key' : ''}`}>
              <div className="spread">
                <h3 className="adaptation-name">{a.name}</h3>
                {a.role === 'key' && <span className="tag">evolution step</span>}
              </div>
              <p className="muted small">{a.blurb}</p>
              <p className="small accent">{a.effects.map(e => effectText(e, names)).join(', ')}</p>
              {owned ? (
                <p className="small good">Your {st.unit} have this.</p>
              ) : (
                <div className="adaptation-foot">
                  <span className="mono small">
                    {Object.entries(cost).map(([r, n]) => (
                      <span key={r} className={(s.store[r] ?? 0) >= n ? '' : 'muted'}>{fmtInt(n)} {names[r]} </span>
                    ))}
                    {minPop > 0 && <span className={popOk ? '' : 'loss'}>needs {fmtInt(minPop)} {st.unit}</span>}
                  </span>
                  <button disabled={!affordable || !popOk || !!s.ending} onClick={() => onBuy(a.id)}>buy</button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
})
