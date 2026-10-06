import type { AdaptationDef, ResourceDef, StageDef } from '../../engine/types'
import {
  BASE_REGEN, CAP_SECONDS, GATHER, MAT_GATHER, MAT_REGEN, NEED, STAGE_PACE, STAGE_SCALE, START_POP,
} from '../constants'
import { S1 } from './s1-soup'
import { S2 } from './s2-algae'
import { S3 } from './s3-multicell'
import { S4 } from './s4-fish'
import { S5 } from './s5-amphibians'
import { S6 } from './s6-reptiles'
import { S7 } from './s7-giants'
import { S8 } from './s8-mammals'
import { S9 } from './s9-humans'

export const STAGES: StageDef[] = [S1, S2, S3, S4, S5, S6, S7, S8, S9]

export const ADAPTATIONS: Record<string, AdaptationDef> = Object.fromEntries(
  STAGES.flatMap(st => st.adaptations.map(a => [a.id, a])),
)

// Stage data is written in base numbers; the stage scale makes later numbers bigger.
export function resBase(k: number, r: ResourceDef) {
  const regen = (r.food ? BASE_REGEN : MAT_REGEN) * (r.size ?? 1) * STAGE_SCALE[k]
  return { regen, cap: regen * CAP_SECONDS, gather: r.food ? GATHER : MAT_GATHER, need: NEED }
}

export const startPop = (k: number) => START_POP * STAGE_SCALE[k]

export function adaptCost(k: number, a: AdaptationDef): Record<string, number> {
  const f = STAGE_SCALE[k] * STAGE_PACE[k]
  return Object.fromEntries(Object.entries(a.cost).map(([r, n]) => [r, Math.round(n * f)]))
}

export const adaptMinPop = (k: number, a: AdaptationDef) => (a.minPop ?? 0) * STAGE_SCALE[k]
