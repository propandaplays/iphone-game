// ============================================================================
// MAKKO ENGINE STUB - defines global before any other code runs
// ============================================================================

class MakkoEngineDisplay {
  constructor() {
    this.width = 1920;
    this.height = 1080;
    this.canvas = null;
    this._ctx = null;
  }
  clear(color) {
    if (this._ctx) { this._ctx.fillStyle = color || '#1a1a2e'; this._ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); }
  }
  beginFrame() {}
  endFrame() {}
  setImageSmoothing(val) {}
  setGlobalOffset(x, y) {}
  drawRect(x, y, w, h, style = {}) {
    if (!this._ctx) return;
    const ctx = this._ctx;
    ctx.save();
    if (style.fill) { ctx.fillStyle = style.fill; ctx.fillRect(x, y, w, h); }
    if (style.stroke) { ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lineWidth || 1; ctx.strokeRect(x, y, w, h); }
    ctx.restore();
  }
  drawCircle(x, y, r, style = {}) {
    if (!this._ctx) return;
    const ctx = this._ctx;
    ctx.save();
    if (style.fill) { ctx.fillStyle = style.fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    if (style.stroke) { ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lineWidth || 1; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  drawEllipse(x, y, rx, ry, style = {}) {
    if (!this._ctx) return;
    const ctx = this._ctx;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (style.fill) { ctx.fillStyle = style.fill; ctx.fill(); }
    if (style.stroke) { ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lineWidth || 1; ctx.stroke(); }
    ctx.restore();
  }
  drawRoundRect(x, y, w, h, r, style = {}) {
    if (!this._ctx) return;
    const ctx = this._ctx;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (style.fill) { ctx.fillStyle = style.fill; ctx.fill(); }
    if (style.stroke) { ctx.strokeStyle = style.stroke; ctx.lineWidth = style.lineWidth || 1; ctx.stroke(); }
    ctx.restore();
  }
  drawText(text, x, y, style = {}) {
    if (!this._ctx) return;
    const ctx = this._ctx;
    ctx.save();
    ctx.fillStyle = style.fill || '#fff';
    ctx.font = style.font || '16px sans-serif';
    ctx.textAlign = style.align || 'left';
    ctx.fillText(text, x, y);
    ctx.restore();
  }
  drawLine(x1, y1, x2, y2, style = {}) {
    if (!this._ctx) return;
    const ctx = this._ctx;
    ctx.save();
    ctx.strokeStyle = style.stroke || '#fff';
    ctx.lineWidth = style.lineWidth || 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
  drawArc(x, y, r, startAngle, endAngle, style = {}) {
    if (!this._ctx) return;
    const ctx = this._ctx;
    ctx.save();
    ctx.strokeStyle = style.stroke || '#fff';
    ctx.lineWidth = style.lineWidth || 1;
    ctx.beginPath();
    ctx.arc(x, y, r, startAngle, endAngle);
    ctx.stroke();
    ctx.restore();
  }
  measureText(text, style = {}) {
    if (!this._ctx) return { width: text.length * 10 };
    return { width: this._ctx.measureText(text).width };
  }
}

class MakkoEngineInput {
  constructor() {
    this.mouseX = 0; this.mouseY = 0;
    this._keys = {}; this._keysJustPressed = {}; this._mouseDown = false;
  }
  init(canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) * (1920 / rect.width);
      this.mouseY = (e.clientY - rect.top) * (1080 / rect.height);
    });
    canvas.addEventListener('mousedown', () => { this._mouseDown = true; });
    canvas.addEventListener('mouseup', () => { this._mouseDown = false; });
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (touch.clientX - rect.left) * (1920 / rect.width);
      this.mouseY = (touch.clientY - rect.top) * (1080 / rect.height);
      this._mouseDown = true;
    });
    canvas.addEventListener('touchend', () => { this._mouseDown = false; });
    window.addEventListener('keydown', (e) => { this._keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { this._keys[e.key] = false; });
  }
  isKeyPressed(key) { return this._keysJustPressed[key] || false; }
  isMouseDown() { return this._mouseDown; }
  endFrame() { this._keysJustPressed = {}; }
  capture() {}
  getPointerPosition() { return { x: this.mouseX, y: this.mouseY }; }
}

window.MakkoEngine = { display: new MakkoEngineDisplay(), input: new MakkoEngineInput() };
window.MakkoEngine.initEngine = async function(options) {
  this.display.canvas = options.canvas;
  this.display._ctx = options.canvas.getContext('2d');
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  options.canvas.width = 1920; options.canvas.height = 1080;
  options.canvas.style.width = `${1920 * scale}px`; options.canvas.style.height = `${1080 * scale}px`;
  this.input.init(options.canvas);
  return true;
};

// ============================================================================
// GAME DATA
// ============================================================================

