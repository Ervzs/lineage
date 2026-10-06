import { memo } from 'react'
import { STAGES } from '../data/stages'
import { fmtInt, fmtTime } from '../engine/format'
import type { GameState } from '../engine/types'

export const EndScreen = memo(function EndScreen({ state: s, onNewRun }: { state: GameState; onNewRun: () => void }) {
  const survived = s.ending === 'survived'
  const st = STAGES[s.stage]
  return (
    <section className="panel end stack">
      <h2 className={survived ? 'end-title accent' : 'end-title loss'}>
        {survived ? 'Your lineage survived' : `Extinct in stage ${s.stage + 1}: ${st.name}`}
      </h2>
      <p>{survived ? st.evolveText : st.disaster.fail}</p>
      {!survived && <p className="muted">The warning signs were in the Chronicle. Next time, read it closely and prepare.</p>}
      <dl className="end-stats">
        <dt>Play time</dt><dd>{fmtTime(s.playTime)}</dd>
        <dt>Stages survived</dt><dd>{s.history.length} of {STAGES.length}</dd>
        <dt>Furthest stage ever</dt><dd>{s.best}</dd>
      </dl>
      {s.history.length > 0 && (
        <>
          <h3 className="section-title">largest population</h3>
          <dl className="end-stats">
            {s.history.map(h => (
              <div key={h.stage} className="end-pair">
                <dt>{STAGES[h.stage].name}</dt><dd>{fmtInt(h.peak)} {STAGES[h.stage].unit}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      <div><button onClick={onNewRun}>Start a new lineage</button></div>
    </section>
  )
})
