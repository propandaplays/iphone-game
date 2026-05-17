/**
 * Move Definitions
 * 
 * Contains all moves with power, type, PP, and effects.
 */

import { MonsterType } from './monsters';

export type MoveEffect = 'burn' | 'poison' | 'paralyze' | 'none';

export interface MoveSlot {
  moveId: string;
  pp: number;
  maxPp: number;
}

export interface MoveData {
  id: string;
  name: string;
  type: MonsterType;
  power: number;
  maxPp: number;
  effect: MoveEffect;
  effectChance: number; // 0-1 probability
  isSpecial: boolean;
}

export const MOVE_DEFINITIONS: Record<string, MoveData> = {
  // Fire moves
  ember: {
    id: 'ember',
    name: 'Ember',
    type: MonsterType.Fire,
    power: 40,
    maxPp: 25,
    effect: 'burn',
    effectChance: 0.1,
    isSpecial: false
  },
  flameburst: {
    id: 'flameburst',
    name: 'Flame Burst',
    type: MonsterType.Fire,
    power: 60,
    maxPp: 15,
    effect: 'burn',
    effectChance: 0.15,
    isSpecial: false
  },
  inferno: {
    id: 'inferno',
    name: 'Inferno',
    type: MonsterType.Fire,
    power: 90,
    maxPp: 10,
    effect: 'burn',
    effectChance: 0.25,
    isSpecial: true
  },
  firefang: {
    id: 'firefang',
    name: 'Fire Fang',
    type: MonsterType.Fire,
    power: 65,
    maxPp: 15,
    effect: 'burn',
    effectChance: 0.2,
    isSpecial: false
  },
  
  // Water moves
  bubble: {
    id: 'bubble',
    name: 'Bubble',
    type: MonsterType.Water,
    power: 40,
    maxPp: 25,
    effect: 'none',
    effectChance: 0,
    isSpecial: false
  },
  waterpulse: {
    id: 'waterpulse',
    name: 'Water Pulse',
    type: MonsterType.Water,
    power: 60,
    maxPp: 15,
    effect: 'none',
    effectChance: 0,
    isSpecial: false
  },
  hydroslash: {
    id: 'hydroslash',
    name: 'Hydro Slash',
    type: MonsterType.Water,
    power: 90,
    maxPp: 10,
    effect: 'none',
    effectChance: 0,
    isSpecial: true
  },
  aquajet: {
    id: 'aquajet',
    name: 'Aqua Jet',
    type: MonsterType.Water,
    power: 45,
    maxPp: 20,
    effect: 'none',
    effectChance: 0,
    isSpecial: false
  },
  
  // Grass moves
  vinewhip: {
    id: 'vinewhip',
    name: 'Vine Whip',
    type: MonsterType.Grass,
    power: 40,
    maxPp: 25,
    effect: 'none',
    effectChance: 0,
    isSpecial: false
  },
  razorleaf: {
    id: 'razorleaf',
    name: 'Razor Leaf',
    type: MonsterType.Grass,
    power: 60,
    maxPp: 15,
    effect: 'none',
    effectChance: 0,
    isSpecial: false
  },
  solarbeam: {
    id: 'solarbeam',
    name: 'Solar Beam',
    type: MonsterType.Grass,
    power: 90,
    maxPp: 10,
    effect: 'none',
    effectChance: 0,
    isSpecial: true
  },
  leechseed: {
    id: 'leechseed',
    name: 'Leech Seed',
    type: MonsterType.Grass,
    power: 50,
    maxPp: 15,
    effect: 'poison',
    effectChance: 0.3,
    isSpecial: false
  },
  
  // Electric moves
  thundershock: {
    id: 'thundershock',
    name: 'Thundershock',
    type: MonsterType.Electric,
    power: 40,
    maxPp: 25,
    effect: 'paralyze',
    effectChance: 0.1,
    isSpecial: false
  },
  spark: {
    id: 'spark',
    name: 'Spark',
    type: MonsterType.Electric,
    power: 60,
    maxPp: 15,
    effect: 'paralyze',
    effectChance: 0.15,
    isSpecial: false
  },
  thunderbolt: {
    id: 'thunderbolt',
    name: 'Thunderbolt',
    type: MonsterType.Electric,
    power: 90,
    maxPp: 10,
    effect: 'paralyze',
    effectChance: 0.2,
    isSpecial: true
  },
  electroweb: {
    id: 'electroweb',
    name: 'Electroweb',
    type: MonsterType.Electric,
    power: 50,
    maxPp: 15,
    effect: 'paralyze',
    effectChance: 0.25,
    isSpecial: false
  },
  
  // Normal moves
  tackle: {
    id: 'tackle',
    name: 'Tackle',
    type: MonsterType.Normal,
    power: 40,
    maxPp: 35,
    effect: 'none',
    effectChance: 0,
    isSpecial: false
  },
  quickattack: {
    id: 'quickattack',
    name: 'Quick Attack',
    type: MonsterType.Normal,
    power: 45,
    maxPp: 30,
    effect: 'none',
    effectChance: 0,
    isSpecial: false
  },
  headbutt: {
    id: 'headbutt',
    name: 'Headbutt',
    type: MonsterType.Normal,
    power: 60,
    maxPp: 20,
    effect: 'none',
    effectChance: 0,
    isSpecial: false
  },
  slam: {
    id: 'slam',
    name: 'Slam',
    type: MonsterType.Normal,
    power: 80,
    maxPp: 15,
    effect: 'none',
    effectChance: 0,
    isSpecial: false
  }
};

// Default movesets for each monster
export const DEFAULT_MOVESETS: Record<string, string[]> = {
  flamepup: ['ember', 'tackle', 'quickattack', 'firefang'],
  aquaslime: ['bubble', 'tackle', 'aquajet', 'waterpulse'],
  sproutling: ['vinewhip', 'tackle', 'razorleaf', 'leechseed'],
  sparkrat: ['thundershock', 'tackle', 'quickattack', 'spark'],
  fluffling: ['tackle', 'quickattack', 'headbutt', 'slam'],
  
  pyrowolf: ['flameburst', 'firefang', 'inferno', 'quickattack'],
  tideguardian: ['waterpulse', 'aquajet', 'hydroslash', 'bubble'],
  bramblebeast: ['razorleaf', 'leechseed', 'solarbeam', 'vinewhip'],
  thunderclaw: ['spark', 'electroweb', 'thunderbolt', 'quickattack'],
  cloudpuff: ['headbutt', 'slam', 'quickattack', 'tackle']
};

export function getMoveDefinition(id: string): MoveData | undefined {
  return MOVE_DEFINITIONS[id];
}

export function getDefaultMoves(monsterId: string): string[] {
  return DEFAULT_MOVESETS[monsterId] || ['tackle', 'quickattack', 'headbutt', 'slam'];
}