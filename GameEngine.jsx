import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Vector2: Simple 2D vector math
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

/**
 * Particle: For visual effects
 */
class Particle {
  constructor(x, y, vx, vy, color, life = 1) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = Math.random() * 4 + 2;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 200 * dt; // gravity
    this.life -= dt;
  }

  render(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/**
 * Sprite: Represents a game object
 */
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
    this.renderShape = 'rect'; // 'rect' or 'star'
    this.rotation = 0; // For rotation animation
    this.scale = 1; // For pulsing animation
    this.time = 0; // For animation timing
  }

  update(dt) {
    this.vel = this.vel.add(this.acc.mul(dt));
    this.pos = this.pos.add(this.vel.mul(dt));
    this.time += dt;
    
    // Animate coins with pulse effect
    if (this.tag === 'coin') {
      this.scale = 1 + Math.sin(this.time * 4) * 0.15;
      this.rotation += dt * 2;
    }
    
    // Animate enemies with rotation
    if (this.tag === 'enemy') {
      this.rotation += dt * 2;
    }
  }

  render(ctx) {
    ctx.save();
    
    // Apply transformations
    const cx = this.pos.x + this.width / 2;
    const cy = this.pos.y + this.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-cx, -cy);
    
    // Draw glow for coins
    if (this.tag === 'coin') {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ff00';
    }
    
    // Draw glow for player
    if (this.tag === 'player') {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#D2B48C';
    }
    
    // If this sprite has a custom render function, use it
    if (this.renderShape === 'rune') {
      this.renderRune(ctx);
    } else if (this.renderShape === 'star') {
      this.renderStar(ctx);
    } else if (this.tag === 'coin') {
      this.renderCoin(ctx);
    } else {
      // Default: render as rectangle with gradient
      const gradient = ctx.createLinearGradient(
        this.pos.x, this.pos.y,
        this.pos.x + this.width, this.pos.y + this.height
      );
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, this.darkenColor(this.color, 0.3));
      ctx.fillStyle = gradient;
      ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }
    
    ctx.restore();
  }
  
  darkenColor(color, amount) {
    // Simple color darkening
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
    const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
    const b = Math.max(0, (num & 0xff) * (1 - amount));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  
  renderCoin(ctx) {
    // Draw a shiny coin with gradient
    const cx = this.pos.x + this.width / 2;
    const cy = this.pos.y + this.height / 2;
    const radius = this.width / 2;
    
    // Outer glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5);
    glow.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
    glow.addColorStop(1, 'rgba(0, 255, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Main coin with gradient
    const gradient = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
    gradient.addColorStop(0, '#88ff88');
    gradient.addColorStop(0.5, '#00ff00');
    gradient.addColorStop(1, '#006600');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  renderRune(ctx) {
    // Draw Algiz rune ᛉ centered at sprite position
    const cx = this.pos.x + this.width / 2;
    const cy = this.pos.y + this.height / 2;
    const size = this.width * 0.8;
    
    ctx.fillStyle = this.color;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ᛉ', cx, cy);
  }

  renderStar(ctx) {
    // Draw a 6-pointed star centered at (this.pos.x + this.width/2, this.pos.y + this.height/2)
    const cx = this.pos.x + this.width / 2;
    const cy = this.pos.y + this.height / 2;
    const radius = this.width / 2; // Use width as radius reference

    // Create gradient for star
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, '#ff6666');
    gradient.addColorStop(0.5, '#ff0101');
    gradient.addColorStop(1, '#aa0000');
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6; // 6 points = 60 degrees apart
      const r = i % 2 === 0 ? radius : radius * 0.5; // Alternate between outer and inner points
      const x = cx + r * Math.cos(angle - Math.PI / 2);
      const y = cy + r * Math.sin(angle - Math.PI / 2);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // Add red glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0101';
    ctx.fill();
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

/**
 * GameEngine: Core game engine with sprite management and update loop
 */
class GameEngine {
  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.sprites = [];
    this.particles = [];
    this.input = {};
    this.shake = 0; // Screen shake intensity
  }

  addSprite(sprite) {
    this.sprites.push(sprite);
    return sprite;
  }

  removeSprite(sprite) {
    const idx = this.sprites.indexOf(sprite);
    if (idx > -1) this.sprites.splice(idx, 1);
  }
  
  addParticle(particle) {
    this.particles.push(particle);
  }
  
  spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 100 + Math.random() * 100;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 50;
      this.addParticle(new Particle(x, y, vx, vy, color, 0.5 + Math.random() * 0.5));
    }
  }
  
  screenShake(intensity = 10) {
    this.shake = intensity;
  }

  isKeyPressed(key) {
    return this.input[key.toLowerCase()] || false;
  }

  findSpritesWithTag(tag) {
    return this.sprites.filter((s) => s.tag === tag);
  }

  update(dt) {
    for (const sprite of this.sprites) {
      if (sprite.active) {
        sprite.update(dt);
      }
    }
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    // Decay screen shake
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 30);
    }
  }

  render(ctx) {
    // Apply screen shake
    ctx.save();
    if (this.shake > 0) {
      const shakeX = (Math.random() - 0.5) * this.shake;
      const shakeY = (Math.random() - 0.5) * this.shake;
      ctx.translate(shakeX, shakeY);
    }
    
    // Background with grid
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw grid pattern
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Render sprites
    for (const sprite of this.sprites) {
      if (sprite.active) {
        sprite.render(ctx);
      }
    }
    
    // Render particles
    for (const particle of this.particles) {
      particle.render(ctx);
    }
    
    ctx.restore();
  }

  clear() {
    this.sprites = [];
    this.particles = [];
  }

  setInput(key, pressed) {
    this.input[key.toLowerCase()] = pressed;
  }
}