const MONSTER_DEFINITIONS = {
  flamepup: { id: 'flamepup', name: 'Flamepup', type: 'Fire', baseHp: 45, baseAtk: 60, baseDef: 40, baseSpd: 55, evolutionId: 'pyrowolf', evolutionLevel: 16, catchRate: 0.40, xpYield: 50 },
  aquaslime: { id: 'aquaslime', name: 'Aquaslime', type: 'Water', baseHp: 50, baseAtk: 45, baseDef: 50, baseSpd: 45, evolutionId: 'tideguardian', evolutionLevel: 16, catchRate: 0.45, xpYield: 50 },
  sproutling: { id: 'sproutling', name: 'Sproutling', type: 'Grass', baseHp: 55, baseAtk: 45, baseDef: 55, baseSpd: 40, evolutionId: 'bramblebeast', evolutionLevel: 16, catchRate: 0.50, xpYield: 50 },
  sparkrat: { id: 'sparkrat', name: 'Sparkrat', type: 'Electric', baseHp: 40, baseAtk: 55, baseDef: 35, baseSpd: 70, evolutionId: 'thunderclaw', evolutionLevel: 16, catchRate: 0.35, xpYield: 50 },
  fluffling: { id: 'fluffling', name: 'Fluffling', type: 'Normal', baseHp: 50, baseAtk: 50, baseDef: 50, baseSpd: 50, evolutionId: null, evolutionLevel: null, catchRate: 0.60, xpYield: 50 },
  pyrowolf: { id: 'pyrowolf', name: 'Pyrowolf', type: 'Fire', baseHp: 65, baseAtk: 80, baseDef: 55, baseSpd: 70, evolutionId: null, evolutionLevel: null, catchRate: 0.20, xpYield: 120 },
  tideguardian: { id: 'tideguardian', name: 'Tideguardian', type: 'Water', baseHp: 75, baseAtk: 60, baseDef: 70, baseSpd: 55, evolutionId: null, evolutionLevel: null, catchRate: 0.25, xpYield: 120 },
  bramblebeast: { id: 'bramblebeast', name: 'Bramblebeast', type: 'Grass', baseHp: 80, baseAtk: 65, baseDef: 75, baseSpd: 50, evolutionId: null, evolutionLevel: null, catchRate: 0.25, xpYield: 120 },
  thunderclaw: { id: 'thunderclaw', name: 'Thunderclaw', type: 'Electric', baseHp: 55, baseAtk: 75, baseDef: 50, baseSpd: 90, evolutionId: null, evolutionLevel: null, catchRate: 0.15, xpYield: 120 },
  cloudpuff: { id: 'cloudpuff', name: 'Cloudpuff', type: 'Normal', baseHp: 70, baseAtk: 65, baseDef: 65, baseSpd: 65, evolutionId: null, evolutionLevel: null, catchRate: 0.35, xpYield: 120 }
};

