const canvas = document.getElementById('mist-canvas');
const ctx = canvas.getContext('2d');
const DEBUG_MODE = false;
const particles = [];
let particleCount = 0;
let fallOffset = 0;
const mouse = { x: -9999, y: -9999 };
const FALL_SPEED = 1.18;
const FOG_TOP_COLOR = { r: 160, g: 200, b: 235 };
const FOG_BOTTOM_COLOR = { r: 150, g: 230, b: 185 };

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Color helpers: RGB <-> HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h = (h % 360 + 360) % 360;
  h /= 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function createParticles() {
  particles.length = 0;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const cols = Math.min(20, Math.max(12, Math.floor(width / 92)));
  const rows = Math.min(16, Math.max(10, Math.floor(height / 92)));
  const extraRows = 4;
  const totalRows = rows + extraRows;
  particleCount = cols * totalRows;
  const xSpacing = cols > 1 ? width / (cols - 1) : width;
  const spawnAbove = height * 0.28;
  const ySpacing = (height + spawnAbove) / totalRows;

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = xSpacing * col + randomBetween(-xSpacing * 0.22, xSpacing * 0.22);
      const py = -spawnAbove + ySpacing * row + randomBetween(-ySpacing * 0.4, ySpacing * 0.4);
      const drift = randomBetween(0.025, 0.07);
      particles.push({
        x: px,
        y: py,
        vx: randomBetween(-0.1, 0.1),
        vy: randomBetween(0.04, 0.18),
        radius: randomBetween(260, 430),
        alpha: randomBetween(0.24, 0.42),
        hueShift: 0,
        drift,
        warp: 0,
        warpAngle: 0,
        noiseOffset: randomBetween(0, Math.PI * 2),
      });
    }
  }
}

function updateParticles() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const spawnAbove = height * 0.45;

  particles.forEach((particle) => {
    const dx = particle.x - mouse.x;
    const dy = particle.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repelRadius = 320;
    const repelStrength = 1.05;

    particle.vy += FALL_SPEED * 0.9;

    if (dist < repelRadius) {
      const push = repelStrength * (1 - dist / repelRadius);
      particle.vx += (dx / dist || 0) * push;
      particle.vy += (dy / dist || 0) * push;
    }

    particle.vx += (Math.random() - 0.5) * particle.drift;
    particle.vy += (Math.random() - 0.5) * particle.drift * 0.7;
    particle.vx *= 0.86;
    particle.vy *= 0.86;

    const proximity = Math.max(0, Math.min(1, (repelRadius - dist) / repelRadius));
    const targetWarp = Math.min(1, Math.pow(proximity, 0.82) * 1.1);
    const warpGrow = 0.16;
    const warpDecay = 0.02;
    if (targetWarp > particle.warp) {
      particle.warp += (targetWarp - particle.warp) * warpGrow;
    } else {
      particle.warp += (targetWarp - particle.warp) * warpDecay;
    }
    // Smoothly interpolate warp angle to avoid instant snapping
    const angle = Math.atan2(dy, dx);
    let a = angle - particle.warpAngle;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    particle.warpAngle += a * 0.04;
    particle.x += Math.sin(performance.now() * 0.0014 + particle.noiseOffset) * 0.08;
    particle.y += Math.cos(performance.now() * 0.0012 + particle.noiseOffset) * 0.06;

    // Hue shift effect: quick on approach, slow fade when leaving
    const hueProximity = Math.max(0, Math.min(1, 1 - dist / repelRadius));
    const effect = Math.pow(hueProximity, 1.3); // stronger near mouse
    const targetHue = effect * 90; // shift hue by up to +90 degrees
    const upRate = 0.36;
    const downRate = 0.04;
    if (targetHue > particle.hueShift) {
      particle.hueShift += (targetHue - particle.hueShift) * upRate;
    } else {
      particle.hueShift += (targetHue - particle.hueShift) * downRate;
    }

    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -280) particle.x = width + 280;
    if (particle.x > width + 280) particle.x = -280;

    if (particle.y - particle.radius > height + 120) {
      // Respawn just above the visible area with some random offset
      particle.y = randomBetween(-spawnAbove, -30);
      particle.x = randomBetween(-90, width + 90);
      particle.vx = randomBetween(-0.12, 0.12);
      particle.vy = randomBetween(0.08, 0.34);
      particle.alpha = randomBetween(0.18, 0.36);
      particle.radius = randomBetween(200, 360);
    }
  });
}

function renderParticles() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = 'blur(2.5px)';

  particles.forEach((particle) => {
    // Skip rendering particles that are well outside the viewport
    if (particle.y + particle.radius < -20 || particle.y - particle.radius > height + 20) return;
    const yRatio = Math.min(1, Math.max(0, particle.y / height));
    // base RGB from top/bottom blend
    const baseR = Math.round(FOG_TOP_COLOR.r + (FOG_BOTTOM_COLOR.r - FOG_TOP_COLOR.r) * yRatio);
    const baseG = Math.round(FOG_TOP_COLOR.g + (FOG_BOTTOM_COLOR.g - FOG_TOP_COLOR.g) * yRatio);
    const baseB = Math.round(FOG_TOP_COLOR.b + (FOG_BOTTOM_COLOR.b - FOG_TOP_COLOR.b) * yRatio);
    // apply hue shift per particle
    const [h, s, l] = rgbToHsl(baseR, baseG, baseB);
    const hue = h + (particle.hueShift || 0);
    const [r2, g2, b2] = hslToRgb(hue, s, l);
    const color = { r: r2, g: g2, b: b2 };
    const baseAlpha = particle.alpha * (0.54 + yRatio * 0.14);
    const radius = particle.radius;
    const scaleX = 1 - particle.warp * 0.42;
    const scaleY = 1 + particle.warp * 0.26;

    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.warpAngle);
    ctx.scale(scaleX, scaleY);

    const gradient = ctx.createRadialGradient(
      0,
      0,
      radius * 0.12,
      0,
      0,
      radius
    );

    gradient.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${Math.max(0, baseAlpha * 0.9)})`);
    gradient.addColorStop(0.24, `rgba(${color.r},${color.g},${color.b},${Math.max(0, baseAlpha * 0.45)})`);
    gradient.addColorStop(0.58, `rgba(${color.r},${color.g},${color.b},${Math.max(0, baseAlpha * 0.12)})`);
    gradient.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    if (DEBUG_MODE) {
      ctx.save();
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(255,255,0,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  });

  ctx.filter = 'none';
}

function animate() {
  updateParticles();
  renderParticles();
  requestAnimationFrame(animate);
}

function onResize() {
  resizeCanvas();
  createParticles();
}

window.addEventListener('pointermove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

window.addEventListener('pointerleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

window.addEventListener('resize', onResize);

resizeCanvas();
createParticles();
animate();
