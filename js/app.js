// ============================================================
// STEMwithLong — Bridge Simulator
// app.js — Main application controller
// ============================================================

'use strict';

// ========== GLOBAL STATE ==========
const AppState = {
  view: 'hero',
  isHeroVisible: true,
};

// ========== VIEW MANAGEMENT ==========
function switchView(viewName) {
  // Hide hero
  const hero = document.getElementById('heroSection');
  const main = document.getElementById('mainContent');

  if (viewName === 'hero') {
    hero.style.display = '';
    main.style.display = 'none';
    AppState.isHeroVisible = true;
  } else {
    hero.style.display = 'none';
    main.style.display = '';
    AppState.isHeroVisible = false;
  }

  // Switch views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));

  const targetView = document.getElementById('view-' + viewName);
  if (targetView) {
    targetView.classList.add('active');
    main.style.display = '';
    hero.style.display = 'none';
  }

  const activePill = document.querySelector(`.nav-pill[data-view="${viewName}"]`);
  if (activePill) activePill.classList.add('active');

  AppState.view = viewName;

  // Init view-specific logic
  if (viewName === 'simulator') {
    setTimeout(() => BridgeSim.init(), 50);
  } else if (viewName === 'library') {
    renderLibrary();
  } else if (viewName === 'leaderboard') {
    renderLeaderboard();
  } else if (viewName === 'teacher') {
    updateTeacherStats();
  }

  // Close mobile menu
  document.getElementById('navPills').classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
  document.getElementById('navPills').classList.toggle('open');
}

// ========== MODALS ==========
function showTemplates() {
  renderTemplateModal();
  document.getElementById('templateModal').style.display = 'flex';
}
function closeTemplates() {
  document.getElementById('templateModal').style.display = 'none';
}
function closeSaveModal() {
  document.getElementById('saveModal').style.display = 'none';
}
function closeResults() {
  document.getElementById('resultsPanel').style.display = 'none';
}
function closeHint() {
  document.getElementById('hintOverlay').style.display = 'none';
}
function closeLessonModal() {
  document.getElementById('lessonModal').style.display = 'none';
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
  }
});

// ========== LOAD & SPAN CONTROLS ==========
function updateLoad(val) {
  document.getElementById('loadValue').textContent = val + ' tấn';
  BridgeSim.testLoad = parseFloat(val);
}
function updateSpan(val) {
  document.getElementById('spanValue').textContent = val + ' px';
  BridgeSim.spanWidth = parseFloat(val);
  if (!BridgeSim.isRunning) BridgeSim.drawScene();
}

// ========== DISPLAY TOGGLES ==========
function toggleHeatmap() {
  BridgeSim.showHeatmap = document.getElementById('showHeatmap').checked;
  BridgeSim.drawScene();
}
function toggleLabels() {
  BridgeSim.showLabels = document.getElementById('showLabels').checked;
  BridgeSim.drawScene();
}
function toggleGrid() {
  BridgeSim.showGrid = document.getElementById('showGrid').checked;
  BridgeSim.drawScene();
}

