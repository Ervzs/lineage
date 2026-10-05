// All tuning knobs. Values marked [START] in PLAN.md are tuned by `npm run balance`.

export const SAVE_KEY = 'lineage-save-v1'
export const SAVE_VERSION = 1
export const TICK_MS = 100
export const AUTOSAVE_MS = 10_000
export const LOG_MAX = 200
export const NUMBER_CLAMP = 1e300
export const BALANCE_CEILING = 1e66

// Species anchors B_k (cost of the first Tier 1 producer) and population scales.
export const ANCHORS = [10, 1e4, 1e7, 1e10, 1e13, 1e16, 1e19, 1e22]
export const UNIT_SCALES = [1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21]
export const DECLINE_SECONDS = [300, 450, 600, 900, 1200, 1800, 2400, 1800]
export const DEFENSE_UNITS = [4, 6, 8, 12, 18, 26, 36, 50]

// Producers (index = tier - 1)
export const PRODUCER_COST_MULT = [1, 20, 400]
export const PRODUCER_GROWTH = [1.15, 1.2, 1.25]
export const TIER1_PAYBACK = 20      // Tier 1 makes B_k / 20 Biomass per second
export const CHAIN_RATE = 0.1        // units per second per unit for tiers 2 and 3
export const MILESTONES = [10, 25, 50, 100, 200]
export const POP_WEIGHTS = [1, 5, 25]

// Traits (index = tier - 1)
export const TRAIT_COST_MULT = [5, 40, 320]
export const TRAIT_POINTS = [9, 13, 18]
export const EVO_NEEDED = 100
export const LATE_TRAIT_FACTOR = 250
export const GROWTH_MULTS = [1.5, 1.75, 2]
export const SURVIVAL2_LOSS_MULT = 0.85
export const CUNNING1_LUCK = 3
export const CUNNING2_RISK = 5
export const CUNNING3_GIFT = 10

// Caps
export const LOSS_MULT_FLOOR = 0.4
export const RISK_CAP = 30
export const LUCK_CAP = 60
export const GIFT_BASE = 25
export const GIFT_CAP = 60
export const MUTATION_DEFENSE_CAP = 100

// Genome
export const GENOME_FACTOR = 3

// Events
export const EVENT_WINDOW = 90
export const EVENT_GAPS: Record<number, [number, number]> = {
  2: [300, 420],
  3: [280, 400],
  4: [260, 380],
  5: [240, 360],
  6: [240, 340],
  7: [220, 320],
  8: [200, 300],
}
export const MAX_BIOMASS_LOSS_PCT = 15
export const MAX_HEALTH_DROP_PCT = 50
export const HEALTH_FLOOR = 0.4

// Reckoning
export const THREAT_LEVEL = 750
export const THREAT_COUNTDOWN = 600

// Absorb
export const ABSORB_AMOUNT = 1
