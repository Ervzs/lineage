import type { ThreatDef } from '../engine/types'

export const THREATS: ThreatDef[] = [
  { id: 'meteor', name: 'Meteor', text: 'A bright point grows in the sky. It does not move.', checks: ['toughness'] },
  { id: 'plague', name: 'Plague', text: 'A sickness moves along every trade route.', checks: ['immunity'] },
  { id: 'ice-age', name: 'Ice Age', text: 'The summers shorten. The ice does not retreat.', checks: ['endurance'] },
  { id: 'supervolcano', name: 'Supervolcano', text: 'The ground warms. Ash rises over the horizon.', checks: ['endurance', 'toughness'] },
  { id: 'solar-flare', name: 'Solar Flare', text: 'The sun flares. Every instrument reads the same number.', checks: ['toughness', 'immunity'] },
]

export const THREAT_BY_ID: Record<string, ThreatDef> = Object.fromEntries(THREATS.map(t => [t.id, t]))
