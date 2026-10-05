import type { Branch, Effect, TraitDef } from '../engine/types'
import {
  ANCHORS, CUNNING1_LUCK, CUNNING2_RISK, CUNNING3_GIFT, DEFENSE_UNITS, GROWTH_MULTS,
  SURVIVAL2_LOSS_MULT, TRAIT_COST_MULT, TRAIT_POINTS,
} from './constants'

// [name, flavor] per species, in order: growth 1-3, survival 1-3, cunning 1-3
const NAMES: [string, string][][] = [
  [
    ['Lipid Bilayer', 'Fat shells hold chemistry together.'],
    ['Template Copying', 'Chains of molecules copy themselves.'],
    ['RNA Catalysis', 'Molecules speed up their own growth.'],
    ['Stable Membrane', 'The shell resists breaking.'],
    ['Heat Tolerance', 'Warm vents stop being deadly.'],
    ['Repair Chemistry', 'Damage mends itself.'],
    ['Chemical Sensing', 'Cells notice food nearby.'],
    ['Gradient Seeking', 'Cells drift toward richer water.'],
    ['Mutable Code', 'Copying errors create new forms.'],
  ],
  [
    ['Cell Wall', 'Rigid walls guard the cell.'],
    ['Binary Fission', 'One cell becomes two.'],
    ['Plasmid Exchange', 'Cells trade useful genes.'],
    ['Spore Formation', 'Dormant cells outlast hard times.'],
    ['Antibiotic Resistance', 'Chemical attacks fail.'],
    ['Biofilm Shield', 'A slime layer protects the colony.'],
    ['Chemotaxis', 'Cells swim toward nutrients.'],
    ['Quorum Sensing', 'Cells count their neighbors.'],
    ['Horizontal Transfer', 'Genes jump between species.'],
  ],
  [
    ['Pore Network', 'Water flows through the whole body.'],
    ['Filter Feeding', 'Food arrives without hunting.'],
    ['Cell Specialization', 'Cells take on separate jobs.'],
    ['Spicule Skeleton', 'Glass needles deter attackers.'],
    ['Toxin Glands', 'Bitter chemicals repel grazers.'],
    ['Regeneration', 'Lost pieces regrow.'],
    ['Water Sensing', 'The body reads currents.'],
    ['Cell Signaling', 'Cells coordinate by chemical message.'],
    ['Larval Dispersal', 'Young drift to new reefs.'],
  ],
  [
    ['Fins', 'Steady steering and speed.'],
    ['Schooling', 'Groups move as one.'],
    ['Swim Bladder', 'Effortless depth control.'],
    ['Scales', 'Overlapping plates form armor.'],
    ['Camouflage', 'Colors blend into the water.'],
    ['Armored Plates', 'Heavy bone covers the head.'],
    ['Lateral Line', 'Pressure sense detects movement.'],
    ['Spawning Migration', 'Journeys to safer waters.'],
    ['Social Learning', 'Young fish copy elders.'],
  ],
  [
    ['Lungs', 'Air breathing opens the land.'],
    ['Warm Basking', 'Sunlight powers movement.'],
    ['Amniotic Egg', 'Eggs survive away from water.'],
    ['Dry Skin', 'Scales hold in moisture.'],
    ['Burrowing', 'Tunnels hide the young.'],
    ['Venom', 'Bites end threats quickly.'],
    ['Keen Eyes', 'Sharp sight spots prey and danger.'],
    ['Territory Memory', 'Animals remember safe ground.'],
    ['Brood Care', 'Parents guard the nest.'],
  ],
  [
    ['Fur', 'Insulation keeps heat in.'],
    ['Live Birth', 'Young arrive developed.'],
    ['Warm Blood', 'Constant body heat at any hour.'],
    ['Nocturnal Life', 'Night hides small hunters.'],
    ['Herd Defense', 'Groups watch for danger.'],
    ['Immune Memory', 'Past illness trains defenses.'],
    ['Large Brain', 'More thinking, faster learning.'],
    ['Play Learning', 'Young practice survival skills.'],
    ['Pack Hunting', 'Teams take bigger prey.'],
  ],
  [
    ['Upright Walk', 'Free hands, longer travel.'],
    ['Tool Making', 'Stone edges cut and dig.'],
    ['Fire', 'Cooked food and warm nights.'],
    ['Shelter', 'Built cover blocks weather.'],
    ['Medicinal Plants', 'Herbs treat wounds.'],
    ['Group Watch', 'Sentries guard the camp.'],
    ['Language', 'Ideas pass between minds.'],
    ['Cooperation', 'Shared work beats solo effort.'],
    ['Cultural Memory', 'Stories carry knowledge across generations.'],
  ],
  [
    ['Agriculture', 'Farms feed settled people.'],
    ['Writing', 'Records outlast memory.'],
    ['Industry', 'Machines multiply labor.'],
    ['Fortification', 'Walls and shields against threats.'],
    ['Public Health', 'Clean water and medicine.'],
    ['Planetary Watch', 'Instruments scan the sky and land.'],
    ['Science', 'Methods that test ideas.'],
    ['Trade Networks', 'Goods and ideas cross the world.'],
    ['Global Network', 'Everyone shares information instantly.'],
  ],
]

export const BRANCHES: Branch[] = ['growth', 'survival', 'cunning']

export const traitId = (species: number, branch: Branch, tier: number) => `s${species + 1}-${branch}${tier}`

function effectsFor(species: number, branch: Branch, tier: 1 | 2 | 3): Effect[] {
  const d = DEFENSE_UNITS[species]
  if (branch === 'growth') {
    const target = (['tier1.output', 'tier2.output', 'tier3.output'] as const)[tier - 1]
    return [{ target, op: 'mul', value: GROWTH_MULTS[tier - 1] }]
  }
  if (branch === 'survival') {
    if (tier === 2) return [{ target: 'event.lossMult', op: 'mul', value: SURVIVAL2_LOSS_MULT }]
    return [{ target: 'defense.flat', op: 'add', value: tier === 1 ? d : 2 * d }]
  }
  if (tier === 1) return [{ target: 'luck.points', op: 'add', value: CUNNING1_LUCK }]
  if (tier === 2) return [{ target: 'event.riskSuccess', op: 'add', value: CUNNING2_RISK }]
  return [{ target: 'gift.chance', op: 'add', value: CUNNING3_GIFT }]
}

export const TRAITS: TraitDef[] = NAMES.flatMap((rows, s) =>
  rows.map(([name, flavor], i) => {
    const branch = BRANCHES[Math.floor(i / 3)]
    const tier = ((i % 3) + 1) as 1 | 2 | 3
    return {
      id: traitId(s, branch, tier),
      species: s,
      branch,
      tier,
      name,
      flavor,
      cost: TRAIT_COST_MULT[tier - 1] * ANCHORS[s],
      evoPoints: TRAIT_POINTS[tier - 1],
      requires: tier === 1 ? [] : [traitId(s, branch, tier - 1)],
      requiresAny: tier === 3 ? BRANCHES.filter(b => b !== branch).map(b => traitId(s, b, 1)) : [],
      effects: effectsFor(s, branch, tier),
    }
  }),
)

export const TRAIT_BY_ID: Record<string, TraitDef> = Object.fromEntries(TRAITS.map(t => [t.id, t]))
