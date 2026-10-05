// npm run balance — simulates full runs with a bot and checks the balance laws (PLAN.md section 20).
import { writeFileSync } from 'node:fs'
import { BALANCE_CEILING, EVO_NEEDED, GENOME_FACTOR, THREAT_LEVEL } from '../src/data/constants'
import { EVENT_BY_ID, EVENTS } from '../src/data/events'
import { GENOME_NODES } from '../src/data/genomeNodes'
import { RARITIES } from '../src/data/mutations'
import { SPECIES } from '../src/data/species'
import { TRAITS, traitId } from '../src/data/traits'
import { buyCount, producerCost, traitCost } from '../src/engine/costs'
import { canBuyTrait } from '../src/engine/evolution'
import { fmt, fmtTime } from '../src/engine/format'
import { canBuyNode } from '../src/engine/genome'
import { computeMods, type Mods } from '../src/engine/modifiers'
import { giftCheck, rarityOdds, rollRarity } from '../src/engine/mutations'
import { totalIncome } from '../src/engine/production'
import { gameReducer } from '../src/engine/reducer'
import { activeIndex, initialState } from '../src/engine/state'
import type { Branch, EventOption, GameState } from '../src/engine/types'

const STEP = 0.5
const MAX_TIME = 12 * 3600
const CLICKS_PER_SECOND = 4

// ---------- policies ----------

interface Policy { name: string; order: [Branch, number][]; oldBranches: Branch[] }

const seq = (branches: Branch[]): [Branch, number][] => branches.flatMap(b => [1, 2, 3].map(t => [b, t] as [Branch, number]))

const POLICIES: Policy[] = [
  {
    name: 'balanced',
    order: [1, 2, 3].flatMap(t => (['growth', 'survival', 'cunning'] as Branch[]).map(b => [b, t] as [Branch, number])),
    oldBranches: ['growth', 'survival', 'cunning'],
  },
  { name: 'growth-only', order: seq(['growth', 'cunning', 'survival']), oldBranches: ['growth', 'cunning'] },
  { name: 'survival-first', order: seq(['survival', 'growth', 'cunning']), oldBranches: ['survival', 'growth', 'cunning'] },
  { name: 'cunning-first', order: seq(['cunning', 'growth', 'survival']), oldBranches: ['cunning', 'growth', 'survival'] },
]

// ---------- event valuation (production-seconds) ----------

function optionLoss(o: EventOption, ratio: number): number {
  return o.outcomes.reduce((sum, x) =>
    sum + x.chance * ((x.biomassLossPct ?? 0) / 100 * ratio + (x.populationLossPct ?? 0) / 100 * (x.recoverSeconds ?? 0) / 2), 0)
}

function optionGain(o: EventOption): number {
  return o.outcomes.reduce((sum, x) =>
    sum + x.chance * ((x.biomassGainSeconds ?? 0) + ((x.productionMult ?? 1) - 1) * (x.durationSeconds ?? 0)), 0)
}

function bestOption(eventId: string, ratio: number): string {
  const def = EVENT_BY_ID[eventId]
  const score = (o: EventOption) => (def.kind === 'boost' ? -optionGain(o) : optionLoss(o, ratio))
  return [...def.options].sort((a, b) => score(a) - score(b))[0].id
}

// ---------- bot ----------

interface SpeciesReport {
  meterAt: (number | null)[]
  bornAt: number | null
  biomassAtBirth: number
  incomeAtBirth: number
  oldSurvivalCost: { species: number; seconds: number }[]
}

interface RunReport {
  policy: string
  answer: 'default' | 'best'
  ending: string
  time: number
  maxBiomass: number
  genomeEarned: number
  defense: number
  defenseParts: string
  species: SpeciesReport[]
  peak: number[]
  genomeBySpecies: number[]
  defenseBySpecies: number[]
  longestWait: number
  longestWaitAt: number
  ratios: number[]
  badNumber: boolean
  mutations: number
}

function nextTrait(s: GameState, k: number, p: Policy): string | null {
  for (const [b, t] of p.order) {
    const id = traitId(k, b, t)
    if (!s.species[k].traitsBought.includes(id)) {
      const def = TRAITS.find(x => x.id === id)!
      const unlocked = def.requires.every(r => s.species[k].traitsBought.includes(r)) &&
        (def.requiresAny.length === 0 || def.requiresAny.some(r => s.species[k].traitsBought.includes(r)))
      if (unlocked) return id
    }
  }
  return null
}

