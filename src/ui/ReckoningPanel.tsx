import { memo } from 'react'
import { THREAT_BY_ID } from '../data/threats'
import { fmt, fmtClock } from '../engine/format'
import type { Reckoning } from '../engine/types'
import { TextBar } from './TextBar'

export const ReckoningPanel = memo(function ReckoningPanel({ reckoning, defense }: { reckoning: Reckoning; defense: number }) {
  const threat = THREAT_BY_ID[reckoning.threatId]
  const safe = defense >= reckoning.level
  return (
    <section className="panel reckoning stack">
      <div className="spread">
        <h2 className="event-name loss">The Reckoning: {threat.name}</h2>
        <span className="loss">{reckoning.resolved ? 'impact' : `impact in ${fmtClock(reckoning.countdown)}`}</span>
      </div>
      <p className="muted">{threat.text}</p>
      {reckoning.resolved ? (
        <p className="loss">The defenses failed. Every species is fading.</p>
      ) : (
        <>
          <p>
            Defense {fmt(defense)} / {fmt(reckoning.level)}{' '}
            <TextBar value={defense / reckoning.level} className={safe ? 'accent' : 'loss'} />
          </p>
          <p className="muted small">
            {safe
              ? 'Defense holds the line. Keep it there until impact.'
              : 'Raise Defense with Survival Traits, Genome nodes and Defense mutations before impact.'}
          </p>
        </>
      )}
    </section>
  )
})
