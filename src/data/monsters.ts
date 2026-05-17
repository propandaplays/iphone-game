/**
 * Monster Definitions
 * 
 * Contains all monster data including base stats, types, moves, and evolution.
 */

export enum MonsterType {
  Fire = 'Fire',
  Water = 'Water',
  Grass = 'Grass',
  Electric = 'Electric',
  Normal = 'Normal'
}

export interface MoveSlot {
  moveId: string;
  pp: number;
  maxPp: number;
}

export interface MonsterData {
  id: string;
  name: string;
  type: MonsterType;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  evolutionId: string | null;
  evolutionLevel: number | null;
  catchRate: number;
  xpYield: number;
  sprite: MonsterSpriteConfig;
}

export interface MonsterSpriteConfig {
  bodyColor: string;
  bodyShape: 'circle' | 'oval' | 'blob';
  eyeStyle: 'round' | 'angry' | 'cute';
  hasFlame?: boolean;
  hasSpark?: boolean;
  hasLeaf?: boolean;
  hasSlime?: boolean;
  isFluffy?: boolean;
  evolveForm?: string;
}

export const MONSTER_DEFINITIONS: Record<string, MonsterData> = {
  // Base Forms
  flamepup: {
    id: 'flamepup',
    name: 'Flamepup',
    type: MonsterType.Fire,
    baseHp: 45,
    baseAtk: 60,
    baseDef: 40,
    baseSpd: 55,
    evolutionId: 'pyrowolf',
    evolutionLevel: 16,
    catchRate: 0.40,
    xpYield: 50,
    sprite: {
      bodyColor: '#ff6b35',
      bodyShape: 'circle',
      eyeStyle: 'round',
      hasFlame: true
    }
  },
  aquaslime: {
    id: 'aquaslime',
    name: 'Aquaslime',
    type: MonsterType.Water,
    baseHp: 50,
    baseAtk: 45,
    baseDef: 50,
    baseSpd: 45,
    evolutionId: 'tideguardian',
    evolutionLevel: 16,
    catchRate: 0.45,
    xpYield: 50,
    sprite: {
      bodyColor: '#4fc3f7',
      bodyShape: 'blob',
      eyeStyle: 'cute',
      hasSlime: true
    }
  },
  sproutling: {
    id: 'sproutling',
    name: 'Sproutling',
    type: MonsterType.Grass,
    baseHp: 55,
    baseAtk: 45,
    baseDef: 55,
    baseSpd: 40,
    evolutionId: 'bramblebeast',
    evolutionLevel: 16,
    catchRate: 0.50,
    xpYield: 50,
    sprite: {
      bodyColor: '#7cb342',
      bodyShape: 'oval',
      eyeStyle: 'cute',
      hasLeaf: true
    }
  },
  sparkrat: {
    id: 'sparkrat',
    name: 'Sparkrat',
    type: MonsterType.Electric,
    baseHp: 40,
    baseAtk: 55,
    baseDef: 35,
    baseSpd: 70,
    evolutionId: 'thunderclaw',
    evolutionLevel: 16,
    catchRate: 0.35,
    xpYield: 50,
    sprite: {
      bodyColor: '#ffc107',
      bodyShape: 'oval',
      eyeStyle: 'angry',
      hasSpark: true
    }
  },
  fluffling: {
    id: 'fluffling',
    name: 'Fluffling',
    type: MonsterType.Normal,
    baseHp: 50,
    baseAtk: 50,
    baseDef: 50,
    baseSpd: 50,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.60,
    xpYield: 50,
    sprite: {
      bodyColor: '#f8bbd9',
      bodyShape: 'circle',
      eyeStyle: 'cute',
      isFluffy: true
    }
  },
  
  // Evolved Forms
  pyrowolf: {
    id: 'pyrowolf',
    name: 'Pyrowolf',
    type: MonsterType.Fire,
    baseHp: 65,
    baseAtk: 80,
    baseDef: 55,
    baseSpd: 70,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.20,
    xpYield: 120,
    sprite: {
      bodyColor: '#ff4500',
      bodyShape: 'circle',
      eyeStyle: 'angry',
      hasFlame: true
    }
  },
  tideguardian: {
    id: 'tideguardian',
    name: 'Tideguardian',
    type: MonsterType.Water,
    baseHp: 75,
    baseAtk: 60,
    baseDef: 70,
    baseSpd: 55,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.25,
    xpYield: 120,
    sprite: {
      bodyColor: '#0288d1',
      bodyShape: 'blob',
      eyeStyle: 'round',
      hasSlime: true
    }
  },
  bramblebeast: {
    id: 'bramblebeast',
    name: 'Bramblebeast',
    type: MonsterType.Grass,
    baseHp: 80,
    baseAtk: 65,
    baseDef: 75,
    baseSpd: 50,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.25,
    xpYield: 120,
    sprite: {
      bodyColor: '#558b2f',
      bodyShape: 'blob',
      eyeStyle: 'angry',
      hasLeaf: true
    }
  },
  thunderclaw: {
    id: 'thunderclaw',
    name: 'Thunderclaw',
    type: MonsterType.Electric,
    baseHp: 55,
    baseAtk: 75,
    baseDef: 50,
    baseSpd: 90,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.15,
    xpYield: 120,
    sprite: {
      bodyColor: '#ffca28',
      bodyShape: 'oval',
      eyeStyle: 'angry',
      hasSpark: true
    }
  },
  cloudpuff: {
    id: 'cloudpuff',
    name: 'Cloudpuff',
    type: MonsterType.Normal,
    baseHp: 70,
    baseAtk: 65,
    baseDef: 65,
    baseSpd: 65,
    evolutionId: null,
    evolutionLevel: null,
    catchRate: 0.35,
    xpYield: 120,
    sprite: {
      bodyColor: '#e1bee7',
      bodyShape: 'circle',
      eyeStyle: 'cute',
      isFluffy: true
    }
  }
};

export function getMonsterDefinition(id: string): MonsterData | undefined {
  return MONSTER_DEFINITIONS[id];
}

export function getAllBaseMonsters(): MonsterData[] {
  return Object.values(MONSTER_DEFINITIONS).filter(m => !m.id.includes('claw') && !m.id.includes('guardian') && !m.id.includes('beast') && !m.id.includes('puff') && m.evolutionId !== null);
}

export function getAllEvolvedMonsters(): MonsterData[] {
  return Object.values(MONSTER_DEFINITIONS).filter(m => m.evolutionId === null && m.baseHp >= 55);
}