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
  }

  update(dt) {
    this.vel = this.vel.add(this.acc.mul(dt));
    this.pos = this.pos.add(this.vel.mul(dt));
  }

  render(ctx) {
    // If this sprite has a custom render function, use it
    if (this.renderShape === 'rune') {
      this.renderRune(ctx);
    } else if (this.renderShape === 'star') {
      this.renderStar(ctx);
    } else {
      // Default: render as rectangle
      ctx.fillStyle = this.color;
      ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }
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

    ctx.fillStyle = this.color; // Set the color before drawing
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
    this.input = {};
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
    for (const sprite of this.sprites) {
      if (sprite.active) {
        sprite.update(dt);
      }
    }
  }

  render(ctx) {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, this.width, this.height);

    for (const sprite of this.sprites) {
      if (sprite.active) {
        sprite.render(ctx);
      }
    }
  }

  clear() {
    this.sprites = [];
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
          <p>Move your player (blue square) to collect coins (green) and avoid enemies (red 6-pointed stars).</p>
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
