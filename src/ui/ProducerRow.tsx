import { memo } from 'react'
import { fmt } from '../engine/format'

interface Props {
  name: string
  bought: number
  amount: number
  output: string
  cost: number
  count: number
  affordable: boolean
  next: number | null
  readOnly: boolean
  hotkey: string
  onBuy: () => void
}

export const ProducerRow = memo(function ProducerRow(p: Props) {
  return (
    <div className="producer">
      <div className="producer-main">
        <span className="producer-name">{p.name}</span>
        <span className="muted">owned <span className="num">{fmt(p.bought)}</span></span>
        <span className="muted">total <span className="num">{fmt(Math.floor(p.amount))}</span></span>
        <span className="accent">{p.output}</span>
      </div>
      <div className="producer-side">
        <span className="muted small">{p.next === null ? 'all ×2 earned' : `next ×2 at ${p.next}`}</span>
        {!p.readOnly && (
          <div className="producer-buy">
            <span className={p.affordable ? '' : 'muted'}>cost {fmt(p.cost)}</span>
            <button onClick={p.onBuy} disabled={!p.affordable} aria-keyshortcuts={p.hotkey}>
              buy{p.count > 1 ? ` ${p.count}` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
})
