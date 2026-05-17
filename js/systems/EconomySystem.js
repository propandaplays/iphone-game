// Economy System - handles gold, gems, inventory
export const CaptureBall = {
  MonsterBall: 'monster_ball',
  GreatBall: 'great_ball',
  UltraBall: 'ultra_ball',
  MasterBall: 'master_ball'
};

export const BALL_MULTIPLIERS = {
  'monster_ball': 1.0,
  'great_ball': 1.5,
  'ultra_ball': 2.0,
  'master_ball': 3.0
};

export const BALL_NAMES = {
  'monster_ball': 'Monster Ball',
  'great_ball': 'Great Ball',
  'ultra_ball': 'Ultra Ball',
  'master_ball': 'Master Ball'
};

export const SHOP_ITEMS = [
  { id: 'monster_ball', name: 'Monster Ball', price: 100, type: 'ball', effect: '×1.0' },
  { id: 'great_ball', name: 'Great Ball', price: 300, type: 'ball', effect: '×1.5' },
  { id: 'ultra_ball', name: 'Ultra Ball', price: 600, type: 'ball', effect: '×2.0' },
  { id: 'potion', name: 'Potion', price: 200, type: 'heal', effect: 'Heal 20 HP' },
  { id: 'super_potion', name: 'Super Potion', price: 500, type: 'heal', effect: 'Heal 50 HP' },
  { id: 'full_heal', name: 'Full Heal', price: 1000, type: 'heal', effect: 'Heal all HP' }
];

export const IAP_BUNDLES = [
  { id: 'starter_pack', gems: 100, price: '$0.99', displayName: 'Starter Pack' },
  { id: 'battle_bundle', gems: 500, price: '$4.99', displayName: 'Battle Bundle' },
  { id: 'collector_bundle', gems: 1200, price: '$9.99', displayName: 'Collector Bundle' },
  { id: 'ultimate_bundle', gems: 3000, price: '$19.99', displayName: 'Ultimate Bundle' }
];

export class EconomySystem {
  constructor() {
    this.gold = 500;
    this.gems = 0;
    this.inventory = [];
    this.MAX_GEMS = 999999;
    this.MAX_GOLD = 9999999;
  }

  getGold() { return this.gold; }
  getGems() { return this.gems; }

  addGold(amount) { this.gold = Math.min(this.MAX_GOLD, this.gold + amount); }
  spendGold(amount) { if (this.gold < amount) return false; this.gold -= amount; return true; }
  addGems(amount) { this.gems = Math.min(this.MAX_GEMS, this.gems + amount); }
  spendGems(amount) { if (this.gems < amount) return false; this.gems -= amount; return true; }

  getItemCount(itemId) { const item = this.inventory.find(i => i.id === itemId); return item?.quantity ?? 0; }

  addItem(itemId, quantity = 1) {
    const existing = this.inventory.find(i => i.id === itemId);
    if (existing) existing.quantity += quantity;
    else this.inventory.push({ id: itemId, quantity });
  }

  useItem(itemId, quantity = 1) {
    const existing = this.inventory.find(i => i.id === itemId);
    if (!existing || existing.quantity < quantity) return false;
    existing.quantity -= quantity;
    if (existing.quantity <= 0) this.inventory = this.inventory.filter(i => i.id !== itemId);
    return true;
  }

  buyItem(item, quantity = 1) {
    const totalCost = item.price * quantity;
    if (!this.spendGold(totalCost)) return false;
    this.addItem(item.id, quantity);
    return true;
  }

  getInventory() { return [...this.inventory]; }

  save() {
    const data = {
      version: 1,
      gold: this.gold,
      gems: this.gems,
      inventory: [...this.inventory]
    };
    localStorage.setItem('monster_economy', JSON.stringify(data));
  }

  load() {
    const raw = localStorage.getItem('monster_economy');
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      this.gold = data.gold;
      this.gems = data.gems;
      this.inventory = [...data.inventory];
      return true;
    } catch { return false; }
  }

  hasSave() { return localStorage.getItem('monster_economy') !== null; }
  deleteSave() { localStorage.removeItem('monster_economy'); }
  reset() { this.gold = 500; this.gems = 0; this.inventory = []; }
}

export class IAPSystem {
  constructor(economy) {
    this.economy = economy;
  }

  getBundles() { return IAP_BUNDLES; }

  async purchase(bundleId, callback) {
    const bundle = IAP_BUNDLES.find(b => b.id === bundleId);
    if (!bundle) { callback.onFailure('Invalid bundle'); return; }

    console.log(`[IAP Stub] Processing purchase: ${bundle.displayName} for ${bundle.price}`);
    
    setTimeout(() => {
      this.economy.addGems(bundle.gems);
      this.economy.save();
      callback.onSuccess(bundle.gems);
    }, 100);
  }
}