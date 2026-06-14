export interface Misconception {
  id: string;
  triggers: string[];
  alert: string;
  hint: string;
}

export const MISCONCEPTIONS: Misconception[] = [
  {
    id: 'heavier_falls_faster',
    triggers: ['heavier', 'heavy', 'more weight', 'bigger falls', 'falls faster', 'fall first', 'fall quicker'],
    alert: "⚠ Aristotle's 2000-year error detected",
    hint: 'The student believes heavier objects fall faster. Do NOT correct them directly. Ask them to design a dropping experiment and make a prediction first.',
  },
  {
    id: 'force_maintains_motion',
    triggers: ['need force to keep', 'keeps it moving', 'force to maintain', 'pushing to stay'],
    alert: "⚠ Newton's 1st Law misconception",
    hint: 'Student thinks sustained force is needed for constant motion. Ask about a hockey puck on frictionless ice.',
  },
  {
    id: 'mass_equals_weight',
    triggers: ['mass is weight', 'weight is mass', 'same as weight', 'same as mass'],
    alert: "⚠ Mass/weight confusion detected",
    hint: 'Ask: would your mass change if you traveled to the Moon?',
  },
  {
    id: 'electricity_consumed',
    triggers: ['current used up', 'electricity used up', 'current decreases after'],
    alert: "⚠ Current consumption misconception",
    hint: 'Ask what current actually represents physically — charge flow per second.',
  },
  {
    id: 'heat_is_substance',
    triggers: ['heat flows into', 'heat is stored', 'caloric', 'heat is a substance'],
    alert: "⚠ Caloric theory misconception",
    hint: 'Student treats heat as a material thing rather than energy transfer. Ask if heat is stored as a liquid or if it is the kinetic energy of particles moving.',
  },
];

export function detectMisconceptions(message: string): Misconception[] {
  const lower = message.toLowerCase();
  return MISCONCEPTIONS.filter((m) =>
    m.triggers.some((t) => lower.includes(t))
  );
}

const FRUSTRATION_TRIGGERS = ['idk', 'i give up', 'just tell me', 'no idea', 'confused', 'what', "i don't know", "dont know", "no clue"];

export function detectFrustration(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return message.length < 20 || FRUSTRATION_TRIGGERS.some((t) => lower.includes(t));
}

export function isSubstantive(message: string): boolean {
  return message.length >= 40 && message.split(' ').length > 8;
}
