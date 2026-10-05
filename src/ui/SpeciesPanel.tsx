import { memo } from 'react'
import { SPECIES } from '../data/species'
import { buyCount, displayCount, producerCost } from '../engine/costs'
import { fmt } from '../engine/format'
import { nextMilestone, type Mods } from '../engine/modifiers'
import { chainRate, incomeBySpecies } from '../engine/production'
import { upcomingThreat } from '../engine/reckoning'
import type { BuyMode, GameState } from '../engine/types'
import { resistLabel } from './Header'
import { ProducerRow } from './ProducerRow'
import { TextBar } from './TextBar'

interface Props {
  state: GameState
  mods: Mods
  onBuy: (k: number, tier: 0 | 1 | 2) => void
  onAbsorb: () => void
  onMode: (m: BuyMode) => void
}

const MODES: BuyMode[] = [1, 10, 'max']

export const SpeciesPanel = memo(function SpeciesPanel({ state, mods, onBuy, onAbsorb, onMode }: Props) {
  const income = incomeBySpecies(state, mods)
  const shown = state.species
    .map((sp, k) => ({ sp, k }))
    .filter(({ sp }) => sp.status === 'active' || sp.status === 'declining')
    .sort((a, b) => b.k - a.k)

  const anyProducer = state.species.some(sp => sp.producers.some(p => p.bought > 0))

  return (
    <section className="stack">
      {shown.map(({ sp, k }) => {
        const def = SPECIES[k]
        const active = sp.status === 'active'
        const rows = ([0, 1, 2] as const).filter(t => t === 0 || sp.producers[t].bought > 0 || state.revealed.includes(`t${t + 1}-${k}`))
        return (
          <article key={k} className={active ? 'panel stack' : 'panel stack panel-fading'}>
            <div className="spread">
              <h2 className="panel-title">
                {def.name} <span className="muted">{def.era}</span>
              </h2>
              <span className={active ? 'accent small' : 'loss small'}>{sp.status}</span>
            </div>

            {active && !state.threat && (() => {
              const next = upcomingThreat(state, k)
              if (!next) return <p className="small muted">A final Threat waits at the end of this era.</p>
              const reqs = Object.entries(next.requirements) as [keyof typeof mods.resist, number][]
              return (
                <p className="small era-ahead">
                  <span className="muted">Era threat ahead:</span> <span className="loss">{next.def.name}</span>
                  <span className="muted">. Needs </span>
                  {reqs.map(([r, n], i) => (
                    <span key={r}>
                      {i > 0 && <span className="muted">, </span>}
                      <span className={mods.resist[r] >= n ? 'accent' : ''}>{resistLabel(r)} {fmt(mods.resist[r])}/{n}</span>
                    </span>
                  ))}
                </p>
              )
            })()}

            {!active && (
              <p className="small">
                <span className="muted">vitality</span> <TextBar value={sp.vitality} className="loss" /> {Math.round(sp.vitality * 100)}%
              </p>
            )}

            {active && k === 0 && (
              <div className="row">
                <button className="absorb" onClick={onAbsorb} aria-keyshortcuts="a">Absorb nutrients</button>
                <span className="muted small">+1 Biomass</span>
              </div>
            )}

            {active && anyProducer && (
              <div className="row small" role="group" aria-label="buy amount">
                <span className="muted">buy</span>
                {MODES.map(m => (
                  <button key={m} className={state.settings.buyMode === m ? 'chip chip-on' : 'chip'} aria-pressed={state.settings.buyMode === m} onClick={() => onMode(m)}>
                    {m}
                  </button>
                ))}
              </div>
            )}

            <div className="producers">
              {rows.map(t => {
                const pdef = def.producers[t]
                const p = sp.producers[t]
                const count = displayCount(pdef, p.bought, state.biomass, state.settings.buyMode)
                const output = t === 0
                  ? `+${fmt(income[k])} B/s`
                  : `+${fmt(chainRate(state, mods, k, t))} ${def.producers[t - 1].name}/s`
                return (
                  <ProducerRow
                    key={t}
                    name={pdef.name}
                    bought={p.bought}
                    amount={p.amount}
                    output={output}
                    cost={producerCost(pdef, p.bought, count)}
                    count={count}
                    affordable={buyCount(pdef, p.bought, state.biomass, state.settings.buyMode) > 0}
                    next={nextMilestone(p.bought)}
                    readOnly={!active}
                    hotkey={String(t + 1)}
                    onBuy={() => onBuy(k, t)}
                  />
                )
              })}
            </div>
          </article>
        )
      })}
    </section>
  )
})
