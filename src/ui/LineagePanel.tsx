import { memo } from 'react'
import { SPECIES } from '../data/species'
import { fmt } from '../engine/format'
import { genomeGain } from '../engine/genome'
import { speciesPopulation } from '../engine/population'
import type { GameState } from '../engine/types'
import { TextBar } from './TextBar'

export const LineagePanel = memo(function LineagePanel({ state }: { state: GameState }) {
  return (
    <section className="panel">
      <ul className="lineage">
        {state.species.map((sp, k) => {
          if (sp.status === 'locked') return null
          return (
            <li key={k} className="lineage-row">
              <span className="lineage-name">{SPECIES[k].name}</span>
              <span className={sp.status === 'active' ? 'accent' : sp.status === 'declining' ? 'loss' : 'muted'}>{sp.status}</span>
              {sp.status === 'extinct' && (
                <>
                  <span className="muted">peak <span className="num">{fmt(sp.peakPopulation)}</span></span>
                  <span className="muted">genome <span className="num">+{genomeGain(sp.peakPopulation)}</span></span>
                </>
              )}
              {sp.status === 'declining' && (
                <>
                  <span className="muted">pop <span className="num">{fmt(Math.floor(speciesPopulation(state, k)))}</span></span>
                  <span><TextBar value={sp.vitality} width={10} className="loss" /> <span className="muted">vitality {Math.round(sp.vitality * 100)}%</span></span>
                </>
              )}
              {sp.status === 'active' && (
                <>
                  <span className="muted">pop <span className="num">{fmt(Math.floor(speciesPopulation(state, k)))}</span></span>
                  <span className="muted">traits <span className="num">{sp.traitsBought.length} / 9</span></span>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
})
