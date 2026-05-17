/**
 * Economy System
 * 
 * Handles gold, gems, inventory, and transactions.
 */

import { SaveManager, SaveData } from '../save/save-manager';

export interface InventoryItem {
  id: string;
  quantity: number;
}

export interface EconomySaveData extends SaveData {
  gold: number;
  gems: number;
  inventory: InventoryItem[];
}

export enum CaptureBall {
  MonsterBall = 'monster_ball',
  GreatBall = 'great_ball',
  UltraBall = 'ultra_ball',
  MasterBall = 'master_ball'
}

export const BALL_PRICES: Record<CaptureBall, number> = {
  [CaptureBall.MonsterBall]: 100,
  [CaptureBall.GreatBall]: 300,
  [CaptureBall.UltraBall]: 600,
  [CaptureBall.MasterBall]: 1500
};

export const BALL_MULTIPLIERS: Record<CaptureBall, number> = {
  [CaptureBall.MonsterBall]: 1.0,
  [CaptureBall.GreatBall]: 1.5,
  [CaptureBall.UltraBall]: 2.0,
  [CaptureBall.MasterBall]: 3.0
};

export const BALL_NAMES: Record<CaptureBall, string> = {
  [CaptureBall.MonsterBall]: 'Monster Ball',
  [CaptureBall.GreatBall]: 'Great Ball',
  [CaptureBall.UltraBall]: 'Ultra Ball',
  [CaptureBall.MasterBall]: 'Master Ball'
};

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'ball' | 'heal' | 'other';
  effect?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: CaptureBall.MonsterBall, name: 'Monster Ball', price: 100, type: 'ball', effect: '×1.0' },
  { id: CaptureBall.GreatBall, name: 'Great Ball', price: 300, type: 'ball', effect: '×1.5' },
  { id: CaptureBall.UltraBall, name: 'Ultra Ball', price: 600, type: 'ball', effect: '×2.0' },
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
  private gold: number = 500;
  private gems: number = 0;
  private inventory: InventoryItem[] = [];
  private saveManager: SaveManager<EconomySaveData>;
  
  private readonly MAX_GEMS = 999999;
  private readonly MAX_GOLD = 9999999;

  constructor() {
    this.saveManager = new SaveManager<EconomySaveData>('monster_economy', 1);
  }

  /**
   * Get current gold.
   */
  getGold(): number {
    return this.gold;
  }

  /**
   * Get current gems.
   */
  getGems(): number {
    return this.gems;
  }

  /**
   * Add gold.
   */
  addGold(amount: number): void {
    this.gold = Math.min(this.MAX_GOLD, this.gold + amount);
  }

  /**
   * Spend gold. Returns true if successful.
   */
  spendGold(amount: number): boolean {
    if (this.gold < amount) return false;
    this.gold -= amount;
    return true;
  }

  /**
   * Add gems.
   */
  addGems(amount: number): void {
    this.gems = Math.min(this.MAX_GEMS, this.gems + amount);
  }

  /**
   * Spend gems. Returns true if successful.
   */
  spendGems(amount: number): boolean {
    if (this.gems < amount) return false;
    this.gems -= amount;
    return true;
  }

  /**
   * Get inventory count for an item.
   */
  getItemCount(itemId: string): number {
    const item = this.inventory.find(i => i.id === itemId);
    return item?.quantity ?? 0;
  }

  /**
   * Add item to inventory.
   */
  addItem(itemId: string, quantity: number = 1): void {
    const existing = this.inventory.find(i => i.id === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.inventory.push({ id: itemId, quantity });
    }
  }

  /**
   * Use item from inventory. Returns true if successful.
   */
  useItem(itemId: string, quantity: number = 1): boolean {
    const existing = this.inventory.find(i => i.id === itemId);
    if (!existing || existing.quantity < quantity) return false;
    existing.quantity -= quantity;
    if (existing.quantity <= 0) {
      this.inventory = this.inventory.filter(i => i.id !== itemId);
    }
    return true;
  }

  /**
   * Buy item from shop with gold.
   */
  buyItem(item: ShopItem, quantity: number = 1): boolean {
    const totalCost = item.price * quantity;
    if (!this.spendGold(totalCost)) return false;
    this.addItem(item.id, quantity);
    return true;
  }

  /**
   * Get all inventory items.
   */
  getInventory(): InventoryItem[] {
    return [...this.inventory];
  }

  /**
   * Save economy data.
   */
  save(): void {
    const data = {
      gold: this.gold,
      gems: this.gems,
      inventory: [...this.inventory]
    };
    this.saveManager.save(data);
  }

  /**
   * Load economy data.
   */
  load(): boolean {
    const data = this.saveManager.load();
    if (!data) return false;

    this.gold = data.gold;
    this.gems = data.gems;
    this.inventory = [...data.inventory];
    return true;
  }

  /**
   * Check if save exists.
   */
  hasSave(): boolean {
    return this.saveManager.exists();
  }

  /**
   * Delete save.
   */
  deleteSave(): void {
    this.saveManager.delete();
  }

  /**
   * Reset economy (new game).
   */
  reset(): void {
    this.gold = 500;
    this.gems = 0;
    this.inventory = [];
  }
}