// ========== HERO CANVAS ANIMATION ==========
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // A simple animated truss bridge preview
  const nodes = [
    {x:60, y:220}, {x:160, y:220}, {x:260, y:220}, {x:360, y:220}, {x:440, y:220},
    {x:110, y:140}, {x:210, y:100}, {x:310, y:100}, {x:390, y:140},
  ];
  const beams = [
    [0,1],[1,2],[2,3],[3,4],
    [5,6],[6,7],[7,8],
    [0,5],[1,5],[1,6],[2,6],[2,7],[3,7],[3,8],[4,8],
  ];
  const heatColors = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6'];

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Dark background
    const bg = ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#1e293b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = '#334155';
    ctx.fillRect(40, 230, W-80, 14);

    // Supports
    ctx.fillStyle = '#475569';
    ctx.fillRect(55, 220, 14, 20);
    ctx.fillRect(430, 220, 14, 20);

    // Animated load car
    const carX = 80 + ((t * 0.6) % (W - 160));
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(carX - 20, 205, 40, 15);
    ctx.fillStyle = '#fbbf24';
    ctx.font = '10px sans-serif';
    ctx.fillText('⚖️', carX - 7, 218);

    // Beams with animated stress colors
    beams.forEach(([a, b], i) => {
      const stress = Math.sin(t * 0.03 + i * 0.7) * 0.5 + 0.5;
      const ci = Math.floor(stress * (heatColors.length - 1));
      ctx.strokeStyle = heatColors[ci];
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(nodes[a].x + 15, nodes[a].y);
      ctx.lineTo(nodes[b].x + 15, nodes[b].y);
      ctx.stroke();
    });

    // Nodes
    nodes.forEach((n, i) => {
      ctx.beginPath();
      ctx.arc(n.x + 15, n.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px Be Vietnam Pro, sans-serif';
    ctx.fillText('Mô phỏng cầu dàn tam giác — heatmap lực kéo/nén', 20, 275);

    t++;
    requestAnimationFrame(draw);
  }
  draw();
}

// ========== LIBRARY ==========
const BRIDGE_TYPES = [
  {
    id: 'beam',
    name: 'Cầu Dầm (Beam Bridge)',
    type: 'Đơn giản',
    desc: 'Dạng cầu cơ bản nhất — một hoặc nhiều dầm ngang chịu tải. Phù hợp nhịp ngắn, dễ xây dựng.',
    grades: 'Lớp 6–7',
    duration: '30 phút',
    material: 'Que kem / Gỗ',
    difficulty: '⭐',
    maxSpan: 300,
    principles: ['Dầm chịu uốn kết hợp kéo và nén', 'Lực tập trung tại điểm giữa', 'Nhịp càng dài càng yếu'],
    color: '#10b981',
    template: 'beam',
  },
  {
    id: 'truss_warren',
    name: 'Cầu Dàn Warren',
    type: 'Dàn tam giác',
    desc: 'Cấu trúc tam giác xen kẽ, phân phối lực đều. Hiệu quả vật liệu rất cao.',
    grades: 'Lớp 8–9',
    duration: '45 phút',
    material: 'Gỗ / Thép',
    difficulty: '⭐⭐',
    maxSpan: 600,
    principles: ['Tam giác là hình học cứng nhất', 'Lực chỉ truyền dọc theo thanh (kéo/nén)', 'Phân phối tải đều ra hai đầu'],
    color: '#3b82f6',
    template: 'warren',
  },
  {
    id: 'truss_howe',
    name: 'Cầu Dàn Howe',
    type: 'Dàn chéo',
    desc: 'Thanh chéo nghiêng vào giữa, thanh đứng chịu kéo. Phổ biến trong cầu gỗ.',
    grades: 'Lớp 8–10',
    duration: '45 phút',
    material: 'Gỗ / Thép',
    difficulty: '⭐⭐',
    maxSpan: 650,
    principles: ['Thanh chéo chịu nén, thanh đứng chịu kéo', 'Hiệu quả với tải phân bố đều', 'Tiết kiệm thép hơn dàn Pratt'],
    color: '#8b5cf6',
    template: 'howe',
  },
  {
    id: 'truss_pratt',
    name: 'Cầu Dàn Pratt',
    type: 'Dàn chéo',
    desc: 'Thanh chéo nghiêng ra ngoài, thanh đứng chịu nén. Dạng phổ biến nhất thế giới.',
    grades: 'Lớp 9–10',
    duration: '50 phút',
    material: 'Thép / Carbon',
    difficulty: '⭐⭐⭐',
    maxSpan: 700,
    principles: ['Thanh chéo chịu kéo — hiệu quả với thép', 'Thanh đứng chịu nén ngắn — ổn định tốt', 'Phân tích lực bằng phương pháp mặt cắt'],
    color: '#f59e0b',
    template: 'pratt',
  },
  {
    id: 'arch',
    name: 'Cầu Vòm (Arch Bridge)',
    type: 'Vòm',
    desc: 'Hình vòm chuyển tải trọng thành lực nén dọc, truyền xuống đất. Rất chắc chắn.',
    grades: 'Lớp 10–11',
    duration: '55 phút',
    material: 'Thép / Carbon',
    difficulty: '⭐⭐⭐',
    maxSpan: 800,
    principles: ['Vòm triệt tiêu lực kéo — chỉ chịu nén', 'Đất/mố cầu phải chịu lực đẩy ngang', 'Hình dạng vòm catenan tối ưu nhất'],
    color: '#ef4444',
    template: 'arch',
  },
  {
    id: 'cable',
    name: 'Cầu Dây Văng',
    type: 'Dây văng',
    desc: 'Dây cáp từ tháp trung tâm đỡ mặt cầu. Vươn xa nhất, đẹp nhất.',
    grades: 'Lớp 11–12',
    duration: '60 phút',
    material: 'Thép + Cáp',
    difficulty: '⭐⭐⭐⭐',
    maxSpan: 900,
    principles: ['Dây cáp chỉ chịu kéo — không chịu nén/uốn', 'Tháp chịu nén dọc từ dây kéo xuống', 'Góc dây ảnh hưởng lớn đến lực tháp'],
    color: '#0ea5e9',
    template: 'cable',
  },
];

function renderLibrary() {
  const container = document.getElementById('bridgeLibrary');
  container.innerHTML = '';

  BRIDGE_TYPES.forEach(b => {
    const card = document.createElement('div');
    card.className = 'bridge-card';
    card.innerHTML = `
      <div class="bridge-card-visual" style="background: #0f172a;">
        <canvas id="lib-canvas-${b.id}" width="320" height="180"></canvas>
      </div>
      <div class="bridge-card-body">
        <span class="bridge-type-tag">${b.type}</span>
        <h3>${b.name}</h3>
        <p>${b.desc}</p>
        <div class="bridge-props">
          <span class="bridge-prop">🎓 ${b.grades}</span>
          <span class="bridge-prop">⏱️ ${b.duration}</span>
          <span class="bridge-prop">🪵 ${b.material}</span>
          <span class="bridge-prop">${b.difficulty}</span>
          <span class="bridge-prop">📏 Nhịp max: ${b.maxSpan}px</span>
        </div>
        <details style="margin-bottom:12px; font-size:0.78rem; color:var(--text-muted)">
          <summary style="cursor:pointer; font-weight:700; color:var(--text);">💡 Nguyên lý kết cấu</summary>
          <ul style="margin-top:8px; padding-left:16px; line-height:1.8">
            ${b.principles.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </details>
        <div class="bridge-actions">
          <button class="bridge-btn" onclick="loadLibraryTemplate('${b.template}')">📐 Xem Mẫu</button>
          <button class="bridge-btn primary" onclick="practiceTemplate('${b.template}')">🏗️ Thực Hành</button>
        </div>
      </div>
    `;
    container.appendChild(card);
    setTimeout(() => drawLibraryPreview(b), 100);
  });
}

function drawLibraryPreview(bridge) {
  const canvas = document.getElementById('lib-canvas-' + bridge.id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 320, H = 180;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  const tpl = BRIDGE_TEMPLATES[bridge.template];
  if (!tpl) return;

  // Scale template to fit canvas
  const margin = 20;
  const scaleX = (W - margin * 2) / 600;
  const scaleY = (H - margin * 2 - 20) / 200;

  tpl.beams.forEach(([a, b]) => {
    const na = tpl.nodes[a], nb = tpl.nodes[b];
    ctx.strokeStyle = bridge.color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(margin + na.x * scaleX, margin + 20 + na.y * scaleY);
    ctx.lineTo(margin + nb.x * scaleX, margin + 20 + nb.y * scaleY);
    ctx.stroke();
  });

  tpl.nodes.forEach((n, i) => {
    ctx.beginPath();
    ctx.arc(margin + n.x * scaleX, margin + 20 + n.y * scaleY, 4, 0, Math.PI * 2);
    ctx.fillStyle = tpl.fixed.includes(i) ? '#f59e0b' : '#94a3b8';
    ctx.fill();
  });

  // Label
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '10px Be Vietnam Pro, sans-serif';
  ctx.fillText(bridge.name, margin, margin - 4);
}

function loadLibraryTemplate(templateName) {
  switchView('simulator');
  setTimeout(() => {
    BridgeSim.loadTemplate(templateName);
  }, 100);
}

function practiceTemplate(templateName) {
  switchView('simulator');
  setTimeout(() => {
    BridgeSim.loadTemplate(templateName);
    closeHint();
  }, 100);
}

// ========== TEMPLATE MODAL ==========
function renderTemplateModal() {
  const grid = document.getElementById('templateGrid');
  grid.innerHTML = '';

  Object.entries(BRIDGE_TEMPLATES).forEach(([key, tpl]) => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.onclick = () => { BridgeSim.loadTemplate(key); closeTemplates(); };
    card.innerHTML = `
      <canvas class="template-canvas" id="tpl-${key}" width="200" height="110"></canvas>
      <div class="template-label">${tpl.name}</div>
      <div class="template-sub">${tpl.desc}</div>
    `;
    grid.appendChild(card);
    setTimeout(() => {
      const c = document.getElementById('tpl-' + key);
      if (!c) return;
      const ctx = c.getContext('2d');
      const W = 200, H = 110;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      const margin = 15;
      const sx = (W - margin * 2) / 600;
      const sy = (H - margin * 2 - 15) / 200;
      tpl.beams.forEach(([a, b]) => {
        const na = tpl.nodes[a], nb = tpl.nodes[b];
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin + na.x * sx, margin + 15 + na.y * sy);
        ctx.lineTo(margin + nb.x * sx, margin + 15 + nb.y * sy);
        ctx.stroke();
      });
    }, 50);
  });
}

