import { memo } from 'react'
import { RESISTS } from '../data/constants'
import { fmt } from '../engine/format'
import type { Resist } from '../engine/types'

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
  saved: boolean
  settingsOpen: boolean
  onSave: () => void
  onSettings: () => void
}

export const Header = memo(function Header(p: Props) {
  const resists = RESISTS.filter(r => p.resist[r] > 0)
  return (
    <header className="surface">
      <div className="spread">
        <h1 className="title">
          Lineage{p.epoch > 1 && <span className="epoch">Epoch {p.epoch}</span>}
        </h1>
        <div className="row header-actions">
          <button className="ghost" onClick={p.onSave}>{p.saved ? 'saved' : 'save'}</button>
          <button className="ghost" onClick={p.onSettings} aria-pressed={p.settingsOpen}>{p.settingsOpen ? 'close settings' : 'settings'}</button>
        </div>
      </div>

      <div className="stats">
        <div className="stat stat-main">
          <span className="stat-label">Biomass</span>
          <span className="stat-value">{fmt(p.biomass)}</span>
          {p.showRate && <span className="stat-sub good">+{fmt(p.income)}/s</span>}
        </div>
        {p.showRate && (
          <div className="stat">
            <span className="stat-label">Population</span>
            <span className="stat-value">{fmt(Math.floor(p.population))}</span>
            {p.health < 1 && <span className="stat-sub loss">health {Math.round(p.health * 100)}%</span>}
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
        {resists.length > 0 && (
          <div className="resists">
            {resists.map(r => (
              <div key={r} className={`resist resist-${r}`}>
                <span className="stat-label">{resistLabel(r)}</span>
                <span className="resist-value">{fmt(p.resist[r])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  )
})