const DEFAULT_MOVESETS = {
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

const MOVE_DEFINITIONS = {
  ember: { id: 'ember', name: 'Ember', type: 'Fire', power: 40, maxPp: 25, effect: 'burn', effectChance: 0.1 },
  tackle: { id: 'tackle', name: 'Tackle', type: 'Normal', power: 40, maxPp: 35, effect: 'none', effectChance: 0 },
  quickattack: { id: 'quickattack', name: 'Quick Attack', type: 'Normal', power: 45, maxPp: 30, effect: 'none', effectChance: 0 },
  firefang: { id: 'firefang', name: 'Fire Fang', type: 'Fire', power: 65, maxPp: 15, effect: 'burn', effectChance: 0.2 },
  bubble: { id: 'bubble', name: 'Bubble', type: 'Water', power: 40, maxPp: 25, effect: 'none', effectChance: 0 },
  aquajet: { id: 'aquajet', name: 'Aqua Jet', type: 'Water', power: 45, maxPp: 20, effect: 'none', effectChance: 0 },
  waterpulse: { id: 'waterpulse', name: 'Water Pulse', type: 'Water', power: 60, maxPp: 15, effect: 'none', effectChance: 0 },
  vinewhip: { id: 'vinewhip', name: 'Vine Whip', type: 'Grass', power: 40, maxPp: 25, effect: 'none', effectChance: 0 },
  razorleaf: { id: 'razorleaf', name: 'Razor Leaf', type: 'Grass', power: 60, maxPp: 15, effect: 'none', effectChance: 0 },
  leechseed: { id: 'leechseed', name: 'Leech Seed', type: 'Grass', power: 50, maxPp: 15, effect: 'poison', effectChance: 0.3 },
  thundershock: { id: 'thundershock', name: 'Thundershock', type: 'Electric', power: 40, maxPp: 25, effect: 'paralyze', effectChance: 0.1 },
  spark: { id: 'spark', name: 'Spark', type: 'Electric', power: 60, maxPp: 15, effect: 'paralyze', effectChance: 0.15 },
  headbutt: { id: 'headbutt', name: 'Headbutt', type: 'Normal', power: 60, maxPp: 20, effect: 'none', effectChance: 0 },
  flameburst: { id: 'flameburst', name: 'Flame Burst', type: 'Fire', power: 60, maxPp: 15, effect: 'burn', effectChance: 0.15 },
  inferno: { id: 'inferno', name: 'Inferno', type: 'Fire', power: 90, maxPp: 10, effect: 'burn', effectChance: 0.25 },
  hydroslash: { id: 'hydroslash', name: 'Hydro Slash', type: 'Water', power: 90, maxPp: 10, effect: 'none', effectChance: 0 },
  solarbeam: { id: 'solarbeam', name: 'Solar Beam', type: 'Grass', power: 90, maxPp: 10, effect: 'none', effectChance: 0 },
  electroweb: { id: 'electroweb', name: 'Electroweb', type: 'Electric', power: 50, maxPp: 15, effect: 'paralyze', effectChance: 0.25 },
  thunderbolt: { id: 'thunderbolt', name: 'Thunderbolt', type: 'Electric', power: 90, maxPp: 10, effect: 'paralyze', effectChance: 0.2 },
  slam: { id: 'slam', name: 'Slam', type: 'Normal', power: 80, maxPp: 15, effect: 'none', effectChance: 0 }
};

const TYPE_CHART = {
  Fire: { Grass: 2.0, Water: 0.5, Fire: 1.0, Electric: 1.0, Normal: 1.0 },
  Water: { Fire: 2.0, Grass: 0.5, Water: 1.0, Electric: 0.5, Normal: 1.0 },
  Grass: { Water: 2.0, Fire: 0.5, Grass: 1.0, Electric: 1.0, Normal: 1.0 },
  Electric: { Water: 2.0, Grass: 0.5, Fire: 1.0, Electric: 1.0, Normal: 1.0 },
  Normal: { Fire: 1.0, Water: 1.0, Grass: 1.0, Electric: 1.0, Normal: 1.0 }
};

// ============================================================================
// GAME SYSTEMS
// ============================================================================

let instanceCounter = 0;

function createMonster(monsterId, level = 5) {
  const def = MONSTER_DEFINITIONS[monsterId];
  if (!def) return null;
  const maxHp = Math.floor(def.baseHp * (1 + (level - 1) * 0.1));
  const moveIds = DEFAULT_MOVESETS[monsterId] || ['tackle', 'quickattack', 'headbutt', 'slam'];
  return {
    id: monsterId, instanceId: `${monsterId}_${++instanceCounter}`, level,
    currentHp: maxHp, maxHp,
    attack: Math.floor(def.baseAtk * (1 + (level - 1) * 0.1)),
    defense: Math.floor(def.baseDef * (1 + (level - 1) * 0.1)),
    speed: Math.floor(def.baseSpd * (1 + (level - 1) * 0.1)),
    xp: 0, xpToNextLevel: level * 100, status: 'none', isDefending: false,
    moves: moveIds.map(moveId => ({ moveId, pp: MOVE_DEFINITIONS[moveId]?.maxPp || 10, maxPp: MOVE_DEFINITIONS[moveId]?.maxPp || 10 }))
  };
}

function calcDamage(level, power, attackerAtk, defenderDef, moveType, attackerType, defenderType, isDefending) {
  let dmg = ((2 * level / 5 + 2) * power * attackerAtk / defenderDef / 50 + 2);
  const mult = TYPE_CHART[moveType]?.[defenderType] ?? 1.0;
  dmg *= mult;
  if (moveType === attackerType) dmg *= 1.5;
  if (Math.random() < 0.08) dmg *= 1.5;
  dmg *= (0.85 + Math.random() * 0.15);
  if (isDefending) dmg *= 0.5;
  return Math.max(1, Math.floor(dmg));
}

// Party System
class PartySystem {
  constructor() { this.party = []; this.box = []; this.maxPartySize = 3; }
  initWithStarter(monsterId) { this.party = []; this.box = []; const m = createMonster(monsterId, 5); if (m) this.party.push(m); }
  getParty() { return this.party; } getBox() { return this.box; }
  addMonster(monster) {
    if (this.party.length < this.maxPartySize) { this.party.push(monster); return true; }
    else if (this.box.length < 50) { this.box.push(monster); return true; }
    return false;
  }
  healAll() { this.party.forEach(m => { m.currentHp = m.maxHp; m.status = 'none'; m.isDefending = false; }); }
  hasAliveMembers() { return this.party.some(m => m.currentHp > 0); }
  save() { localStorage.setItem('monster_party', JSON.stringify({ version: 1, party: this.party, box: this.box })); }
  load() {
    const raw = localStorage.getItem('monster_party');
    if (!raw) return false;
    try { const d = JSON.parse(raw); this.party = d.party.map(s => ({ ...s, instanceId: `${s.id}_restored` })); this.box = d.box.map(s => ({ ...s, instanceId: `${s.id}_restored` })); return true; }
    catch { return false; }
  }
  hasSave() { return !!localStorage.getItem('monster_party'); }
}

// Economy System
const BALL_MULTIPLIERS = { 'monster_ball': 1.0, 'great_ball': 1.5, 'ultra_ball': 2.0, 'master_ball': 3.0 };
const SHOP_ITEMS = [
  { id: 'monster_ball', name: 'Monster Ball', price: 100, type: 'ball', effect: 'x1.0' },
  { id: 'great_ball', name: 'Great Ball', price: 300, type: 'ball', effect: 'x1.5' },
  { id: 'ultra_ball', name: 'Ultra Ball', price: 600, type: 'ball', effect: 'x2.0' },
  { id: 'potion', name: 'Potion', price: 200, type: 'heal', effect: 'Heal 20 HP' },
  { id: 'super_potion', name: 'Super Potion', price: 500, type: 'heal', effect: 'Heal 50 HP' },
  { id: 'full_heal', name: 'Full Heal', price: 1000, type: 'heal', effect: 'Heal all HP' }
];

class EconomySystem {
  constructor() { this.gold = 500; this.gems = 0; this.inventory = []; }
  getGold() { return this.gold; } getGems() { return this.gems; }
  addGold(a) { this.gold = Math.min(9999999, this.gold + a); }
  spendGold(a) { if (this.gold < a) return false; this.gold -= a; return true; }
  addGems(a) { this.gems = Math.min(999999, this.gems + a); }
  getItemCount(id) { const item = this.inventory.find(i => i.id === id); return item?.quantity ?? 0; }
  addItem(id, q = 1) { const ex = this.inventory.find(i => i.id === id); if (ex) ex.quantity += q; else this.inventory.push({ id, quantity: q }); }
  useItem(id, q = 1) {
    const ex = this.inventory.find(i => i.id === id);
    if (!ex || ex.quantity < q) return false;
    ex.quantity -= q;
    if (ex.quantity <= 0) this.inventory = this.inventory.filter(i => i.id !== id);
    return true;
  }
  buyItem(item) {
    if (!this.spendGold(item.price)) return false;
    this.addItem(item.id, 1);
    return true;
  }
  save() { localStorage.setItem('monster_economy', JSON.stringify({ version: 1, gold: this.gold, gems: this.gems, inventory: this.inventory })); }
  load() {
    const raw = localStorage.getItem('monster_economy');
    if (!raw) return false;
    try { const d = JSON.parse(raw); this.gold = d.gold; this.gems = d.gems; this.inventory = d.inventory || []; return true; }
    catch { return false; }
  }
  hasSave() { return !!localStorage.getItem('monster_economy'); }
}

// Capture System
function calcCaptureChance(monster, ballType) {
  const def = MONSTER_DEFINITIONS[monster.id];
  if (!def) return 0;
  let chance = def.catchRate * (1 - monster.currentHp / monster.maxHp) * (BALL_MULTIPLIERS[ballType] || 1.0);
  if (ballType === 'master_ball') return 1.0;
  return Math.max(0.05, Math.min(0.95, chance));
}

// ============================================================================
// SCENES
// ============================================================================

class StartScene {
  constructor(g) { this.game = g; this.id = 'start'; this.bounceTime = 0; }
  enter() { this.startBtn = { x: MakkoEngine.display.width / 2 - 125, y: MakkoEngine.display.height * 0.65, w: 250, h: 70 }; }
  handleInput() {
    const p = MakkoEngine.input.getPointerPosition();
    if (p) {
      this.startBtn.hover = p.x >= this.startBtn.x && p.x <= this.startBtn.x + this.startBtn.w && p.y >= this.startBtn.y && p.y <= this.startBtn.y + this.startBtn.h;
      if (this.startBtn.hover && MakkoEngine.input.isKeyPressed('Space')) this.game.switchScene('menu');
    }
    if (MakkoEngine.input.isKeyPressed('Enter') || MakkoEngine.input.isKeyPressed('Space')) this.game.switchScene('menu');
  }
  update(dt) { this.bounceTime += dt / 1000; }
  render() {
    const d = MakkoEngine.display, cx = d.width / 2, ty = d.height * 0.3;
    d.clear('#1a1a2e');
    d.drawCircle(cx, ty + 80, 250, { fill: '#16213e', stroke: '#e94560', lineWidth: 3 });
    d.drawCircle(cx, ty + 80, 220, { stroke: '#3b82f6', lineWidth: 2 });
    d.drawText('Monster Tamer', cx - 200, ty, { font: 'bold 72px system-ui', fill: '#e94560' });
    d.drawText('Build your team. Catch them all!', cx - 180, ty + 60, { font: '24px system-ui', fill: '#888888' });
    ['🔥', '💧', '🌿', '⚡', '🐾'].forEach((icon, i) => d.drawText(icon, cx - 100 + i * 50, ty + 150, { font: '32px system-ui' }));
    d.drawRoundRect(this.startBtn.x, this.startBtn.y, this.startBtn.w, this.startBtn.h, 8, { fill: this.startBtn.hover ? '#2563eb' : '#3b82f6' });
    d.drawText('▶ Start Game', this.startBtn.x + 55, this.startBtn.y + 22, { font: 'bold 24px system-ui', fill: '#ffffff' });
    d.drawText('Press ENTER or tap to start', cx - 100, d.height - 60, { font: '16px system-ui', fill: '#555555' });
  }
}

class MenuScene {
  constructor(g) { this.game = g; this.id = 'menu'; this.buttons = [
    { label: '🌍  Explore', scene: 'world' }, { label: '⚔️  PvP Arena', scene: 'pvp' },
    { label: '🛒  Shop', scene: 'shop' }, { label: '🐾  Party', scene: 'party' },
    { label: '⚙️  Settings', scene: 'settings' }
  ]; }
  enter() {
    const cx = MakkoEngine.display.width / 2, sy = MakkoEngine.display.height * 0.38;
    this.buttons.forEach((btn, i) => { btn.x = cx - 160; btn.y = sy + i * 85; btn.w = 320; btn.h = 65; btn.hover = false; });
  }
  handleInput() {
    const p = MakkoEngine.input.getPointerPosition();
    if (p) this.buttons.forEach(btn => {
      btn.hover = p.x >= btn.x && p.x <= btn.x + btn.w && p.y >= btn.y && p.y <= btn.y + btn.h;
      if (btn.hover && MakkoEngine.input.isKeyPressed('Space')) this.game.switchScene(btn.scene);
    });
  }
  update(dt) {}
  render() {
    const d = MakkoEngine.display, cx = d.width / 2;
    d.clear('#1a1a2e');
    d.drawRect(0, 0, d.width, 220, { fill: '#16213e' });
    d.drawRect(0, 218, d.width, 4, { fill: '#e94560' });
    d.drawText('Monster Tamer', cx - 180, 80, { font: 'bold 56px system-ui', fill: '#e94560' });
    d.drawText('Build your team. Catch them all!', cx - 180, 140, { font: '20px system-ui', fill: '#888888' });
    this.buttons.forEach(btn => {
      d.drawRoundRect(btn.x, btn.y, btn.w, btn.h, 8, { fill: btn.hover ? '#2563eb' : '#3b82f6' });
      d.drawText(btn.label, btn.x + 50, btn.y + 18, { font: 'bold 22px system-ui', fill: '#ffffff' });
    });
    d.drawText('v1.0', cx - 15, d.height - 40, { font: '14px system-ui', fill: '#444444' });
  }
}

class WorldScene {
  constructor(g) { this.game = g; this.id = 'world'; this.stepCount = 0; this.bounceTime = 0; }
  enter() {
    const d = MakkoEngine.display;
    this.playerX = d.width / 2; this.playerY = d.height / 2 + 50; this.stepCount = 0;
  }
  handleInput() {
    if (MakkoEngine.input.isKeyPressed('Escape')) { this.game.switchScene('menu'); return; }
    if (MakkoEngine.input.isKeyPressed('Space') && MakkoEngine.input.mouseX > 0) {
      const mx = MakkoEngine.input.mouseX, my = MakkoEngine.input.mouseY;
      if (mx > 150 || my > 80) {
        const dx = mx - this.playerX, dy = my - this.playerY, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 30) {
          const d = MakkoEngine.display;
          this.playerX += (dx / dist) * 40; this.playerY += (dy / dist) * 40;
          this.playerX = Math.max(100, Math.min(d.width - 100, this.playerX));
          this.playerY = Math.max(150, Math.min(d.height - 100, this.playerY));
          this.stepCount++;
          if (this.stepCount >= 8) this.triggerEncounter();
        }
      }
    }
  }
  triggerEncounter() {
    this.stepCount = 0;
    const bases = Object.values(MONSTER_DEFINITIONS).filter(m => m.evolutionId);
    const def = bases[Math.floor(Math.random() * bases.length)];
    const monster = createMonster(def.id, 5 + Math.floor(Math.random() * 6));
    if (monster && this.game.partySystem.getParty().some(m => m.currentHp > 0)) {
      this.game.setPendingWildEncounter(monster);
      this.game.switchScene('battle');
    }
  }
  update(dt) { this.bounceTime += dt / 1000; }
  render() {
    const d = MakkoEngine.display;
    d.clear('#1a1a2e');
    for (let x = 0; x < d.width; x += 60) for (let y = 100; y < d.height; y += 60) d.drawRect(x, y, 60, 60, { fill: (Math.floor(x / 60) + Math.floor(y / 60)) % 2 === 0 ? '#1e3a1e' : '#1a321a' });
    d.drawCircle(this.playerX, this.playerY + 150, 20, { fill: '#2d4a2d' });
    d.drawCircle(this.playerX, this.playerY - 100, 20, { fill: '#2d4a2d' });
    const bounce = Math.sin(this.bounceTime * 3) * 3;
    d.drawCircle(this.playerX, this.playerY + bounce, 30, { fill: '#e94560' });
    d.drawCircle(this.playerX - 8, this.playerY - 8 + bounce, 6, { fill: '#ffffff' });
    d.drawCircle(this.playerX + 8, this.playerY - 8 + bounce, 6, { fill: '#ffffff' });
    d.drawRoundRect(20, 20, 120, 45, 8, { fill: '#333333' });
    d.drawText('← Back', 45, 35, { font: '18px system-ui', fill: '#ffffff' });
    d.drawText(`Steps: ${this.stepCount}/8`, d.width / 2 - 60, 50, { font: '18px system-ui', fill: '#888888' });
    d.drawText('Click to move • Random encounters!', d.width / 2 - 150, d.height - 30, { font: '16px system-ui', fill: '#555555' });
  }
}

