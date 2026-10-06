import { useCallback, useMemo, useState } from 'react'
import { GameProvider, hardReset, saveNow, useGameDispatch, useGameState } from './context/GameContext'
import { STAGES } from './data/stages'
import { keySteps, keysOwned } from './engine/disaster'
import { canBuy, canSpark, perSecond } from './engine/ecology'
import { revealed } from './engine/story'
import type { GameState } from './engine/types'
import { AdaptationsPanel } from './ui/AdaptationsPanel'
import { EndScreen } from './ui/EndScreen'
import { Header } from './ui/Header'
import { HistoryPanel } from './ui/HistoryPanel'
import { StartPanel } from './ui/StartPanel'
import { LifePanel } from './ui/LifePanel'
import { LogPanel } from './ui/LogPanel'
import { ObjectiveBar } from './ui/ObjectiveBar'
import { SettingsPanel } from './ui/SettingsPanel'
import { Tabs, type TabId } from './ui/Tabs'

// One short next step, in plain words.
function hint(s: GameState) {
  const st = STAGES[s.stage]
  const keys = keySteps(s.stage).length
  const done = keysOwned(s)
  if (s.pop === 0) {
    return { text: canSpark(s) ? 'You have enough. Start life.' : 'Click Gather chemicals to collect minerals and heat.' }
  }
  if (!revealed(s, 'adapt')) return { text: `Watch your ${st.unit}. The log tells you what they are doing.` }
  if (st.adaptations.some(a => canBuy(s, a.id))) return { text: 'You can afford an adaptation. Open the adaptations tab.' }
  if (!st.adaptations.some(a => s.owned.includes(a.id))) {
    return { text: `Your ${st.unit} save part of the food they gather. When enough is saved, buy an adaptation.` }
  }
  if (done < keys) return { text: 'Evolution steps bought', current: done, target: keys }
  return { text: `All evolution steps bought. Keep your ${st.unit} alive; their time to change will come.` }
}

function Game() {
  const s = useGameState()
  const dispatch = useGameDispatch()
  const [saved, setSaved] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tab, setTab] = useState<TabId>('life')

  const flows = useMemo(() => perSecond(s), [s])

  const onSave = useCallback(() => {
    saveNow(s)
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }, [s])
  const onSettings = useCallback(() => setSettingsOpen(o => !o), [])
  const onGather = useCallback(() => dispatch({ type: 'GATHER' }), [dispatch])
  const onSpark = useCallback(() => dispatch({ type: 'SPARK' }), [dispatch])
  const onBuy = useCallback((id: string) => dispatch({ type: 'BUY_ADAPTATION', id }), [dispatch])
  const onImport = useCallback((data: string) => dispatch({ type: 'IMPORT_SAVE', data }), [dispatch])
  const onReset = useCallback(() => {
    hardReset(dispatch)
    setTab('life')
  }, [dispatch])
  const onNewRun = useCallback(() => {
    dispatch({ type: 'NEW_RUN' })
    setTab('life')
  }, [dispatch])

  const tabs: TabId[] = ['life']
  if (revealed(s, 'adapt')) tabs.push('adaptations')
  if (s.history.length) tabs.push('history')
  const current = tabs.includes(tab) ? tab : 'life'

  return (
    <div className="layout">
      <main className="game">
        <Header
          stage={s.stage}
          pop={s.pop}
          flows={flows}
          store={s.store}
          saved={saved}
          settingsOpen={settingsOpen}
          onSave={onSave}
          onSettings={onSettings}
        />

        {settingsOpen ? (
          <div className="content"><SettingsPanel state={s} onImport={onImport} onReset={onReset} /></div>
        ) : s.ending ? (
          <div className="content"><EndScreen state={s} onNewRun={onNewRun} /></div>
        ) : (
          <>
            <ObjectiveBar {...hint(s)} />
            <Tabs tabs={tabs} current={current} onSelect={setTab} />
            <div className="content">
              {current === 'life' && STAGES[s.stage].spark && <StartPanel store={s.store} alive={s.pop > 0} onGather={onGather} onSpark={onSpark} />}
              {current === 'life' && (
                <LifePanel stage={s.stage} owned={s.owned} flows={flows} effects={s.effects} alive={s.pop > 0} showEnv={revealed(s, 'env')} />
              )}
              {current === 'adaptations' && <AdaptationsPanel state={s} onBuy={onBuy} />}
              {current === 'history' && <HistoryPanel history={s.history} />}
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
