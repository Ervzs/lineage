import { memo } from 'react'
import { SPECIES } from '../data/species'
import { fmt } from '../engine/format'
import { describeMutation } from '../engine/mutations'
import type { Effect, MutationInstance, TraitDef } from '../engine/types'

function effectText(e: Effect, species: number): string {
  const p = SPECIES[species].producers
  switch (e.target) {
    case 'tier1.output': return `${p[0].name} output ×${e.value}`
    case 'tier2.output': return `${p[1].name} output ×${e.value}`
    case 'tier3.output': return `${p[2].name} output ×${e.value}`
    case 'defense.flat': return `Defense +${e.value}`
    case 'event.lossMult': return `Event losses ×${e.value}`
    case 'luck.points': return `Luck +${e.value}`
    case 'event.riskSuccess': return `Risky choices +${e.value}% success`
    case 'gift.chance': return `Gift chance +${e.value}%`
  }
}

interface Props {
  trait: TraitDef
  cost: number
  owned: boolean
  unlocked: boolean
  affordable: boolean
  requiresText: string
  mutation?: MutationInstance
  onBuy: (id: string) => void
}

export const TraitRow = memo(function TraitRow({ trait, cost, owned, unlocked, affordable, requiresText, mutation, onBuy }: Props) {
  return (
    <div className={owned ? 'trait trait-owned' : unlocked ? 'trait' : 'trait trait-locked'}>
      <div className="spread">
        <span className="trait-name">{trait.name}</span>
        <span className="muted small">tier {trait.tier}</span>
      </div>
      <p className="muted small">{trait.flavor}</p>
      <p className="small">{trait.effects.map(e => effectText(e, trait.species)).join(', ')}</p>
      {mutation && (
        <p className="small">
          <span className="muted">gifted:</span> <span className={`r-${mutation.rarity}`}>{describeMutation(mutation)}</span>
        </p>
      )}
      <div className="spread trait-foot">
        {owned ? (
          <span className="accent small">owned</span>
        ) : unlocked ? (
          <>
            <span className={affordable ? 'small' : 'muted small'}>cost {fmt(cost)}</span>
            <button onClick={() => onBuy(trait.id)} disabled={!affordable}>buy</button>
          </>
        ) : (
          <span className="muted small">locked: needs {requiresText}</span>
        )}
      </div>
    </div>
  )
})
