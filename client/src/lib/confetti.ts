// A tiny canvas confetti burst: paper bits, little dice and stars. No library, removed when done.
// Loaded on demand with import('../lib/confetti') so it never weighs on the first page load.

const COLORS = ['#b4501f', '#a9bba0', '#7d5800', '#456277', '#665979', '#f6efdf', '#294632', '#e9b949'];

interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'die' | 'star';
  life: number;
}

export function burst({ x = 0.5, y = 0.45, count = 160, spread = 1 }: { x?: number; y?: number; count?: number; spread?: number } = {}) {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '90' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const ox = innerWidth * x;
  const oy = innerHeight * y;
  const bits: Bit[] = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2;
    const s = (6 + Math.random() * 12) * spread;
    const roll = Math.random();
    return {
      x: ox,
      y: oy,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 8,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: roll < 0.08 ? 'die' : roll < 0.16 ? 'star' : roll < 0.6 ? 'rect' : 'circle',
      life: 1,
    };
  });

  const start = performance.now();
  const frame = (now: number) => {
    const t = (now - start) / 1000;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const b of bits) {
      b.vy += 0.35;
      b.vx *= 0.985;
      b.vy *= 0.985;
      b.x += b.vx;
      b.y += b.vy;
      b.r += b.vr;
      b.life = Math.max(0, 1 - Math.max(0, t - 1.6) / 1.2);
      ctx.save();
      ctx.globalAlpha = b.life;
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.fillStyle = b.color;
      if (b.shape === 'rect') {
        ctx.fillRect(-b.size / 2, -b.size / 4, b.size, b.size / 2 * Math.abs(Math.cos(b.r * 3)) + 1);
      } else if (b.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, b.size / 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.shape === 'die') {
        const s = b.size * 1.6;
        ctx.fillStyle = '#fffdf8';
        ctx.strokeStyle = '#294632';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-s / 2, -s / 2, s, s, s / 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#294632';
        for (const [dx, dy] of [[-0.22, -0.22], [0, 0], [0.22, 0.22]]) {
          ctx.beginPath();
          ctx.arc(dx * s, dy * s, s / 11, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // A little four-point star.
        const s = b.size;
        ctx.fillStyle = '#e9b949';
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const rad = k % 2 ? s * 0.3 : s;
          const ang = (k * Math.PI) / 4;
          ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    if (t < 3) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}

/** Bursts from both bottom corners plus the middle: for the big moments. */
export function celebrate() {
  burst({ x: 0.5, y: 0.35, count: 140 });
  setTimeout(() => burst({ x: 0.1, y: 0.8, count: 80, spread: 1.2 }), 180);
  setTimeout(() => burst({ x: 0.9, y: 0.8, count: 80, spread: 1.2 }), 320);
}
