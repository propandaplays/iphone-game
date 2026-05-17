// Move definitions
export const MOVE_DEFINITIONS = {
  ember: { id: 'ember', name: 'Ember', type: 'Fire', power: 40, maxPp: 25, effect: 'burn', effectChance: 0.1, isSpecial: false },
  flameburst: { id: 'flameburst', name: 'Flame Burst', type: 'Fire', power: 60, maxPp: 15, effect: 'burn', effectChance: 0.15, isSpecial: false },
  inferno: { id: 'inferno', name: 'Inferno', type: 'Fire', power: 90, maxPp: 10, effect: 'burn', effectChance: 0.25, isSpecial: true },
  firefang: { id: 'firefang', name: 'Fire Fang', type: 'Fire', power: 65, maxPp: 15, effect: 'burn', effectChance: 0.2, isSpecial: false },
  bubble: { id: 'bubble', name: 'Bubble', type: 'Water', power: 40, maxPp: 25, effect: 'none', effectChance: 0, isSpecial: false },
  waterpulse: { id: 'waterpulse', name: 'Water Pulse', type: 'Water', power: 60, maxPp: 15, effect: 'none', effectChance: 0, isSpecial: false },
  hydroslash: { id: 'hydroslash', name: 'Hydro Slash', type: 'Water', power: 90, maxPp: 10, effect: 'none', effectChance: 0, isSpecial: true },
  aquajet: { id: 'aquajet', name: 'Aqua Jet', type: 'Water', power: 45, maxPp: 20, effect: 'none', effectChance: 0, isSpecial: false },
  vinewhip: { id: 'vinewhip', name: 'Vine Whip', type: 'Grass', power: 40, maxPp: 25, effect: 'none', effectChance: 0, isSpecial: false },
  razorleaf: { id: 'razorleaf', name: 'Razor Leaf', type: 'Grass', power: 60, maxPp: 15, effect: 'none', effectChance: 0, isSpecial: false },
  solarbeam: { id: 'solarbeam', name: 'Solar Beam', type: 'Grass', power: 90, maxPp: 10, effect: 'none', effectChance: 0, isSpecial: true },
  leechseed: { id: 'leechseed', name: 'Leech Seed', type: 'Grass', power: 50, maxPp: 15, effect: 'poison', effectChance: 0.3, isSpecial: false },
  thundershock: { id: 'thundershock', name: 'Thundershock', type: 'Electric', power: 40, maxPp: 25, effect: 'paralyze', effectChance: 0.1, isSpecial: false },
  spark: { id: 'spark', name: 'Spark', type: 'Electric', power: 60, maxPp: 15, effect: 'paralyze', effectChance: 0.15, isSpecial: false },
  thunderbolt: { id: 'thunderbolt', name: 'Thunderbolt', type: 'Electric', power: 90, maxPp: 10, effect: 'paralyze', effectChance: 0.2, isSpecial: true },
  electroweb: { id: 'electroweb', name: 'Electroweb', type: 'Electric', power: 50, maxPp: 15, effect: 'paralyze', effectChance: 0.25, isSpecial: false },
  tackle: { id: 'tackle', name: 'Tackle', type: 'Normal', power: 40, maxPp: 35, effect: 'none', effectChance: 0, isSpecial: false },
  quickattack: { id: 'quickattack', name: 'Quick Attack', type: 'Normal', power: 45, maxPp: 30, effect: 'none', effectChance: 0, isSpecial: false },
  headbutt: { id: 'headbutt', name: 'Headbutt', type: 'Normal', power: 60, maxPp: 20, effect: 'none', effectChance: 0, isSpecial: false },
  slam: { id: 'slam', name: 'Slam', type: 'Normal', power: 80, maxPp: 15, effect: 'none', effectChance: 0, isSpecial: false }
};

export const DEFAULT_MOVESETS = {
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

export function getMoveDefinition(id) {
  return MOVE_DEFINITIONS[id];
}

export function getDefaultMoves(monsterId) {
  return DEFAULT_MOVESETS[monsterId] || ['tackle', 'quickattack', 'headbutt', 'slam'];
}