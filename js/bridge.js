// ============================================================
// STEMwithLong — Bridge Simulator
// bridge.js — Core simulation engine (canvas 2D + physics)
// ============================================================

'use strict';

// ========== BRIDGE TEMPLATES ==========
const BRIDGE_TEMPLATES = {
  beam: {
    name: 'Cầu Dầm Đơn',
    desc: 'Dầm ngang cơ bản — dành cho người mới',
    nodes: [
      {x:0,y:160},{x:150,y:160},{x:300,y:160},{x:450,y:160},{x:600,y:160}
    ],
    beams: [[0,1],[1,2],[2,3],[3,4]],
    fixed: [0, 4],
  },
  warren: {
    name: 'Cầu Dàn Warren',
    desc: 'Tam giác xen kẽ — hiệu quả cao',
    nodes: [
      {x:0,y:160},{x:120,y:160},{x:240,y:160},{x:360,y:160},{x:480,y:160},{x:600,y:160},
      {x:60,y:80},{x:180,y:80},{x:300,y:80},{x:420,y:80},{x:540,y:80},
    ],
    beams: [
      [0,1],[1,2],[2,3],[3,4],[4,5],
      [6,7],[7,8],[8,9],[9,10],
      [0,6],[1,6],[1,7],[2,7],[2,8],[3,8],[3,9],[4,9],[4,10],[5,10],
    ],
    fixed: [0, 5],
  },
  howe: {
    name: 'Cầu Dàn Howe',
    desc: 'Thanh chéo vào trong — phổ biến trong cầu gỗ',
    nodes: [
      {x:0,y:160},{x:150,y:160},{x:300,y:160},{x:450,y:160},{x:600,y:160},
      {x:0,y:60},{x:150,y:60},{x:300,y:60},{x:450,y:60},{x:600,y:60},
    ],
    beams: [
      [0,1],[1,2],[2,3],[3,4],
      [5,6],[6,7],[7,8],[8,9],
      [0,5],[1,6],[2,7],[3,8],[4,9],
      [1,5],[2,6],[3,7],[4,8],
    ],
    fixed: [0, 4],
  },
  pratt: {
    name: 'Cầu Dàn Pratt',
    desc: 'Thanh chéo ra ngoài — phổ biến nhất thế giới',
    nodes: [
      {x:0,y:160},{x:150,y:160},{x:300,y:160},{x:450,y:160},{x:600,y:160},
      {x:0,y:60},{x:150,y:60},{x:300,y:60},{x:450,y:60},{x:600,y:60},
    ],
    beams: [
      [0,1],[1,2],[2,3],[3,4],
      [5,6],[6,7],[7,8],[8,9],
      [0,5],[1,6],[2,7],[3,8],[4,9],
      [0,6],[1,7],[2,8],[3,9],
    ],
    fixed: [0, 4],
  },
  arch: {
    name: 'Cầu Vòm',
    desc: 'Hình vòm chuyển tải thành lực nén',
    nodes: [
      {x:0,y:180},{x:100,y:180},{x:200,y:180},{x:300,y:180},{x:400,y:180},{x:500,y:180},{x:600,y:180},
      {x:60,y:120},{x:150,y:70},{x:300,y:40},{x:450,y:70},{x:540,y:120},
    ],
    beams: [
      [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],
      [7,8],[8,9],[9,10],[10,11],
      [0,7],[1,7],[1,8],[2,8],[2,9],[3,9],[3,10],[4,10],[4,11],[5,11],[5,6],
      [7,2],[11,4],
    ],
    fixed: [0, 6],
  },
  cable: {
    name: 'Cầu Dây Văng',
    desc: 'Dây từ tháp trung tâm đỡ mặt cầu',
    nodes: [
      {x:0,y:180},{x:100,y:180},{x:200,y:180},{x:300,y:180},{x:400,y:180},{x:500,y:180},{x:600,y:180},
      {x:300,y:30},
    ],
    beams: [
      [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],
      [7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],
      [3,7],
    ],
    fixed: [0, 6],
  },
  empty: {
    name: 'Bắt Đầu Từ Đầu',
    desc: 'Chỉ có trụ cầu — tự thiết kế',
    nodes: [
      {x:0,y:180},{x:600,y:180}
    ],
    beams: [],
    fixed: [0, 1],
  },
};

