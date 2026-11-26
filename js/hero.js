// ============================================================
// STEMwithLong — Bridge Simulator
// hero.js — Hero section animation & scroll behaviour
// ============================================================

'use strict';

// ========== ANIMATED HERO CANVAS ==========
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Bridge nodes for a Pratt truss
  const baseY = H * 0.72;
  const topY  = H * 0.30;
  const left  = W * 0.08;
  const right = W * 0.92;
  const span  = right - left;
  const panels = 5;
  const dx = span / panels;

  const bottomNodes = Array.from({ length: panels + 1 }, (_, i) => ({ x: left + i * dx, y: baseY }));
  const topNodes    = Array.from({ length: panels - 1 }, (_, i) => ({ x: left + (i + 1) * dx, y: topY }));
  const allNodes    = [...bottomNodes, ...topNodes];

  // Pratt truss connectivity
  const beams = [
    // Bottom chord
    [0,1],[1,2],[2,3],[3,4],[4,5],
    // Top chord
    [6,7],[7,8],[8,9],
    // Verticals
    [1,6],[2,7],[3,8],[4,9],
    // Diagonals (Pratt — slanting outward from center)
    [0,6],[1,7],[3,9],[4,5+5],
    // end posts
    [0,6],[5,9],
  ].filter(([a,b]) => a < allNodes.length && b < allNodes.length && a !== b);

  // Remove duplicate beams
  const beamSet = new Set();
  const uniqueBeams = beams.filter(([a,b]) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (beamSet.has(key)) return false;
    beamSet.add(key);
    return true;
  });

  // ---- Physics state for animated stress ----
  let t = 0;
  const heatColors = ['#22c55e','#86efac','#fbbf24','#f97316','#ef4444'];

  function getHeat(beamIdx) {
    const phase = beamIdx * 0.8 + t * 0.015;
    const val   = (Math.sin(phase) + 1) / 2;
    return val;
  }
  function heatToColor(val) {
    const idx = val * (heatColors.length - 1);
    const lo  = Math.floor(idx);
    const hi  = Math.min(lo + 1, heatColors.length - 1);
    const frac = idx - lo;
    const c1 = heatColors[lo], c2 = heatColors[hi];
    const r1=parseInt(c1.slice(1,3),16), g1=parseInt(c1.slice(3,5),16), b1=parseInt(c1.slice(5,7),16);
    const r2=parseInt(c2.slice(1,3),16), g2=parseInt(c2.slice(3,5),16), b2=parseInt(c2.slice(5,7),16);
    return `rgb(${Math.round(r1+(r2-r1)*frac)},${Math.round(g1+(g2-g1)*frac)},${Math.round(b1+(b2-b1)*frac)})`;
  }

  // Moving load truck
  let truckX = left - 30;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#1e293b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Stars / particles
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 40; i++) {
      const sx = (Math.sin(i * 137.5 + t * 0.002) * 0.5 + 0.5) * W;
      const sy = (Math.sin(i * 97.3 + t * 0.001) * 0.5 + 0.5) * (H * 0.5);
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Water / river
    const riverY = baseY + 18;
    const waterGrad = ctx.createLinearGradient(0, riverY, 0, H);
    waterGrad.addColorStop(0, 'rgba(14,165,233,0.25)');
    waterGrad.addColorStop(1, 'rgba(14,165,233,0.05)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, riverY, W, H - riverY);

    // Animated water ripples
    ctx.strokeStyle = 'rgba(14,165,233,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const wy = riverY + 10 + i * 14;
      ctx.beginPath();
      for (let x = 0; x < W; x += 2) {
        const y = wy + Math.sin(x * 0.03 + t * 0.04 + i) * 3;
        i === 0 && x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Ground / road deck
    ctx.fillStyle = '#334155';
    ctx.fillRect(left - 10, baseY + 2, span + 20, 14);
    ctx.fillStyle = '#475569';
    ctx.fillRect(left - 10, baseY, span + 20, 4);

    // Road markings
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(left, baseY + 9);
    ctx.lineTo(right, baseY + 9);
    ctx.stroke();
    ctx.setLineDash([]);

    // Supports / abutments
    [[left - 2, baseY], [right - 12, baseY]].forEach(([ax, ay]) => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(ax - 14, ay + 20);
      ctx.lineTo(ax + 14, ay + 20);
      ctx.lineTo(ax + 7, ay);
      ctx.lineTo(ax - 7, ay);
      ctx.fill();
      ctx.fillStyle = '#78716c';
      ctx.fillRect(ax - 16, ay + 20, 32, 16);
    });

    // Beams with animated heatmap
    uniqueBeams.forEach(([a, b], bi) => {
      const na = allNodes[a], nb = allNodes[b];
      if (!na || !nb) return;
      const heat  = getHeat(bi);
      const color = heatToColor(heat);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;

    // Nodes
    allNodes.forEach((n, i) => {
      const isFixed = i === 0 || i === panels;
      ctx.beginPath();
      ctx.arc(n.x, n.y, isFixed ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isFixed ? '#f59e0b' : '#94a3b8';
      ctx.fill();
      ctx.strokeStyle = isFixed ? '#fbbf24' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Moving truck
    truckX += 1.4;
    if (truckX > right + 30) truckX = left - 30;
    const tx = truckX;
    const ty = baseY - 2;

    // Truck body
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.roundRect(tx - 18, ty - 18, 36, 16, 3);
    ctx.fill();
    // Cabin
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(tx + 8, ty - 26, 20, 10, 2);
    ctx.fill();
    // Windows
    ctx.fillStyle = 'rgba(186,230,253,0.8)';
    ctx.fillRect(tx + 10, ty - 24, 7, 6);
    ctx.fillRect(tx + 19, ty - 24, 7, 6);
    // Wheels
    [[tx - 10, ty], [tx + 12, ty]].forEach(([wx, wy]) => {
      ctx.beginPath();
      ctx.arc(wx, wy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Load arrow above truck (if on bridge)
    if (tx > left && tx < right) {
      const arrowH = 20;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 30);
      ctx.lineTo(tx, ty - 30 + arrowH);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(tx, ty - 10);
      ctx.lineTo(tx - 5, ty - 20);
      ctx.lineTo(tx + 5, ty - 20);
      ctx.fill();
    }

    // Legend pills at bottom
    const pills = [
      { label: 'Kéo căng', color: '#ef4444' },
      { label: 'Trung bình', color: '#f59e0b' },
      { label: 'Ổn định', color: '#22c55e' },
    ];
    pills.forEach((p, i) => {
      const px = W * 0.15 + i * (W * 0.26);
      const py = H - 22;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.roundRect(px - 4, py - 12, 90, 18, 9);
      ctx.fill();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px + 6, py - 3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '10px Be Vietnam Pro, sans-serif';
      ctx.fillText(p.label, px + 14, py + 1);
    });

    t++;
    requestAnimationFrame(draw);
  }

  draw();
}

// ========== SCROLL-BASED HEADER SHADOW ==========
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (!header) return;
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 4px 32px rgba(0,0,0,0.12)';
  } else {
    header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
  }
}, { passive: true });

// ========== COUNTER ANIMATION (hero stats) ==========
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// Trigger counters when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num[data-target]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
      heroObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('heroSection');
  if (heroSection) heroObserver.observe(heroSection);

  // Set data-target on stat numbers
  document.querySelectorAll('.stat-num').forEach(el => {
    const val = parseInt(el.textContent);
    if (!isNaN(val)) {
      el.dataset.target = val;
      el.textContent = '0';
    }
  });

  initHeroCanvas();
});

// ========== SMOOTH SCROLL TO SIMULATOR ==========
function scrollToSimulator() {
  switchView('simulator');
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const map = {
    '1': () => switchView('simulator'),
    '2': () => switchView('library'),
    '3': () => switchView('leaderboard'),
    '4': () => switchView('teacher'),
    ' ': (ev) => { ev.preventDefault(); if (AppState.view === 'simulator') toggleTest(); },
    'r': () => { if (AppState.view === 'simulator') resetBridge(); },
    'a': () => setTool('add'),
    'n': () => setTool('node'),
    'd': () => setTool('delete'),
    'm': () => setTool('move'),
  };
  const handler = map[e.key];
  if (handler) handler(e);
});
