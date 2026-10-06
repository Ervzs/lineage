import { memo } from 'react'
import { STAGES } from '../data/stages'
import type { Flows } from '../engine/ecology'
import { fmtInt, fmtRate } from '../engine/format'

interface Props {
  stage: number
  pop: number
  flows: Flows
  store: Record<string, number>
  saved: boolean
  settingsOpen: boolean
  onSave: () => void
  onSettings: () => void
}

const signed = (n: number) => (n >= 0 ? '+' : '-') + fmtRate(Math.abs(n))

export const Header = memo(function Header(p: Props) {
  const st = STAGES[p.stage]
  const net = p.flows.births - p.flows.natural - p.flows.hunger
  return (
    <header className="surface">
      <div className="spread">
        <h1 className="title">Lineage</h1>
        <div className="row header-actions">
          <button className="ghost" onClick={p.onSave}>{p.saved ? 'saved' : 'save'}</button>
          <button className="ghost" onClick={p.onSettings} aria-pressed={p.settingsOpen}>{p.settingsOpen ? 'close settings' : 'settings'}</button>
        </div>
      </div>
      <p className="stage-name">
        <span className="muted">Stage {p.stage + 1} of {STAGES.length}</span> {st.name}
      </p>

      <div className="stats">
        <div className="stat stat-main">
          <span className="stat-label">Population</span>
          <span className="stat-value">{fmtInt(p.pop)}</span>
          <span className={`stat-sub ${net >= 0 ? 'good' : 'loss'}`}>{signed(net)}/s {st.unit}</span>
        </div>
        {p.flows.res.map(r => (
          <div key={r.def.id} className="stat">
            <span className="stat-label">{r.def.name}</span>
            <span className="stat-value">{fmtInt(p.store[r.def.id] ?? 0)}</span>
            <span className="stat-sub good">+{fmtRate(r.stored)}/s saved</span>
          </div>
        ))}
      </div>
    </header>
  )
})
