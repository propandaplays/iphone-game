// Battle Scene - turn-based combat
// MakkoEngine is a global
import { MonsterSystem } from '../systems/MonsterSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { CaptureSystem } from '../systems/CaptureSystem.js';
import { getMonsterDefinition } from '../data/monsters.js';
import { getMoveDefinition } from '../data/moves.js';
import { BALL_NAMES, BALL_MULTIPLIERS } from '../systems/EconomySystem.js';

export class BattleScene {
  constructor(game) {
    this.game = game;
    this.id = 'battle';
    this.combatSystem = new CombatSystem();
    this.captureSystem = new CaptureSystem();
    this.resultState = 'none';
    this.messageText = '';
    this.messageTimer = 0;
    this.damageNumbers = [];
    this.mode = 'action';
  }

  enter() {
    const wildMonster = this.game.getPendingWildEncounter();
    this.isWild = !!wildMonster;
    
    this.playerMonsters = [...this.game.getPartySystem().getParty()];
    this.enemyMonsters = wildMonster ? [wildMonster] : this.createAIParty();

    this.combatSystem.init(this.playerMonsters, this.enemyMonsters, this.isWild, (e) => this.handleEvent(e));
    
    this.resultState = 'none';
    this.mode = 'action';
    this.damageNumbers = [];
  }

  createAIParty() {
    const types = ['flamepup', 'aquaslime', 'sproutling', 'sparkrat', 'fluffling'];
    const monsters = [];
    for (let i = 0; i < 3; i++) {
      const m = MonsterSystem.createMonster(types[Math.floor(Math.random() * types.length)], 8 + Math.floor(Math.random() * 5));
      if (m) monsters.push(m);
    }
    return monsters;
  }

  handleEvent(event) {
    switch (event.type) {
      case 'damage':
        this.showDamageNumber(event.data);
        if (event.data.effectivenessText) this.showMessage(event.data.effectivenessText);
        this.showMessage(`${event.data.moveName}!`);
        break;
      case 'status_apply':
        this.showMessage(`${event.data.target} is now ${event.data.status}!`);
        break;
      case 'flee_success':
        this.showMessage('Got away safely!');
        setTimeout(() => this.game.switchScene('world'), 1500);
        break;
      case 'flee_fail':
        this.showMessage("Couldn't escape!");
        break;
      case 'victory':
        this.handleVictory();
        break;
      case 'defeat':
        this.handleDefeat();
        break;
    }
  }

  showDamageNumber(data) {
    const playerMonster = this.combatSystem.getCurrentPlayerMonster();
    const isPlayerTarget = data.defender === playerMonster?.instanceId;
    
    this.damageNumbers.push({
      x: isPlayerTarget ? 300 : 1620,
      y: isPlayerTarget ? 700 : 300,
      text: `-${data.damage}${data.isCritical ? '! CRIT!' : ''}`,
      age: 0
    });
  }

  showMessage(text) {
    this.messageText = text;
    this.messageTimer = 2000;
  }

  handleVictory() {
    this.resultState = 'victory';
    this.showMessage('Victory!');
    
    const xp = this.combatSystem.getXpReward();
    const monster = this.combatSystem.getCurrentPlayerMonster();
    const leveled = MonsterSystem.addXp(monster, xp);
    
    setTimeout(() => this.showMessage(`${monster.id} gained ${xp} XP!`), 1000);
    if (leveled) setTimeout(() => this.showMessage(`${monster.id} leveled up!`), 2000);
    
    if (this.isWild) {
      const gold = 50 + Math.floor(Math.random() * 50);
      this.game.getEconomySystem().addGold(gold);
      setTimeout(() => this.showMessage(`Earned ${gold} gold!`), 2500);
    }
    
    this.game.getPartySystem().save();
    setTimeout(() => this.game.switchScene(this.isWild ? 'world' : 'menu'), 3500);
  }

  handleDefeat() {
    this.resultState = 'defeat';
    this.showMessage('Defeated...');
    setTimeout(() => {
      this.showMessage('Your monsters have been healed!');
      this.game.getPartySystem().healAll();
      this.game.getPartySystem().save();
      this.game.switchScene(this.isWild ? 'world' : 'menu');
    }, 2000);
  }

  handleInput() {
    if (this.resultState !== 'none') return;

    const pointer = MakkoEngine.input.getPointerPosition();
    if (!pointer) return;

    if (this.mode === 'action') {
      // Action buttons
      const actions = [
        { x: 50, y: 900, w: 150, h: 50, type: 'attack' },
        { x: 220, y: 900, w: 150, h: 50, type: 'capture' },
        { x: 390, y: 900, w: 150, h: 50, type: 'defend' },
        { x: 560, y: 900, w: 150, h: 50, type: 'flee' }
      ];

      actions.forEach(act => {
        if (pointer.x >= act.x && pointer.x <= act.x + act.w && pointer.y >= act.y && pointer.y <= act.y + act.h) {
          if (MakkoEngine.input.isKeyPressed('Space')) {
            this.handleAction(act.type);
          }
        }
      });
    }
  }

  handleAction(type) {
    if (this.combatSystem.isPlayerTurn()) {
      switch (type) {
        case 'attack':
          // Use first move
          this.combatSystem.performAction({ type: 'attack', moveIndex: 0 });
          break;
        case 'capture':
          this.tryCapture();
          break;
        case 'defend':
          this.combatSystem.performAction({ type: 'defend' });
          break;
        case 'flee':
          this.combatSystem.performAction({ type: 'flee' });
          break;
      }
    }
  }

