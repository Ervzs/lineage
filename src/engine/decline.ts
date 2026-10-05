import { SPECIES } from '../data/species'
import { genomeGain } from './genome'
import { addLog, isLiving } from './state'
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

// Soft-lock guard: if nothing produces any more and the active species cannot
// afford its first producer, grant exactly that cost so the run can continue.
export function rescueIfStuck(s: GameState) {
  const k = s.species.findIndex(sp => sp.status === 'active')
  if (k < 0) return
  const producing = s.species.some(sp => isLiving(sp) && sp.producers[0].amount > 0)
  const first = SPECIES[k].producers[0].baseCost
  if (producing || s.species[k].producers[0].bought > 0 || s.biomass >= first) return
  s.biomass = first
  addLog(s, 'The last survivors gather enough to start again.', 'system')
}