// Seconds until a producer pays for itself (tier 2 and 3 grow polynomially).
function payback(s: GameState, m: Mods, k: number, tier: number, income: number): number {
  const def = SPECIES[k].producers[tier]
  const cost = producerCost(def, s.species[k].producers[tier].bought)
  const perT1 = SPECIES[k].producers[0].baseRate * m.tierMult[k][0] * (income > 0 ? (1 + m.chainBonus[k]) * (1 + m.productionBonus) * m.health : 1)
  if (tier === 0) return cost / perT1
  if (tier === 1) return Math.sqrt(cost / (0.05 * m.tierMult[k][1] * perT1))
  return Math.cbrt(6 * cost / (0.01 * m.tierMult[k][1] * m.tierMult[k][2] * perT1))
}

function simulate(policy: Policy, answer: 'default' | 'best', seed: number): RunReport {
  let s = initialState(seed)
  const species: SpeciesReport[] = SPECIES.map(() => ({ meterAt: [null, null, null, null], bornAt: null, biomassAtBirth: 0, incomeAtBirth: 0, oldSurvivalCost: [] }))
  species[0].bornAt = 0
  let maxBiomass = 0
  let lastBuy = 0
  let longestWait = 0
  let longestWaitAt = 0
  const ratios: number[] = []
  let badNumber = false
  let seenEvents = 0
  let defenseAtImpact = 0

  const bought = () => {
    const wait = s.playTime - lastBuy
    if (wait > longestWait && !s.reckoning?.resolved) {
      longestWait = wait
      longestWaitAt = lastBuy
    }
    lastBuy = s.playTime
  }

  while (!s.ending && s.playTime < MAX_TIME) {
    const prevActive = activeIndex(s)
    let m = computeMods(s)
    let income = totalIncome(s, m)

    // Absorb clicks while income is tiny.
    if (s.species[0].status === 'active' && income < CLICKS_PER_SECOND) {
      for (let i = 0; i < CLICKS_PER_SECOND * STEP; i++) s = gameReducer(s, { type: 'ABSORB' })
    }

    // Events.
    if (s.activeEvent) {
      if (s.stats.eventsSeen > seenEvents && income > 0) ratios.push(s.biomass / income)
      seenEvents = s.stats.eventsSeen
      const id = answer === 'best' ? bestOption(s.activeEvent.id, income > 0 ? s.biomass / income : 0) : EVENT_BY_ID[s.activeEvent.id].defaultOptionId
      s = gameReducer(s, { type: 'RESOLVE_EVENT', optionId: id })
    }

    // Genome nodes: cheapest affordable first.
    for (const n of [...GENOME_NODES].sort((a, b) => a.cost - b.cost)) {
      if (canBuyNode(s, n.id)) s = gameReducer(s, { type: 'BUY_GENOME_NODE', nodeId: n.id })
    }

    const k = activeIndex(s)
    const inReckoning = !!s.reckoning && !s.reckoning.resolved

    // Traits of the active species, in policy order.
    let target: string | null = null
    if (k >= 0) {
      for (let guard = 0; guard < 9; guard++) {
        const id = nextTrait(s, k, policy)
        if (!id) break
        if (canBuyTrait(s, id)) {
          s = gameReducer(s, { type: 'BUY_TRAIT', traitId: id })
          bought()
          if (activeIndex(s) !== k) break
        } else {
          target = id
          break
        }
      }
    }

    // Traits of old species: cheap ones once the new species produces, or anything during the Reckoning.
    const started = k >= 0 && s.species[k].producers[0].bought > 0
    for (const t of TRAITS) {
      if (!started && !inReckoning) break
      if (s.species[t.species].status === 'active' || !policy.oldBranches.includes(t.branch)) continue
      if (!canBuyTrait(s, t.id)) continue
      const cost = traitCost(s, t)
      if (inReckoning || cost <= s.biomass * 0.25) {
        s = gameReducer(s, { type: 'BUY_TRAIT', traitId: t.id })
        bought()
      }
    }

    // Producers by payback, keeping savings for a trait that is close.
    const k2 = activeIndex(s)
    if (k2 >= 0) {
      for (let guard = 0; guard < 200; guard++) {
        m = computeMods(s)
        income = totalIncome(s, m)
        const tCost = target && s.species[k2].status === 'active' ? traitCost(s, TRAITS.find(x => x.id === target)!) : Infinity
        const reserve = tCost <= Math.max(income, 1) * 30 ? tCost : 0
        let best = -1
        let bestPay = Infinity
        for (const tier of [0, 1, 2]) {
          const def = SPECIES[k2].producers[tier]
          const cost = producerCost(def, s.species[k2].producers[tier].bought)
          if (s.biomass - cost < reserve) continue
          const pb = payback(s, m, k2, tier, income)
          if (pb < bestPay) {
            bestPay = pb
            best = tier
          }
        }
        if (best < 0) break
        const def = SPECIES[k2].producers[best]
        if (buyCount(def, s.species[k2].producers[best].bought, s.biomass, 1) <= 0) break
        s = gameReducer(s, { type: 'SET_BUY_MODE', mode: 1 })
        s = gameReducer(s, { type: 'BUY_PRODUCER', species: k2, tier: best as 0 | 1 | 2 })
        bought()
      }
    }

    const wasPending = !!s.reckoning && !s.reckoning.resolved
    const before = computeMods(s).defense
    s = gameReducer(s, { type: 'TICK', dt: STEP })
    if (wasPending && s.reckoning?.resolved) defenseAtImpact = before

    // Bookkeeping.
    maxBiomass = Math.max(maxBiomass, s.biomass)
    if (!Number.isFinite(s.biomass) || Number.isNaN(s.biomass) || !Number.isFinite(s.health)) badNumber = true
    s.species.forEach((sp, i) => {
      const meter = sp.evoPoints / EVO_NEEDED
      ;[0.25, 0.5, 0.75, 1].forEach((q, j) => {
        if (meter >= q && species[i].meterAt[j] === null) species[i].meterAt[j] = s.playTime
      })
    })
    const nowActive = activeIndex(s)
    if (nowActive !== prevActive && nowActive > 0 && species[nowActive].bornAt === null) {
      const mm = computeMods(s)
      const inc = totalIncome(s, mm)
      species[nowActive].bornAt = s.playTime
      species[nowActive].biomassAtBirth = s.biomass
      species[nowActive].incomeAtBirth = inc
      for (let j = 0; j < nowActive; j++) {
        const cost = TRAITS.filter(t => t.species === j && t.branch === 'survival').reduce((sum, t) => sum + traitCost(s, t), 0)
        species[nowActive].oldSurvivalCost.push({ species: j, seconds: cost / Math.max(inc, 1e-9) })
      }
    }
  }

  const m = computeMods(s)
  const defenseBySpecies = s.species.map(sp => sp.traitsBought.reduce((sum, id) => {
    const t = TRAITS.find(x => x.id === id)!
    return sum + t.effects.filter(e => e.target === 'defense.flat').reduce((a, e) => a + e.value, 0)
  }, 0))
  return {
    policy: policy.name,
    answer,
    ending: s.ending ?? (s.reckoning?.resolved ? 'extinct (fading)' : 'none'),
    time: s.playTime,
    maxBiomass,
    genomeEarned: s.genomeEarned,
    defense: defenseAtImpact,
    defenseParts: `traits ${m.defenseTraits} + genome ${m.defenseGenome} + mutations ${m.defenseMutations}`,
    species,
    peak: s.species.map(sp => sp.peakPopulation),
    genomeBySpecies: s.species.map(sp => (sp.genomePaid ? Math.round(GENOME_FACTOR * Math.log10(Math.max(sp.peakPopulation, 1))) : 0)),
    defenseBySpecies,
    longestWait,
    longestWaitAt,
    ratios,
    badNumber,
    mutations: s.mutations.length,
  }
}

