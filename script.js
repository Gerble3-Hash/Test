const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const statusEl = document.querySelector('#status');

const world = {
  gravity: 1800,
  moveSpeed: 360,
  jumpPower: 720,
  width: canvas.width,
  height: canvas.height,
};

const player = {
  x: 72,
  y: 410,
  width: 36,
  height: 52,
  vx: 0,
  vy: 0,
  onGround: false,
  color: '#1d2761',
};

const level = {
  platforms: [
    { x: 0, y: 500, width: 960, height: 40 },
    { x: 120, y: 410, width: 140, height: 24 },
    { x: 340, y: 340, width: 170, height: 24 },
    { x: 610, y: 280, width: 150, height: 24 },
    { x: 420, y: 220, width: 110, height: 24 },
    { x: 770, y: 180, width: 120, height: 24 },
  ],
  stars: [
    { x: 165, y: 370, collected: false },
    { x: 390, y: 300, collected: false },
    { x: 655, y: 240, collected: false },
    { x: 805, y: 140, collected: false },
    { x: 455, y: 180, collected: false },
  ],
};

let score = 0;
let gameWon = false;
let lastTime = 0;
const keys = new Set();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const restart = () => {
  player.x = 72;
  player.y = 410;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  level.stars.forEach((star) => {
    star.collected = false;
  });
  score = 0;
  gameWon = false;
  scoreEl.textContent = `Score: ${score}`;
  statusEl.textContent = 'Collect all stars ⭐';
};

const overlap = (a, b) => (
  a.x < b.x + b.width
  && a.x + a.width > b.x
  && a.y < b.y + b.height
  && a.y + a.height > b.y
);

const handlePlatformCollisions = (dt) => {
  player.onGround = false;

  player.x += player.vx * dt;
  for (const p of level.platforms) {
    if (!overlap(player, p)) continue;

    if (player.vx > 0) {
      player.x = p.x - player.width;
    } else if (player.vx < 0) {
      player.x = p.x + p.width;
    }
    player.vx = 0;
  }

  player.y += player.vy * dt;
  for (const p of level.platforms) {
    if (!overlap(player, p)) continue;

    if (player.vy > 0) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.onGround = true;
    } else if (player.vy < 0) {
      player.y = p.y + p.height;
      player.vy = 40;
    }
  }
};

const collectStars = () => {
  const hitbox = {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height,
  };

  for (const star of level.stars) {
    if (star.collected) continue;

    const starBox = {
      x: star.x - 10,
      y: star.y - 10,
      width: 20,
      height: 20,
    };

    if (overlap(hitbox, starBox)) {
      star.collected = true;
      score += 10;
      scoreEl.textContent = `Score: ${score}`;
    }
  }

  if (!gameWon && level.stars.every((star) => star.collected)) {
    gameWon = true;
    statusEl.textContent = 'You win! Press R to play again 🎉';
  }
};

const update = (dt) => {
  if (keys.has('ArrowLeft') || keys.has('KeyA')) {
    player.vx = -world.moveSpeed;
  } else if (keys.has('ArrowRight') || keys.has('KeyD')) {
    player.vx = world.moveSpeed;
  } else {
    player.vx = 0;
  }

  const wantsJump = keys.has('ArrowUp') || keys.has('Space') || keys.has('KeyW');
  if (wantsJump && player.onGround) {
    player.vy = -world.jumpPower;
    player.onGround = false;
  }

  player.vy += world.gravity * dt;
  player.vy = clamp(player.vy, -999, 1200);

  handlePlatformCollisions(dt);
  collectStars();

  if (player.y > world.height + 200) {
    statusEl.textContent = 'You fell! Press R to retry.';
  }
};

const drawBackground = () => {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#8fd3ff');
  gradient.addColorStop(1, '#6ab0ed');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.ellipse(120 + i * 130, 65 + (i % 2) * 20, 42, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawPlatforms = () => {
  level.platforms.forEach((p) => {
    ctx.fillStyle = '#4f6d3d';
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.fillStyle = '#86b45f';
    ctx.fillRect(p.x, p.y, p.width, 8);
  });
};

const drawStars = (timeMs) => {
  level.stars.forEach((star) => {
    if (star.collected) return;

    const pulse = 1 + Math.sin((timeMs / 200) + star.x) * 0.12;
    ctx.save();
    ctx.translate(star.x, star.y);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#ffeb5b';
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const angle = ((Math.PI * 2) / 5) * i - Math.PI / 2;
      const outerX = Math.cos(angle) * 11;
      const outerY = Math.sin(angle) * 11;
      ctx.lineTo(outerX, outerY);
      const innerAngle = angle + Math.PI / 5;
      ctx.lineTo(Math.cos(innerAngle) * 5, Math.sin(innerAngle) * 5);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
};

const drawPlayer = () => {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = '#f0f4ff';
  ctx.fillRect(player.x + 6, player.y + 8, 8, 8);
  ctx.fillRect(player.x + 22, player.y + 8, 8, 8);
};

const render = (timeMs) => {
  drawBackground();
  drawPlatforms();
  drawStars(timeMs);
  drawPlayer();
};

const gameLoop = (timeMs) => {
  const dt = Math.min((timeMs - lastTime) / 1000, 0.033);
  lastTime = timeMs;

  update(dt);
  render(timeMs);
  requestAnimationFrame(gameLoop);
};

window.addEventListener('keydown', (event) => {
  keys.add(event.code);

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
    event.preventDefault();
  }

  if (event.code === 'KeyR') {
    restart();
  }
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.code);
});

restart();
requestAnimationFrame(gameLoop);
