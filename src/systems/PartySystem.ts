/**
 * Party System
 * 
 * Handles team management, party size, and monster box.
 */

import { MonsterSystem, MonsterInstance, StatusEffect } from './MonsterSystem';
import { SaveManager, SaveData } from '../save/save-manager';

export interface PartySaveData extends SaveData {
  party: SerializedMonster[];
  box: SerializedMonster[];
  boxSize: number;
}

interface SerializedMonster {
  id: string;
  level: number;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  xp: number;
  xpToNextLevel: number;
  status: string;
  moves: { moveId: string; pp: number; maxPp: number }[];
}

export class PartySystem {
  private party: MonsterInstance[] = [];
  private box: MonsterInstance[] = [];
  private readonly maxPartySize = 3;
  private readonly maxBoxSize = 50;
  private saveManager: SaveManager<PartySaveData>;

  constructor() {
    this.saveManager = new SaveManager<PartySaveData>('monster_party', 1);
    this.saveManager.setMigration((data) => {
      // Migration from v0 to v1: ensure boxSize exists
      if (!('boxSize' in data)) {
        (data as Partial<PartySaveData>).boxSize = 50;
      }
      return data;
    });
  }

  /**
   * Initialize party with a starter monster.
   */
  initWithStarter(monsterId: string): void {
    this.party = [];
    this.box = [];
    
    const starter = MonsterSystem.createMonster(monsterId, 5);
    if (starter) {
      this.party.push(starter);
    }
  }

  /**
   * Get the current party.
   */
  getParty(): MonsterInstance[] {
    return this.party;
  }

  /**
   * Get the monster box.
   */
  getBox(): MonsterInstance[] {
    return this.box;
  }

  /**
   * Add a monster to the party (or box if party is full).
   */
  addMonster(monster: MonsterInstance): boolean {
    if (this.party.length < this.maxPartySize) {
      this.party.push(monster);
      return true;
    } else if (this.box.length < this.maxBoxSize) {
      this.box.push(monster);
      return true;
    }
    return false; // Both full
  }

  /**
   * Remove a monster from the party.
   */
  removeFromParty(index: number): MonsterInstance | null {
    if (index < 0 || index >= this.party.length) return null;
    return this.party.splice(index, 1)[0];
  }

  /**
   * Swap monsters between party slots.
   */
  swapPartySlots(index1: number, index2: number): boolean {
    if (index1 < 0 || index1 >= this.party.length) return false;
    if (index2 < 0 || index2 >= this.party.length) return false;
    
    const temp = this.party[index1];
    this.party[index1] = this.party[index2];
    this.party[index2] = temp;
    return true;
  }

  /**
   * Move a monster from box to party.
   */
  boxToParty(boxIndex: number): boolean {
    if (this.party.length >= this.maxPartySize) return false;
    if (boxIndex < 0 || boxIndex >= this.box.length) return false;
    
    const monster = this.box.splice(boxIndex, 1)[0];
    this.party.push(monster);
    return true;
  }

  /**
   * Move a monster from party to box.
   */
  partyToBox(partyIndex: number): boolean {
    if (partyIndex < 0 || partyIndex >= this.party.length) return false;
    if (this.box.length >= this.maxBoxSize) return false;
    
    const monster = this.party.splice(partyIndex, 1)[0];
    this.box.push(monster);
    return true;
  }

  /**
   * Heal all monsters in the party.
   */
  healAll(): void {
    this.party.forEach(monster => MonsterSystem.fullHeal(monster));
  }

  /**
   * Get party member at index.
   */
  getPartyMember(index: number): MonsterInstance | undefined {
    return this.party[index];
  }

  /**
   * Check if party is empty.
   */
  isEmpty(): boolean {
    return this.party.length === 0;
  }

  /**
   * Check if any party member is alive.
   */
  hasAliveMembers(): boolean {
    return this.party.some(m => m.currentHp > 0);
  }

  /**
   * Get alive party members.
   */
  getAliveMembers(): MonsterInstance[] {
    return this.party.filter(m => m.currentHp > 0);
  }

  /**
   * Save party data.
   */
  save(): void {
    const data = {
      party: this.party.map(m => this.serializeMonster(m)),
      box: this.box.map(m => this.serializeMonster(m)),
      boxSize: this.maxBoxSize
    };
    this.saveManager.save(data);
  }

  /**
   * Load party data.
   */
  load(): boolean {
    const data = this.saveManager.load();
    if (!data) return false;

    this.party = data.party.map(s => this.deserializeMonster(s));
    this.box = data.box.map(s => this.deserializeMonster(s));
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
   * Serialize a monster for saving.
   */
  private serializeMonster(m: MonsterInstance): SerializedMonster {
    return {
      id: m.id,
      level: m.level,
      currentHp: m.currentHp,
      maxHp: m.maxHp,
      attack: m.attack,
      defense: m.defense,
      speed: m.speed,
      xp: m.xp,
      xpToNextLevel: m.xpToNextLevel,
      status: m.status,
      moves: m.moves.map(move => ({
        moveId: move.moveId,
        pp: move.pp,
        maxPp: move.maxPp
      }))
    };
  }

  /**
   * Deserialize a monster from save data.
   */
  private deserializeMonster(s: SerializedMonster): MonsterInstance {
    return {
      id: s.id,
      instanceId: `${s.id}_restored`,
      level: s.level,
      currentHp: s.currentHp,
      maxHp: s.maxHp,
      attack: s.attack,
      defense: s.defense,
      speed: s.speed,
      xp: s.xp,
      xpToNextLevel: s.xpToNextLevel,
      status: s.status as StatusEffect,
      isDefending: false,
      moves: s.moves
    };
  }
}