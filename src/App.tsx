import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GameProvider, hardReset, saveNow, useGameDispatch, useGameState } from './context/GameContext'
import { EVENT_BY_ID } from './data/events'
import { computeMods } from './engine/modifiers'
import { objectiveView } from './engine/objectives'
import { totalPopulation } from './engine/population'
import { totalIncome } from './engine/production'
import { activeIndex } from './engine/state'
import type { BuyMode } from './engine/types'
import { EndScreen } from './ui/EndScreen'
import { EventCard } from './ui/EventCard'
import { FossilsPanel } from './ui/FossilsPanel'
import { GenomePanel } from './ui/GenomePanel'
import { Header } from './ui/Header'
import { LineagePanel } from './ui/LineagePanel'
import { LogPanel } from './ui/LogPanel'
import { MutationsPanel } from './ui/MutationsPanel'
import { ObjectiveBar } from './ui/ObjectiveBar'
import { SettingsPanel } from './ui/SettingsPanel'
import { SpeciesPanel } from './ui/SpeciesPanel'
import { ThreatPanel } from './ui/ThreatPanel'
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
  const onLevelTrait = useCallback((traitId: string) => dispatch({ type: 'LEVEL_TRAIT', traitId }), [dispatch])
  const onBuyFossil = useCallback((id: string) => dispatch({ type: 'BUY_FOSSIL_UPGRADE', id }), [dispatch])
  const onBuyNode = useCallback((nodeId: string) => dispatch({ type: 'BUY_GENOME_NODE', nodeId }), [dispatch])
  const onResolve = useCallback((optionId: string) => dispatch({ type: 'RESOLVE_EVENT', optionId }), [dispatch])
  const onImport = useCallback((data: string) => dispatch({ type: 'IMPORT_SAVE', data }), [dispatch])
  const onReset = useCallback(() => {
    hardReset(dispatch)
    setTab('species')
  }, [dispatch])
  const onRebirth = useCallback(() => {
    if (window.confirm('Rebirth into a new Epoch? Only Fossils and Fossil upgrades carry over.')) {
      dispatch({ type: 'REBIRTH' })
      setTab('species')
    }
  }, [dispatch])

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
  if (s.meta.epoch > 1 || s.meta.fossilsEarned > 0) tabs.push('fossils')
  const current = tabs.includes(tab) ? tab : 'species'

  return (
    <div className="layout">
      <main className="game">
      <Header
        biomass={s.biomass}
        income={income}
        population={totalPopulation(s)}
        health={s.health}
        genome={s.genome}
        resist={m.resist}
        epoch={s.meta.epoch}
        fossils={s.meta.fossils}
        showRate={anyProducer}
        showGenome={s.genomeEarned > 0}
        showFossils={s.meta.epoch > 1 || s.meta.fossilsEarned > 0}
        saved={saved}
        settingsOpen={settingsOpen}
        onSave={onSave}
        onSettings={onSettings}
      />

      {settingsOpen ? (
        <div className="content"><SettingsPanel state={s} onImport={onImport} onReset={onReset} onMode={onMode} /></div>
      ) : s.ending ? (
        <div className="content"><EndScreen state={s} onRebirth={onRebirth} /></div>
      ) : (
        <>
          {objective && <ObjectiveBar {...objective} />}
          {s.threat && <ThreatPanel threat={s.threat} resist={m.resist} />}
          {s.activeEvent && <EventCard eventId={s.activeEvent.id} mods={m} onResolve={onResolve} />}
          <Tabs tabs={tabs} current={current} onSelect={setTab} />
          <div className="content">
          {current === 'species' && <SpeciesPanel state={s} mods={m} onBuy={onBuy} onAbsorb={onAbsorb} onMode={onMode} />}
          {current === 'traits' && <TraitsPanel state={s} onBuy={onBuyTrait} onLevel={onLevelTrait} />}
          {current === 'lineage' && <LineagePanel state={s} />}
          {current === 'mutations' && (
            <MutationsPanel mutations={s.mutations} luck={m.luck} resist={m.resistMutations} productionBonus={m.productionBonus} />
          )}
          {current === 'genome' && (
            <GenomePanel genome={s.genome} nodes={s.genomeNodes} resist={m.resistGenome} ended={!!s.ending} onBuy={onBuyNode} />
          )}
          {current === 'fossils' && <FossilsPanel state={s} onBuy={onBuyFossil} />}
          </div>
        </>
      )}
      </main>
      <LogPanel log={s.log} />
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  )
}
