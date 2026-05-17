// Menu Scene - main menu
// MakkoEngine is a global

export class MenuScene {
  constructor(game) {
    this.game = game;
    this.id = 'menu';
    this.buttons = [
      { label: '🌍  Explore', scene: 'world', hover: false },
      { label: '⚔️  PvP Arena', scene: 'pvp', hover: false },
      { label: '🛒  Shop', scene: 'shop', hover: false },
      { label: '🐾  Party', scene: 'party', hover: false },
      { label: '⚙️  Settings', scene: 'settings', hover: false }
    ];
  }

  enter() {
    const centerX = MakkoEngine.display.width / 2;
    const startY = MakkoEngine.display.height * 0.38;
    this.buttons.forEach((btn, i) => {
      btn.x = centerX - 160;
      btn.y = startY + i * 85;
      btn.w = 320;
      btn.h = 65;
    });
  }

  handleInput() {
    const pointer = MakkoEngine.input.getPointerPosition();
    if (pointer) {
      this.buttons.forEach(btn => {
        btn.hover = pointer.x >= btn.x && pointer.x <= btn.x + btn.w &&
                   pointer.y >= btn.y && pointer.y <= btn.y + btn.h;
        
        if (btn.hover && MakkoEngine.input.isKeyPressed('Space')) {
          this.game.switchScene(btn.scene);
        }
      });
    }
  }

  update(dt) {}

  render() {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;

    display.clear('#1a1a2e');

    // Header
    display.drawRect(0, 0, display.width, 220, { fill: '#16213e' });
    display.drawRect(0, 218, display.width, 4, { fill: '#e94560' });

    // Title
    display.drawText('Monster Tamer', centerX - 180, 80, { font: 'bold 56px system-ui', fill: '#e94560' });
    display.drawText('Build your team. Catch them all!', centerX - 180, 140, { font: '20px system-ui', fill: '#888888' });

    // Buttons
    this.buttons.forEach(btn => {
      display.drawRoundRect(btn.x, btn.y, btn.w, btn.h, 8, { fill: btn.hover ? '#2563eb' : '#3b82f6' });
      display.drawText(btn.label, btn.x + 50, btn.y + 18, { font: 'bold 22px system-ui', fill: '#ffffff' });
    });

    // Version
    display.drawText('v1.0', centerX - 15, display.height - 40, { font: '14px system-ui', fill: '#444444' });
  }
}