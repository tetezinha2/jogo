// Sistema de Som Retrô usando Web Audio API
const AudioSys = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  play(type) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    const now = this.ctx.currentTime;

    if (type === 'jump') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'attack') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }
};

// Canvas & Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos da Interface (HUD / UI)
const hpVal = document.getElementById('hp-val');
const coinVal = document.getElementById('coin-val');
const keyVal = document.getElementById('key-val');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const startBtn = document.getElementById('start-btn');

// Configuração do Mapa
const TILE_SIZE = 16;
const COLS = 20;
const ROWS = 15;

// Estado do Jogo
let gameState = 'START';
let score = 0;
let coinsCollected = 0;
let hasKey = false;

// Input
const keys = { left: false, right: false, up: false, attack: false };

// Mapa (0: Ar, 1: Parede, 2: Espinho, 3: Moeda, 4: Chave, 5: Porta, 6: Princesa)
const originalMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,1],
  [1,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,0,1,1,1,1,2,2,1,1,1,1,0,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
  [1,0,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,1],
  [1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,5,1,1],
  [1,0,0,0,0,0,0,0,0,3,0,0,0,0,0,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let map = [];

// Jogador
const player = {
  x: 32,
  y: 32,
  w: 12,
  h: 14,
  vx: 0,
  vy: 0,
  speed: 1.5,
  jumpPower: -4.2,
  grounded: false,
  hp: 3,
  facing: 'right',
  isAttacking: false,
  attackTimer: 0,
  invulnerable: 0
};

// Inimigos
let enemies = [];

function initEnemies() {
  enemies = [
    { x: 100, y: 80, w: 12, h: 12, vx: 0.8, type: 'slime' },
    { x: 200, y: 144, w: 12, h: 12, vx: -1, type: 'slime' },
    { x: 120, y: 40, w: 12, h: 10, vx: 1.2, vy: 0, type: 'bat', startY: 40, t: 0 }
  ];
}

// Inicializar / Resetar Jogo
function resetGame() {
  map = JSON.parse(JSON.stringify(originalMap));
  player.x = 32;
  player.y = 32;
  player.vx = 0;
  player.vy = 0;
  player.hp = 3;
  player.invulnerable = 0;
  coinsCollected = 0;
  hasKey = false;
  initEnemies();
  updateHUD();
}

function updateHUD() {
  hpVal.innerText = player.hp;
  coinVal.innerText = coinsCollected;
  keyVal.innerText = hasKey ? 'SIM' : 'NÃO';
}

// Colisões de AABB
function checkCollision(r1, r2) {
  return r1.x < r2.x + r2.w &&
         r1.x + r1.w > r2.x &&
         r1.y < r2.y + r2.h &&
         r1.y + r1.h > r2.y;
}

function getTile(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return 1;
  return map[row][col];
}

function setTile(col, row, val) {
  if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
    map[row][col] = val;
  }
}

// Atualização Principal
function update() {
  if (gameState !== 'PLAYING') return;

  // Ataque
  if (keys.attack && !player.isAttacking) {
    player.isAttacking = true;
    player.attackTimer = 15;
    AudioSys.play('attack');
  }

  if (player.attackTimer > 0) {
    player.attackTimer--;
    if (player.attackTimer === 0) player.isAttacking = false;
  }

  // Movimento Horizontal
  player.vx = 0;
  if (keys.left) {
    player.vx = -player.speed;
    player.facing = 'left';
  }
  if (keys.right) {
    player.vx = player.speed;
    player.facing = 'right';
  }

  // Gravidade & Pulo
  player.vy += 0.25; // Gravidade
  if (keys.up && player.grounded) {
    player.vy = player.jumpPower;
    player.grounded = false;
    AudioSys.play('jump');
  }

  // Movimento & Colisão em X
  player.x += player.vx;
  collideMap(true);

  // Movimento & Colisão em Y
  player.y += player.vy;
  player.grounded = false;
  collideMap(false);

  // Invulnerabilidade
  if (player.invulnerable > 0) player.invulnerable--;

  // Atualizar Inimigos
  updateEnemies();

  // Ataque do Jogador acertando Inimigos
  if (player.isAttacking && player.attackTimer > 5) {
    const attackBox = {
      x: player.facing === 'right' ? player.x + player.w : player.x - 12,
      y: player.y,
      w: 12,
      h: player.h
    };

    enemies.forEach((enemy, index) => {
      if (checkCollision(attackBox, enemy)) {
        enemies.splice(index, 1);
        AudioSys.play('hit');
      }
    });
  }
}

// Resolução de Colisão com o Mapa
function collideMap(isX) {
  const left = Math.floor(player.x / TILE_SIZE);
  const right = Math.floor((player.x + player.w - 1) / TILE_SIZE);
  const top = Math.floor(player.y / TILE_SIZE);
  const bottom = Math.floor((player.y + player.h - 1) / TILE_SIZE);

  for (let r = top; r <= bottom; r++) {
    for (let c = left; c <= right; c++) {
      const tile = getTile(c, r);

      // Parede Solida ou Porta Trancada
      if (tile === 1 || (tile === 5 && !hasKey)) {
        if (isX) {
          if (player.vx > 0) player.x = c * TILE_SIZE - player.w;
          if (player.vx < 0) player.x = (c + 1) * TILE_SIZE;
        } else {
          if (player.vy > 0) {
            player.y = r * TILE_SIZE - player.h;
            player.grounded = true;
            player.vy = 0;
          }
          if (player.vy < 0) {
            player.y = (r + 1) * TILE_SIZE;
            player.vy = 0;
          }
        }
      }

      // Porta Desbloqueada
      if (tile === 5 && hasKey) {
        setTile(c, r, 0); // Destrói a porta
      }

      // Coletáveis e Interativos
      if (tile === 3) { // Moeda
        setTile(c, r, 0);
        coinsCollected++;
        AudioSys.play('coin');
        updateHUD();
      } else if (tile === 4) { // Chave
        setTile(c, r, 0);
        hasKey = true;
        AudioSys.play('coin');
        updateHUD();
      } else if (tile === 2) { // Espinho
        damagePlayer();
      } else if (tile === 6) { // Princesa (Vitória)
        gameWin();
      }
    }
  }
}

function updateEnemies() {
  enemies.forEach(e => {
    if (e.type === 'slime') {
      e.x += e.vx;
      const c = Math.floor((e.vx > 0 ? e.x + e.w : e.x) / TILE_SIZE);
      const r = Math.floor((e.y + e.h / 2) / TILE_SIZE);
      if (getTile(c, r) === 1) e.vx *= -1; // Inverte direção ao bater na parede
    } else if (e.type === 'bat') {
      e.t += 0.05;
      e.x += e.vx;
      e.y = e.startY + Math.sin(e.t) * 10;
      if (e.x < 16 || e.x > 280) e.vx *= -1;
    }

    // Colisão do Inimigo com o Jogador
    if (checkCollision(player, e)) {
      damagePlayer();
    }
  });
}

function damagePlayer() {
  if (player.invulnerable > 0) return;
  player.hp--;
  player.invulnerable = 60; // 1 segundo piscando
  AudioSys.play('hit');
  updateHUD();

  // Impulso ao sofrer dano
  player.vy = -2;

  if (player.hp <= 0) {
    gameOver();
  }
}

function gameOver() {
  gameState = 'GAMEOVER';
  overlayTitle.innerText = "GAME OVER";
  overlayTitle.style.color = "#ac3232";
  overlayMsg.innerText = "Você caiu no calabouço!";
  startBtn.innerText = "TENTAR NOVAMENTE";
  overlay.style.display = 'flex';
}

function gameWin() {
  gameState = 'WIN';
  overlayTitle.innerText = "VICTORY!";
  overlayTitle.style.color = "#6abe30";
  overlayMsg.innerText = `Você salvou a princesa!\nMoedas coletadas: ${coinsCollected}/5`;
  startBtn.innerText = "JOGAR NOVAMENTE";
  overlay.style.display = 'flex';
}

// Desenho (Renderização em Pixel Art)
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Renderizar Mapa
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = map[r][c];
      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;

      if (tile === 1) { // Parede / Bloco
        ctx.fillStyle = '#3a3f58';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#222533';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      } else if (tile === 2) { // Espinho
        ctx.fillStyle = '#9badb7';
        ctx.beginPath();
        ctx.moveTo(x, y + TILE_SIZE);
        ctx.lineTo(x + 4, y + 4);
        ctx.lineTo(x + 8, y + TILE_SIZE);
        ctx.lineTo(x + 12, y + 4);
        ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
        ctx.fill();
      } else if (tile === 3) { // Moeda
        ctx.fillStyle = '#f2e200';
        ctx.fillRect(x + 5, y + 4, 6, 8);
        ctx.fillStyle = '#fff890';
        ctx.fillRect(x + 6, y + 5, 2, 6);
      } else if (tile === 4) { // Chave
        ctx.fillStyle = '#f2e200';
        ctx.fillRect(x + 4, y + 6, 8, 4);
        ctx.fillRect(x + 10, y + 4, 2, 8);
      } else if (tile === 5) { // Porta
        ctx.fillStyle = '#8f563b';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#f2e200';
        ctx.fillRect(x + 12, y + 8, 2, 2); // Maçaneta
      } else if (tile === 6) { // Princesa
        ctx.fillStyle = '#d95763';
        ctx.fillRect(x + 4, y + 4, 8, 12);
        ctx.fillStyle = '#ffcdb2';
        ctx.fillRect(x + 5, y + 2, 6, 5); // Rosto
        ctx.fillStyle = '#f2e200';
        ctx.fillRect(x + 4, y, 8, 3); // Coroa
      }
    }
  }

  // Renderizar Inimigos
  enemies.forEach(e => {
    if (e.type === 'slime') {
      ctx.fillStyle = '#6abe30';
      ctx.fillRect(e.x, e.y + 4, e.w, e.h - 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(e.x + 2, e.y + 6, 2, 2);
      ctx.fillRect(e.x + 8, e.y + 6, 2, 2);
    } else if (e.type === 'bat') {
      ctx.fillStyle = '#d95763';
      ctx.fillRect(e.x + 2, e.y + 2, 8, 6);
      // Asas
      ctx.fillRect(e.x - 2, e.y, 4, 4);
      ctx.fillRect(e.x + 10, e.y, 4, 4);
    }
  });

  // Renderizar Jogador (Piscando se estver invulnerável)
  if (player.invulnerable % 4 < 2) {
    // Corpo
    ctx.fillStyle = '#306082';
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Cabeça / Capacete
    ctx.fillStyle = '#5b6ee1';
    ctx.fillRect(player.x + 1, player.y, player.w - 2, 6);

    // Viseira
    ctx.fillStyle = '#f2e200';
    const visorX = player.facing === 'right' ? player.x + 6 : player.x + 1;
    ctx.fillRect(visorX, player.y + 2, 5, 2);

    // Espada / Ataque
    if (player.isAttacking) {
      ctx.fillStyle = '#fff';
      const swordX = player.facing === 'right' ? player.x + player.w : player.x - 10;
      ctx.fillRect(swordX, player.y + 4, 10, 3);
    }
  }
}

