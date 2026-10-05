import { memo } from 'react'
import { fmt, fmtClock } from '../engine/format'
import { TextBar } from './TextBar'

interface Props {
  biomass: number
  income: number
  population: number
  health: number
  genome: number
  defense: number
  showRate: boolean
  showGenome: boolean
  showDefense: boolean
  threat: { name: string; level: number; countdown: number; resolved: boolean } | null
  saved: boolean
  settingsOpen: boolean
  onSave: () => void
  onSettings: () => void
}

export const Header = memo(function Header(p: Props) {
  return (
    <header className="header">
      <div className="spread">
        <h1 className="title">Lineage</h1>
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
        {p.showDefense && (
          <div className="stat">
            <span className="stat-label">Defense</span>
            <span className="stat-value">{fmt(p.defense)}</span>
          </div>
        )}
      </div>

      {p.threat && !p.threat.resolved && (
        <p className="threat-line loss">
          <span>THREAT {p.threat.name} {fmt(p.threat.level)}</span>
          <span>Impact in {fmtClock(p.threat.countdown)}</span>
          <span>
            Defense {fmt(p.defense)}{' '}
            <TextBar value={p.defense / p.threat.level} width={10} className={p.defense >= p.threat.level ? 'accent' : 'loss'} />
          </span>
        </p>
      )}
    </header>
  )
})
