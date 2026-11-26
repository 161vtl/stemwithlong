// ============================================================
// STEMwithLong — Bridge Simulator
// teacher.js — Teacher dashboard logic
// ============================================================

'use strict';

const TEACHER_PIN = '2026';
const ASSIGN_KEY  = 'stemwithlong_assignments';
let teacherUnlocked = false;

// ========== PIN UNLOCK ==========
function unlockTeacher() {
  const val = document.getElementById('pinInput').value.trim();
  const err = document.getElementById('pinError');
  if (val === TEACHER_PIN) {
    teacherUnlocked = true;
    document.getElementById('teacherLock').style.display = 'none';
    document.getElementById('teacherDash').style.display = 'grid';
    updateTeacherStats();
  } else {
    err.textContent = '❌ PIN không đúng. Thử lại!';
    document.getElementById('pinInput').value = '';
    setTimeout(() => { err.textContent = ''; }, 2500);
  }
}

// Allow Enter key on PIN input
document.addEventListener('DOMContentLoaded', () => {
  const pin = document.getElementById('pinInput');
  if (pin) pin.addEventListener('keydown', e => { if (e.key === 'Enter') unlockTeacher(); });

  // Set default due date to 7 days from now
  const due = document.getElementById('assignDue');
  if (due) {
    const d = new Date(); d.setDate(d.getDate() + 7);
    due.value = d.toISOString().split('T')[0];
  }
});

// ========== TEACHER STATS ==========
function updateTeacherStats() {
  const entries = Leaderboard.load();
  const total = entries.length;
  const passed = entries.filter(e => e.maxLoad >= 3).length;
  const avgScore = total ? Math.round(entries.reduce((s, e) => s + e.score, 0) / total) : 0;
  const avgLoad  = total ? (entries.reduce((s, e) => s + e.maxLoad, 0) / total).toFixed(1) : 0;

  const s = id => document.getElementById(id);
  if (s('statTotal'))    s('statTotal').textContent    = total;
  if (s('statPass'))     s('statPass').textContent     = passed;
  if (s('statAvgScore')) s('statAvgScore').textContent = avgScore;
  if (s('statAvgLoad'))  s('statAvgLoad').textContent  = avgLoad;

  // Student list
  renderStudentList(entries);
}

function renderStudentList(entries) {
  const list = document.getElementById('studentList');
  if (!list) return;
  if (!entries.length) {
    list.innerHTML = '<div class="empty-msg">Chưa có học sinh nào nộp bài</div>';
    return;
  }

  list.innerHTML = `
    <table class="lb-table" style="font-size:0.8rem">
      <thead>
        <tr>
          <th>#</th><th>Tên</th><th>Lớp</th><th>Loại Cầu</th>
          <th>Vật Liệu</th><th>Tải (tấn)</th><th>Điểm</th><th>Thời gian</th>
        </tr>
      </thead>
      <tbody>
        ${entries.map((e, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${escHtml(e.name)}</strong></td>
            <td>${escHtml(e.cls)}</td>
            <td>${escHtml(e.bridgeType)}</td>
            <td>${escHtml(e.material)}</td>
            <td style="color:var(--primary);font-weight:700">${e.maxLoad}</td>
            <td style="color:var(--primary);font-weight:800">${e.score}</td>
            <td style="font-size:0.68rem;color:var(--text-muted)">${e.timestamp || '—'}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ========== ASSIGNMENTS ==========
function createAssignment() {
  const title    = document.getElementById('assignTitle').value.trim();
  const type     = document.getElementById('assignType').value;
  const minLoad  = document.getElementById('assignLoad').value;
  const due      = document.getElementById('assignDue').value;
  const note     = document.getElementById('assignNote').value.trim();

  if (!title) { alert('Vui lòng nhập tên bài thực hành!'); return; }

  const id = btoa(encodeURIComponent(JSON.stringify({ title, type, minLoad, due, note, created: Date.now() }))).slice(0, 24);
  const link = `${location.origin}${location.pathname}?assign=${id}&type=${type}&load=${minLoad}`;

  // Save assignment
  const assignments = JSON.parse(localStorage.getItem(ASSIGN_KEY) || '[]');
  assignments.push({ id, title, type, minLoad, due, note, link, created: new Date().toLocaleString('vi-VN') });
  localStorage.setItem(ASSIGN_KEY, JSON.stringify(assignments));

  document.getElementById('assignLinkText').textContent = link;
  document.getElementById('assignLink').style.display = '';
}

function copyAssignLink() {
  const text = document.getElementById('assignLinkText').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    btn.textContent = '✅ Đã sao chép!';
    setTimeout(() => { btn.textContent = '📋 Sao chép'; }, 2000);
  }).catch(() => {
    prompt('Sao chép link này:', text);
  });
}

// ========== CLASS REPORT PDF ==========
function exportClassReport() {
  const entries = Leaderboard.load();
  if (!entries.length) { alert('Chưa có dữ liệu học sinh để xuất!'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('STEMwithLong - Bao Cao Ket Qua Lop Hoc', 20, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Ngay xuat: ${new Date().toLocaleString('vi-VN')}`, 20, 30);
  doc.text(`Tong so bai nop: ${entries.length}`, 20, 38);

  const passed = entries.filter(e => e.maxLoad >= 3).length;
  const avgScore = Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length);
  doc.text(`Dat yeu cau: ${passed}/${entries.length}`, 20, 46);
  doc.text(`Diem trung binh: ${avgScore}`, 20, 54);

  // Table header
  let y = 70;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('#',   15, y); doc.text('Ten',         25, y);
  doc.text('Lop', 70, y); doc.text('Loai Cau',    85, y);
  doc.text('Tai', 125, y); doc.text('Diem',       145, y);
  doc.text('Hieu qua', 160, y);
  doc.line(15, y + 2, 195, y + 2);

  doc.setFont('helvetica', 'normal');
  entries.slice(0, 30).forEach((e, i) => {
    y += 9;
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(String(i + 1),                 15, y);
    doc.text(String(e.name ?? '').slice(0, 18),    25, y);
    doc.text(String(e.cls ?? ''),           70, y);
    doc.text(String(e.bridgeType ?? '').slice(0,16), 85, y);
    doc.text(String(e.maxLoad) + 't',      125, y);
    doc.text(String(e.score),              145, y);
    doc.text(Number(e.efficiency).toFixed(2), 160, y);
  });

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('© 2026 STEMwithLong — Mo phong Cau STEM K-12', 20, 285);
  doc.save(`STEMwithLong_BaoCaoLop_${Date.now()}.pdf`);
}

