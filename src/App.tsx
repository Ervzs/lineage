import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GameProvider, hardReset, saveNow, useGameDispatch, useGameState } from './context/GameContext'
import { EVENT_BY_ID } from './data/events'
import { THREAT_BY_ID } from './data/threats'
import { computeMods } from './engine/modifiers'
import { objectiveView } from './engine/objectives'
import { totalPopulation } from './engine/population'
import { totalIncome } from './engine/production'
import { activeIndex } from './engine/state'
import type { BuyMode } from './engine/types'
import { EndScreen } from './ui/EndScreen'
import { EventCard } from './ui/EventCard'
import { GenomePanel } from './ui/GenomePanel'
import { Header } from './ui/Header'
import { LineagePanel } from './ui/LineagePanel'
import { LogPanel } from './ui/LogPanel'
import { MutationsPanel } from './ui/MutationsPanel'
import { ObjectiveBar } from './ui/ObjectiveBar'
import { ReckoningPanel } from './ui/ReckoningPanel'
import { SettingsPanel } from './ui/SettingsPanel'
import { SpeciesPanel } from './ui/SpeciesPanel'
import { Tabs, type TabId } from './ui/Tabs'
import { TraitsPanel } from './ui/TraitsPanel'

const MODES: BuyMode[] = [1, 10, 'max']

function Game() {
  const s = useGameState()
  const dispatch = useGameDispatch()
  const [saved, setSaved] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tab, setTab] = useState<TabId>('species')

  const m = useMemo(() => computeMods(s), [s])
  const income = totalIncome(s, m)
  const objective = objectiveView(s, m)
  const anyProducer = s.species.some(sp => sp.producers.some(p => p.bought > 0))
  const threat = s.reckoning && {
    name: THREAT_BY_ID[s.reckoning.threatId].name,
    level: s.reckoning.level,
    countdown: s.reckoning.countdown,
    resolved: s.reckoning.resolved,
  }

  const onSave = useCallback(() => {
    saveNow(s)
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }, [s])
  const onSettings = useCallback(() => setSettingsOpen(o => !o), [])
  const onBuy = useCallback((k: number, tier: 0 | 1 | 2) => dispatch({ type: 'BUY_PRODUCER', species: k, tier }), [dispatch])
  const onAbsorb = useCallback(() => dispatch({ type: 'ABSORB' }), [dispatch])
  const onMode = useCallback((mode: BuyMode) => dispatch({ type: 'SET_BUY_MODE', mode }), [dispatch])
  const onBuyTrait = useCallback((traitId: string) => dispatch({ type: 'BUY_TRAIT', traitId }), [dispatch])
  const onBuyNode = useCallback((nodeId: string) => dispatch({ type: 'BUY_GENOME_NODE', nodeId }), [dispatch])
  const onResolve = useCallback((optionId: string) => dispatch({ type: 'RESOLVE_EVENT', optionId }), [dispatch])
  const onImport = useCallback((data: string) => dispatch({ type: 'IMPORT_SAVE', data }), [dispatch])
  const onReset = useCallback(() => {
    hardReset(dispatch)
    setTab('species')
  }, [dispatch])
  const onRestart = useCallback(() => {
    if (window.confirm('Start a new run? This run will be deleted.')) onReset()
  }, [onReset])

  // Keyboard: A absorb, 1-3 buy, M buy mode, E default event answer.
  const latest = useRef(s)
  latest.current = s
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      const el = e.target as HTMLElement
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return
      const st = latest.current
      const key = e.key.toLowerCase()
      if (key === 'a') dispatch({ type: 'ABSORB' })
      else if (key === '1' || key === '2' || key === '3') {
        const k = activeIndex(st)
        if (k >= 0) dispatch({ type: 'BUY_PRODUCER', species: k, tier: (Number(key) - 1) as 0 | 1 | 2 })
      } else if (key === 'm') {
        dispatch({ type: 'SET_BUY_MODE', mode: MODES[(MODES.indexOf(st.settings.buyMode) + 1) % MODES.length] })
      } else if (key === 'e' && st.activeEvent) {
        dispatch({ type: 'RESOLVE_EVENT', optionId: EVENT_BY_ID[st.activeEvent.id].defaultOptionId })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch])

  const tabs: TabId[] = ['species']
  if (s.revealed.includes('traits') || s.species.some(sp => sp.traitsBought.length)) tabs.push('traits')
  if (s.species[1].status !== 'locked') tabs.push('lineage')
  if (s.mutations.length) tabs.push('mutations')
  if (s.genomeEarned > 0) tabs.push('genome')
  tabs.push('log')
  const current = tabs.includes(tab) ? tab : 'species'

  return (
    <main className="game">
      <Header
        biomass={s.biomass}
        income={income}
        population={totalPopulation(s)}
        health={s.health}
        genome={s.genome}
        defense={m.defense}
        showRate={anyProducer}
        showGenome={s.genomeEarned > 0}
        showDefense={m.defense > 0}
        threat={threat}
        saved={saved}
        settingsOpen={settingsOpen}
        onSave={onSave}
        onSettings={onSettings}
      />

      {settingsOpen ? (
        <SettingsPanel state={s} onImport={onImport} onReset={onReset} onMode={onMode} />
      ) : s.ending ? (
        <EndScreen state={s} onRestart={onRestart} />
      ) : (
        <>
          {objective && <ObjectiveBar {...objective} />}
          {s.activeEvent && <EventCard eventId={s.activeEvent.id} remaining={s.activeEvent.remaining} mods={m} onResolve={onResolve} />}
          {s.reckoning && <ReckoningPanel reckoning={s.reckoning} defense={m.defense} />}
          <Tabs tabs={tabs} current={current} onSelect={setTab} />
          {current === 'species' && <SpeciesPanel state={s} mods={m} onBuy={onBuy} onAbsorb={onAbsorb} onMode={onMode} />}
          {current === 'traits' && <TraitsPanel state={s} onBuy={onBuyTrait} />}
          {current === 'lineage' && <LineagePanel state={s} />}
          {current === 'mutations' && (
            <MutationsPanel mutations={s.mutations} luck={m.luck} defense={m.defenseMutations} productionBonus={m.productionBonus} />
          )}
          {current === 'genome' && (
            <GenomePanel genome={s.genome} nodes={s.genomeNodes} defense={m.defenseGenome} ended={!!s.ending} onBuy={onBuyNode} />
          )}
          {current === 'log' && <LogPanel log={s.log} />}
        </>
      )}
    </main>
  )
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  )
}
