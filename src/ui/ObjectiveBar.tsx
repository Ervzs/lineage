import { memo } from 'react'
import { fmt } from '../engine/format'
import { TextBar } from './TextBar'

export const ObjectiveBar = memo(function ObjectiveBar({ text, current, target }: { text: string; current?: number; target?: number }) {
  return (
    <p className="objective">
      <span className="muted">Next:</span> <span>{text}</span>
      {target !== undefined && current !== undefined && (
        <span className="objective-progress">
          <TextBar value={current / target} /> <span className="muted">{fmt(Math.floor(current))} / {fmt(target)}</span>
        </span>
      )}
    </p>
  )
})