// ---------- report ----------

const out: string[] = []
const line = (t = '') => {
  console.log(t)
  out.push(t)
}
const t = (x: number | null) => (x === null ? '-' : fmtTime(x))

const runs: RunReport[] = []
for (const p of POLICIES) runs.push(simulate(p, 'default', 12345))
runs.push(simulate(POLICIES[0], 'best', 12345))

line('# Lineage balance report')
line()
line('Bot: buys producers by payback, Traits by policy, Genome nodes cheapest first. Events answered at once.')
line(`Threat level ${THREAT_LEVEL}. Simulation step ${STEP} s. Seed 12345.`)

for (const r of runs) {
  line()
  line(`## ${r.policy} (events: ${r.answer})`)
  line()
  line(`Ending: ${r.ending} after ${fmtTime(r.time)}. Defense at impact ${r.defense} (final: ${r.defenseParts}). Genome earned ${r.genomeEarned}. Mutations ${r.mutations}. Max Biomass ${fmt(r.maxBiomass)}.`)
  line(`Longest wait between purchases: ${fmtTime(r.longestWait)} (from ${fmtTime(r.longestWaitAt)}).`)
  line()
  line('| Species | Born | 25% | 50% | 75% | 100% | Biomass at birth | Income at birth | Anchor ratio | Peak pop | Genome | Defense |')
  line('|---|---|---|---|---|---|---|---|---|---|---|---|')
  r.species.forEach((sp, i) => {
    const ratio = sp.incomeAtBirth > 0 ? `${(SPECIES[i].anchor / sp.incomeAtBirth / 60).toFixed(2)} min` : '-'
    line(`| ${SPECIES[i].name} | ${t(sp.bornAt)} | ${sp.meterAt.map(t).join(' | ')} | ${fmt(sp.biomassAtBirth)} | ${fmt(sp.incomeAtBirth)}/s | ${ratio} | ${fmt(r.peak[i])} | ${r.genomeBySpecies[i]} | ${r.defenseBySpecies[i]} |`)
  })
}

