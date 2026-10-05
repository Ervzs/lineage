import type { ThreatDef } from '../engine/types'

export const THREATS: ThreatDef[] = [
  { id: 'meteor', name: 'Meteor', text: 'A bright point grows in the sky. It does not move.' },
  { id: 'plague', name: 'Plague', text: 'A sickness moves along every trade route.' },
  { id: 'ice-age', name: 'Ice Age', text: 'The summers shorten. The ice does not retreat.' },
  { id: 'supervolcano', name: 'Supervolcano', text: 'The ground warms. Ash rises over the horizon.' },
  { id: 'solar-flare', name: 'Solar Flare', text: 'The sun flares. Every instrument reads the same number.' },
]

export const THREAT_BY_ID: Record<string, ThreatDef> = Object.fromEntries(THREATS.map(t => [t.id, t]))
