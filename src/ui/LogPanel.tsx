import { memo, useState } from 'react'
import { fmtTime } from '../engine/format'
import type { LogEntry } from '../engine/types'

// The Chronicle: always open. A side rail on wide screens, a bottom strip on phones.
export const LogPanel = memo(function LogPanel({ log }: { log: LogEntry[] }) {
  const [open, setOpen] = useState(false)
  return (
    <aside className={open ? 'chronicle open' : 'chronicle'} aria-label="Chronicle">
      <div className="chronicle-head">
        <h2 className="chronicle-title">Chronicle</h2>
        <button className="chronicle-toggle ghost" onClick={() => setOpen(o => !o)} aria-expanded={open}>
          {open ? 'collapse' : 'expand'}
        </button>
      </div>
      <p className="chronicle-hint">The story of your species, newest first. Read it: it warns you of what is coming.</p>
      <ol className="plain-list" aria-live="polite">
        {log.map((e, i) => (
          <li key={log.length - i} className={`entry entry-${e.kind}${i === 0 ? ' entry-new' : ''}`}>
            <time>{fmtTime(e.t)}</time>
            <span>{e.text}</span>
          </li>
        ))}
      </ol>
    </aside>
  )
})
