import { memo } from 'react'
import { GENOME_NODE_BY_ID, GENOME_NODES } from '../data/genomeNodes'
import { fmt } from '../engine/format'

interface Props { genome: number; nodes: string[]; defense: number; ended: boolean; onBuy: (id: string) => void }

export const GenomePanel = memo(function GenomePanel({ genome, nodes, defense, ended, onBuy }: Props) {
  return (
    <section className="stack">
      <p className="row">
        <span><span className="muted">Genome</span> {fmt(genome)}</span>
        <span><span className="muted">Defense from Genome</span> {fmt(defense)}</span>
      </p>
      <ul className="plain-list genome-list">
        {GENOME_NODES.map(n => {
          const owned = nodes.includes(n.id)
          const unlocked = n.requires.every(r => nodes.includes(r))
          return (
            <li key={n.id} className={owned ? 'trait trait-owned genome-node' : unlocked ? 'trait genome-node' : 'trait trait-locked genome-node'}>
              <div className="genome-info">
                <span className="trait-name">{n.name}</span>
                <span className="muted small">{n.flavor}</span>
                <span className="small">
                  Defense +{n.defense}
                  {n.requires.length > 0 && <span className="muted">, needs {n.requires.map(r => GENOME_NODE_BY_ID[r].name).join(' and ')}</span>}
                </span>
              </div>
              <div className="genome-buy">
                {owned ? (
                  <span className="accent small">owned</span>
                ) : (
                  <>
                    <span className={genome >= n.cost ? 'small' : 'muted small'}>cost {n.cost}</span>
                    <button disabled={!unlocked || genome < n.cost || ended} onClick={() => onBuy(n.id)}>
                      {unlocked ? 'buy' : 'locked'}
                    </button>
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
