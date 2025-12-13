/**
 * Mini Game Engine
 * A lightweight 2D game engine with sprites, collision, input, and game loop.
 */

class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  mul(s) {
    return new Vector2(this.x * s, this.y * s);
  }

  clone() {
    return new Vector2(this.x, this.y);
  }
}

class Sprite {
  constructor(x = 0, y = 0, width = 32, height = 32, color = '#fff') {
    this.pos = new Vector2(x, y);
    this.vel = new Vector2(0, 0);
    this.acc = new Vector2(0, 0);
    this.width = width;
    this.height = height;
    this.color = color;
    this.active = true;
    this.tag = 'sprite';
    this.renderShape = 'rect'; // 'rect', 'star', 'rune', or 'dollar'
  }

  update(dt) {
    // Simple physics: vel += acc; pos += vel
    this.vel = this.vel.add(this.acc.mul(dt));
    this.pos = this.pos.add(this.vel.mul(dt));
  }

  render(ctx) {
    if (this.renderShape === 'star') {
      this.renderStar(ctx);
      return;
    }

    if (this.renderShape === 'rune') {
      this.renderRune(ctx);
      return;
    }

    if (this.renderShape === 'dollar') {
      this.renderDollar(ctx);
      return;
    }

    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  }

  // Draw a 6-pointed star centered on the sprite's rectangle
  renderStar(ctx) {
    const cx = this.pos.x + this.width / 2;
    const cy = this.pos.y + this.height / 2;
    const outer = Math.min(this.width, this.height) / 2;
    const inner = outer * 0.45;
    const points = 6;
    const total = points * 2; // outer + inner points

    ctx.fillStyle = this.color;
    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / points; // start at top
      const r = i % 2 === 0 ? outer : inner;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Draw Algiz rune (ᛉ) - Elder Futhark life/protection rune
  // Vertical stem from top to bottom, with two diagonal branches from center going up-outward
  renderRune(ctx) {
    const x = this.pos.x;
    const y = this.pos.y;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.strokeStyle = this.color; // use sprite's color
    ctx.lineWidth = Math.max(2, w * 0.12);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Main vertical stem (full height, top to bottom)
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h * 0.10);
    ctx.lineTo(x + w * 0.5, y + h * 0.90);
    ctx.stroke();

    // Left diagonal branch (from center, up and outward to upper-left)
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h * 0.50);
    ctx.lineTo(x + w * 0.15, y + h * 0.20);
    ctx.stroke();

    // Right diagonal branch (from center, up and outward to upper-right)
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h * 0.50);
    ctx.lineTo(x + w * 0.85, y + h * 0.20);
    ctx.stroke();

    ctx.restore();
  }

  // Draw a dollar sign ($) centered on the sprite
  renderDollar(ctx) {
    const x = this.pos.x;
    const y = this.pos.y;
    const w = this.width;
    const h = this.height;
    const cx = x + w * 0.5;
    const cy = y + h * 0.5;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = `bold ${Math.max(14, h * 0.9)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', cx, cy);
    ctx.restore();
  }

  getBounds() {
    return {
      left: this.pos.x,
      right: this.pos.x + this.width,
      top: this.pos.y,
      bottom: this.pos.y + this.height,
    };
  }

  collidesWith(other) {
    const a = this.getBounds();
    const b = other.getBounds();
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  setPosition(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  setVelocity(vx, vy) {
    this.vel.x = vx;
    this.vel.y = vy;
  }
}

class GameEngine {
  constructor(canvasId, width = 800, height = 600) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;

    this.sprites = [];
    this.input = {};
    this.running = false;
    this.deltaTime = 0;
    this.lastFrameTime = 0;

    this.setupInput();
  }

  setupInput() {
    document.addEventListener('keydown', (e) => {
      this.input[e.key.toLowerCase()] = true;
    });
    document.addEventListener('keyup', (e) => {
      this.input[e.key.toLowerCase()] = false;
    });
  }

  addSprite(sprite) {
    this.sprites.push(sprite);
    return sprite;
  }

  removeSprite(sprite) {
    const idx = this.sprites.indexOf(sprite);
    if (idx > -1) this.sprites.splice(idx, 1);
  }

  isKeyPressed(key) {
    return this.input[key.toLowerCase()] || false;
  }

  findSpritesWithTag(tag) {
    return this.sprites.filter((s) => s.tag === tag);
  }

  update(dt) {
    // Update active sprites
    for (const sprite of this.sprites) {
      if (sprite.active) {
        sprite.update(dt);
      }
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render sprites
    for (const sprite of this.sprites) {
      if (sprite.active) {
        sprite.render(this.ctx);
      }
    }
  }

  gameLoop = (currentTime) => {
    // Calculate delta time
    if (this.lastFrameTime) {
      this.deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.016); // cap at ~60fps
    }
    this.lastFrameTime = currentTime;

    // Update and render
    this.update(this.deltaTime);
    this.render();

    // Continue loop
    if (this.running) {
      requestAnimationFrame(this.gameLoop);
    }
  };

  start() {
    this.running = true;
    requestAnimationFrame(this.gameLoop);
  }

  stop() {
    this.running = false;
  }

  // Utility: clear all sprites
  clear() {
    this.sprites = [];
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameEngine, Sprite, Vector2 };
}
