// ============================================================
// STEMwithLong — Bridge Simulator
// leaderboard.js — Leaderboard & scoring system
// ============================================================

'use strict';

const Leaderboard = {
  KEY: 'stemwithlong_leaderboard',
  sortBy: 'score',

  load() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch { return []; }
  },

  save(entries) {
    localStorage.setItem(this.KEY, JSON.stringify(entries));
  },

  add(entry) {
    const entries = this.load();
    entry.id = Date.now();
    entries.push(entry);
    // Keep top 100
    entries.sort((a, b) => b.score - a.score);
    this.save(entries.slice(0, 100));
  },

  getAll(sortKey = 'score') {
    const entries = this.load();
    return entries.sort((a, b) => {
      if (sortKey === 'score')      return b.score - a.score;
      if (sortKey === 'efficiency') return b.efficiency - a.efficiency;
      if (sortKey === 'load')       return b.maxLoad - a.maxLoad;
      return b.score - a.score;
    });
  },

  clear() {
    localStorage.removeItem(this.KEY);
  },
};

window.Leaderboard = Leaderboard;

// ========== RENDER ==========
function renderLeaderboard() {
  const entries = Leaderboard.getAll(Leaderboard.sortBy);
  const tbody = document.getElementById('lbBody');
  const empty = document.getElementById('lbEmpty');
  if (!tbody) return;

  if (entries.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const medals = ['🥇', '🥈', '🥉'];
  tbody.innerHTML = entries.map((e, i) => {
    const rank = i < 3 ? medals[i] : (i + 1);
    const effClass = e.efficiency > 2 ? 'color:#10b981;font-weight:700' : '';
    const rowClass = i < 3 ? `top-${i + 1}` : '';
    return `
      <tr class="${rowClass}">
        <td><span class="lb-rank">${rank}</span></td>
        <td><strong>${escHtml(e.name)}</strong><br><small style="color:var(--text-muted)">${escHtml(e.cls)}</small></td>
        <td>${escHtml(e.bridgeType)}</td>
        <td>${escHtml(e.material)}</td>
        <td style="font-weight:700;color:var(--primary)">${e.maxLoad}</td>
        <td>${Number(e.cost).toLocaleString('vi-VN')} VNĐ</td>
        <td style="${effClass}">${Number(e.efficiency).toFixed(3)}</td>
        <td style="font-weight:800;font-size:1.05rem;color:var(--primary)">${e.score}</td>
        <td style="font-size:0.72rem;color:var(--text-muted)">${e.timestamp || '—'}</td>
      </tr>`;
  }).join('');
}

function sortLeaderboard(key) {
  Leaderboard.sortBy = key;
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.lb-tab[data-sort="${key}"]`)?.classList.add('active');
  renderLeaderboard();
}

function clearLeaderboard() {
  if (!confirm('Xóa toàn bộ bảng xếp hạng?')) return;
  Leaderboard.clear();
  renderLeaderboard();
}

function escHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
