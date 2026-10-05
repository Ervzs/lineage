import { memo } from 'react'
import { RESISTS } from '../data/constants'
import { fmt, fmtClock } from '../engine/format'
import { threatName, threatText } from '../engine/reckoning'
import type { Resist, Threat } from '../engine/types'
import { resistLabel } from './Header'
import { TextBar } from './TextBar'

export const ThreatPanel = memo(function ThreatPanel({ threat, resist }: { threat: Threat; resist: Record<Resist, number> }) {
  const checks = RESISTS.filter(r => threat.requirements[r] !== undefined)
  const safe = checks.every(r => resist[r] >= threat.requirements[r]!)
  const title = threat.kind === 'final' ? `The Reckoning: ${threatName(threat)}` : threatName(threat)
  return (
    <section className="panel reckoning stack">
      <div className="spread">
        <h2 className="event-name loss">{title}</h2>
        <span className="loss">{threat.resolved ? 'impact' : `impact in ${fmtClock(threat.countdown)}`}</span>
      </div>
      <p className="muted">{threatText(threat)}</p>
      {threat.resolved ? (
        <p className="loss">The defenses failed. Every species is fading.</p>
      ) : (
        <>
          {checks.map(r => {
            const need = threat.requirements[r]!
            return (
              <p key={r} className="threat-req">
                <span className="threat-req-name">{resistLabel(r)}</span>
                <span>{fmt(resist[r])} / {fmt(need)}</span>
                <TextBar value={resist[r] / need} className={resist[r] >= need ? 'accent' : 'loss'} />
              </p>
            )
          })}
          <p className="muted small">
            {safe
              ? 'The lineage is ready. Hold on until impact.'
              : threat.kind === 'era'
                ? 'If any resistance is short at impact, this world ends. Buy or level Survival Traits, Genome nodes or mutations now.'
                : 'Raise every listed resistance before impact.'}
          </p>
        </>
      )}
    </section>
  )
})
