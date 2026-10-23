// Wait for DOM to finish loading completely
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game") || document.querySelector("canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Fix native canvas resolution
  const W = 960;
  const H = 540;
  canvas.width = W;
  canvas.height = H;

  function resize() {
    const scale = Math.min((window.innerWidth - 32) / W, (window.innerHeight - 120) / H, 1);
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;
  }
  window.addEventListener("resize", resize);
  resize();

  // HUD elements
  const scoreEl = document.getElementById("scoreValue");
  const highScoreEl = document.getElementById("highScoreValue");
  const relicsEl = document.getElementById("relicsValue");

  let score = 0;
  let relics = 0;
  let highScore = Number(localStorage.getItem("ps_highscore")) || 0;
  if (highScoreEl) highScoreEl.textContent = String(highScore).padStart(6, "0");

  // Safe Audio Synth (only plays after user interacts)
  let audioCtx = null;
  function beep(freq, duration = 0.1) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {}
  }

  // Player & Entities
  const player = {
    x: 100,
    y: 380,
    w: 24,
    h: 36,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpPower: -11.5,
    grounded: false
  };

  const platforms = [
    { x: 0, y: 460, w: 960, h: 80 },
    { x: 220, y: 380, w: 140, h: 16 },
    { x: 440, y: 300, w: 160, h: 16 },
    { x: 680, y: 420, w: 180, h: 16 }
  ];

  const items = [
    { x: 280, y: 340, w: 16, h: 16, taken: false },
    { x: 510, y: 260, w: 16, h: 16, taken: false },
    { x: 820, y: 380, w: 16, h: 16, taken: false }
  ];

  const keys = { left: false, right: false, up: false, interact: false };

  window.addEventListener("keydown", (e) => {
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

  // Touch controls support
  function bindTouch(id, keyName) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("touchstart", (e) => { e.preventDefault(); keys[keyName] = true; }, { passive: false });
    el.addEventListener("touchend", (e) => { e.preventDefault(); keys[keyName] = false; }, { passive: false });
  }
  bindTouch("btn-left", "left");
  bindTouch("btn-right", "right");
  bindTouch("btn-jump", "up");
  bindTouch("btn-interact", "interact");

  // Game Loop
  function update() {
    if (keys.left) player.vx = -player.speed;
    else if (keys.right) player.vx = player.speed;
    else player.vx *= 0.75;

    if (keys.up && player.grounded) {
      player.vy = player.jumpPower;
      player.grounded = false;
      beep(380, 0.1);
    }

    player.vy += 0.55;
    player.x += player.vx;
    player.y += player.vy;

    // Platform collisions
    player.grounded = false;
    for (const p of platforms) {
      if (
        player.x < p.x + p.w &&
        player.x + player.w > p.x &&
        player.y + player.h <= p.y + 16 &&
        player.y + player.h + player.vy >= p.y
      ) {
        player.grounded = true;
        player.vy = 0;
        player.y = p.y - player.h;
      }
    }

    // Boundary checks
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > W) player.x = W - player.w;

    // Relic collection
    items.forEach((item) => {
      if (!item.taken && Math.hypot(player.x - item.x, player.y - item.y) < 28) {
        item.taken = true;
        relics++;
        score += 500;
        beep(620, 0.15);
        if (scoreEl) scoreEl.textContent = String(score).padStart(6, "0");
        if (relicsEl) relicsEl.textContent = `${relics}/3`;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("ps_highscore", highScore);
          if (highScoreEl) highScoreEl.textContent = String(highScore).padStart(6, "0");
        }
      }
    });
  }

  function render() {
    // Clear canvas
    ctx.fillStyle = "#070b10";
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "rgba(134, 215, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    // Platforms
    ctx.fillStyle = "#0f1722";
    ctx.strokeStyle = "rgba(134, 215, 255, 0.25)";
    ctx.lineWidth = 2;
    for (const p of platforms) {
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    }

    // Relics
    ctx.fillStyle = "#f0c883";
    for (const item of items) {
      if (!item.taken) {
        ctx.fillRect(item.x, item.y, item.w, item.h);
      }
    }

    // Player
    ctx.fillStyle = "#86d7ff";
    ctx.shadowColor = "#86d7ff";
    ctx.shadowBlur = 12;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.shadowBlur = 0;

    // YAAR Beacon
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(780, 390, 28, 28);

    update();
    requestAnimationFrame(render);
  }

  render();
});
