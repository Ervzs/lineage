import { memo } from 'react'
import { FOSSIL_UPGRADES, type FossilUpgradeDef } from '../data/fossilUpgrades'
import { fmt } from '../engine/format'
import { canBuyUpgrade, upgradeCost } from '../engine/rebirth'
import type { GameState } from '../engine/types'

function effectText(u: FossilUpgradeDef, level: number): string {
  const v = Math.min(level, u.max ?? Infinity) * u.perLevel
  switch (u.id) {
    case 'vigor': return `production +${Math.round(v * 100)}%`
    case 'hide': return `all resistances +${Math.round(v * 100)}%`
    case 'adapt': return `Trait costs -${Math.round(v * 100)}%`
    case 'luck': return `gift chance +${v}%`
    case 'record': return `Fossils +${Math.round(v * 100)}%`
    default: return ''
  }
}

export const FossilsPanel = memo(function FossilsPanel({ state, onBuy }: { state: GameState; onBuy: (id: string) => void }) {
  const { meta } = state
  return (
    <section className="stack">
      <p className="row">
        <span><span className="muted">Fossils</span> {fmt(meta.fossils)}</span>
        <span><span className="muted">Epoch</span> {meta.epoch}</span>
        <span><span className="muted">Best Epoch survived</span> {meta.bestEpoch || 'none yet'}</span>
      </p>
      <p className="muted small">Fossil upgrades are permanent. They stay through every rebirth.</p>
      <ul className="plain-list genome-list">
        {FOSSIL_UPGRADES.map(u => {
          const level = meta.upgrades[u.id] ?? 0
          const maxed = u.max !== undefined && level >= u.max
          return (
            <li key={u.id} className="trait genome-node">
              <div className="genome-info">
                <span className="trait-name">{u.name} <span className="muted small">level {level}</span></span>
                <span className="muted small">{u.flavor}</span>
                <span className="small">
                  now {effectText(u, level) }{!maxed && <span className="muted">, next {effectText(u, level + 1)}</span>}
                </span>
              </div>
              <div className="genome-buy">
                {maxed ? (
                  <span className="accent small">max</span>
                ) : (
                  <>
                    <span className={meta.fossils >= upgradeCost(state, u.id) ? 'small' : 'muted small'}>cost {fmt(upgradeCost(state, u.id))}</span>
                    <button disabled={!canBuyUpgrade(state, u.id)} onClick={() => onBuy(u.id)}>buy</button>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
})