// ---------- checks ----------

const results: [string, boolean | null, string][] = []
const balanced = runs[0]

results.push(['1. No NaN or Infinity', !runs.some(r => r.badNumber), ''])
const maxB = Math.max(...runs.map(r => r.maxBiomass))
results.push(['2. Biomass maximum below 1e66', maxB < BALANCE_CEILING, `max ${fmt(maxB)}`])
const growth = runs.find(r => r.policy === 'growth-only')!
results.push(['3. balanced survives, growth-only fails', balanced.ending === 'survived' && growth.ending !== 'survived',
  `balanced: ${balanced.ending} (defense ${balanced.defense}), growth-only: ${growth.ending} (defense ${growth.defense})`])

const anchorRatios = balanced.species.slice(1).map((sp, i) => SPECIES[i + 1].anchor / sp.incomeAtBirth / 60)
results.push(['4. Anchor ratio between 1 and 4 minutes', anchorRatios.every(x => x >= 1 && x <= 4),
  anchorRatios.map(x => (Number.isFinite(x) ? x.toFixed(2) : '-')).join(', ')])

const nodeCost = GENOME_NODES.reduce((a, n) => a + n.cost, 0)
const gPct = balanced.genomeEarned / nodeCost
results.push(['5. Genome earned 80-110% of node cost', gPct >= 0.8 && gPct <= 1.1, `${balanced.genomeEarned} / ${nodeCost} = ${(gPct * 100).toFixed(0)}%`])

const ratio = balanced.ratios.length ? balanced.ratios.reduce((a, b) => a + b, 0) / balanced.ratios.length : 900
const eventLines: string[] = []
let eventsOk = true
for (const e of EVENTS) {
  if (!e.options.some(o => o.outcomes.length > 1)) continue
  const def = e.options.find(o => o.id === e.defaultOptionId)!
  const best = Math.min(...e.options.map(o => optionLoss(o, ratio)))
  const r = best / optionLoss(def, ratio)
  if (r < 0.8 || r > 0.9) eventsOk = false
  eventLines.push(`${e.name} ${(r * 100).toFixed(0)}%`)
}
results.push(['6. Best option 80-90% of default loss', eventsOk, `ratio ${ratio.toFixed(0)} s: ${eventLines.join(', ')}`])

{
  const rng = { rngState: 777 }
  const N = 1_000_000
  const check = (luck: number) => {
    const counts = Object.fromEntries(RARITIES.map(r => [r, 0])) as Record<string, number>
    for (let i = 0; i < N; i++) counts[rollRarity(rng, luck)]++
    const odds = rarityOdds(luck)
    return RARITIES.every(r => Math.abs(counts[r] / N * 100 - odds[r]) <= 0.2)
  }
  const a = check(0)
  const b = check(30)
  const gs = initialState(99)
  const mods = { ...computeMods(gs), giftChance: 25 }
  let gifts = 0
  const G = 100_000
  for (let i = 0; i < G; i++) {
    gs.mutations = []
    giftCheck(gs, mods, 's1-growth1')
    if (gs.mutations.length) gifts++
  }
  const rate = gifts / G * 100
  results.push(['7. Rarity and gift distribution', a && b && Math.abs(rate - 25) <= 0.5, `luck 0: ${a ? 'ok' : 'off'}, luck 30: ${b ? 'ok' : 'off'}, gift rate ${rate.toFixed(2)}% (target 25%)`])
}

results.push(['8. Longest wait for next purchase (report)', null, `balanced ${fmtTime(balanced.longestWait)} at ${fmtTime(balanced.longestWaitAt)}`])

const late = balanced.species.map((sp, i) => sp.oldSurvivalCost.length
  ? `${SPECIES[i].name} birth: ${sp.oldSurvivalCost.map(c => `${SPECIES[c.species].name} ${fmtTime(c.seconds)}`).join(', ')}`
  : '').filter(Boolean)
results.push(['9. Late adaptation cost (report)', null, 'old Survival branch cost in income-seconds'])

line()
line('## Checks')
line()
for (const [name, ok, detail] of results) line(`- ${ok === null ? 'INFO' : ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
line()
line('### Late adaptation cost (balanced)')
line()
for (const l of late) line(`- ${l}`)

writeFileSync('balance-report.md', out.join('\n') + '\n')
