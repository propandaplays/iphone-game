// Monster definitions
export const MonsterType = {
  Fire: 'Fire',
  Water: 'Water',
  Grass: 'Grass',
  Electric: 'Electric',
  Normal: 'Normal'
};

export const MONSTER_DEFINITIONS = {
  flamepup: {
    id: 'flamepup',
    name: 'Flamepup',
    type: 'Fire',
    baseHp: 45,
    baseAtk: 60,
    baseDef: 40,
    baseSpd: 55,
    evolutionId: 'pyrowolf',
    evolutionLevel: 16,
    catchRate: 0.40,
    xpYield: 50
  },
  aquaslime: {
    id: 'aquaslime',
    name: 'Aquaslime',
    type: 'Water',
    baseHp: 50,
    baseAtk: 45,
    baseDef: 50,
    baseSpd: 45,
    evolutionId: 'tideguardian',
    evolutionLevel: 16,
    catchRate: 0.45,
    xpYield: 50
  },
  sproutling: {
    id: 'sproutling',
    name: 'Sproutling',
    type: 'Grass',
    baseHp: 55,
    baseAtk: 45,
    baseDef: 55,
    baseSpd: 40,
    evolutionId: 'bramblebeast',
    evolutionLevel: 16,
    catchRate: 0.50,
    xpYield: 50
  },
  sparkrat: {
    id: 'sparkrat',
    name: 'Sparkrat',
    type: 'Electric',
    baseHp: 40,
    baseAtk: 55,
    baseDef: 35,
    baseSpd: 70,
    evolutionId: 'thunderclaw',
    evolutionLevel: 16,
    catchRate: 0.35,
    xpYield: 50
  },
  fluffling: {
    id: 'fluffling',
    name: 'Fluffling',
    type: 'Normal',
    baseHp: 50,
    baseAtk: 50,
    baseDef: 50,
    baseSpd: 50,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.60,
    xpYield: 50
  },
  pyrowolf: {
    id: 'pyrowolf',
    name: 'Pyrowolf',
    type: 'Fire',
    baseHp: 65,
    baseAtk: 80,
    baseDef: 55,
    baseSpd: 70,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.20,
    xpYield: 120
  },
  tideguardian: {
    id: 'tideguardian',
    name: 'Tideguardian',
    type: 'Water',
    baseHp: 75,
    baseAtk: 60,
    baseDef: 70,
    baseSpd: 55,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.25,
    xpYield: 120
  },
  bramblebeast: {
    id: 'bramblebeast',
    name: 'Bramblebeast',
    type: 'Grass',
    baseHp: 80,
    baseAtk: 65,
    baseDef: 75,
    baseSpd: 50,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.25,
    xpYield: 120
  },
  thunderclaw: {
    id: 'thunderclaw',
    name: 'Thunderclaw',
    type: 'Electric',
    baseHp: 55,
    baseAtk: 75,
    baseDef: 50,
    baseSpd: 90,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.15,
    xpYield: 120
  },
  cloudpuff: {
    id: 'cloudpuff',
    name: 'Cloudpuff',
    type: 'Normal',
    baseHp: 70,
    baseAtk: 65,
    baseDef: 65,
    baseSpd: 65,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.35,
    xpYield: 120
  }
};

export function getMonsterDefinition(id) {
  return MONSTER_DEFINITIONS[id];
}

export function getAllBaseMonsters() {
  return Object.values(MONSTER_DEFINITIONS).filter(m => m.evolutionId !== null);
}