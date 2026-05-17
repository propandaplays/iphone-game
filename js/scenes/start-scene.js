// Start Scene - title screen
// MakkoEngine is a global from main.js

export class StartScene {
  constructor(game) {
    this.game = game;
    this.id = 'start';
    this.bounceTime = 0;
    this.startButton = { x: 0, y: 0, w: 250, h: 70, label: '▶ Start Game', hover: false };
  }

  enter() {
    this.startButton.y = MakkoEngine.display.height * 0.65;
    this.startButton.x = MakkoEngine.display.width / 2 - 125;
  }

  handleInput() {
    const pointer = MakkoEngine.input.getPointerPosition();
    if (pointer) {
      this.startButton.hover = pointer.x >= this.startButton.x && pointer.x <= this.startButton.x + this.startButton.w &&
                               pointer.y >= this.startButton.y && pointer.y <= this.startButton.y + this.startButton.h;
      
      if (this.startButton.hover && MakkoEngine.input.isKeyPressed('Space')) {
        this.game.switchScene('menu');
      }
    }

    if (MakkoEngine.input.isKeyPressed('Enter') || MakkoEngine.input.isKeyPressed('Space')) {
      this.game.switchScene('menu');
    }
  }

  update(dt) {
    this.bounceTime += dt / 1000;
  }

  render() {
    const display = MakkoEngine.display;
    const centerX = display.width / 2;
    const titleY = display.height * 0.3;

    display.clear('#1a1a2e');

    // Background circle
    display.drawCircle(centerX, titleY + 80, 250, { fill: '#16213e', stroke: '#e94560', lineWidth: 3 });
    display.drawCircle(centerX, titleY + 80, 220, { fill: 'transparent', stroke: '#3b82f6', lineWidth: 2 });

    // Title
    display.drawText('Monster Tamer', centerX - 200, titleY, { font: 'bold 72px system-ui', fill: '#e94560' });

    // Subtitle
    display.drawText('Build your team. Catch them all!', centerX - 180, titleY + 60, { font: '24px system-ui', fill: '#888888' });

    // Monster icons
    const icons = ['🔥', '💧', '🌿', '⚡', '🐾'];
    icons.forEach((icon, i) => {
      display.drawText(icon, centerX - 100 + i * 50, titleY + 150, { font: '32px system-ui', fill: '#ffffff' });
    });

    // Start button
    const bg = this.startButton.hover ? '#2563eb' : '#3b82f6';
    display.drawRoundRect(this.startButton.x, this.startButton.y, this.startButton.w, this.startButton.h, 8, { fill: bg });
    display.drawText(this.startButton.label, this.startButton.x + 55, this.startButton.y + 22, { font: 'bold 24px system-ui', fill: '#ffffff' });

    // Footer
    display.drawText('Press ENTER or tap to start', centerX - 100, display.height - 60, { font: '16px system-ui', fill: '#555555' });
  }
}