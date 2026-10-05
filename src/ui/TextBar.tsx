import { memo } from 'react'

// Text-only progress bar: filled and empty blocks, 20 characters by default.
export const TextBar = memo(function TextBar({ value, width = 20, className = 'accent' }: { value: number; width?: number; className?: string }) {
  const filled = Math.round(Math.max(0, Math.min(1, value)) * width)
  return (
    <span className={`bar ${className}`} aria-hidden="true">
      {'█'.repeat(filled)}<span className="bar-empty">{'░'.repeat(width - filled)}</span>
    </span>
  )
})
