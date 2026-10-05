import { memo } from 'react'
import { SPECIES } from '../data/species'
import { ENDING_TEXT } from '../data/story'
import { fmt, fmtTime } from '../engine/format'
import { eraThreatFor } from '../engine/reckoning'
import { fossilsForRun, nextEpoch } from '../engine/rebirth'
import type { GameState } from '../engine/types'

export const EndScreen = memo(function EndScreen({ state, onRebirth }: { state: GameState; onRebirth: () => void }) {
  const ending = state.ending ?? 'extinct'
  const era = state.threat?.kind === 'era' ? eraThreatFor(state.threat.species) : undefined
  const gain = fossilsForRun(state)
  return (
    <section className="panel end stack">
      <h2 className={ending === 'survived' ? 'end-title accent' : 'end-title loss'}>
        {ending === 'survived' ? 'Life survived' : era ? `Lost to the ${era.name}` : 'Extinction'}
      </h2>
      {era && <p className="muted">{era.failText}</p>}
      <p>{ENDING_TEXT[ending]}</p>
      <dl className="end-stats">
        <dt>Epoch</dt><dd>{state.meta.epoch}</dd>
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
      <div className="rebirth stack">
        <p>
          Rebirth pays <span className="accent">{fmt(gain)} {gain === 1 ? 'Fossil' : 'Fossils'}</span> and starts Epoch {nextEpoch(state)}.
          {ending === 'survived' ? ' Every Threat will be stronger.' : ' The Threats stay as they were, until a lineage survives.'}
          {' '}Fossils and Fossil upgrades stay. Everything else starts over.
        </p>
        <div><button onClick={onRebirth}>Rebirth</button></div>
      </div>
    </section>
  )
})
