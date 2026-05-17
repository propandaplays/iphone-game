// World Scene - exploration with random encounters
// MakkoEngine is a global
import { MonsterSystem } from '../systems/MonsterSystem.js';
import { getAllBaseMonsters } from '../data/monsters.js';

export class WorldScene {
  constructor(game) {
    this.game = game;
    this.id = 'world';
    this.playerX = 0;
    this.playerY = 0;
    this.stepCount = 0;
    this.encounterThreshold = 8;
    this.bounceTime = 0;
  }

  enter() {
    const display = MakkoEngine.display;
    this.playerX = display.width / 2;
    this.playerY = display.height / 2 + 50;
    this.stepCount = 0;
  }

  handleInput() {
    if (MakkoEngine.input.isKeyPressed('Escape')) {
      this.game.switchScene('menu');
      return;
    }

    if (MakkoEngine.input.isKeyPressed('Space') && MakkoEngine.input.mouseX > 0 && MakkoEngine.input.mouseY > 0) {
      this.handleTap(MakkoEngine.input.mouseX, MakkoEngine.input.mouseY);
    }
  }

  handleTap(x, y) {
    if (x < 150 && y < 80) return; // Back button area

    const dx = x - this.playerX;
    const dy = y - this.playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 30) {
      this.playerX += (dx / dist) * 40;
      this.playerY += (dy / dist) * 40;

      const display = MakkoEngine.display;
      this.playerX = Math.max(100, Math.min(display.width - 100, this.playerX));
      this.playerY = Math.max(150, Math.min(display.height - 100, this.playerY));

      this.stepCount++;
      if (this.stepCount >= this.encounterThreshold) {
        this.triggerEncounter();
      }
    }
  }

  triggerEncounter() {
    this.stepCount = 0;
    const baseMonsters = getAllBaseMonsters();
    const randomIndex = Math.floor(Math.random() * baseMonsters.length);
    const wildMonsterDef = baseMonsters[randomIndex];
    const wildLevel = 5 + Math.floor(Math.random() * 6);
    const wildMonster = MonsterSystem.createMonster(wildMonsterDef.id, wildLevel);

    if (wildMonster) {
      const playerParty = this.game.getPartySystem().getParty();
      if (playerParty.length > 0 && playerParty.some(m => m.currentHp > 0)) {
        this.game.setPendingWildEncounter(wildMonster);
        this.game.switchScene('battle');
      }
    }
  }

  update(dt) {
    this.bounceTime += dt / 1000;
  }

  render() {
    const display = MakkoEngine.display;
    display.clear('#1a1a2e');

    // Grass pattern
    for (let x = 0; x < display.width; x += 60) {
      for (let y = 100; y < display.height; y += 60) {
        const shade = (Math.floor(x / 60) + Math.floor(y / 60)) % 2 === 0 ? '#1e3a1e' : '#1a321a';
        display.drawRect(x, y, 60, 60, { fill: shade });
      }
    }

    // Path hints
    display.drawCircle(this.playerX, this.playerY + 150, 20, { fill: '#2d4a2d' });
    display.drawCircle(this.playerX, this.playerY - 100, 20, { fill: '#2d4a2d' });

    // Player character
    const bounce = Math.sin(this.bounceTime * 3) * 3;
    display.drawCircle(this.playerX, this.playerY + bounce, 30, { fill: '#e94560' });
    display.drawCircle(this.playerX - 8, this.playerY - 8 + bounce, 6, { fill: '#ffffff' });
    display.drawCircle(this.playerX + 8, this.playerY - 8 + bounce, 6, { fill: '#ffffff' });

    // Back button
    display.drawRoundRect(20, 20, 120, 45, 8, { fill: '#333333' });
    display.drawText('← Back', 45, 35, { font: '18px system-ui', fill: '#ffffff' });

    // Step counter
    display.drawText(`Steps: ${this.stepCount}/${this.encounterThreshold}`, display.width / 2 - 60, 50, { font: '18px system-ui', fill: '#888888' });
    display.drawText('Click to move • Random encounters!', display.width / 2 - 150, display.height - 30, { font: '16px system-ui', fill: '#555555' });
  }
}