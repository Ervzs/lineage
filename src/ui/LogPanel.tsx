import { memo } from 'react'
import { fmtTime } from '../engine/format'
import type { LogEntry } from '../engine/types'

export const LogPanel = memo(function LogPanel({ log }: { log: LogEntry[] }) {
  return (
    <section className="panel">
      <ol className="plain-list log">
        {log.map((e, i) => (
          <li key={log.length - i} className={`log-row log-${e.kind}`}>
            <span className="muted small log-time">{fmtTime(e.t)}</span>
            <span>{e.text}</span>
          </li>
        ))}
      </ol>
    </section>
  )
})