// ========== SAVE SCORE ==========
let _pendingScore = null;

function saveScore() {
  const result = BridgeSim.getLastResult();
  if (!result) {
    alert('⚠️ Hãy chạy kiểm tra cầu trước khi lưu điểm!');
    return;
  }
  _pendingScore = result;

  const preview = document.getElementById('savePreview');
  preview.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div><strong>Tải chịu được:</strong><br>${result.maxLoad} tấn</div>
      <div><strong>Chi phí:</strong><br>${result.cost.toLocaleString()} VNĐ</div>
      <div><strong>Hiệu quả:</strong><br>${result.efficiency.toFixed(2)}</div>
      <div><strong>Điểm:</strong><br><span style="color:var(--primary);font-size:1.2rem;font-weight:800">${result.score}</span></div>
    </div>
  `;

  document.getElementById('saveModal').style.display = 'flex';
}

function confirmSave() {
  const name = document.getElementById('playerName').value.trim() || 'Học sinh';
  const cls = document.getElementById('playerClass').value.trim() || '—';

  if (!_pendingScore) return;

  const entry = {
    name, cls,
    bridgeType: BridgeSim.currentTemplate || 'Tự do',
    material: BridgeSim.currentMaterial,
    maxLoad: _pendingScore.maxLoad,
    cost: _pendingScore.cost,
    efficiency: _pendingScore.efficiency,
    score: _pendingScore.score,
    bars: _pendingScore.bars,
    timestamp: new Date().toLocaleString('vi-VN'),
  };

  Leaderboard.add(entry);
  closeSaveModal();
  switchView('leaderboard');
}

// ========== EXPORT REPORT ==========
function exportReport() {
  const result = BridgeSim.getLastResult();
  if (!result) { alert('Hãy chạy kiểm tra trước!'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('STEMwithLong — Bao Cao Thuc Hanh Cau', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Thoi gian: ${new Date().toLocaleString('vi-VN')}`, 20, 32);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Ket qua Kiem tra:', 20, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const rows = [
    ['Loai cau', BridgeSim.currentTemplate || 'Tu do'],
    ['Vat lieu chinh', BridgeSim.currentMaterial],
    ['So thanh', result.bars + ' thanh'],
    ['Tai trong dat', BridgeSim.testLoad + ' tan'],
    ['Tai chiu duoc toi da', result.maxLoad + ' tan'],
    ['Khoi luong cau', result.mass.toFixed(1) + ' kg'],
    ['Chi phi', result.cost.toLocaleString() + ' VND'],
    ['He so hieu qua', result.efficiency.toFixed(3)],
    ['Diem tong', result.score + ' diem'],
    ['Ket qua', result.passed ? 'DAT - Cau chiu duoc tai!' : 'CHUA DAT'],
  ];

  let y = 60;
  rows.forEach(([label, val]) => {
    doc.text(label + ':', 20, y);
    doc.text(val, 90, y);
    y += 9;
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Nguyen ly Vat ly:', 20, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('- Thanh mau do: chiu keo (tension) — bi gian ra', 20, y + 20);
  doc.text('- Thanh mau xanh duong: chiu nen (compression) — bi ep lai', 20, y + 29);
  doc.text('- Tam giac la don vi co ban, khong bien dang duoc', 20, y + 38);
  doc.text('- Luc tap trung tai nut, truyen doc theo thanh', 20, y + 47);

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text('© 2026 STEMwithLong — Mo phong Cau STEM K-12', 20, 285);

  doc.save(`STEMwithLong_BaoCao_${Date.now()}.pdf`);
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  renderLibrary();
  renderLeaderboard();

  // Show hero on load
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('heroSection').style.display = '';
});