// Loop Principal do Jogo
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Configuração de Controles (Teclado)
window.addEventListener('keydown', e => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'KeyW' || e.code === 'Space' || e.code === 'ArrowUp') keys.up = true;
  if (e.code === 'KeyK' || e.code === 'KeyJ') keys.attack = true;
});

window.addEventListener('keyup', e => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
  if (e.code === 'KeyW' || e.code === 'Space' || e.code === 'ArrowUp') keys.up = false;
  if (e.code === 'KeyK' || e.code === 'KeyJ') keys.attack = false;
});

// Suporte para Controles de Toque (Mobile Touch)
function setupTouchButton(id, keyName) {
  const btn = document.getElementById(id);
  
  const startHandler = (e) => {
    e.preventDefault();
    keys[keyName] = true;
  };
  
  const endHandler = (e) => {
    e.preventDefault();
    keys[keyName] = false;
  };

  btn.addEventListener('touchstart', startHandler);
  btn.addEventListener('touchend', endHandler);
  btn.addEventListener('mousedown', startHandler);
  btn.addEventListener('mouseup', endHandler);
}

setupTouchButton('btn-left', 'left');
setupTouchButton('btn-right', 'right');
setupTouchButton('btn-jump', 'up');
setupTouchButton('btn-attack', 'attack');

// Iniciar Botão da Tela de Overlay
startBtn.addEventListener('click', () => {
  AudioSys.init();
  resetGame();
  gameState = 'PLAYING';
  overlay.style.display = 'none';
});

// Iniciar o loop gráfico
requestAnimationFrame(loop);
