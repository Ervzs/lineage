import { memo } from 'react'
import { SPECIES } from '../data/species'
import { ENDING_TEXT } from '../data/story'
import { fmt, fmtTime } from '../engine/format'
import type { GameState } from '../engine/types'

export const EndScreen = memo(function EndScreen({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const ending = state.ending ?? 'extinct'
  return (
    <section className="panel end stack">
      <h2 className={ending === 'survived' ? 'end-title accent' : 'end-title loss'}>
        {ending === 'survived' ? 'Life survived' : 'Extinction'}
      </h2>
      <p>{ENDING_TEXT[ending]}</p>
      <dl className="end-stats">
        <dt>Play time</dt><dd>{fmtTime(state.playTime)}</dd>
        <dt>Total Biomass</dt><dd>{fmt(state.stats.totalBiomass)}</dd>
        <dt>Genome earned</dt><dd>{fmt(state.genomeEarned)}</dd>
        <dt>Events resolved</dt><dd>{fmt(state.stats.eventsResolved)} of {fmt(state.stats.eventsSeen)}</dd>
        <dt>Biomass lost</dt><dd>{fmt(state.stats.biomassLost)}</dd>
      </dl>
      <h3 className="section-title">peak population</h3>
      <dl className="end-stats">
        {state.species.map((sp, k) => sp.status === 'locked' ? null : (
          <div key={k} className="end-pair">
            <dt>{SPECIES[k].name}</dt><dd>{fmt(sp.peakPopulation)}</dd>
          </div>
        ))}
      </dl>
      <div>
        <button onClick={onRestart}>Start over</button>
      </div>
    </section>
  )
})
