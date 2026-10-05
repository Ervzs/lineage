import { useCallback, useMemo, useState } from 'react'
import { GameProvider, saveNow, useGameDispatch, useGameState } from './context/GameContext'
import { THREAT_BY_ID } from './data/threats'
import { computeMods } from './engine/modifiers'
import { objectiveView } from './engine/objectives'
import { totalPopulation } from './engine/population'
import { totalIncome } from './engine/production'
import type { BuyMode } from './engine/types'
import { Header } from './ui/Header'
import { ObjectiveBar } from './ui/ObjectiveBar'
import { SpeciesPanel } from './ui/SpeciesPanel'

function Game() {
  const s = useGameState()
  const dispatch = useGameDispatch()
  const [saved, setSaved] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

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
      {objective && <ObjectiveBar {...objective} />}
      <SpeciesPanel state={s} mods={m} onBuy={onBuy} onAbsorb={onAbsorb} onMode={onMode} />
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
