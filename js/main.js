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
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (touch.clientX - rect.left) * (1920 / rect.width);
      this.mouseY = (touch.clientY - rect.top) * (1080 / rect.height);
      this._mouseDown = true;
    });
    canvas.addEventListener('touchend', () => { this._mouseDown = false; });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (touch.clientX - rect.left) * (1920 / rect.width);
      this.mouseY = (touch.clientY - rect.top) * (1080 / rect.height);
    });
    window.addEventListener('keydown', (e) => { this._keys[e.key] = true; if (!this._keysJustPressed[e.key]) this._keysJustPressed[e.key] = true; });
    window.addEventListener('keyup', (e) => { this._keys[e.key] = false; });
  }
  isKeyPressed(key) { return this._keysJustPressed[key] || false; }
  isMouseDown() { return this._mouseDown; }
  isPointerDown() { return this._mouseDown; }
  endFrame() { this._keysJustPressed = {}; }
  capture() {}
  getPointerPosition() { return { x: this.mouseX, y: this.mouseY }; }
}

window.MakkoEngine = { display: new MakkoEngineDisplay(), input: new MakkoEngineInput() };
window.MakkoEngine.initEngine = async function(options) {
  this.display.canvas = options.canvas;
  this.display._ctx = options.canvas.getContext('2d');
  const w = window.innerWidth, h = window.innerHeight;
  const scale = Math.min(w / 1920, h / 1080);
  options.canvas.width = w; options.canvas.height = h;
  this.display.width = w; this.display.height = h;
  options.canvas.style.width = `${w}px`; options.canvas.style.height = `${h}px`;
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
    if (p && p.x && p.y) {
      this.startBtn.hover = p.x >= this.startBtn.x && p.x <= this.startBtn.x + this.startBtn.w && p.y >= this.startBtn.y && p.y <= this.startBtn.y + this.startBtn.h;
      if (this.startBtn.hover && (MakkoEngine.input.isKeyPressed('Space') || MakkoEngine.input.isPointerDown())) this.game.switchScene('menu');
    }
    if (MakkoEngine.input.isKeyPressed('Enter') || MakkoEngine.input.isKeyPressed('Space')) this.game.switchScene('menu');
  }
  update(dt) { this.bounceTime += dt / 1000; }
  render() {
    const d = MakkoEngine.display, cx = d.width / 2, ty = d.height * 0.25;
    const scale = Math.min(d.width / 800, d.height / 600);
    const uiScale = Math.max(0.5, Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    d.clear('#1a1a2e');
    d.drawCircle(cx, ty + 60, 180 * uiScale, { fill: '#16213e', stroke: '#e94560', lineWidth: Math.max(2, 3 * uiScale) });
    d.drawCircle(cx, ty + 60, 160 * uiScale, { stroke: '#3b82f6', lineWidth: 2 });
    d.drawText('Monster Tamer', cx - 160 * uiScale, ty, { font: `bold ${Math.round(56 * uiScale)}px system-ui`, fill: '#e94560' });
    d.drawText('Build your team. Catch them all!', cx - 140 * uiScale, ty + 50 * uiScale, { font: `${Math.round(20 * uiScale)}px system-ui`, fill: '#888888' });
    const iconSpacing = 45 * uiScale;
    ['🔥', '💧', '🌿', '⚡', '🐾'].forEach((icon, i) => d.drawText(icon, cx - iconSpacing * 2.5 + i * iconSpacing, ty + 110 * uiScale, { font: `${Math.round(28 * uiScale)}px system-ui` }));
    const btnW = 280 * uiScale, btnH = 80 * uiScale;
    this.startBtn.x = cx - btnW / 2; this.startBtn.y = d.height * 0.65; this.startBtn.w = btnW; this.startBtn.h = btnH;
    d.drawRoundRect(this.startBtn.x, this.startBtn.y, this.startBtn.w, this.startBtn.h, 8, { fill: this.startBtn.hover ? '#2563eb' : '#3b82f6' });
    d.drawText('▶ Start Game', this.startBtn.x + btnW / 2 - 70 * uiScale, this.startBtn.y + btnH / 2 + 8, { font: `bold ${Math.round(22 * uiScale)}px system-ui`, fill: '#ffffff' });
    d.drawText('Tap to start', cx - 60 * uiScale, d.height - 40, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#555555' });
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
      if (btn.hover && (MakkoEngine.input.isKeyPressed('Space') || MakkoEngine.input.isPointerDown())) this.game.switchScene(btn.scene);
    });
  }
  update(dt) {}
  render() {
    const d = MakkoEngine.display, cx = d.width / 2;
    const scale = Math.min(d.width / 800, d.height / 600);
    const uiScale = Math.max(0.5, scale);
    d.clear('#1a1a2e');
    d.drawRect(0, 0, d.width, 180 * uiScale, { fill: '#16213e' });
    d.drawRect(0, 180 * uiScale - 2, d.width, 4, { fill: '#e94560' });
    d.drawText('Monster Tamer', cx - 160 * uiScale, 65 * uiScale, { font: `bold ${Math.round(48 * uiScale)}px system-ui`, fill: '#e94560' });
    d.drawText('Build your team. Catch them all!', cx - 150 * uiScale, 115 * uiScale, { font: `${Math.round(18 * uiScale)}px system-ui`, fill: '#888888' });
    this.buttons.forEach((btn, i) => {
      btn.x = cx - 180 * uiScale; btn.y = d.height * 0.38 + i * 75 * uiScale; btn.w = 360 * uiScale; btn.h = 70 * uiScale;
      d.drawRoundRect(btn.x, btn.y, btn.w, btn.h, 8, { fill: btn.hover ? '#2563eb' : '#3b82f6' });
      d.drawText(btn.label, btn.x + 50 * uiScale, btn.y + btn.h / 2 + 6, { font: `bold ${Math.round(20 * uiScale)}px system-ui`, fill: '#ffffff' });
    });
    d.drawText('v1.0', cx - 15, d.height - 30, { font: `${Math.round(14 * uiScale)}px system-ui`, fill: '#444444' });
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
    const scale = Math.min(MakkoEngine.display.width / 800, MakkoEngine.display.height / 600);
    const uiScale = Math.max(0.5, scale);
    const bw = 120 * uiScale, bh = 50 * uiScale;
    const p = MakkoEngine.input.getPointerPosition();
    if (p && p.x >= 20 && p.x <= 20 + bw && p.y >= 20 && p.y <= 20 + bh && (MakkoEngine.input.isKeyPressed('Space') || MakkoEngine.input.isPointerDown())) { this.game.switchScene('menu'); return; }
    if ((MakkoEngine.input.isKeyPressed('Space') || MakkoEngine.input.isPointerDown()) && MakkoEngine.input.mouseX > 0) {
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
    const scale = Math.min(d.width / 800, d.height / 600);
    const uiScale = Math.max(0.5, scale);
    this.backBtn = { x: 20, y: 20, w: 120 * uiScale, h: 50 * uiScale };
    d.clear('#1a1a2e');
    const tileSize = 60 * uiScale;
    for (let x = 0; x < d.width; x += tileSize) for (let y = 100 * uiScale; y < d.height; y += tileSize) d.drawRect(x, y, tileSize, tileSize, { fill: (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0 ? '#1e3a1e' : '#1a321a' });
    d.drawCircle(this.playerX, this.playerY + 150, 20, { fill: '#2d4a2d' });
    d.drawCircle(this.playerX, this.playerY - 100, 20, { fill: '#2d4a2d' });
    const bounce = Math.sin(this.bounceTime * 3) * 3;
    d.drawCircle(this.playerX, this.playerY + bounce, 28 * uiScale, { fill: '#e94560' });
    d.drawCircle(this.playerX - 7 * uiScale, this.playerY - 7 * uiScale + bounce, 5 * uiScale, { fill: '#ffffff' });
    d.drawCircle(this.playerX + 7 * uiScale, this.playerY - 7 * uiScale + bounce, 5 * uiScale, { fill: '#ffffff' });
    d.drawRoundRect(this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, 8, { fill: '#333333' });
    d.drawText('← Back', this.backBtn.x + 25, this.backBtn.y + 18, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#ffffff' });
    d.drawText(`Steps: ${this.stepCount}/8`, d.width / 2 - 60, 40, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#888888' });
    d.drawText('Tap to move • Random encounters!', d.width / 2 - 140, d.height - 25, { font: `${Math.round(15 * uiScale)}px system-ui`, fill: '#555555' });
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
    if (!p || !p.x || !p.y) return;
    const scale = Math.min(MakkoEngine.display.width / 800, MakkoEngine.display.height / 600);
    const uiScale = Math.max(0.5, scale);
    const actionBarY = MakkoEngine.display.height * 0.83;
    const actionW = 130 * uiScale, actionH = 45 * uiScale, actionGap = 8 * uiScale;
    const totalActionsW = 4 * actionW + 3 * actionGap;
    const actionStartX = (MakkoEngine.display.width - totalActionsW) / 2;
    const actionY = actionBarY + 20 * uiScale;
    const actionTypes = ['attack', 'capture', 'defend', 'flee'];
    actionTypes.forEach((type, i) => {
      const ax = actionStartX + i * (actionW + actionGap);
      if (p.x >= ax && p.x <= ax + actionW && p.y >= actionY && p.y <= actionY + actionH && (MakkoEngine.input.isKeyPressed('Space') || MakkoEngine.input.isPointerDown())) {
        if (type === 'attack') this.doAttack();
        else if (type === 'capture') this.tryCapture();
        else if (type === 'defend') this.getPlayerMonster().isDefending = true;
        else if (type === 'flee' && this.isWild && Math.random() < 0.5 + (this.getPlayerMonster().speed - this.getEnemyMonster().speed) * 0.001) {
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
    const scale = Math.min(d.width / 800, d.height / 600);
    const uiScale = Math.max(0.5, scale);
    d.clear('#1a1a2e');
    d.drawRect(0, 0, d.width, 380 * uiScale, { fill: '#16213e' });
    d.drawRect(0, 380 * uiScale, d.width, 180 * uiScale, { fill: '#1e3a1e' });
    
    const p = this.getPlayerMonster(), e = this.getEnemyMonster();
    
    if (e) {
      const def = MONSTER_DEFINITIONS[e.id];
      d.drawCircle(d.width * 0.82, d.height * 0.32, 70 * uiScale, { fill: '#444466' });
      d.drawText(def.name, d.width * 0.72, 40, { font: `bold ${Math.round(22 * uiScale)}px system-ui`, fill: '#ffffff' });
      d.drawText(`Lv${e.level}`, d.width * 0.72, 68, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#888888' });
      const hpPct = e.currentHp / e.maxHp;
      d.drawRoundRect(d.width * 0.72, 96, 180 * uiScale, 18, 4, { fill: '#333333' });
      d.drawRoundRect(d.width * 0.72, 96, 180 * uiScale * hpPct, 18, 4, { fill: hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444' });
    }
    
    if (p) {
      const def = MONSTER_DEFINITIONS[p.id];
      d.drawCircle(d.width * 0.18, d.height * 0.62, 90 * uiScale, { fill: '#e94560' });
      d.drawCircle(d.width * 0.18 - 8, d.height * 0.62 - 8, 10 * uiScale, { fill: '#ffffff' });
      d.drawCircle(d.width * 0.18 + 8, d.height * 0.62 - 8, 10 * uiScale, { fill: '#ffffff' });
      d.drawText(def.name, d.width * 0.06, d.height * 0.85, { font: `bold ${Math.round(22 * uiScale)}px system-ui`, fill: '#ffffff' });
      d.drawText(`Lv${p.level}`, d.width * 0.06, d.height * 0.88, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#888888' });
      const hpPct = p.currentHp / p.maxHp;
      d.drawRoundRect(d.width * 0.06, d.height * 0.91, 180 * uiScale, 18, 4, { fill: '#333333' });
      d.drawRoundRect(d.width * 0.06, d.height * 0.91, 180 * uiScale * hpPct, 18, 4, { fill: hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444' });
    }
    
    d.drawText('VS', d.width / 2 - 25, d.height * 0.4, { font: `bold ${Math.round(42 * uiScale)}px system-ui`, fill: '#e94560' });
    
    const actionBarY = d.height * 0.83;
    d.drawRect(0, actionBarY, d.width, d.height - actionBarY, { fill: 'rgba(22, 33, 62, 0.95)' });
    d.drawRect(0, actionBarY, d.width, 4, { fill: '#e94560' });
    
    const actionW = 130 * uiScale, actionH = 45 * uiScale, actionGap = 8 * uiScale;
    const totalActionsW = 4 * actionW + 3 * actionGap;
    const actionStartX = (d.width - totalActionsW) / 2;
    const actionY = actionBarY + 20 * uiScale;
    const actions = ['⚔️ Attack', '🪣 Capture', '🛡️ Defend', '🏃 Flee'];
    actions.forEach((label, i) => {
      const ax = actionStartX + i * (actionW + actionGap);
      d.drawRoundRect(ax, actionY, actionW, actionH, 8, { fill: '#3b82f6' });
      d.drawText(label, ax + actionW / 2 - 45 * uiScale, actionY + actionH / 2 + 5, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#ffffff' });
    });
    this.damageNumbers.forEach(dn => d.drawText(dn.text, dn.x - 40, dn.y, { font: `bold ${Math.round(26 * uiScale)}px system-ui`, fill: '#ff4444' }));
    
    if (this.messageTimer > 0) {
      d.drawRoundRect(d.width / 2 - 100, d.height * 0.4, 200, 48, 8, { fill: 'rgba(0,0,0,0.7)' });
      d.drawText(this.messageText, d.width / 2 - 60, d.height * 0.4 + 12, { font: `bold ${Math.round(22 * uiScale)}px system-ui`, fill: '#ffffff' });
    }
    
    if (this.resultState !== 'none') {
      d.drawRect(0, 0, d.width, d.height, { fill: 'rgba(0,0,0,0.5)' });
      const text = this.resultState === 'victory' ? 'VICTORY!' : this.resultState === 'captured' ? 'CAUGHT!' : 'DEFEAT';
      d.drawText(text, d.width / 2 - 100, d.height / 2 - 30, { font: `bold ${Math.round(56 * uiScale)}px system-ui`, fill: this.resultState === 'defeat' ? '#ef4444' : '#22c55e' });
    }
  }
}

class PartyScene {
  constructor(g) { this.game = g; this.id = 'party'; }
  enter() {}
  handleInput() {
    if (MakkoEngine.input.isKeyPressed('Escape')) { this.game.switchScene('menu'); return; }
    const p = MakkoEngine.input.getPointerPosition();
    if (p && p.x >= 20 && p.x <= 140 && p.y >= 20 && p.y <= 65 && (MakkoEngine.input.isKeyPressed('Space') || MakkoEngine.input.isPointerDown())) this.game.switchScene('menu');
  }
  update(dt) {}
  render() {
    const d = MakkoEngine.display;
    const scale = Math.min(d.width / 800, d.height / 600);
    const uiScale = Math.max(0.5, scale);
    this.backBtn = { x: 20, y: 20, w: 120 * uiScale, h: 50 * uiScale };
    d.clear('#1a1a2e');
    d.drawRect(0, 0, d.width, 90 * uiScale, { fill: '#16213e' });
    d.drawRect(0, 90 * uiScale - 2, d.width, 4, { fill: '#e94560' });
    d.drawText('Party', 25, 32, { font: `bold ${Math.round(32 * uiScale)}px system-ui`, fill: '#ffffff' });
    d.drawText(`💰 ${this.game.economySystem.getGold()}`, d.width - 300 * uiScale, 30, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#ffc947' });
    d.drawText(`💎 ${this.game.economySystem.getGems()}`, d.width - 180 * uiScale, 30, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#e94560' });
    
    const party = this.game.partySystem.getParty();
    d.drawText('Your Team:', 40, 130, { font: `bold ${Math.round(20 * uiScale)}px system-ui`, fill: '#888888' });
    
    party.forEach((monster, i) => {
      const def = MONSTER_DEFINITIONS[monster.id];
      const y = 170 + i * 90 * uiScale;
      d.drawRoundRect(40, y, 350 * uiScale, 70 * uiScale, 10, { fill: '#16213e', stroke: monster.currentHp > 0 ? '#3b82f6' : '#666666', lineWidth: 2 });
      d.drawText(def.name, 55, y + 15, { font: `bold ${Math.round(20 * uiScale)}px system-ui`, fill: '#ffffff' });
      d.drawText(`Lv. ${monster.level}`, 55, y + 38, { font: `${Math.round(14 * uiScale)}px system-ui`, fill: '#888888' });
      const hpPct = monster.currentHp / monster.maxHp;
      d.drawRoundRect(55, y + 52, 180 * uiScale, 10, 3, { fill: '#333333' });
      d.drawRoundRect(55, y + 52, 180 * uiScale * hpPct, 10, 3, { fill: hpPct > 0.5 ? '#22c55e' : '#ef4444' });
      if (monster.currentHp <= 0) d.drawText('💀 FAINTED', 250 * uiScale, y + 45, { font: `${Math.round(13 * uiScale)}px system-ui`, fill: '#ef4444' });
    });
    
    d.drawText(`Box: ${this.game.partySystem.getBox().length}/50`, 420 * uiScale, 130, { font: `${Math.round(18 * uiScale)}px system-ui`, fill: '#888888' });
    d.drawRoundRect(this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, 8, { fill: '#333333' });
    d.drawText('← Back', this.backBtn.x + 22, this.backBtn.y + 16, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#ffffff' });
    d.drawText('💚 Party healed!', d.width / 2 - 55, d.height - 40, { font: `${Math.round(15 * uiScale)}px system-ui`, fill: '#22c55e' });
  }
}

class ShopScene {
  constructor(g) { this.game = g; this.id = 'shop'; }
  enter() { this.backBtn = { x: 20, y: 20, w: 120, h: 45 }; }
  handleInput() {
    if (MakkoEngine.input.isKeyPressed('Escape')) { this.game.switchScene('menu'); return; }
    const p = MakkoEngine.input.getPointerPosition();
    if (p && this.backBtn && p.x >= this.backBtn.x && p.x <= this.backBtn.x + this.backBtn.w && p.y >= this.backBtn.y && p.y <= this.backBtn.y + this.backBtn.h && (MakkoEngine.input.isKeyPressed('Space') || MakkoEngine.input.isPointerDown())) this.game.switchScene('menu');
  }
  update(dt) {}
  render() {
    const d = MakkoEngine.display, econ = this.game.economySystem;
    const scale = Math.min(d.width / 800, d.height / 600);
    const uiScale = Math.max(0.5, scale);
    this.backBtn = { x: 20, y: 20, w: 120 * uiScale, h: 50 * uiScale };
    d.clear('#1a1a2e');
    d.drawRect(0, 0, d.width, 100 * uiScale, { fill: '#16213e' });
    d.drawRect(0, 100 * uiScale - 2, d.width, 4, { fill: '#e94560' });
    d.drawText('🛒 Shop', 25, 38, { font: `bold ${Math.round(32 * uiScale)}px system-ui`, fill: '#ffffff' });
    d.drawText(`💰 ${econ.getGold()} Gold`, d.width - 220 * uiScale, 36, { font: `${Math.round(20 * uiScale)}px system-ui`, fill: '#ffc947' });
    d.drawText(`💎 ${econ.getGems()} Gems`, d.width - 110 * uiScale, 36, { font: `${Math.round(20 * uiScale)}px system-ui`, fill: '#e94560' });
    
    SHOP_ITEMS.forEach((item, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 60 * uiScale + col * 200 * uiScale, y = 170 * uiScale + row * 130 * uiScale;
      const itemW = 185 * uiScale, itemH = 115 * uiScale;
      const canAfford = econ.getGold() >= item.price;
      d.drawRoundRect(x, y, itemW, itemH, 10, { fill: '#16213e', stroke: canAfford ? '#3b82f6' : '#666666', lineWidth: 2 });
      d.drawText(item.type === 'ball' ? '🪣' : '💊', x + 15, y + 15, { font: `${Math.round(32 * uiScale)}px system-ui` });
      d.drawText(item.name, x + 70 * uiScale, y + 18, { font: `bold ${Math.round(16 * uiScale)}px system-ui`, fill: '#ffffff' });
      d.drawText(item.effect, x + 70 * uiScale, y + 40, { font: `${Math.round(13 * uiScale)}px system-ui`, fill: '#888888' });
      d.drawText(`${item.price} 💰`, x + 15, y + 75, { font: `bold ${Math.round(18 * uiScale)}px system-ui`, fill: canAfford ? '#ffc947' : '#ef4444' });
      const owned = econ.getItemCount(item.id);
      if (owned > 0) d.drawText(`Owned: ${owned}`, x + 100 * uiScale, y + 75, { font: `${Math.round(13 * uiScale)}px system-ui`, fill: '#888888' });
    });
    
    d.drawRoundRect(this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, 8, { fill: '#333333' });
    d.drawText('← Back', this.backBtn.x + 22, this.backBtn.y + 16, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#ffffff' });
  }
}

class PvPArenaScene {
  constructor(g) { this.game = g; this.id = 'pvp'; this.isSearching = false; this.searchTime = 0; }
  enter() { this.isSearching = false; this.searchTime = 0; this.backBtn = { x: 20, y: 20, w: 120, h: 45 }; }
  handleInput() {
    if (MakkoEngine.input.isKeyPressed('Escape')) { this.game.switchScene('menu'); return; }
    const p = MakkoEngine.input.getPointerPosition();
    if (p && p.x >= this.backBtn.x && p.x <= this.backBtn.x + this.backBtn.w && p.y >= this.backBtn.y && p.y <= this.backBtn.y + this.backBtn.h && (MakkoEngine.input.isKeyPressed('Space') || MakkoEngine.input.isPointerDown())) this.game.switchScene('menu');
  }
  update(dt) {
    if (this.isSearching) {
      this.searchTime += dt / 1000;
      if (this.searchTime >= 2.5) { this.isSearching = false; this.game.switchScene('battle'); }
    }
  }
  render() {
    const d = MakkoEngine.display, cx = d.width / 2, cy = d.height / 2;
    const scale = Math.min(d.width / 800, d.height / 600);
    const uiScale = Math.max(0.5, scale);
    this.backBtn = { x: 20, y: 20, w: 120 * uiScale, h: 50 * uiScale };
    d.clear('#1a1a2e');
    d.drawCircle(cx, cy + 40 * uiScale, 160 * uiScale, { stroke: '#e94560', lineWidth: Math.max(3, 4 * uiScale) });
    d.drawCircle(cx, cy + 40 * uiScale, 140 * uiScale, { stroke: '#3b82f6', lineWidth: 2 });
    d.drawRect(0, 0, d.width, 90 * uiScale, { fill: '#16213e' });
    d.drawRect(0, 90 * uiScale - 2, d.width, 4, { fill: '#e94560' });
    d.drawText('⚔️ PvP Arena', 25, 36, { font: `bold ${Math.round(32 * uiScale)}px system-ui`, fill: '#ffffff' });
    d.drawText(`💎 ${this.game.economySystem.getGems()}`, d.width - 110 * uiScale, 34, { font: `${Math.round(20 * uiScale)}px system-ui`, fill: '#e94560' });
    d.drawText('🏆 Bronze', cx - 45, 34, { font: `${Math.round(18 * uiScale)}px system-ui`, fill: '#cd7f32' });
    
    if (this.isSearching) {
      const angle = (this.searchTime * 2) % (Math.PI * 2);
      d.drawArc(cx, cy, 70 * uiScale, angle, angle + Math.PI * 1.5, { stroke: '#e94560', lineWidth: Math.max(4, 6 * uiScale) });
      d.drawText('🔍 Searching...', cx - 70, cy + 110, { font: `${Math.round(22 * uiScale)}px system-ui`, fill: '#ffffff' });
    } else {
      d.drawText('Test your team against other tamers!', cx - 180, cy - 40, { font: `${Math.round(20 * uiScale)}px system-ui`, fill: '#888888' });
      d.drawRoundRect(cx - 110 * uiScale, cy + 90, 220 * uiScale, 65 * uiScale, 8, { fill: '#3b82f6' });
      d.drawText('⚔️ Find Match', cx - 55, cy + 110, { font: `bold ${Math.round(22 * uiScale)}px system-ui`, fill: '#ffffff' });
      const party = this.game.partySystem.getParty();
      d.drawText('Your Team:', 40, 130, { font: `bold ${Math.round(18 * uiScale)}px system-ui`, fill: '#888888' });
      party.forEach((m, i) => d.drawText(`• ${m.id} Lv${m.level}`, 40, 160 + i * 28, { font: `${Math.round(15 * uiScale)}px system-ui`, fill: '#ffffff' }));
    }
    d.drawRoundRect(this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, 8, { fill: '#333333' });
    d.drawText('← Back', this.backBtn.x + 22, this.backBtn.y + 16, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#ffffff' });
  }
}

class SettingsScene {
  constructor(g) { this.game = g; this.id = 'settings'; }
  enter() { this.backBtn = { x: 20, y: 20, w: 120, h: 45 }; }
  handleInput() {
    if (MakkoEngine.input.isKeyPressed('Escape')) { this.game.switchScene('menu'); return; }
    const p = MakkoEngine.input.getPointerPosition();
    if (p && p.x >= this.backBtn.x && p.x <= this.backBtn.x + this.backBtn.w && p.y >= this.backBtn.y && p.y <= this.backBtn.y + this.backBtn.h && (MakkoEngine.input.isKeyPressed('Space') || MakkoEngine.input.isPointerDown())) this.game.switchScene('menu');
  }
  update(dt) {}
  render() {
    const d = MakkoEngine.display, cx = d.width / 2;
    const scale = Math.min(d.width / 800, d.height / 600);
    const uiScale = Math.max(0.5, scale);
    this.backBtn = { x: 20, y: 20, w: 120 * uiScale, h: 50 * uiScale };
    d.clear('#1a1a2e');
    d.drawRect(0, 0, d.width, 90 * uiScale, { fill: '#16213e' });
    d.drawRect(0, 90 * uiScale - 2, d.width, 4, { fill: '#e94560' });
    d.drawText('⚙️ Settings', 25, 36, { font: `bold ${Math.round(32 * uiScale)}px system-ui`, fill: '#ffffff' });
    const panelW = 450 * uiScale, panelH = 380 * uiScale;
    d.drawRoundRect(cx - panelW / 2, 130 * uiScale, panelW, panelH, 14, { fill: '#16213e', stroke: '#3b82f6', lineWidth: 2 });
    const sections = [
      { label: '🔊 Sound', items: ['Music: On'] },
      { label: '🖥️ Display', items: ['Canvas: 1920x1080', 'Touch: Enabled'] },
      { label: '💾 Save Data', items: [`Party: ${this.game.partySystem.getParty().length} monsters`] }
    ];
    let yOff = 150 * uiScale;
    sections.forEach((sec, si) => {
      d.drawText(sec.label, cx - 180 * uiScale, yOff, { font: `bold ${Math.round(20 * uiScale)}px system-ui`, fill: '#ffffff' });
      yOff += 40 * uiScale;
      sec.items.forEach(item => {
        d.drawText(item, cx - 150 * uiScale, yOff, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#888888' });
        yOff += 35 * uiScale;
      });
      if (si < sections.length - 1) yOff += 15 * uiScale;
    });
    d.drawRoundRect(this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, 8, { fill: '#333333' });
    d.drawText('← Back', this.backBtn.x + 22, this.backBtn.y + 16, { font: `${Math.round(16 * uiScale)}px system-ui`, fill: '#ffffff' });
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