  tryCapture() {
    if (!this.isWild) return;
    
    const economy = this.game.getEconomySystem();
    if (economy.getItemCount('monster_ball') <= 0) {
      this.showMessage('No capture balls!');
      return;
    }

    economy.useItem('monster_ball');
    economy.save();

    const enemy = this.combatSystem.getCurrentEnemyMonster();
    const chance = CaptureSystem.calculateCaptureChance(enemy, 'monster_ball');
    
    this.showMessage('Monster Ball thrown!');
    
    setTimeout(() => {
      if (Math.random() < chance) {
        this.resultState = 'captured';
        this.showMessage(`Caught ${getMonsterDefinition(enemy.id)?.name}!`);
        this.game.getPartySystem().addMonster(enemy);
        this.game.getPartySystem().save();
        setTimeout(() => this.game.switchScene('world'), 2000);
      } else {
        this.showMessage('It broke free!');
        this.combatSystem.performAction({ type: 'flee' }); // Trigger enemy turn
      }
    }, 1000);
  }

  update(dt) {
    if (this.messageTimer > 0) this.messageTimer -= dt;
    
    // Update damage numbers
    this.damageNumbers = this.damageNumbers.filter(d => {
      d.age += dt;
      d.y -= dt * 0.05;
      return d.age < 1000;
    });
  }

  render() {
    const display = MakkoEngine.display;
    display.clear('#1a1a2e');

    // Arena background
    display.drawRect(0, 0, display.width, 400, { fill: '#16213e' });
    display.drawRect(0, 400, display.width, 200, { fill: '#1e3a1e' });

    const playerMonster = this.combatSystem.getCurrentPlayerMonster();
    const enemyMonster = this.combatSystem.getCurrentEnemyMonster();

    // Draw enemy (top)
    if (enemyMonster) {
      const def = getMonsterDefinition(enemyMonster.id);
      display.drawCircle(1620, 350, 80, { fill: '#444466' });
      display.drawText(def?.name || 'Enemy', 1450, 50, { font: 'bold 24px system-ui', fill: '#ffffff' });
      display.drawText(`Lv${enemyMonster.level}`, 1450, 80, { font: '18px system-ui', fill: '#888888' });
      
      // HP bar
      const hpPct = enemyMonster.currentHp / enemyMonster.maxHp;
      display.drawRoundRect(1450, 110, 200, 20, 4, { fill: '#333333' });
      display.drawRoundRect(1450, 110, 200 * hpPct, 20, 4, { fill: hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444' });
    }

    // Draw player (bottom)
    if (playerMonster) {
      const def = getMonsterDefinition(playerMonster.id);
      display.drawCircle(300, 700, 100, { fill: '#e94560' });
      display.drawCircle(296, 692, 12, { fill: '#ffffff' });
      display.drawCircle(308, 692, 12, { fill: '#ffffff' });
      display.drawText(def?.name || 'Player', 80, 950, { font: 'bold 24px system-ui', fill: '#ffffff' });
      display.drawText(`Lv${playerMonster.level}`, 80, 980, { font: '18px system-ui', fill: '#888888' });
      
      // HP bar
      const hpPct = playerMonster.currentHp / playerMonster.maxHp;
      display.drawRoundRect(80, 1010, 200, 20, 4, { fill: '#333333' });
      display.drawRoundRect(80, 1010, 200 * hpPct, 20, 4, { fill: hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444' });
    }

    // VS text
    display.drawText('VS', display.width / 2 - 25, 420, { font: 'bold 48px system-ui', fill: '#e94560' });

    // Action buttons
    display.drawRect(0, 850, display.width, 250, { fill: 'rgba(22, 33, 62, 0.95)' });
    display.drawRect(0, 850, display.width, 4, { fill: '#e94560' });

    const actions = [
      { label: '⚔️ Attack', x: 50, y: 900 },
      { label: '🪣 Capture', x: 220, y: 900 },
      { label: '🛡️ Defend', x: 390, y: 900 },
      { label: '🏃 Flee', x: 560, y: 900 }
    ];

    actions.forEach(act => {
      display.drawRoundRect(act.x, act.y, 150, 50, 8, { fill: '#3b82f6' });
      display.drawText(act.label, act.x + 20, act.y + 15, { font: '18px system-ui', fill: '#ffffff' });
    });

    // Damage numbers
    this.damageNumbers.forEach(d => {
      const alpha = 1 - d.age / 1000;
      display.drawText(d.text, d.x - 40, d.y, { font: 'bold 28px system-ui', fill: '#ff4444' });
    });

    // Message
    if (this.messageTimer > 0) {
      const metrics = { width: this.messageText.length * 15 };
      display.drawRoundRect(display.width / 2 - metrics.width / 2 - 20, 420, metrics.width + 40, 50, 8, { fill: 'rgba(0,0,0,0.7)' });
      display.drawText(this.messageText, display.width / 2 - metrics.width / 2, 435, { font: 'bold 24px system-ui', fill: '#ffffff' });
    }

    // Result overlay
    if (this.resultState !== 'none') {
      display.drawRect(0, 0, display.width, display.height, { fill: 'rgba(0,0,0,0.5)' });
      const text = this.resultState === 'victory' ? 'VICTORY!' : this.resultState === 'captured' ? 'CAUGHT!' : 'DEFEAT';
      const color = this.resultState === 'defeat' ? '#ef4444' : '#22c55e';
      display.drawText(text, display.width / 2 - 100, display.height / 2 - 30, { font: 'bold 64px system-ui', fill: color });
    }
  }
}