// ========== LESSON MODALS ==========
const LESSON_PLANS = {
  1: {
    title: '🎓 Giáo án: Giới thiệu Kết cấu Cầu Dầm (Lớp 6–7)',
    content: `
      <div class="lesson-modal-content">
        <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
          <span style="background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:50px;font-size:0.75rem;font-weight:700">🎓 Lớp 6–7</span>
          <span style="background:#dbeafe;color:#1e40af;padding:4px 12px;border-radius:50px;font-size:0.75rem;font-weight:700">⏱️ 45 phút</span>
          <span style="background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:50px;font-size:0.75rem;font-weight:700">🪵 Que kem / Gỗ</span>
        </div>
        <h4>🎯 Mục tiêu bài học</h4>
        <ul>
          <li>Nhận biết các bộ phận cơ bản của cầu dầm</li>
          <li>Hiểu khái niệm lực kéo và lực nén trong kết cấu</li>
          <li>Thực hành xây cầu dầm đơn giản bằng vật liệu ảo</li>
        </ul>
        <h4>📋 Các bước thực hiện</h4>
        <div class="lesson-step"><div class="step-num">1</div><div><strong>Khởi động (5 phút)</strong><br>Cho học sinh xem ảnh một số cây cầu thực tế. Hỏi: "Cây cầu đứng được nhờ điều gì?"</div></div>
        <div class="lesson-step"><div class="step-num">2</div><div><strong>Giới thiệu lý thuyết (10 phút)</strong><br>Giải thích lực kéo (tension) và lực nén (compression). Dùng heatmap màu trên web để minh họa trực quan.</div></div>
        <div class="lesson-step"><div class="step-num">3</div><div><strong>Thực hành trên web (20 phút)</strong><br>Vào trang <em>Mẫu Cầu → Cầu Dầm</em> → nhấn Thực Hành → Chạy Kiểm Tra với tải 2–3 tấn. Quan sát màu heatmap.</div></div>
        <div class="lesson-step"><div class="step-num">4</div><div><strong>Thảo luận (5 phút)</strong><br>Hỏi: "Vì sao cầu dầm chỉ dùng được cho nhịp ngắn? Làm sao để cầu chắc hơn?"</div></div>
        <div class="lesson-step"><div class="step-num">5</div><div><strong>Đánh giá (5 phút)</strong><br>Học sinh tự xây cầu dầm, lưu điểm vào bảng xếp hạng. Giáo viên nhận xét.</div></div>
        <h4>📊 Tiêu chí đánh giá</h4>
        <ul>
          <li>Cầu chịu được ít nhất 2 tấn — Đạt yêu cầu</li>
          <li>Giải thích được màu heatmap — Tốt</li>
          <li>Điểm trên 500 — Xuất sắc</li>
        </ul>
      </div>`
  },
  2: {
    title: '🎓 Giáo án: Cầu Dàn Tam Giác và Phân Phối Lực (Lớp 8)',
    content: `
      <div class="lesson-modal-content">
        <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
          <span style="background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:50px;font-size:0.75rem;font-weight:700">🎓 Lớp 8</span>
          <span style="background:#dbeafe;color:#1e40af;padding:4px 12px;border-radius:50px;font-size:0.75rem;font-weight:700">⏱️ 45 phút</span>
          <span style="background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:50px;font-size:0.75rem;font-weight:700">🪵 Gỗ / Thép</span>
        </div>
        <h4>🎯 Mục tiêu bài học</h4>
        <ul>
          <li>Hiểu tại sao tam giác là hình học cứng nhất</li>
          <li>So sánh hiệu quả cầu dầm vs cầu dàn tam giác</li>
          <li>Phân tích lực trên từng thanh qua heatmap</li>
        </ul>
        <h4>📋 Các bước thực hiện</h4>
        <div class="lesson-step"><div class="step-num">1</div><div><strong>Thí nghiệm trực quan (8 phút)</strong><br>Cho 2 nhóm: nhóm A xây cầu dầm, nhóm B xây cầu dàn Warren. Cùng tải 5 tấn — so sánh kết quả.</div></div>
        <div class="lesson-step"><div class="step-num">2</div><div><strong>Giải thích nguyên lý (10 phút)</strong><br>Tam giác không thể biến dạng → phân phối lực ra toàn bộ kết cấu. Dùng màu heatmap để chỉ từng thanh.</div></div>
        <div class="lesson-step"><div class="step-num">3</div><div><strong>Thực hành tự do (20 phút)</strong><br>Học sinh tự thiết kế cầu dàn với vật liệu gỗ, cố gắng chịu tải 5 tấn với ít thanh nhất có thể.</div></div>
        <div class="lesson-step"><div class="step-num">4</div><div><strong>Báo cáo & lưu điểm (7 phút)</strong><br>Mỗi học sinh xuất báo cáo PDF, nộp cho giáo viên. Lưu điểm vào bảng xếp hạng.</div></div>
        <h4>📊 Tiêu chí đánh giá</h4>
        <ul>
          <li>Cầu chịu được ít nhất 5 tấn — Đạt yêu cầu</li>
          <li>Dùng ít hơn 20 thanh — Tốt</li>
          <li>Điểm hiệu quả trên 1.5 — Xuất sắc</li>
        </ul>
      </div>`
  },
  3: {
    title: '🎓 Giáo án: Tối Ưu Hóa Kết Cấu Cầu (Lớp 10–12)',
    content: `
      <div class="lesson-modal-content">
        <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
          <span style="background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:50px;font-size:0.75rem;font-weight:700">🎓 Lớp 10–12</span>
          <span style="background:#dbeafe;color:#1e40af;padding:4px 12px;border-radius:50px;font-size:0.75rem;font-weight:700">⏱️ 60 phút</span>
          <span style="background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:50px;font-size:0.75rem;font-weight:700">🔬 Mọi vật liệu</span>
        </div>
        <h4>🎯 Mục tiêu bài học</h4>
        <ul>
          <li>Áp dụng bài toán tối ưu hóa kỹ thuật: chịu lực tối đa, chi phí tối thiểu</li>
          <li>So sánh ưu/nhược điểm các loại cầu (Pratt, Howe, Warren, Vòm, Dây văng)</li>
          <li>Rèn kỹ năng lập luận kỹ thuật và trình bày kết quả</li>
        </ul>
        <h4>📋 Các bước thực hiện</h4>
        <div class="lesson-step"><div class="step-num">1</div><div><strong>Đặt vấn đề (10 phút)</strong><br>Yêu cầu: Thiết kế cầu chịu tải 8 tấn, nhịp 600px, ngân sách tối đa 500.000 VNĐ. Học sinh lên kế hoạch trước khi làm.</div></div>
        <div class="lesson-step"><div class="step-num">2</div><div><strong>Nghiên cứu mẫu (10 phút)</strong><br>Vào trang Mẫu Cầu, đọc nguyên lý từng loại. Chọn loại cầu phù hợp nhất cho yêu cầu đề bài.</div></div>
        <div class="lesson-step"><div class="step-num">3</div><div><strong>Thiết kế & Thử nghiệm (30 phút)</strong><br>Xây cầu, chạy kiểm tra, phân tích heatmap. Điều chỉnh thiết kế ít nhất 3 lần để tối ưu điểm hiệu quả.</div></div>
        <div class="lesson-step"><div class="step-num">4</div><div><strong>Thuyết trình (10 phút)</strong><br>Mỗi nhóm trình bày: đã chọn loại cầu gì, vật liệu gì, tại sao, kết quả như thế nào.</div></div>
        <h4>📊 Tiêu chí đánh giá</h4>
        <ul>
          <li>Cầu chịu được ít nhất 8 tấn — Đạt yêu cầu</li>
          <li>Chi phí dưới 500.000 VNĐ — Trong ngân sách</li>
          <li>Điểm hiệu quả trên 3.0 — Tốt</li>
          <li>Thuyết trình logic, giải thích được nguyên lý — Xuất sắc</li>
        </ul>
      </div>`
  },
};

function openLesson(id) {
  const plan = LESSON_PLANS[id];
  if (!plan) return;
  document.getElementById('lessonTitle').textContent = plan.title;
  document.getElementById('lessonBody').innerHTML = plan.content;
  document.getElementById('lessonModal').style.display = 'flex';
}
