import { memo } from 'react'
import { SPECIES } from '../data/species'
import { fmt } from '../engine/format'
import { effectAtLevel } from '../engine/modifiers'
import { describeMutation } from '../engine/mutations'
import type { Effect, MutationInstance, TraitDef } from '../engine/types'

const num = (v: number) => String(Math.round(v * 1000) / 1000)

function effectText(e: Effect, species: number, level: number): string {
  const p = SPECIES[species].producers
  const v = effectAtLevel(e, level)
  switch (e.target) {
    case 'tier1.output': return `${p[0].name} output ×${num(v)}`
    case 'tier2.output': return `${p[1].name} output ×${num(v)}`
    case 'tier3.output': return `${p[2].name} output ×${num(v)}`
    case 'resist.immunity': return `Immunity +${num(v)}`
    case 'resist.toughness': return `Toughness +${num(v)}`
    case 'resist.endurance': return `Endurance +${num(v)}`
    case 'event.lossMult': return `Event losses ×${num(v)}`
    case 'luck.points': return `Luck +${num(v)}`
    case 'event.riskSuccess': return `Risky choices +${num(v)}% success`
    case 'gift.chance': return `Gift chance +${num(v)}%`
  }
}

const effectsText = (t: TraitDef, level: number) => t.effects.map(e => effectText(e, t.species, level)).join(', ')

interface Props {
  trait: TraitDef
  cost: number
  owned: boolean
  unlocked: boolean
  affordable: boolean
  level: number
  levelCost: number
  canLevel: boolean
  requiresText: string
  mutation?: MutationInstance
  onBuy: (id: string) => void
  onLevel: (id: string) => void
}

export const TraitRow = memo(function TraitRow(p: Props) {
  const { trait } = p
  return (
    <div className={p.owned ? 'trait trait-owned' : p.unlocked ? 'trait' : 'trait trait-locked'}>
      <div className="spread">
        <span className="trait-name">{trait.name}</span>
        <span className="muted small">{p.owned && p.level > 0 ? `level ${p.level}` : `tier ${trait.tier}`}</span>
      </div>
      <p className="muted small">{trait.flavor}</p>
      <p className="small">{effectsText(trait, p.level)}</p>
      {p.mutation && (
        <p className="small">
          <span className="muted">gifted:</span> <span className={`r-${p.mutation.rarity}`}>{describeMutation(p.mutation)}</span>
        </p>
      )}
      <div className="spread trait-foot">
        {p.owned ? (
          <>
            <span className={p.canLevel ? 'small' : 'muted small'}>
              next: {effectsText(trait, p.level + 1)}<br />cost {fmt(p.levelCost)}
            </span>
            <button onClick={() => p.onLevel(trait.id)} disabled={!p.canLevel}>level up</button>
          </>
        ) : p.unlocked ? (
          <>
            <span className={p.affordable ? 'small' : 'muted small'}>cost {fmt(p.cost)}</span>
            <button onClick={() => p.onBuy(trait.id)} disabled={!p.affordable}>buy</button>
          </>
        ) : (
          <span className="muted small">locked: needs {p.requiresText}</span>
        )}
      </div>
    </div>
  )
})
