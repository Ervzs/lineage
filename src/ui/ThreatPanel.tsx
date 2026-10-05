import { memo } from 'react'
import { RESISTS } from '../data/constants'
import { fmt } from '../engine/format'
import { threatName, threatStage, threatText } from '../engine/reckoning'
import type { Resist, Threat } from '../engine/types'
import { resistLabel } from './Header'
import { TextBar } from './TextBar'

const STAGES = ['distant', 'approaching', 'imminent'] as const

export const ThreatPanel = memo(function ThreatPanel({ threat, resist }: { threat: Threat; resist: Record<Resist, number> }) {
  const checks = RESISTS.filter(r => threat.requirements[r] !== undefined)
  const ready = checks.every(r => resist[r] >= threat.requirements[r]!)
  const stage = threatStage(threat)
  const title = threat.kind === 'final' ? `The Reckoning: ${threatName(threat)}` : threatName(threat)
  const cls = threat.resolved ? '' : ready ? ' ready' : stage === 'imminent' ? ' imminent' : ''
  return (
    <section className={`band threat-band${cls}`} aria-live="polite">
      <div className="band-head">
        <h2 className="band-title">{title}</h2>
        {!threat.resolved && (
          <span className="stage">
            {stage}
            {STAGES.map((st, i) => <i key={st} className={i <= STAGES.indexOf(stage) ? 'on' : ''} />)}
          </span>
        )}
      </div>
      <p className="band-text">{threatText(threat)}</p>
      {threat.resolved ? (
        <p className="band-note">The defenses failed. Every species is fading.</p>
      ) : (
        <>
          <div className="needs">
            {checks.map(r => {
              const need = threat.requirements[r]!
              const ok = resist[r] >= need
              return (
                <div key={r} className="need">
                  <span>{resistLabel(r)} {fmt(resist[r])} / {fmt(need)}</span>
                  <TextBar value={resist[r] / need} width={16} className={ok ? 'good' : 'loss'} />
                </div>
              )
            })}
          </div>
          <p className="band-note">
            {ready
              ? 'The lineage is ready. Hold on.'
              : threat.kind === 'era'
                ? 'If any resistance is short at impact, this world ends. Buy or level Survival Traits, Genome nodes or mutations.'
                : 'Raise every listed resistance before impact.'}
          </p>
        </>
      )}
    </section>
  )
})