// ========== MATERIAL PROPERTIES ==========
const MATERIALS = {
  popsicle: { name: 'Que Kem', color: '#a16207', density: 0.6, strength: 0.4, cost: 100, strokeW: 3 },
  wood:     { name: 'Gỗ',     color: '#854d0e', density: 0.9, strength: 0.7, cost: 300, strokeW: 4 },
  steel:    { name: 'Thép',   color: '#64748b', density: 7.8, strength: 2.5, cost: 1500, strokeW: 5 },
  carbon:   { name: 'Carbon', color: '#1e293b', density: 1.6, strength: 3.0, cost: 4000, strokeW: 4 },
  rope:     { name: 'Cáp',    color: '#d97706', density: 0.5, strength: 1.5, cost: 800, strokeW: 2 },
};

// ========== BRIDGE SIMULATOR OBJECT ==========
const BridgeSim = {
  canvas: null,
  ctx: null,

  nodes: [],     // {x, y, fixed, vx, vy, fx, fy}
  beams: [],     // {a, b, material, restLen, force, broken}
  selectedNodes: [],

  currentTool: 'add',
  currentMaterial: 'popsicle',
  currentTemplate: null,

  showHeatmap: true,
  showLabels: true,
  showGrid: true,
  isRunning: false,
  testLoad: 3,
  spanWidth: 600,

  W: 0, H: 0,
  offsetX: 0, offsetY: 0,
  scale: 1,
  snapRadius: 20,

  animFrame: null,
  simTime: 0,
  lastResult: null,

  isDragging: false,
  dragStart: null,
  dragNode: null,
  moveNode: null,

  // Init
  init() {
    if (this.canvas) {
      this.resize();
      this.drawScene();
      return;
    }
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    this.loadTemplate('warren');
    this.bindEvents();

    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    const wrapper = document.getElementById('canvasWrapper');
    if (!wrapper || !this.canvas) return;
    this.W = wrapper.clientWidth;
    this.H = wrapper.clientHeight;
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.drawScene();
  },

  // ========== TEMPLATE LOADING ==========
  loadTemplate(name) {
    const tpl = BRIDGE_TEMPLATES[name];
    if (!tpl) return;
    this.stopTest();
    this.currentTemplate = name;

    // Center the template in canvas
    const cx = this.W / 2;
    const cy = this.H * 0.55;

    // Find template bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    tpl.nodes.forEach(n => {
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
    });
    const tW = maxX - minX || 600;
    const tH = maxY - minY || 160;

    const targetW = Math.min(this.W * 0.75, this.spanWidth);
    const sx = targetW / tW;
    const sy = Math.min((this.H * 0.4) / (tH || 1), sx);
    const scale = Math.min(sx, sy, 1.2);

    const offX = cx - (tW * scale) / 2;
    const offY = cy - (tH * scale) / 2;

    this.nodes = tpl.nodes.map((n, i) => ({
      x: offX + (n.x - minX) * scale,
      y: offY + (n.y - minY) * scale,
      fixed: tpl.fixed.includes(i),
      vx: 0, vy: 0, fx: 0, fy: 0,
    }));

    this.beams = tpl.beams.map(([a, b]) => ({
      a, b,
      material: this.currentMaterial,
      restLen: this.dist(this.nodes[a], this.nodes[b]),
      force: 0,
      broken: false,
    }));

    this.lastResult = null;
    this.updateInfoBar();
    this.drawScene();
    document.getElementById('hintOverlay').style.display = 'none';
    document.getElementById('resultsPanel').style.display = 'none';
    document.getElementById('scoreBar').style.display = 'none';
    document.getElementById('maxForceBar').style.display = 'none';
    document.getElementById('btnTest').textContent = '▶️ Chạy Kiểm Tra';
    document.getElementById('btnTest').className = 'action-btn run';
    document.getElementById('statusPill').textContent = `📐 Mẫu "${BRIDGE_TEMPLATES[name].name}" đã tải — sẵn sàng kiểm tra`;
  },

  // ========== RESET ==========
  resetBridge() {
    if (this.currentTemplate) {
      this.loadTemplate(this.currentTemplate);
    } else {
      this.nodes = [];
      this.beams = [];
      this.loadTemplate('empty');
    }
    this.isRunning = false;
    cancelAnimationFrame(this.animFrame);
    document.getElementById('btnTest').textContent = '▶️ Chạy Kiểm Tra';
    document.getElementById('btnTest').className = 'action-btn run';
    document.getElementById('statusPill').textContent = '🏗️ Chế độ xây dựng — kéo thả để nối thanh';
  },

  // ========== TOOLS ==========
  selectMaterial(mat) { this.currentMaterial = mat; },
  setTool(tool) { this.currentTool = tool; },

  // ========== EVENTS ==========
  bindEvents() {
    const c = this.canvas;
    c.addEventListener('mousedown', e => this.onMouseDown(e));
    c.addEventListener('mousemove', e => this.onMouseMove(e));
    c.addEventListener('mouseup', e => this.onMouseUp(e));
    c.addEventListener('touchstart', e => { e.preventDefault(); this.onMouseDown(this.touchToMouse(e)); }, { passive: false });
    c.addEventListener('touchmove', e => { e.preventDefault(); this.onMouseMove(this.touchToMouse(e)); }, { passive: false });
    c.addEventListener('touchend', e => { e.preventDefault(); this.onMouseUp(this.touchToMouse(e)); }, { passive: false });
  },

  touchToMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    const t = e.touches[0] || e.changedTouches[0];
    return { clientX: t.clientX, clientY: t.clientY, offsetX: t.clientX - rect.left, offsetY: t.clientY - rect.top };
  },

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height),
    };
  },

  findNearNode(x, y, radius) {
    let best = null, bestD = radius;
    this.nodes.forEach((n, i) => {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  },

  findNearBeam(x, y) {
    let best = null, bestD = 12;
    this.beams.forEach((b, i) => {
      const na = this.nodes[b.a], nb = this.nodes[b.b];
      const d = this.pointToSegDist(x, y, na.x, na.y, nb.x, nb.y);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  },

  pointToSegDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  },

  onMouseDown(e) {
    if (this.isRunning) return;
    const pos = this.getPos(e);

    if (this.currentTool === 'node') {
      this.nodes.push({ x: pos.x, y: pos.y, fixed: false, vx: 0, vy: 0, fx: 0, fy: 0 });
      this.updateInfoBar();
      this.drawScene();
      return;
    }

    if (this.currentTool === 'delete') {
      const ni = this.findNearNode(pos.x, pos.y, this.snapRadius);
      if (ni !== null) {
        // Remove beams connected to node
        this.beams = this.beams.filter(b => b.a !== ni && b.b !== ni);
        // Remap indices
        this.beams = this.beams.map(b => ({
          ...b,
          a: b.a > ni ? b.a - 1 : b.a,
          b: b.b > ni ? b.b - 1 : b.b,
        }));
        this.nodes.splice(ni, 1);
        this.updateInfoBar();
        this.drawScene();
        return;
      }
      const bi = this.findNearBeam(pos.x, pos.y);
      if (bi !== null) {
        this.beams.splice(bi, 1);
        this.updateInfoBar();
        this.drawScene();
      }
      return;
    }

    if (this.currentTool === 'move') {
      const ni = this.findNearNode(pos.x, pos.y, this.snapRadius);
      if (ni !== null) {
        this.moveNode = ni;
        this.canvas.style.cursor = 'grabbing';
      }
      return;
    }

    if (this.currentTool === 'add') {
      const ni = this.findNearNode(pos.x, pos.y, this.snapRadius);
      if (ni !== null) {
        this.isDragging = true;
        this.dragStart = ni;
      } else {
        // Create new node and start drag from it
        const newIdx = this.nodes.length;
        this.nodes.push({ x: pos.x, y: pos.y, fixed: false, vx: 0, vy: 0, fx: 0, fy: 0 });
        this.isDragging = true;
        this.dragStart = newIdx;
      }
      this.dragNode = { x: pos.x, y: pos.y };
      this.updateInfoBar();
      this.drawScene();
    }
  },

  onMouseMove(e) {
    const pos = this.getPos(e);

    if (this.moveNode !== null && this.currentTool === 'move') {
      const n = this.nodes[this.moveNode];
      if (n && !n.fixed) {
        n.x = pos.x;
        n.y = pos.y;
        // Update rest lengths
        this.beams.forEach(b => {
          if (b.a === this.moveNode || b.b === this.moveNode) {
            b.restLen = this.dist(this.nodes[b.a], this.nodes[b.b]);
          }
        });
        this.updateInfoBar();
        this.drawScene();
      }
      return;
    }

    if (this.isDragging && this.currentTool === 'add') {
      this.dragNode = pos;
      this.drawScene();
      // Preview snap
      const snap = this.findNearNode(pos.x, pos.y, this.snapRadius);
      this.canvas.style.cursor = snap !== null ? 'pointer' : 'crosshair';
    }
  },

  onMouseUp(e) {
    const pos = this.getPos(e);

    if (this.moveNode !== null) {
      this.moveNode = null;
      this.canvas.style.cursor = 'crosshair';
      return;
    }

    if (this.isDragging && this.currentTool === 'add') {
      this.isDragging = false;
      const snap = this.findNearNode(pos.x, pos.y, this.snapRadius);
      let endNode;

      if (snap !== null && snap !== this.dragStart) {
        endNode = snap;
      } else if (snap === null) {
        // If new node was created at start, check if end is far enough
        const startNode = this.nodes[this.dragStart];
        const d = Math.hypot(pos.x - startNode.x, pos.y - startNode.y);
        if (d < 20) {
          // Too close — snap to itself, don't add beam; remove dangling node if brand new
          if (this.dragStart === this.nodes.length - 1 && this.beams.filter(b => b.a === this.dragStart || b.b === this.dragStart).length === 0) {
            this.nodes.pop();
          }
          this.drawScene();
          return;
        }
        // Create end node
        endNode = this.nodes.length;
        this.nodes.push({ x: pos.x, y: pos.y, fixed: false, vx: 0, vy: 0, fx: 0, fy: 0 });
      } else {
        // Dropped on start node
        if (this.dragStart === this.nodes.length - 1 && this.beams.filter(b => b.a === this.dragStart || b.b === this.dragStart).length === 0) {
          this.nodes.pop();
        }
        this.drawScene();
        return;
      }

      // Check duplicate beam
      const dup = this.beams.some(b =>
        (b.a === this.dragStart && b.b === endNode) ||
        (b.a === endNode && b.b === this.dragStart)
      );
      if (!dup && this.dragStart !== endNode) {
        this.beams.push({
          a: this.dragStart,
          b: endNode,
          material: this.currentMaterial,
          restLen: this.dist(this.nodes[this.dragStart], this.nodes[endNode]),
          force: 0,
          broken: false,
        });
      }
      this.dragNode = null;
      this.updateInfoBar();
      this.drawScene();
    }
  },

  // ========== PHYSICS SIMULATION ==========
  toggleTest() {
    if (this.isRunning) { this.stopTest(); }
    else { this.startTest(); }
  },

  startTest() {
    if (this.nodes.length < 2) {
      alert('Hãy xây cầu trước!');
      return;
    }
    const fixedCount = this.nodes.filter(n => n.fixed).length;
    if (fixedCount < 2) {
      alert('⚠️ Cần ít nhất 2 nút cố định (trụ cầu)!');
      return;
    }

    this.isRunning = true;
    this.simTime = 0;

    // Reset physics state
    this.nodes.forEach(n => { n.vx = 0; n.vy = 0; n.fx = 0; n.fy = 0; });
    this.beams.forEach(b => { b.force = 0; b.broken = false; });

    document.getElementById('btnTest').textContent = '⏹️ Dừng Kiểm Tra';
    document.getElementById('btnTest').className = 'action-btn run stop';
    document.getElementById('statusPill').textContent = '⚡ Đang chạy mô phỏng vật lý...';
    document.getElementById('resultsPanel').style.display = 'none';
    document.getElementById('hintOverlay').style.display = 'none';

    this.runPhysicsLoop();
  },

  stopTest() {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrame);
    document.getElementById('btnTest').textContent = '▶️ Chạy Kiểm Tra';
    document.getElementById('btnTest').className = 'action-btn run';
    document.getElementById('statusPill').textContent = '🏗️ Mô phỏng dừng — sửa và thử lại';
  },

  runPhysicsLoop() {
    const GRAVITY = 0.3;
    const DAMPING = 0.92;
    const STIFFNESS = 0.6;
    const DT = 1;
    const MAX_STEPS = 600; // 10 seconds at 60fps
    const LOAD_N = this.testLoad * 9810; // N (1 ton = 9810 N roughly)

    const step = () => {
      if (!this.isRunning) return;
      this.simTime++;

      // Apply gravity to non-fixed nodes
      this.nodes.forEach(n => {
        if (!n.fixed) {
          n.fy = GRAVITY * (1 + this.testLoad * 0.5);
          n.fx = 0;
        }
      });

      // Apply beam spring forces
      let brokenCount = 0;
      this.beams.forEach(b => {
        if (b.broken) { brokenCount++; return; }
        const na = this.nodes[b.a], nb = this.nodes[b.b];
        const dx = nb.x - na.x, dy = nb.y - na.y;
        const len = Math.hypot(dx, dy) || 0.001;
        const strain = (len - b.restLen) / b.restLen;
        const forceMag = STIFFNESS * strain;
        const mat = MATERIALS[b.material];
        b.force = forceMag;

        // Check breakage
        const maxStrain = mat.strength * 0.08;
        if (Math.abs(strain) > maxStrain) {
          b.broken = true;
          brokenCount++;
          return;
        }

        const fx = forceMag * dx / len;
        const fy = forceMag * dy / len;
        if (!na.fixed) { na.fx += fx; na.fy += fy; }
        if (!nb.fixed) { nb.fx -= fx; nb.fy -= fy; }
      });

      // Integrate
      this.nodes.forEach(n => {
        if (!n.fixed) {
          n.vx = (n.vx + n.fx) * DAMPING;
          n.vy = (n.vy + n.fy) * DAMPING;
          n.x += n.vx;
          n.y += n.vy;

          // Floor collision
          if (n.y > this.H - 20) { n.y = this.H - 20; n.vy *= -0.3; }
        }
      });

      this.drawScene();

      // Check if settled or collapsed
      const totalVelocity = this.nodes.reduce((s, n) => s + Math.abs(n.vx) + Math.abs(n.vy), 0);
      const collapsed = brokenCount >= Math.max(1, this.beams.length * 0.4);
      const settled = totalVelocity < 0.5 && this.simTime > 60;

      if (collapsed || settled || this.simTime >= MAX_STEPS) {
        this.isRunning = false;
        this.showResults(collapsed);
        document.getElementById('btnTest').textContent = '▶️ Chạy Kiểm Tra';
        document.getElementById('btnTest').className = 'action-btn run';
        document.getElementById('statusPill').textContent = collapsed
          ? '💥 Cầu đã sập — thử thiết kế lại!'
          : '✅ Cầu đứng vững — xuất sắc!';
        return;
      }

      this.animFrame = requestAnimationFrame(step);
    };

    this.animFrame = requestAnimationFrame(step);
  },

  showResults(collapsed) {
    const mat = MATERIALS[this.currentMaterial];
    const totalLen = this.beams.reduce((s, b) => s + b.restLen, 0) / 100;
    const mass = totalLen * mat.density;
    const cost = Math.round(totalLen * mat.cost);
    const maxLoad = collapsed ? Math.max(0, this.testLoad - 1) : this.testLoad;
    const efficiency = maxLoad / (cost / 1000 || 1);
    const score = Math.round(maxLoad * 1000 / (cost / 100 || 1) * (1 - this.beams.filter(b => b.broken).length / (this.beams.length || 1)));

    this.lastResult = { maxLoad, cost, mass, efficiency, score, bars: this.beams.length, passed: !collapsed };

    // Update info bar
    document.getElementById('maxForceBar').style.display = '';
    document.getElementById('maxForceVal').textContent = (maxLoad * 9.81).toFixed(1);
    document.getElementById('scoreBar').style.display = '';
    document.getElementById('scoreVal').textContent = score;

    const panel = document.getElementById('resultsPanel');
    const body = document.getElementById('resultsBody');
    document.getElementById('resultsIcon').textContent = collapsed ? '💥' : '✅';
    document.getElementById('resultsTitle').textContent = collapsed ? 'Cầu đã sập!' : 'Cầu đứng vững!';

    body.innerHTML = `
      <div class="result-row"><span class="result-label">Tải đặt</span><span class="result-value">${this.testLoad} tấn</span></div>
      <div class="result-row"><span class="result-label">Tải chịu được</span><span class="result-value" style="color:${collapsed?'#ef4444':'#10b981'}">${maxLoad} tấn</span></div>
      <div class="result-row"><span class="result-label">Thanh gãy</span><span class="result-value" style="color:#ef4444">${this.beams.filter(b=>b.broken).length} / ${this.beams.length}</span></div>
      <div class="result-row"><span class="result-label">Khối lượng</span><span class="result-value">${mass.toFixed(1)} kg</span></div>
      <div class="result-row"><span class="result-label">Chi phí</span><span class="result-value">${cost.toLocaleString()} VNĐ</span></div>
      <div class="result-row"><span class="result-label">Hiệu quả</span><span class="result-value">${efficiency.toFixed(3)}</span></div>
      <div class="result-score ${collapsed?'fail':'pass'}">
        🏆 Điểm: ${score}${collapsed?' — Thử lại nhé!':' — Rất tốt!'}
      </div>
      <button class="btn-primary" style="width:100%;margin-top:10px" onclick="saveScore()">💾 Lưu Điểm</button>
    `;
    panel.style.display = '';
  },

  getLastResult() { return this.lastResult; },

  // ========== DRAWING ==========
  drawScene() {
    const ctx = this.ctx;
    if (!ctx) return;
    const W = this.W, H = this.H;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Grid
    if (this.showGrid) this.drawGrid(ctx, W, H);

    // Ground
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, H - 16, W, 16);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, H - 18, W, 3);

    // Water effect (river below bridge)
    const gy = H - 16;
    const gradient = ctx.createLinearGradient(0, gy - 60, 0, gy);
    gradient.addColorStop(0, 'rgba(14,165,233,0)');
    gradient.addColorStop(1, 'rgba(14,165,233,0.15)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, gy - 60, W, 60);

    // Beams
    this.beams.forEach(b => this.drawBeam(ctx, b));

    // Drag preview
    if (this.isDragging && this.dragStart !== null && this.dragNode) {
      const na = this.nodes[this.dragStart];
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(this.dragNode.x, this.dragNode.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Nodes
    this.nodes.forEach((n, i) => this.drawNode(ctx, n, i));

    // Load indicators during test
    if (this.isRunning || this.lastResult) {
      this.drawLoadIndicators(ctx);
    }
  },

  drawGrid(ctx, W, H) {
    const size = 40;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += size) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += size) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  },

  drawBeam(ctx, b) {
    const na = this.nodes[b.a], nb = this.nodes[b.b];
    const mat = MATERIALS[b.material];
    let color;

    if (b.broken) {
      color = '#6b7280';
      ctx.setLineDash([4, 4]);
    } else if (this.showHeatmap && (this.isRunning || this.lastResult)) {
      const f = Math.abs(b.force);
      const maxF = 0.2;
      const t = Math.min(f / maxF, 1);
      if (b.force > 0.005) {
        // Tension — red
        const r = Math.round(239 + (239-239)*t), g = Math.round(68 * (1-t)), bl = Math.round(68 * (1-t));
        color = `rgb(${239},${Math.round(68*(1-t))},${Math.round(68*(1-t))})`;
        color = this.lerpColor('#22c55e', '#ef4444', Math.min(t * 2, 1));
      } else if (b.force < -0.005) {
        // Compression — blue
        color = this.lerpColor('#22c55e', '#3b82f6', Math.min(-t * 2, 1));
      } else {
        color = '#22c55e';
      }
    } else {
      color = mat.color;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = mat.strokeW;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(na.x, na.y);
    ctx.lineTo(nb.x, nb.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Force label
    if (this.showLabels && this.lastResult && !b.broken && Math.abs(b.force) > 0.005) {
      const mx = (na.x + nb.x) / 2, my = (na.y + nb.y) / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(mx - 18, my - 10, 36, 14);
      ctx.fillStyle = 'white';
      ctx.font = '9px Be Vietnam Pro, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((b.force > 0 ? '+' : '') + (b.force * 1000).toFixed(0) + 'N', mx, my + 1);
      ctx.textAlign = 'left';
    }

    // Broken X mark
    if (b.broken) {
      const mx = (na.x + nb.x) / 2, my = (na.y + nb.y) / 2;
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✕', mx, my + 5);
      ctx.textAlign = 'left';
    }
  },

  lerpColor(c1, c2, t) {
    const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
    const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
    const r = Math.round(r1 + (r2-r1)*t), g = Math.round(g1 + (g2-g1)*t), b = Math.round(b1 + (b2-b1)*t);
    return `rgb(${r},${g},${b})`;
  },

  drawNode(ctx, n, i) {
    const r = n.fixed ? 10 : 7;
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);

    if (n.fixed) {
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Triangle base for fixed
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(n.x - 10, n.y + 10);
      ctx.lineTo(n.x + 10, n.y + 10);
      ctx.lineTo(n.x, n.y);
      ctx.fill();
    } else {
      ctx.fillStyle = this.isDragging && this.dragStart === i ? '#10b981' : '#94a3b8';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  },

  drawLoadIndicators(ctx) {
    // Find non-fixed middle nodes and show load arrows
    const midNodes = this.nodes.filter((n, i) => !n.fixed);
    if (midNodes.length === 0) return;
    // Show on top chord nodes
    const topNodes = midNodes.filter(n => n.y < this.H * 0.6);
    const drawNodes = topNodes.length > 0 ? topNodes.slice(0, 3) : midNodes.slice(0, 2);

    drawNodes.forEach(n => {
      const len = 24 + this.testLoad * 4;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(n.x, n.y - len);
      ctx.lineTo(n.x, n.y - 5);
      ctx.stroke();
      // Arrow head
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(n.x, n.y - 5);
      ctx.lineTo(n.x - 6, n.y - 16);
      ctx.lineTo(n.x + 6, n.y - 16);
      ctx.fill();
      // Label
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px Be Vietnam Pro, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.testLoad + 't', n.x, n.y - len - 4);
      ctx.textAlign = 'left';
    });
  },

  // ========== HELPERS ==========
  dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); },

  updateInfoBar() {
    const mat = MATERIALS[this.currentMaterial];
    document.getElementById('barCount').textContent = this.beams.length;
    document.getElementById('nodeCount').textContent = this.nodes.length;
    const totalLen = this.beams.reduce((s, b) => s + b.restLen, 0) / 100;
    document.getElementById('totalMass').textContent = (totalLen * mat.density).toFixed(1);
    document.getElementById('totalCost').textContent = Math.round(totalLen * mat.cost).toLocaleString();
  },
};

// Expose to global
window.BridgeSim = BridgeSim;
window.BRIDGE_TEMPLATES = BRIDGE_TEMPLATES;

// Tool/material selectors
function selectMaterial(mat) {
  document.querySelectorAll('.mat-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-mat="${mat}"]`)?.classList.add('active');
  BridgeSim.selectMaterial(mat);
  BridgeSim.currentMaterial = mat;
}

function setTool(tool) {
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tool' + tool.charAt(0).toUpperCase() + tool.slice(1))?.classList.add('active');
  BridgeSim.setTool(tool);

  const cursors = { add: 'crosshair', node: 'cell', delete: 'not-allowed', move: 'grab' };
  if (BridgeSim.canvas) BridgeSim.canvas.style.cursor = cursors[tool] || 'crosshair';
}

function toggleTest() { BridgeSim.toggleTest(); }
function resetBridge() { BridgeSim.resetBridge(); }
