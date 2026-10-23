const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score-el");
const healthEl = document.getElementById("health-el");
const waveEl = document.getElementById("wave-el");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-msg");
const startBtn = document.getElementById("start-btn");

let W = 0;
let H = 0;
function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
}
window.addEventListener("resize", resize);
resize();

// Safe sound synthesis (triggered strictly on user actions)
let audioCtx = null;
function playBeep(freq, type = "sine", duration = 0.1) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio optional; game never crashes
  }
}

// Game State
let isPlaying = false;
let score = 0;
let health = 100;
let wave = 1;
let frame = 0;

const player = {
  x: W / 2,
  y: H - 90,
  w: 36,
  h: 36,
  speed: 7,
  vx: 0
};

let bullets = [];
let enemies = [];
let particles = [];
let keys = { left: false, right: false, fire: false };

// Input Handlers
window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
  if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
  if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
    if (!keys.fire && isPlaying) shoot();
    keys.fire = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
  if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
  if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") keys.fire = false;
});

function bindBtn(id, pressFn, releaseFn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("touchstart", (e) => { e.preventDefault(); pressFn(); }, { passive: false });
  el.addEventListener("touchend", (e) => { e.preventDefault(); releaseFn(); }, { passive: false });
  el.addEventListener("mousedown", pressFn);
  el.addEventListener("mouseup", releaseFn);
}

bindBtn("btn-left", () => { keys.left = true; }, () => { keys.left = false; });
bindBtn("btn-right", () => { keys.right = true; }, () => { keys.right = false; });
bindBtn("btn-fire", () => { if (isPlaying) shoot(); }, () => {});

function shoot() {
  bullets.push({ x: player.x, y: player.y - 10, vy: -12 });
  playBeep(520, "triangle", 0.08);
}

function spawnEnemy() {
  const size = Math.random() * 16 + 22;
  const types = ["BUG", "LEAK", "DDOS"];
  const label = types[Math.floor(Math.random() * types.length)];
  enemies.push({
    x: Math.random() * (W - size * 2) + size,
    y: -size,
    w: size,
    h: size,
    vy: Math.random() * 1.5 + (1 + wave * 0.3),
    label: label,
    hp: label === "DDOS" ? 2 : 1
  });
}

function addExplosion(x, y, color = "#38bdf8") {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 25,
      color
    });
  }
}

function startGame() {
  score = 0;
  health = 100;
  wave = 1;
  bullets = [];
  enemies = [];
  particles = [];
  player.x = W / 2;
  player.y = H - 90;
  scoreEl.textContent = "0000";
  healthEl.textContent = "100%";
  waveEl.textContent = "1";
  overlay.classList.remove("overlay-active");
  isPlaying = true;
  playBeep(440, "sine", 0.15);
}

function gameOver() {
  isPlaying = false;
  overlayTitle.textContent = "FIREWALL BREACHED";
  overlayMsg.textContent = `System overloaded at Wave ${wave}. Final Score: ${score}. Architecture intact.`;
  startBtn.textContent = "REBOOT PROTOCOL";
  overlay.classList.add("overlay-active");
  playBeep(180, "sawtooth", 0.3);
}

startBtn.addEventListener("click", startGame);

// Game Loop
function update() {
  if (!isPlaying) return;

  frame++;
  if (frame % Math.max(30, 90 - wave * 10) === 0) spawnEnemy();
  if (frame % 800 === 0) {
    wave++;
    waveEl.textContent = String(wave);
  }

  // Player movement
  if (keys.left) player.vx = -player.speed;
  else if (keys.right) player.vx = player.speed;
  else player.vx *= 0.7;

  player.x += player.vx;
  if (player.x < 30) player.x = 30;
  if (player.x > W - 30) player.x = W - 30;

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y += bullets[i].vy;
    if (bullets[i].y < -10) bullets.splice(i, 1);
  }

  // Enemies & Collisions
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += e.vy;

    // Bullet hit enemy
    for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = bullets[bIdx];
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.w) {
        bullets.splice(bIdx, 1);
        e.hp--;
        if (e.hp <= 0) {
          addExplosion(e.x, e.y, "#38bdf8");
          enemies.splice(i, 1);
          score += 100;
          scoreEl.textContent = String(score).padStart(4, "0");
          playBeep(640, "sine", 0.05);
          break;
        }
      }
    }

    // Enemy breaches bottom firewall
    if (e.y > H - 40) {
      enemies.splice(i, 1);
      health -= 15;
      healthEl.textContent = `${Math.max(0, health)}%`;
      addExplosion(e.x, H - 40, "#ef4444");
      playBeep(150, "square", 0.15);
      if (health <= 0) gameOver();
    }
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);

  // Background Grid Lines
  ctx.strokeStyle = "rgba(56, 189, 248, 0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  // Firewall Defense Line
  ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H - 40);
  ctx.lineTo(W, H - 40);
  ctx.stroke();

  // Player Probe
  ctx.fillStyle = "#38bdf8";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - player.h / 2);
  ctx.lineTo(player.x - player.w / 2, player.y + player.h / 2);
  ctx.lineTo(player.x + player.w / 2, player.y + player.h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Bullets
  ctx.fillStyle = "#34d399";
  for (const b of bullets) {
    ctx.fillRect(b.x - 2, b.y - 8, 4, 16);
  }

  // Enemies
  for (const e of enemies) {
    ctx.fillStyle = e.label === "DDOS" ? "#ef4444" : "#f59e0b";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.fillRect(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#05070a";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(e.label, e.x, e.y + 3);
  }

  // Particles
  for (const p of particles) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 2, 2);
  }

  requestAnimationFrame(render);
}

setInterval(update, 1000 / 60);
render();
