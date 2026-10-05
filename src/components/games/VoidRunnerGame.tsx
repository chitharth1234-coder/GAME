import React, { useEffect, useRef, useState, useCallback } from 'react';
import { soundEngine } from '../../utils/audio';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Shield, Zap, Crosshair } from 'lucide-react';

interface VoidRunnerGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  onClose?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy?: boolean;
  damage: number;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  type: 'drone' | 'scout' | 'dreadnought';
  lastShot: number;
  shootCooldown: number;
  scoreValue: number;
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: 'shield' | 'triple' | 'emp' | 'repair';
  duration: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  rotation: number;
  rotSpeed: number;
}

export const VoidRunnerGame: React.FC<VoidRunnerGameProps> = ({
  onGameOver,
  onScoreUpdate,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('READY');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('vortex_void_highscore') || '0', 10);
  });
  const [wave, setWave] = useState<number>(1);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerShield, setPlayerShield] = useState<number>(100);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEngine.enabled);
  const [weaponLevel, setWeaponLevel] = useState<number>(1);
  const [combo, setCombo] = useState<number>(1);

  // References for game loop state
  const stateRef = useRef({
    gameState: 'READY' as 'READY' | 'PLAYING' | 'PAUSED' | 'GAMEOVER',
    score: 0,
    wave: 1,
    combo: 1,
    comboTimer: 0,
    player: {
      x: 350,
      y: 500,
      width: 38,
      height: 48,
      speed: 6.5,
      hp: 100,
      shield: 100,
      weaponLevel: 1,
      lastShot: 0,
      fireRate: 140, // ms
      shieldRegenTimer: 0
    },
    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      w: false,
      s: false,
      a: false,
      d: false,
      Space: false
    },
    mouse: {
      active: false,
      x: 350,
      y: 500,
      isDown: false
    },
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    asteroids: [] as Asteroid[],
    powerups: [] as PowerUp[],
    particles: [] as Particle[],
    stars: [] as { x: number; y: number; speed: number; size: number; alpha: number }[],
    lastTime: performance.now(),
    spawnTimer: 0,
    asteroidTimer: 0,
    bossSpawned: false,
    screenShake: 0
  });

  const toggleSound = () => {
    const active = soundEngine.toggleSound();
    setSoundEnabled(active);
  };

  // Initialize stars once
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * 700,
        y: Math.random() * 600,
        speed: 0.5 + Math.random() * 2.5,
        size: Math.random() * 2 + 0.5,
        alpha: 0.3 + Math.random() * 0.7
      });
    }
    stateRef.current.stars = stars;
  }, []);

  // Handle controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === ' ' || e.code === 'Space') {
        stateRef.current.keys.Space = true;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') stateRef.current.keys.ArrowUp = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') stateRef.current.keys.ArrowDown = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.keys.ArrowLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.keys.ArrowRight = true;

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (stateRef.current.gameState === 'PLAYING') {
          pauseGame();
        } else if (stateRef.current.gameState === 'PAUSED') {
          resumeGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') stateRef.current.keys.Space = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') stateRef.current.keys.ArrowUp = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') stateRef.current.keys.ArrowDown = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.keys.ArrowLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.keys.ArrowRight = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const createExplosion = (x: number, y: number, color: string, count: number = 16) => {
    soundEngine.playExplosion();
    stateRef.current.screenShake = 6;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4.5;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2.5,
        color,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  };

  const spawnBoss = () => {
    stateRef.current.bossSpawned = true;
    stateRef.current.enemies.push({
      x: 350,
      y: -90,
      vx: 1.5,
      vy: 1,
      width: 120,
      height: 80,
      hp: 1200 + stateRef.current.wave * 300,
      maxHp: 1200 + stateRef.current.wave * 300,
      type: 'dreadnought',
      lastShot: performance.now(),
      shootCooldown: 800,
      scoreValue: 2500
    });
  };

  const startGame = () => {
    soundEngine.playUiClick();
    stateRef.current.gameState = 'PLAYING';
    stateRef.current.score = 0;
    stateRef.current.wave = 1;
    stateRef.current.combo = 1;
    stateRef.current.comboTimer = 0;
    stateRef.current.bossSpawned = false;
    stateRef.current.player = {
      x: 350,
      y: 500,
      width: 38,
      height: 48,
      speed: 6.5,
      hp: 100,
      shield: 100,
      weaponLevel: 1,
      lastShot: 0,
      fireRate: 140,
      shieldRegenTimer: 0
    };
    stateRef.current.bullets = [];
    stateRef.current.enemies = [];
    stateRef.current.asteroids = [];
    stateRef.current.powerups = [];
    stateRef.current.particles = [];

    setScore(0);
    setWave(1);
    setPlayerHp(100);
    setPlayerShield(100);
    setWeaponLevel(1);
    setCombo(1);
    setGameState('PLAYING');
  };

  const pauseGame = () => {
    soundEngine.playUiClick();
    stateRef.current.gameState = 'PAUSED';
    setGameState('PAUSED');
  };

  const resumeGame = () => {
    soundEngine.playUiClick();
    stateRef.current.gameState = 'PLAYING';
    stateRef.current.lastTime = performance.now();
    setGameState('PLAYING');
  };

  // Main animation game loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - stateRef.current.lastTime) / 1000, 0.1);
      stateRef.current.lastTime = currentTime;

      const state = stateRef.current;
      const p = state.player;

      if (state.gameState === 'PLAYING') {
        // Handle combo decay
        if (state.comboTimer > 0) {
          state.comboTimer -= dt;
          if (state.comboTimer <= 0) {
            state.combo = 1;
            setCombo(1);
          }
        }

        // Handle shield regen
        p.shieldRegenTimer += dt;
        if (p.shieldRegenTimer > 3 && p.shield < 100) {
          p.shield = Math.min(100, p.shield + dt * 15);
          setPlayerShield(Math.round(p.shield));
        }

        // Move player
        if (state.keys.ArrowLeft || state.keys.a) p.x -= p.speed;
        if (state.keys.ArrowRight || state.keys.d) p.x += p.speed;
        if (state.keys.ArrowUp || state.keys.w) p.y -= p.speed;
        if (state.keys.ArrowDown || state.keys.s) p.y += p.speed;

        // Mouse follow if mouse moved
        if (state.mouse.active) {
          const dx = state.mouse.x - p.x;
          const dy = state.mouse.y - p.y;
          if (Math.hypot(dx, dy) > 8) {
            p.x += dx * 0.12;
            p.y += dy * 0.12;
          }
        }

        // Clamp boundaries
        p.x = Math.max(25, Math.min(canvas.width - 25, p.x));
        p.y = Math.max(30, Math.min(canvas.height - 30, p.y));

        // Player shooting
        const wantsToShoot = state.keys.Space || state.mouse.isDown;
        if (wantsToShoot && currentTime - p.lastShot > p.fireRate) {
          p.lastShot = currentTime;
          soundEngine.playLaser();

          if (p.weaponLevel === 1) {
            state.bullets.push({ x: p.x, y: p.y - 20, vx: 0, vy: -12, damage: 25 });
          } else if (p.weaponLevel === 2) {
            state.bullets.push({ x: p.x - 12, y: p.y - 15, vx: -0.5, vy: -12, damage: 22 });
            state.bullets.push({ x: p.x + 12, y: p.y - 15, vx: 0.5, vy: -12, damage: 22 });
          } else {
            // Weapon level 3+
            state.bullets.push({ x: p.x - 15, y: p.y - 12, vx: -2, vy: -12, damage: 20 });
            state.bullets.push({ x: p.x, y: p.y - 20, vx: 0, vy: -13, damage: 30 });
            state.bullets.push({ x: p.x + 15, y: p.y - 12, vx: 2, vy: -12, damage: 20 });
          }
        }

        // Spawn enemies
        state.spawnTimer += dt;
        const spawnInterval = Math.max(0.7, 2.2 - state.wave * 0.25);
        if (state.spawnTimer > spawnInterval) {
          state.spawnTimer = 0;
          const isScout = Math.random() > 0.65;
          const enemyType = isScout ? 'scout' : 'drone';
          const maxHp = isScout ? 45 : 30;

          state.enemies.push({
            x: 40 + Math.random() * (canvas.width - 80),
            y: -30,
            vx: (Math.random() - 0.5) * (isScout ? 2.8 : 1.2),
            vy: 1.5 + Math.random() * 1.5 + state.wave * 0.2,
            width: isScout ? 30 : 26,
            height: isScout ? 32 : 26,
            hp: maxHp,
            maxHp,
            type: enemyType,
            lastShot: currentTime + Math.random() * 1000,
            shootCooldown: 1400 + Math.random() * 1000,
            scoreValue: isScout ? 150 : 100
          });
        }

        // Spawn asteroids
        state.asteroidTimer += dt;
        if (state.asteroidTimer > 3.5) {
          state.asteroidTimer = 0;
          const rad = 18 + Math.random() * 22;
          state.asteroids.push({
            x: 30 + Math.random() * (canvas.width - 60),
            y: -rad - 10,
            vx: (Math.random() - 0.5) * 1.2,
            vy: 1.2 + Math.random() * 1.6,
            radius: rad,
            hp: Math.round(rad * 2),
            rotation: 0,
            rotSpeed: (Math.random() - 0.5) * 0.04
          });
        }

        // Boss check
        if (state.score > 2000 * state.wave && !state.bossSpawned) {
          spawnBoss();
        }

        // Update Bullets
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          b.x += b.vx;
          b.y += b.vy;

          if (b.y < -30 || b.y > canvas.height + 30 || b.x < -20 || b.x > canvas.width + 20) {
            state.bullets.splice(i, 1);
            continue;
          }

          // Enemy bullet vs Player
          if (b.isEnemy) {
            const dist = Math.hypot(b.x - p.x, b.y - p.y);
            if (dist < 20) {
              state.bullets.splice(i, 1);
              p.shieldRegenTimer = 0;
              if (p.shield > 0) {
                p.shield = Math.max(0, p.shield - b.damage);
                soundEngine.playShieldHit();
              } else {
                p.hp = Math.max(0, p.hp - b.damage);
                soundEngine.playExplosion();
              }
              setPlayerHp(Math.round(p.hp));
              setPlayerShield(Math.round(p.shield));

              if (p.hp <= 0) {
                // Game Over!
                handlePlayerDeath();
              }
              continue;
            }
          } else {
            // Player bullet vs enemies
            let hit = false;
            for (let j = state.enemies.length - 1; j >= 0; j--) {
              const enemy = state.enemies[j];
              if (
                b.x > enemy.x - enemy.width / 2 &&
                b.x < enemy.x + enemy.width / 2 &&
                b.y > enemy.y - enemy.height / 2 &&
                b.y < enemy.y + enemy.height / 2
              ) {
                enemy.hp -= b.damage;
                hit = true;
                createExplosion(b.x, b.y, '#38BDF8', 4);

                if (enemy.hp <= 0) {
                  // Enemy destroyed
                  createExplosion(enemy.x, enemy.y, enemy.type === 'dreadnought' ? '#F59E0B' : '#EF4444', enemy.type === 'dreadnought' ? 40 : 18);
                  
                  const gainedScore = enemy.scoreValue * state.combo;
                  state.score += gainedScore;
                  state.combo = Math.min(state.combo + 1, 8);
                  state.comboTimer = 3.5;
                  setCombo(state.combo);
                  setScore(state.score);
                  if (onScoreUpdate) onScoreUpdate(state.score);

                  // Drop powerups
                  if (Math.random() > 0.72 || enemy.type === 'dreadnought') {
                    const types: ('shield' | 'triple' | 'emp' | 'repair')[] = ['shield', 'triple', 'repair', 'emp'];
                    state.powerups.push({
                      x: enemy.x,
                      y: enemy.y,
                      vy: 1.8,
                      type: types[Math.floor(Math.random() * types.length)],
                      duration: 0
                    });
                  }

                  if (enemy.type === 'dreadnought') {
                    state.bossSpawned = false;
                    state.wave += 1;
                    setWave(state.wave);
                    soundEngine.playVictory();
                  }

                  state.enemies.splice(j, 1);
                }
                break;
              }
            }

            // Player bullet vs Asteroids
            if (!hit) {
              for (let k = state.asteroids.length - 1; k >= 0; k--) {
                const ast = state.asteroids[k];
                if (Math.hypot(b.x - ast.x, b.y - ast.y) < ast.radius) {
                  ast.hp -= b.damage;
                  hit = true;
                  createExplosion(b.x, b.y, '#94A3B8', 4);

                  if (ast.hp <= 0) {
                    createExplosion(ast.x, ast.y, '#94A3B8', 12);
                    state.score += 50 * state.combo;
                    setScore(state.score);
                    state.asteroids.splice(k, 1);
                  }
                  break;
                }
              }
            }

            if (hit) {
              state.bullets.splice(i, 1);
            }
          }
        }

        // Update Enemies
        for (let i = state.enemies.length - 1; i >= 0; i--) {
          const en = state.enemies[i];
          en.x += en.vx;
          en.y += en.vy;

          if (en.type === 'dreadnought') {
            if (en.y < 80) en.y += 1.2;
            if (en.x < 100 || en.x > canvas.width - 100) en.vx *= -1;

            // Dreadnought barrage
            if (currentTime - en.lastShot > en.shootCooldown) {
              en.lastShot = currentTime;
              state.bullets.push({ x: en.x - 35, y: en.y + 30, vx: -1.5, vy: 5, isEnemy: true, damage: 18 });
              state.bullets.push({ x: en.x, y: en.y + 35, vx: 0, vy: 6, isEnemy: true, damage: 22 });
              state.bullets.push({ x: en.x + 35, y: en.y + 30, vx: 1.5, vy: 5, isEnemy: true, damage: 18 });
            }
          } else {
            if (en.x < 30 || en.x > canvas.width - 30) en.vx *= -1;

            if (currentTime - en.lastShot > en.shootCooldown) {
              en.lastShot = currentTime;
              const angle = Math.atan2(p.y - en.y, p.x - en.x);
              state.bullets.push({
                x: en.x,
                y: en.y + 12,
                vx: Math.cos(angle) * 4.2,
                vy: Math.sin(angle) * 4.2,
                isEnemy: true,
                damage: 15
              });
            }
          }

          // Enemy vs Player collision
          if (Math.hypot(en.x - p.x, en.y - p.y) < (en.width / 2 + 18)) {
            createExplosion(en.x, en.y, '#EF4444', 20);
            p.shieldRegenTimer = 0;
            if (p.shield > 0) {
              p.shield = Math.max(0, p.shield - 40);
              soundEngine.playShieldHit();
            } else {
              p.hp = Math.max(0, p.hp - 35);
              soundEngine.playExplosion();
            }
            setPlayerHp(Math.round(p.hp));
            setPlayerShield(Math.round(p.shield));

            if (en.type !== 'dreadnought') {
              state.enemies.splice(i, 1);
            }

            if (p.hp <= 0) {
              handlePlayerDeath();
            }
            continue;
          }

          if (en.y > canvas.height + 60) {
            state.enemies.splice(i, 1);
          }
        }

        // Update Asteroids
        for (let i = state.asteroids.length - 1; i >= 0; i--) {
          const ast = state.asteroids[i];
          ast.x += ast.vx;
          ast.y += ast.vy;
          ast.rotation += ast.rotSpeed;

          // Collision with player
          if (Math.hypot(ast.x - p.x, ast.y - p.y) < ast.radius + 16) {
            createExplosion(ast.x, ast.y, '#94A3B8', 16);
            p.shieldRegenTimer = 0;
            if (p.shield > 0) {
              p.shield = Math.max(0, p.shield - 35);
              soundEngine.playShieldHit();
            } else {
              p.hp = Math.max(0, p.hp - 30);
              soundEngine.playExplosion();
            }
            setPlayerHp(Math.round(p.hp));
            setPlayerShield(Math.round(p.shield));
            state.asteroids.splice(i, 1);

            if (p.hp <= 0) {
              handlePlayerDeath();
            }
            continue;
          }

          if (ast.y > canvas.height + ast.radius + 20) {
            state.asteroids.splice(i, 1);
          }
        }

        // Update Powerups
        for (let i = state.powerups.length - 1; i >= 0; i--) {
          const pw = state.powerups[i];
          pw.y += pw.vy;

          if (Math.hypot(pw.x - p.x, pw.y - p.y) < 32) {
            soundEngine.playPowerup();
            createExplosion(pw.x, pw.y, '#38BDF8', 10);

            if (pw.type === 'shield') {
              p.shield = 100;
              setPlayerShield(100);
            } else if (pw.type === 'triple') {
              p.weaponLevel = Math.min(3, p.weaponLevel + 1);
              setWeaponLevel(p.weaponLevel);
            } else if (pw.type === 'repair') {
              p.hp = Math.min(100, p.hp + 40);
              setPlayerHp(Math.round(p.hp));
            } else if (pw.type === 'emp') {
              // Destroy all regular drones on screen!
              for (const enemy of state.enemies) {
                if (enemy.type !== 'dreadnought') {
                  enemy.hp = 0;
                  createExplosion(enemy.x, enemy.y, '#06B6D4', 16);
                  state.score += enemy.scoreValue;
                }
              }
              state.enemies = state.enemies.filter(e => e.type === 'dreadnought');
              setScore(state.score);
            }

            state.powerups.splice(i, 1);
            continue;
          }

          if (pw.y > canvas.height + 40) {
            state.powerups.splice(i, 1);
          }
        }
      }

      // Update Stars
      for (const star of state.stars) {
        star.y += star.speed * (state.gameState === 'PLAYING' ? 1.6 : 0.6);
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      }

      // Update Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;
        if (pt.alpha <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // Screen shake decay
      if (state.screenShake > 0) {
        state.screenShake *= 0.88;
        if (state.screenShake < 0.2) state.screenShake = 0;
      }

      // ================= DRAWING =================
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (state.screenShake > 0) {
        const sx = (Math.random() - 0.5) * state.screenShake * 2;
        const sy = (Math.random() - 0.5) * state.screenShake * 2;
        ctx.translate(sx, sy);
      }

      // Deep space background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#040711');
      bgGrad.addColorStop(1, '#0B132B');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield
      for (const star of state.stars) {
        ctx.fillStyle = `rgba(226, 232, 240, ${star.alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      // Draw Asteroids
      for (const ast of state.asteroids) {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.rotation);
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Jagged asteroid shape
        const points = 7;
        for (let pIdx = 0; pIdx < points; pIdx++) {
          const a = (pIdx / points) * Math.PI * 2;
          const r = ast.radius * (0.8 + ((pIdx % 3) * 0.15));
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (pIdx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Draw Powerups
      for (const pw of state.powerups) {
        ctx.save();
        ctx.translate(pw.x, pw.y);
        const glowColor =
          pw.type === 'shield' ? '#38BDF8' :
          pw.type === 'triple' ? '#F59E0B' :
          pw.type === 'emp' ? '#A855F7' : '#10B981';

        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = pw.type === 'shield' ? 'S' : pw.type === 'triple' ? '3x' : pw.type === 'emp' ? 'EMP' : '+';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }

      // Draw Enemies
      for (const en of state.enemies) {
        ctx.save();
        ctx.translate(en.x, en.y);

        if (en.type === 'dreadnought') {
          // Boss Dreadnought
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 16;
          ctx.fillStyle = '#1E1B4B';
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.moveTo(0, en.height / 2);
          ctx.lineTo(-en.width / 2, -en.height / 3);
          ctx.lineTo(-en.width / 3, -en.height / 2);
          ctx.lineTo(en.width / 3, -en.height / 2);
          ctx.lineTo(en.width / 2, -en.height / 3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Health bar
          const barW = en.width + 20;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fillRect(-barW / 2, -en.height / 2 - 18, barW, 6);
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(-barW / 2, -en.height / 2 - 18, barW * (en.hp / en.maxHp), 6);
        } else {
          // Drone / Scout
          const isScout = en.type === 'scout';
          ctx.shadowColor = isScout ? '#EC4899' : '#EF4444';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#1E293B';
          ctx.strokeStyle = isScout ? '#EC4899' : '#EF4444';
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.moveTo(0, en.height / 2);
          ctx.lineTo(-en.width / 2, -en.height / 2);
          ctx.lineTo(0, -en.height / 4);
          ctx.lineTo(en.width / 2, -en.height / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Bullets
      for (const b of state.bullets) {
        ctx.save();
        if (b.isEnemy) {
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#F87171';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.shadowColor = '#38BDF8';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#38BDF8';
          ctx.fillRect(b.x - 2, b.y - 10, 4, 18);
        }
        ctx.restore();
      }

      // Draw Player Ship
      if (state.gameState === 'PLAYING' || state.gameState === 'PAUSED') {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Engine thruster flame
        const thrusterHeight = 12 + Math.random() * 10;
        const thrusterGrad = ctx.createLinearGradient(0, 18, 0, 18 + thrusterHeight);
        thrusterGrad.addColorStop(0, '#38BDF8');
        thrusterGrad.addColorStop(0.6, '#0284C7');
        thrusterGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = thrusterGrad;
        ctx.beginPath();
        ctx.moveTo(-7, 18);
        ctx.lineTo(0, 18 + thrusterHeight);
        ctx.lineTo(7, 18);
        ctx.closePath();
        ctx.fill();

        // Ship hull
        ctx.shadowColor = '#06B6D4';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, -24); // nose
        ctx.lineTo(19, 18);  // right wing tip
        ctx.lineTo(8, 12);   // right body
        ctx.lineTo(0, 16);   // center rear
        ctx.lineTo(-8, 12);  // left body
        ctx.lineTo(-19, 18); // left wing tip
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Canopy
        ctx.fillStyle = '#67E8F9';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(4, 2);
        ctx.lineTo(-4, 2);
        ctx.closePath();
        ctx.fill();

        // Kinetic Shield Bubble if active
        if (p.shield > 0) {
          ctx.shadowColor = '#38BDF8';
          ctx.shadowBlur = 15;
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.25 + (p.shield / 100) * 0.45})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Draw Particles
      for (const pt of state.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePlayerDeath = () => {
    soundEngine.playGameOver();
    stateRef.current.gameState = 'GAMEOVER';
    setGameState('GAMEOVER');

    const finalScore = stateRef.current.score;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('vortex_void_highscore', String(finalScore));
    }

    if (onGameOver) {
      onGameOver(finalScore);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    stateRef.current.mouse.active = true;
    stateRef.current.mouse.x = (e.clientX - rect.left) * scaleX;
    stateRef.current.mouse.y = (e.clientY - rect.top) * scaleY;
  };

  const handleMouseDown = () => {
    stateRef.current.mouse.isDown = true;
  };

  const handleMouseUp = () => {
    stateRef.current.mouse.isDown = false;
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-4xl mx-auto">
      {/* Top HUD Bar */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-t-xl px-5 py-3 text-sm">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 block">SCORE</span>
            <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">HIGH SCORE</span>
            <span className="text-sm font-semibold font-mono text-slate-200 tabular-nums">
              {highScore.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">WAVE</span>
            <span className="text-sm font-bold font-mono text-amber-400 tabular-nums">
              SECTOR {wave}
            </span>
          </div>

          {combo > 1 && (
            <div className="animate-pulse">
              <span className="text-xs text-amber-400 block font-semibold">MULTIPLIER</span>
              <span className="text-sm font-extrabold font-mono text-amber-400">
                {combo}X COMBO
              </span>
            </div>
          )}
        </div>

        {/* Meters & Audio Controls */}
        <div className="flex items-center gap-6">
          {/* Shield & Hull Meters */}
          <div className="flex items-center gap-4">
            <div className="w-24">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>SHIELD</span>
                <span className="font-mono tabular-nums">{playerShield}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150"
                  style={{ width: `${playerShield}%` }}
                />
              </div>
            </div>

            <div className="w-24">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>HULL</span>
                <span className="font-mono tabular-nums">{playerHp}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${
                    playerHp > 50 ? 'bg-emerald-400' : playerHp > 25 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${playerHp}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {gameState === 'PLAYING' && (
              <button
                onClick={pauseGame}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Pause Game (P)"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}

            {gameState === 'PAUSED' && (
              <button
                onClick={resumeGame}
                className="p-2 rounded-lg text-emerald-400 hover:bg-slate-800 transition-colors"
                title="Resume Game"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative w-full aspect-[7/6] max-h-[600px] bg-black border-x border-b border-slate-800 rounded-b-xl overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={700}
          height={600}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="w-full h-full object-contain cursor-crosshair block"
        />

        {/* READY / START OVERLAY */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
              CYBER STRIKE: VOID RUNNER
            </h2>
            <p className="text-slate-400 max-w-md text-sm mb-6">
              Navigate hostile asteroid fields, annihilate drone swarms, and defeat the Sector Dreadnought.
            </p>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-6 max-w-sm w-full text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Controls</span>
                <span className="font-mono text-cyan-300">WASD / Arrow Keys or Mouse</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fire Blasters</span>
                <span className="font-mono text-cyan-300">Spacebar or Left Click</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Power-ups</span>
                <span className="font-mono text-cyan-300">Shield · 3x Laser · EMP Bomb</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wide rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all text-sm flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              LAUNCH INTERCEPTOR
            </button>
          </div>
        )}

        {/* PAUSE OVERLAY */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <h3 className="text-2xl font-bold text-white mb-4">MISSION PAUSED</h3>
            <div className="flex gap-3">
              <button
                onClick={resumeGame}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors text-sm"
              >
                RESUME
              </button>
              <button
                onClick={startGame}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                RESTART
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">INTERCEPTOR DESTROYED</h3>
            <p className="text-slate-400 text-xs mb-6">Mission failed in Sector {wave}</p>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 w-64 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Final Score</span>
                <span className="font-mono font-bold text-cyan-400 text-lg tabular-nums">
                  {score.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-2">
                <span className="text-slate-400">High Score</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {highScore.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg shadow-lg transition-all text-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                PLAY AGAIN
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors text-sm"
                >
                  EXIT TO HUB
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500 px-2 py-3">
        <span>Controls: Move with Mouse or WASD · Space / Click to Shoot · P to Pause</span>
        <span>Hardware Web Audio: Active Synthesizer</span>
      </div>
    </div>
  );
};
