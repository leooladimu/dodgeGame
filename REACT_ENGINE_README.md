# React Game Engine

A mini game engine built with **React**, **Hooks**, and **Canvas** rendering.

## 🎮 Features

- **Vector2 Math**: 2D vector operations (add, sub, mul, clone)
- **Sprite System**: Game objects with position, velocity, acceleration
- **GameEngine**: Core engine with sprite management, input handling, and game loop
- **Collision Detection**: AABB (Axis-Aligned Bounding Box) collision
- **React Integration**: State management with hooks, canvas refs, and effect hooks
- **Example Game**: Dodge game—collect coins, avoid enemies

## 📦 Project Structure

```
/Users/leooladimu1984/x/Game/
├── package.json          # Dependencies (React, Vite)
├── vite.config.js        # Vite configuration
├── gameExample.html      # Standalone HTML example
├── App.jsx               # Root component
├── GameEngine.jsx        # Game engine + DodgeGame component
├── gameEngine.js         # Core engine logic
└── REACT_ENGINE_README.md # This file
```

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd /Users/leooladimu1984/x/Game
npm install
```

### 2. Run development server
```bash
npm run dev
```
Browser will open automatically at `http://localhost:3000`

### 3. Build for production
```bash
npm run build
```

## 🎮 How to Play

**Dodge Game**:
- Move your player (tan rune ᛉ) with **Arrow Keys** or **WASD**
- Collect coins (green) to score points
- Avoid enemies (red 6-pointed stars) bouncing around
- **Win**: Collect 10 coins
- **Lose**: Collide with an enemy

## 🛠️ Core Classes

### Vector2
2D vector with basic math operations.
```javascript
const v = new Vector2(10, 20);
const v2 = v.add(new Vector2(5, 5));  // (15, 25)
const v3 = v.mul(2);                   // (20, 40)
```

### Sprite
Game object with physics and rendering.
```javascript
const sprite = new Sprite(x, y, width, height, color);
sprite.setVelocity(vx, vy);
sprite.update(deltaTime);
sprite.render(canvasContext);
if (sprite.collidesWith(otherSprite)) { /* handle collision */ }
```

### GameEngine
Main game loop and sprite management.
```javascript
const engine = new GameEngine(800, 600);
const sprite = engine.addSprite(new Sprite(...));
engine.update(deltaTime);
engine.render(ctx);
if (engine.isKeyPressed('arrowup')) { /* handle input */ }
```

## 🎨 Customization

### Change game colors
Edit the color strings in `GameEngine.jsx`:
```javascript
player = new Sprite(..., '#0170ff')  // Blue
coin = new Sprite(..., '#00ff00')    // Green
enemy = new Sprite(..., '#ff0101')   // Red
```

### Adjust difficulty
Modify enemy speed and spawn count:
```javascript
enemy.speed = 200;  // pixels/second
for (let i = 0; i < 5; i++) spawnEnemy();  // More enemies
```

### Add new sprites
```javascript
const bullet = engine.addSprite(new Sprite(x, y, 10, 10, '#ffff00'));
bullet.tag = 'projectile';
```

## 📚 React Hooks Used

- **useRef**: Canvas and engine references
- **useState**: Score, game state (gameOver, won)
- **useEffect**: Initialization, input handling, game loop
- **useCallback**: Future optimization for event handlers

## 🔧 Architecture

The React component wraps the game engine:
1. **Initialization** (useEffect): Create engine and sprites
2. **Input** (useEffect + addEventListener): Capture keyboard
3. **Game Loop** (useEffect + requestAnimationFrame): Update and render
4. **State Updates** (useState): UI sync with game state

## 📖 Extension Ideas

- Add sound with Web Audio API
- Implement particle effects
- Add animated sprites
- Create multiple game levels
- Build a menu/pause system
- Add high score persistence (localStorage)
- Implement score multipliers, power-ups
- Create different enemy AI patterns

## 📄 License

Free to use and modify for educational purposes.

---

**Built with React + Canvas + Vite**
