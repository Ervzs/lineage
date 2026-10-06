import { memo } from 'react'
import { STAGES } from '../data/stages'
import { fmtInt, fmtTime } from '../engine/format'
import type { StageRecord } from '../engine/types'

export const HistoryPanel = memo(function HistoryPanel({ history }: { history: StageRecord[] }) {
  return (
    <section className="panel stack">
      <h2 className="panel-title">Your lineage so far</h2>
      {history.map(h => (
        <div key={h.stage} className="lineage-row">
          <span className="lineage-name">{STAGES[h.stage].name}</span>
          <span>most {STAGES[h.stage].unit}: {fmtInt(h.peak)}</span>
          <span className="muted">{fmtTime(h.seconds)}</span>
        </div>
      ))}
    </section>
  )
})