/**
 * DodgeGame: Example game using the React engine
 */
const DodgeGame = () => {
  const canvasRef = useRef(null);
  const engineRef = useRef(new GameEngine(800, 600));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [coinCount, setCoinCount] = useState(5);
  const [enemyCount, setEnemyCount] = useState(3);

  const WIN_SCORE = 10;
  const gameStateRef = useRef({
    score: 0,
    gameOver: false,
    won: false,
    player: null,
  });

  const engine = engineRef.current;

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear previous sprites
    engine.clear();
    gameStateRef.current = { score: 0, gameOver: false, won: false, player: null };
    setScore(0);
    setGameOver(false);
    setWon(false);

    // Create player
    const player = engine.addSprite(
      new Sprite(engine.width / 2 - 16, engine.height / 2, 32, 32, '#D2B48C')
    );
    player.tag = 'player';
    player.renderShape = 'rune'; // Render as Algiz rune ᛉ
    player.speed = 300;
    gameStateRef.current.player = player;

    // Spawn coins
    for (let i = 0; i < 5; i++) {
      const coin = engine.addSprite(
        new Sprite(
          Math.random() * (engine.width - 20),
          Math.random() * (engine.height - 20),
          20,
          20,
          '#00ff00'
        )
      );
      coin.tag = 'coin';
    }
    setCoinCount(5);

    // Spawn enemies
    for (let i = 0; i < 3; i++) {
      const enemy = engine.addSprite(
        new Sprite(
          Math.random() * (engine.width - 24),
          Math.random() * (engine.height - 24),
          24,
          24,
          '#ff0101'
        )
      );
      enemy.tag = 'enemy';
      enemy.renderShape = 'star'; // Render as 6-pointed star
      enemy.speed = 150 + Math.random() * 100;
      enemy.dirX = Math.random() > 0.5 ? 1 : -1;
      enemy.dirY = Math.random() > 0.5 ? 1 : -1;
    }
    setEnemyCount(3);
  }, []);

  // Handle input
  useEffect(() => {
    const handleKeyDown = (e) => {
      engine.setInput(e.key, true);
    };

    const handleKeyUp = (e) => {
      engine.setInput(e.key, false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let lastTime = 0;

    const gameLoop = (currentTime) => {
      const dt = lastTime ? Math.min((currentTime - lastTime) / 1000, 0.016) : 0;
      lastTime = currentTime;

      // Update
      if (!gameStateRef.current.gameOver && !gameStateRef.current.won) {
        const player = gameStateRef.current.player;

        // Player movement
        if (engine.isKeyPressed('arrowleft') || engine.isKeyPressed('a')) {
          player.vel.x = -player.speed;
        } else if (engine.isKeyPressed('arrowright') || engine.isKeyPressed('d')) {
          player.vel.x = player.speed;
        } else {
          player.vel.x = 0;
        }

        if (engine.isKeyPressed('arrowup') || engine.isKeyPressed('w')) {
          player.vel.y = -player.speed;
        } else if (engine.isKeyPressed('arrowdown') || engine.isKeyPressed('s')) {
          player.vel.y = player.speed;
        } else {
          player.vel.y = 0;
        }

        engine.update(dt);
        
        // Player trail effect
        if (Math.random() < 0.5 && (player.vel.x !== 0 || player.vel.y !== 0)) {
          const px = player.pos.x + player.width / 2;
          const py = player.pos.y + player.height / 2;
          engine.addParticle(new Particle(px, py, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, '#D2B48C', 0.3));
        }

        // Clamp player to bounds
        player.pos.x = Math.max(0, Math.min(player.pos.x, engine.width - player.width));
        player.pos.y = Math.max(0, Math.min(player.pos.y, engine.height - player.height));

        // Update enemies
        const enemies = engine.findSpritesWithTag('enemy');
        for (const enemy of enemies) {
          enemy.vel.x = enemy.dirX * enemy.speed;
          enemy.vel.y = enemy.dirY * enemy.speed;

          if (enemy.pos.x <= 0 || enemy.pos.x + enemy.width >= engine.width) {
            enemy.dirX *= -1;
          }
          if (enemy.pos.y <= 0 || enemy.pos.y + enemy.height >= engine.height) {
            enemy.dirY *= -1;
          }
        }

        // Coin collision
        const coins = engine.findSpritesWithTag('coin');
        for (const coin of coins) {
          if (player.collidesWith(coin)) {
            // Spawn particle explosion
            const cx = coin.pos.x + coin.width / 2;
            const cy = coin.pos.y + coin.height / 2;
            engine.spawnParticles(cx, cy, '#00ff00', 15);
            engine.screenShake(5);
            
            engine.removeSprite(coin);
            const newScore = gameStateRef.current.score + 1;
            gameStateRef.current.score = newScore;
            setScore(newScore);
            setCoinCount(coins.length - 1);

            if (newScore >= WIN_SCORE) {
              gameStateRef.current.won = true;
              setWon(true);
            } else {
              // Spawn new coin
              const newCoin = engine.addSprite(
                new Sprite(
                  Math.random() * (engine.width - 20),
                  Math.random() * (engine.height - 20),
                  20,
                  20,
                  '#00ff00'
                )
              );
              newCoin.tag = 'coin';
            }
          }
        }

        // Enemy collision
        for (const enemy of enemies) {
          if (player.collidesWith(enemy)) {
            // Spawn red explosion
            const px = player.pos.x + player.width / 2;
            const py = player.pos.y + player.height / 2;
            engine.spawnParticles(px, py, '#ff0101', 20);
            engine.screenShake(15);
            
            gameStateRef.current.gameOver = true;
            setGameOver(true);
          }
        }
      }

      // Render
      engine.render(ctx);

      // Draw UI
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px system-ui';
      ctx.fillText(`Score: ${gameStateRef.current.score}/${WIN_SCORE}`, 20, 30);
      ctx.font = 'normal 12px system-ui';
      ctx.fillText(`Coins: ${engine.findSpritesWithTag('coin').length}`, 20, 50);
      ctx.fillText(`Enemies: ${engine.findSpritesWithTag('enemy').length}`, 20, 70);

      if (gameStateRef.current.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, engine.width, engine.height);
        ctx.fillStyle = '#ff0101';
        ctx.font = 'bold 48px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', engine.width / 2, engine.height / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'normal 20px system-ui';
        ctx.fillText('Refresh to play again', engine.width / 2, engine.height / 2 + 40);
      } else if (gameStateRef.current.won) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, engine.width, engine.height);
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 48px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', engine.width / 2, engine.height / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'normal 20px system-ui';
        ctx.fillText('Refresh to play again', engine.width / 2, engine.height / 2 + 40);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationId);
  }, [engine]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎮 React Game Engine - Dodge Game</h1>
      <div style={styles.gameContainer}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={styles.canvas}
        />
      </div>
      <div style={styles.info}>
        <p><strong>Score: {score}/{WIN_SCORE}</strong></p>
        <div style={styles.controls}>
          <h3>How to Play</h3>
          <p>Move your player (tan rune) to collect coins (green) and avoid enemies (red stars).</p>
          <p>
            <code style={styles.key}>←</code> <code style={styles.key}>→</code>{' '}
            <code style={styles.key}>↑</code> <code style={styles.key}>↓</code> or{' '}
            <code style={styles.key}>WASD</code> to move
          </p>
          <p>Collect {WIN_SCORE} coins to win! Collide with enemies to lose.</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    margin: 0,
    padding: '20px',
    background: '#111',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  title: {
    marginBottom: '10px',
    color: '#0170ff',
  },
  gameContainer: {
    position: 'relative',
    marginBottom: '20px',
  },
  canvas: {
    display: 'block',
    background: '#222',
    border: '3px solid #0170ff',
    cursor: 'none',
  },
  info: {
    textAlign: 'center',
    maxWidth: '800px',
    lineHeight: 1.6,
    color: '#aaa',
    fontSize: '14px',
  },
  controls: {
    marginTop: '15px',
    padding: '15px',
    background: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: '4px',
  },
  key: {
    background: '#333',
    padding: '2px 6px',
    borderRadius: '3px',
    fontFamily: 'monospace',
    marginRight: '4px',
  },
};

export default DodgeGame;
