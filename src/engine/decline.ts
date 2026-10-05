import { SPECIES } from '../data/species'
import { genomeGain } from './genome'
import { addLog } from './state'
import type { GameState } from './types'

export function stepDecline(s: GameState, dt: number) {
  s.species.forEach((sp, k) => {
    if (sp.status !== 'declining') return
    sp.declineElapsed += dt
    sp.vitality = Math.max(0, 1 - sp.declineElapsed / SPECIES[k].declineSeconds)
  })
}

export function checkExtinctions(s: GameState) {
  s.species.forEach((sp, k) => {
    if (sp.status !== 'declining' || sp.vitality > 0) return
    sp.status = 'extinct'
    addLog(s, SPECIES[k].extinctText, 'story')
    if (!sp.genomePaid) {
      const gain = genomeGain(sp.peakPopulation)
      sp.genomePaid = true
      s.genome += gain
      s.genomeEarned += gain
      addLog(s, `${SPECIES[k].name} leave ${gain} Genome behind.`, 'system')
    }
  })
}
