import { memo } from 'react'
import { RESISTS } from '../data/constants'
import { fmt, fmtClock } from '../engine/format'
import type { Resist } from '../engine/types'
import { TextBar } from './TextBar'

export const resistLabel = (r: Resist) => r[0].toUpperCase() + r.slice(1)

interface Props {
  biomass: number
  income: number
  population: number
  health: number
  genome: number
  resist: Record<Resist, number>
  epoch: number
  fossils: number
  showRate: boolean
  showGenome: boolean
  showFossils: boolean
  threat: { name: string; countdown: number; requirements: Partial<Record<Resist, number>> } | null
  saved: boolean
  settingsOpen: boolean
  onSave: () => void
  onSettings: () => void
}

export const Header = memo(function Header(p: Props) {
  return (
    <header className="header">
      <div className="spread">
        <h1 className="title">
          Lineage{p.epoch > 1 && <span className="epoch muted"> epoch {p.epoch}</span>}
        </h1>
        <div className="row header-actions">
          <button onClick={p.onSave}>{p.saved ? 'saved' : 'save'}</button>
          <button onClick={p.onSettings} aria-pressed={p.settingsOpen}>{p.settingsOpen ? 'close settings' : 'settings'}</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat stat-main">
          <span className="stat-label">Biomass</span>
          <span className="stat-value">{fmt(p.biomass)}</span>
          {p.showRate && <span className="stat-sub accent">+{fmt(p.income)}/s</span>}
        </div>
        {p.showRate && (
          <div className="stat">
            <span className="stat-label">Population</span>
            <span className="stat-value">{fmt(Math.floor(p.population))}</span>
            {p.health < 1 && <span className="stat-sub loss">(health {Math.round(p.health * 100)}%)</span>}
          </div>
        )}
        {p.showGenome && (
          <div className="stat">
            <span className="stat-label">Genome</span>
            <span className="stat-value">{fmt(p.genome)}</span>
          </div>
        )}
        {p.showFossils && (
          <div className="stat">
            <span className="stat-label">Fossils</span>
            <span className="stat-value">{fmt(p.fossils)}</span>
          </div>
        )}
        {RESISTS.filter(r => p.resist[r] > 0).map(r => (
          <div key={r} className="stat stat-small">
            <span className="stat-label">{resistLabel(r)}</span>
            <span className="stat-value">{fmt(p.resist[r])}</span>
          </div>
        ))}
      </div>

      {p.threat && (
        <p className="threat-line loss">
          <span>THREAT {p.threat.name}</span>
          <span>Impact in {fmtClock(p.threat.countdown)}</span>
          {RESISTS.filter(r => p.threat!.requirements[r] !== undefined).map(r => {
            const need = p.threat!.requirements[r]!
            return (
              <span key={r}>
                {resistLabel(r)} {fmt(p.resist[r])}/{fmt(need)}{' '}
                <TextBar value={p.resist[r] / need} width={10} className={p.resist[r] >= need ? 'accent' : 'loss'} />
              </span>
            )
          })}
        </p>
      )}
    </header>
  )
})