class BattleScene {
  constructor(g) { this.game = g; this.id = 'battle'; this.resultState = 'none'; this.messageText = ''; this.messageTimer = 0; this.damageNumbers = []; }
  enter() {
    const wild = this.game.pendingWildEncounter;
    this.isWild = !!wild;
    this.playerMonsters = [...this.game.partySystem.getParty()];
    if (wild) this.enemyMonsters = [wild];
    else {
      const types = ['flamepup', 'aquaslime', 'sproutling', 'sparkrat', 'fluffling'];
      this.enemyMonsters = [];
      for (let i = 0; i < 3; i++) { const m = createMonster(types[Math.floor(Math.random() * types.length)], 8 + Math.floor(Math.random() * 5)); if (m) this.enemyMonsters.push(m); }
    }
    this.resultState = 'none'; this.damageNumbers = [];
  }
  getPlayerMonster() { return this.playerMonsters[0]; }
  getEnemyMonster() { return this.enemyMonsters[0]; }
  handleInput() {
    if (this.resultState !== 'none') return;
    const p = MakkoEngine.input.getPointerPosition();
    if (!p) return;
    const actions = [
      { x: 50, y: 900, w: 150, h: 50, type: 'attack' },
      { x: 220, y: 900, w: 150, h: 50, type: 'capture' },
      { x: 390, y: 900, w: 150, h: 50, type: 'defend' },
      { x: 560, y: 900, w: 150, h: 50, type: 'flee' }
    ];
    actions.forEach(act => {
      if (p.x >= act.x && p.x <= act.x + act.w && p.y >= act.y && p.y <= act.y + act.h && MakkoEngine.input.isKeyPressed('Space')) {
        if (act.type === 'attack') this.doAttack();
        else if (act.type === 'capture') this.tryCapture();
        else if (act.type === 'defend') this.getPlayerMonster().isDefending = true;
        else if (act.type === 'flee' && this.isWild && Math.random() < 0.5 + (this.getPlayerMonster().speed - this.getEnemyMonster().speed) * 0.001) {
          this.showMessage('Got away!'); setTimeout(() => this.game.switchScene('world'), 1500);
        }
      }
    });
  }
  doAttack() {
    const p = this.getPlayerMonster(), e = this.getEnemyMonster();
    if (!p || !e) return;
    const move = p.moves[0], moveDef = MOVE_DEFINITIONS[move.moveId];
    const pDef = MONSTER_DEFINITIONS[p.id], eDef = MONSTER_DEFINITIONS[e.id];
    const dmg = calcDamage(p.level, moveDef.power, p.attack, e.defense, moveDef.type, pDef.type, eDef.type, e.isDefending);
    e.currentHp = Math.max(0, e.currentHp - dmg);
    this.showMessage(`${moveDef.name}!`);
    this.damageNumbers.push({ x: 1620, y: 300, text: `-${dmg}`, age: 0 });
    move.pp--;
    e.isDefending = false;
    if (e.currentHp <= 0) {
      this.resultState = 'victory'; this.showMessage('Victory!');
      const xp = eDef.xpYield;
      p.xp += xp;
      if (p.xp >= p.xpToNextLevel) { p.level++; p.xp -= p.xpToNextLevel; p.xpToNextLevel = p.level * 100; this.showMessage('Level up!'); }
      if (this.isWild) { const gold = 50 + Math.floor(Math.random() * 50); this.game.economySystem.addGold(gold); }
      this.game.partySystem.save();
      setTimeout(() => this.game.switchScene(this.isWild ? 'world' : 'menu'), 2000);
    } else {
      setTimeout(() => this.doEnemyTurn(), 1000);
    }
  }
  doEnemyTurn() {
    const e = this.getEnemyMonster(), p = this.getPlayerMonster();
    if (!e || !p || e.currentHp <= 0) return;
    const move = e.moves[0], moveDef = MOVE_DEFINITIONS[move.moveId];
    const eDef = MONSTER_DEFINITIONS[e.id], pDef = MONSTER_DEFINITIONS[p.id];
    const dmg = calcDamage(e.level, moveDef.power, e.attack, p.defense, moveDef.type, eDef.type, pDef.type, p.isDefending);
    p.currentHp = Math.max(0, p.currentHp - dmg);
    this.showMessage(`${moveDef.name}!`);
    this.damageNumbers.push({ x: 300, y: 700, text: `-${dmg}`, age: 0 });
    move.pp--;
    p.isDefending = false;
    if (p.currentHp <= 0) {
      this.resultState = 'defeat'; this.showMessage('Defeated...');
      setTimeout(() => { this.game.partySystem.healAll(); this.game.partySystem.save(); this.game.switchScene(this.isWild ? 'world' : 'menu'); }, 2000);
    }
  }
  tryCapture() {
    if (!this.isWild) return;
    const econ = this.game.economySystem;
    if (econ.getItemCount('monster_ball') <= 0) { this.showMessage('No capture balls!'); return; }
    econ.useItem('monster_ball'); econ.save();
    const e = this.getEnemyMonster();
    this.showMessage('Monster Ball thrown!');
    setTimeout(() => {
      if (Math.random() < calcCaptureChance(e, 'monster_ball')) {
        this.resultState = 'captured'; this.showMessage(`Caught ${MONSTER_DEFINITIONS[e.id].name}!`);
        this.game.partySystem.addMonster(e); this.game.partySystem.save();
        setTimeout(() => this.game.switchScene('world'), 2000);
      } else {
        this.showMessage('It broke free!'); setTimeout(() => this.doEnemyTurn(), 1000);
      }
    }, 1000);
  }
  showMessage(text) { this.messageText = text; this.messageTimer = 2000; }
  update(dt) {
    if (this.messageTimer > 0) this.messageTimer -= dt;
    this.damageNumbers = this.damageNumbers.filter(d => { d.age += dt; d.y -= dt * 0.05; return d.age < 1000; });
  }
  render() {
    const d = MakkoEngine.display;
    d.clear('#1a1a2e');
    d.drawRect(0, 0, d.width, 400, { fill: '#16213e' });
    d.drawRect(0, 400, d.width, 200, { fill: '#1e3a1e' });
    
    const p = this.getPlayerMonster(), e = this.getEnemyMonster();
    
    if (e) {
      const def = MONSTER_DEFINITIONS[e.id];
      d.drawCircle(1620, 350, 80, { fill: '#444466' });
      d.drawText(def.name, 1450, 50, { font: 'bold 24px system-ui', fill: '#ffffff' });
      d.drawText(`Lv${e.level}`, 1450, 80, { font: '18px system-ui', fill: '#888888' });
      const hpPct = e.currentHp / e.maxHp;
      d.drawRoundRect(1450, 110, 200, 20, 4, { fill: '#333333' });
      d.drawRoundRect(1450, 110, 200 * hpPct, 20, 4, { fill: hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444' });
    }
    
    if (p) {
      const def = MONSTER_DEFINITIONS[p.id];
      d.drawCircle(300, 700, 100, { fill: '#e94560' });
      d.drawCircle(296, 692, 12, { fill: '#ffffff' });
      d.drawCircle(308, 692, 12, { fill: '#ffffff' });
      d.drawText(def.name, 80, 950, { font: 'bold 24px system-ui', fill: '#ffffff' });
      d.drawText(`Lv${p.level}`, 80, 980, { font: '18px system-ui', fill: '#888888' });
      const hpPct = p.currentHp / p.maxHp;
      d.drawRoundRect(80, 1010, 200, 20, 4, { fill: '#333333' });
      d.drawRoundRect(80, 1010, 200 * hpPct, 20, 4, { fill: hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444' });
    }
    
    d.drawText('VS', d.width / 2 - 25, 420, { font: 'bold 48px system-ui', fill: '#e94560' });
    
    d.drawRect(0, 850, d.width, 250, { fill: 'rgba(22, 33, 62, 0.95)' });
    d.drawRect(0, 850, d.width, 4, { fill: '#e94560' });
    
    const actions = [{ label: '⚔️ Attack', x: 50 }, { label: '🪣 Capture', x: 220 }, { label: '🛡️ Defend', x: 390 }, { label: '🏃 Flee', x: 560 }];
    actions.forEach(a => { d.drawRoundRect(a.x, 900, 150, 50, 8, { fill: '#3b82f6' }); d.drawText(a.label, a.x + 20, 915, { font: '18px system-ui', fill: '#ffffff' }); });
    
    this.damageNumbers.forEach(dn => d.drawText(dn.text, dn.x - 40, dn.y, { font: 'bold 28px system-ui', fill: '#ff4444' }));
    
    if (this.messageTimer > 0) {
      d.drawRoundRect(d.width / 2 - 100, 420, 200, 50, 8, { fill: 'rgba(0,0,0,0.7)' });
      d.drawText(this.messageText, d.width / 2 - 60, 435, { font: 'bold 24px system-ui', fill: '#ffffff' });
    }
    
    if (this.resultState !== 'none') {
      d.drawRect(0, 0, d.width, d.height, { fill: 'rgba(0,0,0,0.5)' });
      const text = this.resultState === 'victory' ? 'VICTORY!' : this.resultState === 'captured' ? 'CAUGHT!' : 'DEFEAT';
      d.drawText(text, d.width / 2 - 100, d.height / 2 - 30, { font: 'bold 64px system-ui', fill: this.resultState === 'defeat' ? '#ef4444' : '#22c55e' });
    }
  }
}

class PartyScene {
  constructor(g) { this.game = g; this.id = 'party'; }
  enter() {}
  handleInput() { if (MakkoEngine.input.isKeyPressed('Escape')) this.game.switchScene('menu'); }
  update(dt) {}
  render() {
    const d = MakkoEngine.display;
    d.clear('#1a1a2e');
    d.drawRect(0, 0, d.width, 100, { fill: '#16213e' });
    d.drawRect(0, 98, d.width, 4, { fill: '#e94560' });
    d.drawText('Party', 30, 35, { font: 'bold 36px system-ui', fill: '#ffffff' });
    d.drawText(`💰 ${this.game.economySystem.getGold()}`, d.width - 350, 35, { font: '18px system-ui', fill: '#ffc947' });
    d.drawText(`💎 ${this.game.economySystem.getGems()}`, d.width - 200, 35, { font: '18px system-ui', fill: '#e94560' });
    
    const party = this.game.partySystem.getParty();
    d.drawText('Your Team:', 50, 150, { font: 'bold 24px system-ui', fill: '#888888' });
    
    party.forEach((monster, i) => {
      const def = MONSTER_DEFINITIONS[monster.id];
      const y = 200 + i * 100;
      d.drawRoundRect(50, y, 400, 80, 12, { fill: '#16213e', stroke: monster.currentHp > 0 ? '#3b82f6' : '#666666', lineWidth: 2 });
      d.drawText(def.name, 70, y + 15, { font: 'bold 22px system-ui', fill: '#ffffff' });
      d.drawText(`Lv. ${monster.level}`, 70, y + 45, { font: '16px system-ui', fill: '#888888' });
      const hpPct = monster.currentHp / monster.maxHp;
      d.drawRoundRect(70, y + 60, 200, 12, 4, { fill: '#333333' });
      d.drawRoundRect(70, y + 60, 200 * hpPct, 12, 4, { fill: hpPct > 0.5 ? '#22c55e' : '#ef4444' });
      if (monster.currentHp <= 0) d.drawText('💀 FAINTED', 300, y + 50, { font: '14px system-ui', fill: '#ef4444' });
    });
    
    d.drawText(`Box: ${this.game.partySystem.getBox().length}/50`, 500, 150, { font: '20px system-ui', fill: '#888888' });
    d.drawRoundRect(20, 20, 120, 45, 8, { fill: '#333333' });
    d.drawText('← Back', 45, 35, { font: '18px system-ui', fill: '#ffffff' });
    d.drawText('💚 Party healed!', d.width / 2 - 60, d.height - 50, { font: '16px system-ui', fill: '#22c55e' });
  }
}

class ShopScene {
  constructor(g) { this.game = g; this.id = 'shop'; }
  enter() {}
  handleInput() { if (MakkoEngine.input.isKeyPressed('Escape')) this.game.switchScene('menu'); }
  update(dt) {}
  render() {
    const d = MakkoEngine.display, econ = this.game.economySystem;
    d.clear('#1a1a2e');
    d.drawRect(0, 0, d.width, 120, { fill: '#16213e' });
    d.drawRect(0, 118, d.width, 4, { fill: '#e94560' });
    d.drawText('🛒 Shop', 30, 40, { font: 'bold 36px system-ui', fill: '#ffffff' });
    d.drawText(`💰 ${econ.getGold()} Gold`, d.width - 250, 40, { font: '24px system-ui', fill: '#ffc947' });
    d.drawText(`💎 ${econ.getGems()} Gems`, d.width - 120, 40, { font: '24px system-ui', fill: '#e94560' });
    
    SHOP_ITEMS.forEach((item, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 80 + col * 220, y = 200 + row * 140;
      const canAfford = econ.getGold() >= item.price;
      d.drawRoundRect(x, y, 200, 120, 12, { fill: '#16213e', stroke: canAfford ? '#3b82f6' : '#666666', lineWidth: 2 });
      d.drawText(item.type === 'ball' ? '🪣' : '💊', x + 20, y + 15, { font: '40px system-ui' });
      d.drawText(item.name, x + 80, y + 20, { font: 'bold 18px system-ui', fill: '#ffffff' });
      d.drawText(item.effect, x + 80, y + 45, { font: '14px system-ui', fill: '#888888' });
      d.drawText(`${item.price} 💰`, x + 20, y + 85, { font: 'bold 20px system-ui', fill: canAfford ? '#ffc947' : '#ef4444' });
      const owned = econ.getItemCount(item.id);
      if (owned > 0) d.drawText(`Owned: ${owned}`, x + 120, y + 85, { font: '14px system-ui', fill: '#888888' });
    });
    
    d.drawRoundRect(20, 20, 120, 45, 8, { fill: '#333333' });
    d.drawText('← Back', 45, 35, { font: '18px system-ui', fill: '#ffffff' });
  }
}

class PvPArenaScene {
  constructor(g) { this.game = g; this.id = 'pvp'; this.isSearching = false; this.searchTime = 0; }
  enter() { this.isSearching = false; this.searchTime = 0; }
  handleInput() { if (MakkoEngine.input.isKeyPressed('Escape')) this.game.switchScene('menu'); }
  update(dt) {
    if (this.isSearching) {
      this.searchTime += dt / 1000;
      if (this.searchTime >= 2.5) { this.isSearching = false; this.game.switchScene('battle'); }
    }
  }
  render() {
    const d = MakkoEngine.display, cx = d.width / 2, cy = d.height / 2;
    d.clear('#1a1a2e');
    d.drawCircle(cx, cy + 50, 200, { stroke: '#e94560', lineWidth: 4 });
    d.drawCircle(cx, cy + 50, 180, { stroke: '#3b82f6', lineWidth: 2 });
    d.drawRect(0, 0, d.width, 100, { fill: '#16213e' });
    d.drawRect(0, 98, d.width, 4, { fill: '#e94560' });
    d.drawText('⚔️ PvP Arena', 30, 40, { font: 'bold 36px system-ui', fill: '#ffffff' });
    d.drawText(`💎 ${this.game.economySystem.getGems()}`, d.width - 120, 40, { font: '24px system-ui', fill: '#e94560' });
    d.drawText('🏆 Bronze', cx - 50, 40, { font: '20px system-ui', fill: '#cd7f32' });
    
    if (this.isSearching) {
      const angle = (this.searchTime * 2) % (Math.PI * 2);
      d.drawArc(cx, cy, 80, angle, angle + Math.PI * 1.5, { stroke: '#e94560', lineWidth: 6 });
      d.drawText('🔍 Searching...', cx - 80, cy + 120, { font: '24px system-ui', fill: '#ffffff' });
    } else {
      d.drawText('Test your team against other tamers!', cx - 200, cy - 50, { font: '24px system-ui', fill: '#888888' });
      d.drawRoundRect(cx - 125, cy + 100, 250, 70, 8, { fill: '#3b82f6' });
      d.drawText('⚔️ Find Match', cx - 60, cy + 120, { font: 'bold 24px system-ui', fill: '#ffffff' });
      const party = this.game.partySystem.getParty();
      d.drawText('Your Team:', 50, 150, { font: 'bold 20px system-ui', fill: '#888888' });
      party.forEach((m, i) => d.drawText(`• ${m.id} Lv${m.level}`, 50, 180 + i * 30, { font: '16px system-ui', fill: '#ffffff' }));
    }
    d.drawRoundRect(20, 20, 120, 45, 8, { fill: '#333333' });
    d.drawText('← Back', 45, 35, { font: '18px system-ui', fill: '#ffffff' });
  }
}

class SettingsScene {
  constructor(g) { this.game = g; this.id = 'settings'; }
  enter() {}
  handleInput() { if (MakkoEngine.input.isKeyPressed('Escape')) this.game.switchScene('menu'); }
  update(dt) {}
  render() {
    const d = MakkoEngine.display, cx = d.width / 2;
    d.clear('#1a1a2e');
    d.drawRect(0, 0, d.width, 100, { fill: '#16213e' });
    d.drawRect(0, 98, d.width, 4, { fill: '#e94560' });
    d.drawText('⚙️ Settings', 30, 40, { font: 'bold 36px system-ui', fill: '#ffffff' });
    d.drawRoundRect(cx - 250, 150, 500, 400, 16, { fill: '#16213e', stroke: '#3b82f6', lineWidth: 2 });
    d.drawText('🔊 Sound', cx - 200, 180, { font: 'bold 24px system-ui', fill: '#ffffff' });
    d.drawText('Music: On', cx - 170, 220, { font: '18px system-ui', fill: '#888888' });
    d.drawText('🖥️ Display', cx - 200, 300, { font: 'bold 24px system-ui', fill: '#ffffff' });
    d.drawText('Canvas: 1920x1080', cx - 170, 340, { font: '18px system-ui', fill: '#888888' });
    d.drawText('Touch: Enabled', cx - 170, 370, { font: '18px system-ui', fill: '#888888' });
    d.drawText('💾 Save Data', cx - 200, 420, { font: 'bold 24px system-ui', fill: '#ffffff' });
    d.drawText(`Party: ${this.game.partySystem.getParty().length} monsters`, cx - 170, 460, { font: '18px system-ui', fill: '#888888' });
    d.drawRoundRect(20, 20, 120, 45, 8, { fill: '#333333' });
    d.drawText('← Back', 45, 35, { font: '18px system-ui', fill: '#ffffff' });
  }
}

// ============================================================================
// GAME CLASS
// ============================================================================

class Game {
  constructor() {
    this.scenes = new Map();
    this.partySystem = new PartySystem();
    this.economySystem = new EconomySystem();
    this.pendingWildEncounter = null;
  }
  
  init() {
    if (this.partySystem.hasSave()) this.partySystem.load();
    else { this.partySystem.initWithStarter('flamepup'); this.partySystem.save(); }
    if (this.economySystem.hasSave()) this.economySystem.load();
    else { this.economySystem.addItem('monster_ball', 5); this.economySystem.save(); }
    
    [new StartScene(this), new MenuScene(this), new WorldScene(this), new BattleScene(this), new PartyScene(this), new ShopScene(this), new PvPArenaScene(this), new SettingsScene(this)].forEach(s => { s.game = this; this.scenes.set(s.id, s); });
  }
  
  start() {
    this.switchScene('start');
    const loop = () => {
      const now = performance.now();
      if (this.currentScene) { this.currentScene.handleInput?.(); this.currentScene.update?.(now - this.lastTime); }
      this.lastTime = now;
      this.render();
      requestAnimationFrame(loop);
    };
    this.lastTime = performance.now();
    loop();
  }
  
  render() {
    MakkoEngine.display.beginFrame();
    MakkoEngine.display.clear('#1a1a2e');
    this.currentScene?.render?.();
    MakkoEngine.display.endFrame();
    MakkoEngine.input.endFrame();
  }
  
  switchScene(id) {
    const newScene = this.scenes.get(id);
    if (!newScene) return;
    this.currentScene = newScene;
    this.currentScene.enter?.();
  }
  
  setPendingWildEncounter(m) { this.pendingWildEncounter = m; }
  getPendingWildEncounter() { return this.pendingWildEncounter; }
}

// ============================================================================
// START GAME
// ============================================================================

(async () => {
  await MakkoEngine.initEngine({ canvas: document.getElementById('gameCanvas'), width: 1920, height: 1080 });
  MakkoEngine.display.setImageSmoothing(false);
  MakkoEngine.input.capture(['Space', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  
  const game = new Game();
  game.init();
  game.start();
})().catch(console.error);