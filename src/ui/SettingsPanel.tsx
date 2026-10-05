import { memo, useState } from 'react'
import { exportSave, importSave } from '../engine/save'
import type { BuyMode, GameState } from '../engine/types'

interface Props {
  state: GameState
  onImport: (data: string) => void
  onReset: () => void
  onMode: (m: BuyMode) => void
}

const MODES: BuyMode[] = [1, 10, 'max']

export const SettingsPanel = memo(function SettingsPanel({ state, onImport, onReset, onMode }: Props) {
  const [exported, setExported] = useState('')
  const [input, setInput] = useState('')
  const [message, setMessage] = useState('')

  const doExport = async () => {
    const data = exportSave(state)
    setExported(data)
    try {
      await navigator.clipboard.writeText(data)
      setMessage('Save copied to the clipboard.')
    } catch {
      setMessage('Copy the save text below.')
    }
  }

  const doImport = () => {
    if (!importSave(input)) {
      setMessage('That save text is not valid. Paste the full exported text and try again.')
      return
    }
    onImport(input)
    setInput('')
    setMessage('Save imported.')
  }

  const doReset = () => {
    if (window.confirm('Delete this run and start over? This cannot be undone.')) {
      onReset()
      setMessage('A new run has started.')
    }
  }

  return (
    <section className="panel stack settings">
      <h2 className="panel-title">Settings</h2>

      <div className="stack">
        <h3 className="section-title">default buy amount</h3>
        <div className="row" role="group" aria-label="default buy amount">
          {MODES.map(m => (
            <button key={m} className={state.settings.buyMode === m ? 'chip chip-on' : 'chip'} aria-pressed={state.settings.buyMode === m} onClick={() => onMode(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="stack">
        <h3 className="section-title">export save</h3>
        <div><button onClick={doExport}>Copy save text</button></div>
        {exported && <textarea readOnly value={exported} aria-label="exported save" onFocus={e => e.currentTarget.select()} />}
      </div>

      <div className="stack">
        <h3 className="section-title">import save</h3>
        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste save text here" aria-label="save to import" />
        <div><button onClick={doImport} disabled={!input.trim()}>Import save</button></div>
      </div>

      <div className="stack">
        <h3 className="section-title">hard reset</h3>
        <div><button className="danger" onClick={doReset}>Delete run and start over</button></div>
      </div>

      {message && <p className="accent small" role="status">{message}</p>}
    </section>
  )
})
