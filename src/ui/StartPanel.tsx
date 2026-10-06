import { memo } from 'react'
import { STAGES } from '../data/stages'
import { sparkCost } from '../engine/ecology'
import { fmtInt } from '../engine/format'

interface Props {
  store: Record<string, number>
  alive: boolean
  onGather: () => void
  onSpark: () => void
}

// Stage 1 only: gather by hand, then spark the first cell.
export const StartPanel = memo(function StartPanel({ store, alive, onGather, onSpark }: Props) {
  const st = STAGES[0]
  const cost = sparkCost(0)
  const gathered = st.resources.some(r => (store[r.id] ?? 0) > 0)
  const affordable = st.resources.every(r => (store[r.id] ?? 0) >= cost)
  return (
    <section className="panel stack start">
      <div className="row">
        <button className="gather" onClick={onGather}>Gather chemicals</button>
        <span className="muted small">
          {alive ? 'Your cells gather by themselves now. Clicking still helps a little.' : 'Each click collects a little minerals and heat from the warm water.'}
        </span>
      </div>
      {!alive && gathered && (
        <div className="spark stack">
          <h3 className="adaptation-name">{st.spark!.name}</h3>
          <p className="muted small">{st.spark!.blurb}</p>
          <div className="adaptation-foot">
            <span className="mono small">
              {st.resources.map(r => (
                <span key={r.id} className={(store[r.id] ?? 0) >= cost ? '' : 'muted'}>{fmtInt(cost)} {r.name} </span>
              ))}
            </span>
            <button disabled={!affordable} onClick={onSpark}>start life</button>
          </div>
        </div>
      )}
    </section>
  )
})
