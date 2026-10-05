import { memo } from 'react'
import { RESISTS } from '../data/constants'
import { RARITIES } from '../data/mutations'
import { SPECIES } from '../data/species'
import { TRAIT_BY_ID } from '../data/traits'
import { fmt } from '../engine/format'
import { describeMutation } from '../engine/mutations'
import type { MutationInstance, Resist } from '../engine/types'
import { resistLabel } from './Header'

interface Props {
  mutations: MutationInstance[]
  luck: number
  resist: Record<Resist, number>
  productionBonus: number
}

export const MutationsPanel = memo(function MutationsPanel({ mutations, luck, resist, productionBonus }: Props) {
  const sorted = mutations
    .map((m, i) => ({ m, i }))
    .sort((a, b) => RARITIES.indexOf(b.m.rarity) - RARITIES.indexOf(a.m.rarity) || a.i - b.i)
    .map(x => x.m)

  return (
    <section className="panel stack">
      <ul className="plain-list mutations">
        {sorted.map(m => {
          const t = TRAIT_BY_ID[m.traitId]
          return (
            <li key={m.id} className="mutation-row">
              <span className={`r-${m.rarity}`}>{describeMutation(m)}</span>
              <span className="muted">
                from {t.name}{m.type === 'chain' && m.species !== undefined ? ` (${SPECIES[m.species].name})` : ''}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="row small mutation-foot">
        {luck > 0 && <span><span className="muted">Luck</span> {fmt(luck)}</span>}
        {RESISTS.filter(r => resist[r] > 0).map(r => <span key={r}><span className="muted">{resistLabel(r)}</span> +{fmt(resist[r])}</span>)}
        <span><span className="muted">Production bonus</span> +{Math.round(productionBonus * 100)}%</span>
      </p>
    </section>
  )
})
