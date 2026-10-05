import { memo, useState } from 'react'
import { SPECIES } from '../data/species'
import { BRANCHES, TRAIT_BY_ID, TRAITS } from '../data/traits'
import { traitCost } from '../engine/costs'
import { traitOwned, traitUnlocked } from '../engine/evolution'
import { activeIndex, isBorn } from '../engine/state'
import type { GameState, TraitDef } from '../engine/types'
import { TraitRow } from './TraitRow'

function requiresText(t: TraitDef): string {
  const all = t.requires.map(id => TRAIT_BY_ID[id].name)
  const any = t.requiresAny.length ? [t.requiresAny.map(id => TRAIT_BY_ID[id].name).join(' or ')] : []
  return [...all, ...any].join(' and ')
}

interface Props { state: GameState; onBuy: (id: string) => void }

export const TraitsPanel = memo(function TraitsPanel({ state, onBuy }: Props) {
  const born = state.species.map((sp, k) => ({ sp, k })).filter(({ sp }) => isBorn(sp))
  const fallback = Math.max(0, activeIndex(state))
  const [picked, setPicked] = useState<number | null>(null)
  const k = picked !== null && isBorn(state.species[picked]) ? picked : fallback
  const sp = state.species[k]

  return (
    <section className="stack">
      {born.length > 1 && (
        <div className="row" role="group" aria-label="species">
          {born.map(({ sp: b, k: i }) => (
            <button key={i} className={i === k ? 'chip chip-on' : 'chip'} aria-pressed={i === k} onClick={() => setPicked(i)}>
              {SPECIES[i].name}{b.status !== 'active' ? ` (${b.status})` : ''}
            </button>
          ))}
        </div>
      )}
      <div className="spread">
        <h2 className="panel-title">{SPECIES[k].name} <span className="muted">traits</span></h2>
        <span className="muted small">{sp.traitsBought.length} / 9 owned</span>
      </div>
      <div className="branches">
        {BRANCHES.map(branch => (
          <div key={branch} className="branch stack">
            <h3 className="section-title">{branch}</h3>
            {TRAITS.filter(t => t.species === k && t.branch === branch).map(t => {
              const cost = traitCost(state, t)
              return (
                <TraitRow
                  key={t.id}
                  trait={t}
                  cost={cost}
                  owned={traitOwned(state, t.id)}
                  unlocked={traitUnlocked(state, t.id)}
                  affordable={state.biomass >= cost && !state.ending}
                  requiresText={requiresText(t)}
                  mutation={state.mutations.find(m => m.traitId === t.id)}
                  onBuy={onBuy}
                />
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
})
