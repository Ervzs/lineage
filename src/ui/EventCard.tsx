import { memo } from 'react'
import { EVENT_BY_ID } from '../data/events'
import { adjustedOutcomes, biomassLossPct, populationLossPct } from '../engine/events'
import type { Mods } from '../engine/modifiers'
import type { EventOption, Outcome } from '../engine/types'

const pct = (x: number) => `${Math.round(x * 10) / 10}%`

function effects(o: Outcome, m: Mods): string {
  const parts: string[] = []
  if (o.biomassLossPct) parts.push(`-${pct(biomassLossPct(o, m))} biomass`)
  if (o.populationLossPct) parts.push(`-${pct(populationLossPct(o, m))} pop`)
  if (o.biomassGainSeconds) parts.push(`+${o.biomassGainSeconds}s of income`)
  if (o.productionMult) parts.push(`production ×${o.productionMult} for ${o.durationSeconds}s`)
  return parts.length ? parts.join(', ') : 'safe'
}

function describe(option: EventOption, m: Mods): string {
  const outs = adjustedOutcomes(option, m.riskBonus)
  if (outs.length === 1) return effects(outs[0], m)
  return outs.map(o => `${Math.round(o.chance * 100)}% ${effects(o, m)}`).join(' / ')
}

interface Props { eventId: string; mods: Mods; onResolve: (optionId: string) => void }

export const EventCard = memo(function EventCard({ eventId, mods, onResolve }: Props) {
  const def = EVENT_BY_ID[eventId]
  return (
    <section className={`band event-band${def.kind === 'boost' ? ' boost' : ''}`} aria-live="polite">
      <div className="band-head">
        <h2 className="band-title">{def.name}</h2>
        <span className="muted small">answer soon, or the safe choice is made</span>
      </div>
      <p className="band-text">{def.flavor}</p>
      <div className="event-options">
        {def.options.map(o => (
          <button key={o.id} className="event-option" onClick={() => onResolve(o.id)}>
            <span className="event-label">{o.label}{o.id === def.defaultOptionId ? ' (safe)' : ''}</span>
            <span className="event-effect">{describe(o, mods)}</span>
          </button>
        ))}
      </div>
    </section>
  )
})
