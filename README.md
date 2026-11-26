# 🏗️ STEMwithLong — Mô phỏng Cầu STEM K–12

> **Website:** `https://stemwithlong.github.io`
> Nền tảng mô phỏng xây cầu STEM tương tác cho học sinh lớp 6–12

---

## ✨ Tính năng

- 🏗️ **Xây cầu tự do** — kéo thả để nối thanh, đặt nút, chọn vật liệu
- 🌡️ **Heatmap lực** — đỏ = kéo căng, xanh = nén ép, xanh lá = ổn định
- 📐 **6 mẫu cầu** — Dầm, Warren, Howe, Pratt, Vòm, Dây văng
- ⚖️ **Mô phỏng vật lý** — đặt tải 1–10 tấn, xem cầu chịu lực theo thời gian thực
- 🏆 **Bảng xếp hạng** — lưu điểm học sinh, so sánh hiệu quả
- 👩‍🏫 **Góc giáo viên** — tạo bài thực hành, xem kết quả lớp, xuất PDF
- 📊 **Xuất báo cáo PDF** — kết quả cá nhân và cả lớp
- ⌨️ **Phím tắt** — `1/2/3/4` chuyển tab, `Space` chạy test, `A/N/D/M` chọn tool

## 🪵 Vật liệu

| Vật liệu | Đặc tính | Chi phí |
|---|---|---|
| Que kem | Nhẹ, yếu | 100 VNĐ |
| Gỗ | Trung bình | 300 VNĐ |
| Thép | Nặng, rất chắc | 1.500 VNĐ |
| Carbon | Siêu nhẹ, chắc | 4.000 VNĐ |
| Cáp | Chỉ chịu kéo | 800 VNĐ |

## 🚀 Deploy lên GitHub Pages

### Bước 1 — Tạo tài khoản GitHub
Truy cập [github.com](https://github.com) → Sign up

### Bước 2 — Tạo repository
- Nhấn **New repository**
- Tên repo: `stemwithlong` *(bắt buộc đúng tên này)*
- Chọn **Public**
- Nhấn **Create repository**

### Bước 3 — Upload file
- Nhấn **uploading an existing file**
- Kéo thả toàn bộ thư mục `stemwithlong/` vào
- Nhấn **Commit changes**

### Bước 4 — Bật GitHub Pages
- Vào **Settings** → **Pages**
- Source: **Deploy from a branch**
- Branch: **main** → Folder: **/ (root)**
- Nhấn **Save**

### Bước 5 — Truy cập
Sau 2–3 phút → mở: `https://[tên-github-của-bạn].github.io/stemwithlong`

> **Ví dụ:** nếu GitHub username là `longv` → địa chỉ là `https://longv.github.io/stemwithlong`

---

## 🛠️ Tech Stack

```
HTML5 + CSS3 + Vanilla JavaScript
Không cần Node.js, npm, build tool
Mở file index.html là chạy ngay trên máy
```

## 📁 Cấu trúc file

```
stemwithlong/
├── index.html          — Bộ khung HTML toàn bộ
├── css/
│   └── style.css       — Giao diện, responsive
└── js/
    ├── app.js          — Điều hướng, thư viện mẫu, PDF export
    ├── bridge.js       — Engine mô phỏng vật lý + canvas
    ├── leaderboard.js  — Bảng xếp hạng (localStorage)
    ├── teacher.js      — Góc giáo viên & giáo án
    └── hero.js         — Hero animation & phím tắt
```

## 👩‍🏫 PIN Giáo viên mặc định

```
2026
```

---

© 2026 STEMwithLong · Mô phỏng Cầu STEM K–12
