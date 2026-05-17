// Party System - handles team management
import { MonsterSystem } from './MonsterSystem.js';

export class PartySystem {
  constructor() {
    this.party = [];
    this.box = [];
    this.maxPartySize = 3;
    this.maxBoxSize = 50;
  }

  initWithStarter(monsterId) {
    this.party = [];
    this.box = [];
    const starter = MonsterSystem.createMonster(monsterId, 5);
    if (starter) this.party.push(starter);
  }

  getParty() { return this.party; }
  getBox() { return this.box; }

  addMonster(monster) {
    if (this.party.length < this.maxPartySize) {
      this.party.push(monster);
      return true;
    } else if (this.box.length < this.maxBoxSize) {
      this.box.push(monster);
      return true;
    }
    return false;
  }

  removeFromParty(index) {
    if (index < 0 || index >= this.party.length) return null;
    return this.party.splice(index, 1)[0];
  }

  swapPartySlots(index1, index2) {
    if (index1 < 0 || index1 >= this.party.length) return false;
    if (index2 < 0 || index2 >= this.party.length) return false;
    const temp = this.party[index1];
    this.party[index1] = this.party[index2];
    this.party[index2] = temp;
    return true;
  }

  boxToParty(boxIndex) {
    if (this.party.length >= this.maxPartySize) return false;
    if (boxIndex < 0 || boxIndex >= this.box.length) return false;
    const monster = this.box.splice(boxIndex, 1)[0];
    this.party.push(monster);
    return true;
  }

  partyToBox(partyIndex) {
    if (partyIndex < 0 || partyIndex >= this.party.length) return false;
    if (this.box.length >= this.maxBoxSize) return false;
    const monster = this.party.splice(partyIndex, 1)[0];
    this.box.push(monster);
    return true;
  }

  healAll() {
    this.party.forEach(monster => MonsterSystem.fullHeal(monster));
  }

  getPartyMember(index) { return this.party[index]; }
  isEmpty() { return this.party.length === 0; }
  hasAliveMembers() { return this.party.some(m => m.currentHp > 0); }
  getAliveMembers() { return this.party.filter(m => m.currentHp > 0); }

  save() {
    const data = {
      version: 1,
      party: this.party.map(m => ({ id: m.id, level: m.level, currentHp: m.currentHp, maxHp: m.maxHp, attack: m.attack, defense: m.defense, speed: m.speed, xp: m.xp, xpToNextLevel: m.xpToNextLevel, status: m.status, moves: m.moves })),
      box: this.box.map(m => ({ id: m.id, level: m.level, currentHp: m.currentHp, maxHp: m.maxHp, attack: m.attack, defense: m.defense, speed: m.speed, xp: m.xp, xpToNextLevel: m.xpToNextLevel, status: m.status, moves: m.moves })),
      boxSize: this.maxBoxSize
    };
    localStorage.setItem('monster_party', JSON.stringify(data));
  }

  load() {
    const raw = localStorage.getItem('monster_party');
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      this.party = data.party.map(s => ({ ...s, instanceId: `${s.id}_restored`, isDefending: false }));
      this.box = data.box.map(s => ({ ...s, instanceId: `${s.id}_restored`, isDefending: false }));
      return true;
    } catch { return false; }
  }

  hasSave() { return localStorage.getItem('monster_party') !== null; }
  deleteSave() { localStorage.removeItem('monster_party'); }
}