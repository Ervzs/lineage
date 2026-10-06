import { memo } from 'react'
import { STAGES } from '../data/stages'
import type { Flows } from '../engine/ecology'
import { fmtInt, fmtPct, fmtRate, fmtTime } from '../engine/format'
import type { ActiveEffect } from '../engine/types'
import { TextBar } from './TextBar'

interface Props {
  stage: number
  owned: string[]
  flows: Flows
  effects: ActiveEffect[]
}

function effectText(e: ActiveEffect) {
  const parts: string[] = []
  if (e.birth !== 1) parts.push(`births x${e.birth}`)
  if (e.death !== 1) parts.push(`deaths x${e.death}`)
  if (e.land !== 1) parts.push(`wild food x${e.land}`)
  return parts.join(', ')
}

export const LifePanel = memo(function LifePanel({ stage, owned, flows: f, effects }: Props) {
  const st = STAGES[stage]
  const have = st.adaptations.filter(a => owned.includes(a.id))
  const deaths = f.natural + f.hunger
  const status = f.births > deaths * 1.02 ? 'Growing' : deaths > f.births * 1.02 ? 'Shrinking' : 'Stable'
  return (
    <div className="stack life">
      <section className="panel stack">
        <h2 className="panel-title">Your species</h2>
        <p className="lead">{st.youAre}</p>
        <p className="muted">{st.about}</p>
        {have.length > 0 && (
          <div className="stack">
            <h3 className="section-title">what they can do now</h3>
            <ul className="plain-list can-do">
              {have.map(a => <li key={a.id}><b>{a.name}.</b> <span className="muted">{a.blurb}</span></li>)}
            </ul>
          </div>
        )}
      </section>

      <section className="panel stack">
        <div className="spread">
          <h2 className="panel-title">Why the population is changing</h2>
          <span className={`state ${status === 'Shrinking' ? 'state-old' : 'state-active'}`}>{status}</span>
        </div>
        <ul className="plain-list reasons">
          <li>
            <span className="num good">+{fmtRate(f.births)}/s</span>
            <span>{f.fed > 0.999 ? `born. Food is plentiful, so many ${st.unit} are born.` : `born. They only get ${fmtPct(f.fed)} of the food they need, so fewer are born.`}</span>
          </li>
          <li>
            <span className="num loss">-{fmtRate(f.natural)}/s</span>
            <span>die of old age and accidents.</span>
          </li>
          {f.hunger > 0.0005 && (
            <li>
              <span className="num loss">-{fmtRate(f.hunger)}/s</span>
              <span>starve. There is not enough {f.limiting} for everyone.</span>
            </li>
          )}
          {effects.map((e, i) => (
            <li key={i}>
              <span className="num accent">{fmtTime(e.remaining)}</span>
              <span><b>{e.label}:</b> {effectText(e)}.</span>
            </li>
          ))}
        </ul>
        <p className="muted small">More food in the wild means more births. Too many {st.unit} eat the wild food faster than it grows back, and then they start to starve.</p>
      </section>

      <section className="panel stack">
        <h2 className="panel-title">Environment</h2>
        {f.res.map(r => (
          <div key={r.def.id} className="resource">
            <div className="spread">
              <span className="resource-name">{r.def.name} <span className="muted small">{r.def.food ? 'food' : 'material'}</span></span>
              <span className="mono small"><TextBar value={r.wild / r.cap} width={16} className={r.wild < r.cap * 0.15 ? 'loss' : 'good'} /> {fmtPct(r.wild / r.cap)} left in the wild</span>
            </div>
            <div className="resource-flow mono small">
              <span>grows back <b>+{fmtRate(r.grown)}/s</b></span>
              <span>gathered <b>{fmtRate(r.gathered)}/s</b></span>
              {r.def.food && <span>eaten <b>{fmtRate(r.eaten)}/s</b></span>}
              <span>saved <b className="good">+{fmtRate(r.stored)}/s</b></span>
              {r.def.food && <span className={r.enough < 0.85 ? 'loss' : ''}>enough for {fmtPct(r.enough)}</span>}
              <span className="muted">wild {fmtInt(r.wild)} / {fmtInt(r.cap)}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
})
