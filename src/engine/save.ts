import { SAVE_KEY, SAVE_VERSION } from '../data/constants'
import { STAGES } from '../data/stages'
import { initialState } from './state'
import type { GameState } from './types'

export const serialize = (s: GameState) => JSON.stringify(s)

// Missing fields take their defaults. Saves from before the redo are not loaded.
export function migrate(raw: Record<string, unknown>): GameState {
  const base = initialState(typeof raw.seed === 'number' ? raw.seed : undefined)
  return { ...base, ...raw, version: SAVE_VERSION } as GameState
}

function valid(raw: unknown): raw is Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return false
  const r = raw as Record<string, unknown>
  return r.version === SAVE_VERSION &&
    typeof r.stage === 'number' && r.stage >= 0 && r.stage < STAGES.length &&
    typeof r.pop === 'number' && Number.isFinite(r.pop) &&
    !!r.wild && typeof r.wild === 'object' && !!r.store && typeof r.store === 'object' &&
    Array.isArray(r.log) && Array.isArray(r.owned)
}

export function deserialize(json: string): GameState | null {
  try {
    const raw = JSON.parse(json)
    return valid(raw) ? migrate(raw) : null
  } catch {
    return null
  }
}

// btoa only takes Latin-1, so encode UTF-8 bytes first.
export function exportSave(s: GameState): string {
  const bytes = new TextEncoder().encode(serialize(s))
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

export function importSave(text: string): GameState | null {
  try {
    const bin = atob(text.trim())
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
    return deserialize(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

export function loadLocal(): GameState | null {
  try {
    const json = localStorage.getItem(SAVE_KEY)
    return json ? deserialize(json) : null
  } catch {
    return null
  }
}

export function saveLocal(s: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, serialize(s))
  } catch {
    // Storage full or blocked. The game keeps running.
  }
}

export function clearLocal() {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // ignore
  }
}
