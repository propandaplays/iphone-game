// Monster System - handles monster instances, stats, moves, evolution
import { getMonsterDefinition } from '../data/monsters.js';
import { getMoveDefinition, getDefaultMoves } from '../data/moves.js';
import { DamageCalc } from '../util/DamageCalc.js';

let instanceCounter = 0;

export class MonsterSystem {
  static createMonster(monsterId, level = 5) {
    const def = getMonsterDefinition(monsterId);
    if (!def) return null;

    const maxHp = DamageCalc.calcStat(def.baseHp, level);
    
    return {
      id: monsterId,
      instanceId: `${monsterId}_${++instanceCounter}`,
      level,
      currentHp: maxHp,
      maxHp,
      attack: DamageCalc.calcStat(def.baseAtk, level),
      defense: DamageCalc.calcStat(def.baseDef, level),
      speed: DamageCalc.calcStat(def.baseSpd, level),
      xp: 0,
      xpToNextLevel: DamageCalc.xpToNextLevel(level),
      status: 'none',
      isDefending: false,
      moves: this.createMoves(monsterId)
    };
  }

  static createMoves(monsterId) {
    const moveIds = getDefaultMoves(monsterId);
    return moveIds.map(moveId => {
      const moveDef = getMoveDefinition(moveId);
      return {
        moveId,
        pp: moveDef?.maxPp ?? 10,
        maxPp: moveDef?.maxPp ?? 10
      };
    });
  }

  static getDefinition(monster) {
    return getMonsterDefinition(monster.id);
  }

  static takeDamage(monster, damage) {
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    return monster.currentHp;
  }

  static heal(monster, amount) {
    monster.currentHp = Math.min(monster.maxHp, monster.currentHp + amount);
    return monster.currentHp;
  }

  static fullHeal(monster) {
    monster.currentHp = monster.maxHp;
    monster.status = 'none';
    monster.isDefending = false;
    monster.moves.forEach(move => {
      const def = getMoveDefinition(move.moveId);
      move.pp = def?.maxPp ?? move.maxPp;
    });
  }

  static addXp(monster, xpAmount) {
    monster.xp += xpAmount;
    if (monster.xp >= monster.xpToNextLevel) {
      this.levelUp(monster);
      return true;
    }
    return false;
  }

  static levelUp(monster) {
    monster.level++;
    monster.xp -= monster.xpToNextLevel;
    monster.xpToNextLevel = DamageCalc.xpToNextLevel(monster.level);
    
    const def = getMonsterDefinition(monster.id);
    if (def) {
      monster.maxHp += Math.floor(def.baseHp * 0.1);
      monster.currentHp = Math.min(monster.currentHp + Math.floor(def.baseHp * 0.1), monster.maxHp);
      monster.attack += Math.floor(def.baseAtk * 0.1);
      monster.defense += Math.floor(def.baseDef * 0.1);
      monster.speed += Math.floor(def.baseSpd * 0.1);
    }
    
    const evolution = this.getEvolution(monster.id);
    if (evolution && monster.level >= evolution.level) {
      this.evolve(monster);
    }
  }

  static getEvolution(monsterId) {
    const def = getMonsterDefinition(monsterId);
    if (!def || !def.evolutionId || !def.evolutionLevel) return null;
    return { id: def.evolutionId, level: def.evolutionLevel };
  }

  static evolve(monster) {
    const evolution = this.getEvolution(monster.id);
    if (!evolution) return false;

    const newDef = getMonsterDefinition(evolution.id);
    if (!newDef) return false;

    monster.id = evolution.id;
    monster.instanceId = `${evolution.id}_${++instanceCounter}`;
    monster.maxHp = DamageCalc.calcStat(newDef.baseHp, monster.level);
    monster.currentHp += monster.maxHp - DamageCalc.calcStat(newDef.baseHp, monster.level - 1);
    monster.attack = DamageCalc.calcStat(newDef.baseAtk, monster.level);
    monster.defense = DamageCalc.calcStat(newDef.baseDef, monster.level);
    monster.speed = DamageCalc.calcStat(newDef.baseSpd, monster.level);

    return true;
  }

  static applyStatus(monster, status) {
    if (monster.status === 'none') {
      monster.status = status;
    }
  }

  static tickStatus(monster) {
    let damage = 0;
    if (monster.status === 'burn' || monster.status === 'poison') {
      damage = Math.floor(monster.maxHp * 0.0625);
      monster.currentHp = Math.max(1, monster.currentHp - damage);
    }
    return damage;
  }

  static clearStatus(monster) {
    monster.status = 'none';
  }

  static getEffectiveSpeed(monster) {
    return monster.status === 'paralyze' ? Math.floor(monster.speed * 0.5) : monster.speed;
  }

  static canAct(monster) {
    return monster.status !== 'sleep';
  }

  static useMove(monster, moveIndex) {
    if (moveIndex < 0 || moveIndex >= monster.moves.length) return false;
    if (monster.moves[moveIndex].pp <= 0) return false;
    monster.moves[moveIndex].pp--;
    return true;
  }

  static setDefending(monster, defending) {
    monster.isDefending = defending;
  }
}