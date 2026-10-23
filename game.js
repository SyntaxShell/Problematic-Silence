const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Base Virtual Resolution (16:9 widescreen)
const V_WIDTH = 960;
const V_HEIGHT = 540;
canvas.width = V_WIDTH;
canvas.height = V_HEIGHT;

function resizeCanvas() {
  const scale = Math.min(window.innerWidth / V_WIDTH, window.innerHeight / V_HEIGHT);
  canvas.style.width = `${V_WIDTH * scale}px`;
  canvas.style.height = `${V_HEIGHT * scale}px`;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// HUD References
const scoreValue = document.getElementById("scoreValue");
const highScoreValue = document.getElementById("highScoreValue");
const relicsValue = document.getElementById("relicsValue");

let score = 0;
let relicsCollected = 0;
let highScore = localStorage.getItem("ps_highscore") || 0;
if (highScoreValue) highScoreValue.textContent = String(highScore).padStart(6, "0");

// Procedural Retro Sound Engine (Web Audio API)
const SFX = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  jump() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  },
  interact() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }
};

// Input Handling (Keyboard & Touch)
const keys = { left: false, right: false, up: false, interact: false };

window.addEventListener("keydown", (e) => {
  SFX.init();
  if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
  if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
  if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") keys.up = true;
  if (e.code === "KeyE") keys.interact = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
  if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
  if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") keys.up = false;
  if (e.code === "KeyE") keys.interact = false;
});

// Mobile Touch Control Bindings
function bindTouch(btnId, keyProp) {
  const btn = document.getElementById(btnId);
  if (!btn) return;

  const handleStart = (e) => {
    e.preventDefault();
    SFX.init();
    keys[keyProp] = true;
    if ("vibrate" in navigator) navigator.vibrate(20);
  };
  const handleEnd = (e) => {
    e.preventDefault();
    keys[keyProp] = false;
  };

  btn.addEventListener("touchstart", handleStart, { passive: false });
  btn.addEventListener("touchend", handleEnd, { passive: false });
  btn.addEventListener("touchcancel", handleEnd, { passive: false });
}

bindTouch("btn-left", "left");
bindTouch("btn-right", "right");
bindTouch("btn-jump", "up");
bindTouch("btn-interact", "interact");

// Particle System
let particles = [];
function createDust(x, y, color = "rgba(134, 215, 255, 0.4)") {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 1.2) * 1.5,
      life: 22,
      maxLife: 22,
      color,
      size: Math.random() * 2.5 + 1.5
    });
  }
}

// Entities
const player = {
  x: 100,
  y: 380,
  w: 24,
  h: 36,
  vx: 0,
  vy: 0,
  speed: 4.8,
  jumpPower: -11.5,
  grounded: false
};

const yaar = {
  x: 760,
  y: 394,
  w: 32,
  h: 32,
  glow: 10,
  dialogue: "YAAR: 'Courage is the light within our silence...'",
  showDialogue: false
};

const platforms = [
  { x: 0, y: 460, w: 960, h: 80 },
  { x: 220, y: 380, w: 140, h: 16 },
  { x: 440, y: 300, w: 160, h: 16 },
  { x: 680, y: 426, w: 180, h: 16 }
];

const relics = [
  { x: 280, y: 330, w: 16, h: 16, collected: false },
  { x: 510, y: 250, w: 16, h: 16, collected: false },
  { x: 820, y: 380, w: 16, h: 16, collected: false }
];

// Main Update Loop
function update() {
  if (keys.left) player.vx = -player.speed;
  else if (keys.right) player.vx = player.speed;
  else player.vx *= 0.78;

  if (keys.up && player.grounded) {
    player.vy = player.jumpPower;
    player.grounded = false;
    SFX.jump();
    createDust(player.x + player.w / 2, player.y + player.h);
  }

  // Gravity
  player.vy += 0.58;
  player.x += player.vx;
  player.y += player.vy;

  // Collision with Platforms
  player.grounded = false;
  for (const plat of platforms) {
    if (
      player.x < plat.x + plat.w &&
      player.x + player.w > plat.x &&
      player.y + player.h <= plat.y + 16 &&
      player.y + player.h + player.vy >= plat.y
    ) {
      player.grounded = true;
      player.vy = 0;
      player.y = plat.y - player.h;
    }
  }

  // World Bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > V_WIDTH) player.x = V_WIDTH - player.w;

  // Relic Collectibles
  relics.forEach((r) => {
    if (!r.collected) {
      if (
        player.x < r.x + r.w &&
        player.x + player.w > r.x &&
        player.y < r.y + r.h &&
        player.y + player.h > r.y
      ) {
        r.collected = true;
        relicsCollected++;
        score += 500;
        SFX.interact();
        createDust(r.x + 8, r.y + 8, "rgba(240, 200, 131, 0.8)");
        if (scoreValue) scoreValue.textContent = String(score).padStart(6, "0");
        if (relicsValue) relicsValue.textContent = `${relicsCollected}/3`;

        if (score > highScore) {
          highScore = score;
          localStorage.setItem("ps_highscore", highScore);
          if (highScoreValue) highScoreValue.textContent = String(highScore).padStart(6, "0");
        }
      }
    }
  });

  // YAAR Interaction
  const dist = Math.hypot((player.x + player.w / 2) - (yaar.x + yaar.w / 2), player.y - yaar.y);
  yaar.glow = Math.sin(Date.now() / 240) * 8 + 14;

  if (dist < 85) {
    if (keys.interact && !yaar.showDialogue) {
      SFX.interact();
      yaar.showDialogue = true;
      score += 50;
      if (scoreValue) scoreValue.textContent = String(score).padStart(6, "0");
    }
  } else {
    yaar.showDialogue = false;
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// Render Loop
function render() {
  ctx.fillStyle = "#05070a";
  ctx.fillRect(0, 0, V_WIDTH, V_
