# Product Requirement Document (PRD) Lengkap: NyawitAI

## Informasi Proyek
- **Nama Produk:** NyawitAI
- **Tim Pengembang (Kelompok Nyawit):** Muhammad Azka Raki, Hafiz Nazwa Nugraha, Muhammad Rezky Aulia Saputra, Nicholas Widyadhana Sindunata, Aimansyah Muhammad Adila
- **Platform:** Aplikasi Berbasis Web

---

## A. Ringkasan Eksekutif & Definisi Produk
NyawitAI adalah sebuah web application pemetaan yang berfungsi sebagai alat screening (penyaringan) awal untuk mengetahui potensi kelayakan suatu lahan sebelum ditanami kelapa sawit. Aplikasi ini dirancang untuk menyediakan informasi awal sebelum calon pembeli turun ke lapangan. Sistem ini membantu perusahaan agribisnis dan investor melihat skor kesesuaian lahan secara geografis melalui peta interaktif, sehingga mencegah pemborosan waktu dan biaya perjalanan untuk lahan yang sejak awal tidak cocok untuk kelapa sawit.

---

## B. Latar Belakang & Analisis Bisnis

### 1. Masalah (Problem Statement)
- Evaluasi awal lahan memakan waktu terlalu lama (1–3 bulan) akibat informasi awal yang minim, tingginya risiko legalitas/sengketa tanah, dan harga yang sering di-markup oleh makelar.
- Solusi saat ini mengharuskan survei mandiri ke lokasi, yang sangat mengorbankan waktu, tenaga, dan biaya transportasi hanya untuk sekadar mengecek kondisi awal lahan.
- Pencarian informasi awal lewat media sosial sering kali tidak akurat dan tidak terverifikasi.

### 2. Solusi & Proposisi Nilai (Solution & UVP)
- **Solusi:** Menyediakan peta interaktif berbasis web yang secara otomatis mendeteksi dan memberikan Skor Potensi Lahan khusus untuk kelapa sawit.
- **Unique Value Proposition:** Pengguna dapat melakukan screening awal lahan sawit hanya dalam hitungan menit untuk mengetahui kelayakan lahan sebelum menghabiskan uang untuk berangkat survei fisik.
- **Unfair Advantage:** Model pemrosesan data peta/satelit milik NyawitAI dikalibrasi secara spesifik hanya untuk parameter tumbuh kembang kelapa sawit (seperti elevasi dan kelerengan), bukan sekadar peta geografis umum.

### 3. Target Pasar (Customer Segments)
- **Prioritas:** Perusahaan Perkebunan Kelapa Sawit (B2B) dan BUMD/Pemerintah daerah yang mengurus tata ruang serta ekspansi agribisnis.
- **Sekunder:** Investor lahan mandiri.

### 4. Analisis Kompetitor
- **Kompetitor Utama:** Farmonaut, platform pemantauan lingkungan dan pertanian menggunakan teknologi satelit berbasis AI.
- **Kelebihan Kompetitor:** Menawarkan akurasi pemantauan satelit hingga 90%, harga terjangkau, dan mudah diadopsi.
- **Kelemahan Kompetitor:** Sangat bergantung pada internet stabil, ada tantangan pelatihan untuk petani kecil, memunculkan kekhawatiran privasi data, bahasa terbatas (hanya Inggris), dan akurasi bervariasi tergantung jenis tanaman. NyawitAI dapat mengambil celah ini dengan fokus spesifik pada sawit dan keamanan data korporasi.

### 5. Model Pendapatan (Revenue Stream)
- Skema utama adalah pembelian paket token berskala korporasi.
- Perusahaan dapat melakukan pengisian ulang (top-up) saldo token secara mandiri untuk memfasilitasi kebutuhan analisis potensi lahan volume besar dengan harga yang lebih efisien.

---

## C. Spesifikasi Minimum Viable Product (MVP)
MVP akan berfokus pada penyediaan fitur inti untuk memvalidasi ide dasar produk.

### Metrik Kesuksesan (Traction)
Terdapat minimal 20 pengunjung unik yang mengakses dan berinteraksi dengan fitur peta di Web App dalam 7 hari pertama peluncuran.

### Fitur Utama (Core Features) MVP

#### 1. Analisis Kesesuaian Lahan Berbasis AI
- Pengguna dapat memasukkan parameter spesifik (target provinsi dan luas hektar lahan).
- Sistem memproses data dan menampilkannya melalui Peta 3D Interaktif.
- Output berupa heatmap (indikator warna) dan persentase tingkat kecocokan lahan untuk kelapa sawit, dilengkapi dengan katalog informasi geografis dasar.

#### 2. Dasbor Pengguna
- Fasilitas untuk mengakses dan meninjau ulang riwayat analisis lahan sebelumnya tanpa perlu memproses ulang data.
- Mencakup manajemen profil, pengaturan preferensi, serta konfigurasi keamanan akun.

#### 3. Token & Billing
- Sistem monetisasi transparan berbasis token.
- Pengguna dapat melakukan top-up saldo, melacak riwayat pemakaian token setiap kali sistem melakukan analisis AI, dan mengelola metode pembayaran.
- Mencakup fitur pengunduhan riwayat transaksi (invoice) untuk keperluan administrasi pengguna.

---

## D. Alur Pengguna (User Flow)
Alur interaksi pengguna dengan sistem dirancang sebagai berikut:

1. Pengguna memulai akses (Start) lalu diarahkan ke halaman Login/Register.
2. Pengguna memasukkan input berupa Luas Hektar dan Provinsi.
3. Sistem mengecek apakah pengguna sudah melakukan Login. Jika belum (NO), pengguna akan diarahkan kembali ke halaman Login/Register.
4. Jika sudah login, sistem memproses pengecekan profil pengguna dan memberikan alokasi 3 token gratis.
5. Sistem mengecek apakah saldo token > 0.
   - Jika saldo kosong (NO), pengguna diarahkan ke menu Top-Up Token & Billing.
   - Jika saldo tersedia (Yes), sistem akan memotong 1 token.
6. Sistem melakukan Klasifikasi AI dan melakukan render Peta 3D.
7. Sistem mengeluarkan Output berupa Peta 3D, Heatmap, dan Katalog Info Lahan.
8. Sistem menanyakan apakah pengguna ingin memindai (scan) wilayah lain. Jika ya, alur kembali ke tahap input; jika tidak, proses selesai.

---

## E. Kebutuhan Teknis & Arsitektur (Updated)
Untuk mendukung performa tinggi pada rendering peta spasial dan kelancaran eksekusi model Machine Learning, berikut adalah tech stack definitif yang digunakan:

### 1. Frontend (Client-Side)
- **Framework:** Nuxt 3 (Vue.js). Dipilih karena kapabilitas SSR/SSG untuk performa awal yang cepat dan ekosistem composables yang sangat mendukung Vibe Coding.
- **Styling & UI:** Tailwind CSS dan component library (seperti Nuxt UI atau Shadcn-vue) untuk mempercepat pembuatan antarmuka dasbor.
- **Geospatial & 3D Rendering:** Mapbox GL JS (atau alternatif open-source MapLibre GL JS) dipadukan dengan deck.gl untuk melakukan rendering heatmap 3D dengan lancar di browser.
- **State Management:** Pinia (bawaan ekosistem Vue/Nuxt) untuk mengelola state autentikasi dan saldo token.

### 2. Backend (Server-Side & AI Processing)
- **Framework:** Python 3.11+ menggunakan FastAPI. FastAPI sangat ideal untuk Vibe Coding karena otomatis menghasilkan dokumentasi Swagger/OpenAPI dan menggunakan Pydantic untuk validasi data yang ketat.
- **Geospatial Data Processing:** GeoPandas, Rasterio, dan Shapely untuk mengolah koordinat, luasan poligon (hektar), dan data elevasi/kelerengan.
- **Machine Learning / AI:** scikit-learn (untuk model klasifikasi seperti Random Forest atau Naive Bayes) atau TensorFlow/PyTorch jika menggunakan Deep Learning.
- **Task Queue:** Celery + Redis. Karena pemrosesan AI dan spasial bisa memakan waktu, proses ini harus berjalan di background (asynchronous) agar API tidak timeout.

### 3. Database & Infrastruktur
- **Database & Auth:** Supabase (PostgreSQL). Wajib mengaktifkan ekstensi PostGIS di dalam PostgreSQL untuk melakukan kueri spasial. Supabase juga menangani Autentikasi (JWT) bawaan yang mempermudah integrasi dengan Nuxt.
- **Deployment & Hosting:**
  - **Frontend:** Vercel (sangat optimal untuk lingkungan Nuxt).
  - **Backend & AI:** Google Cloud Platform (GCP). Menggunakan Cloud Run (arsitektur containerized Docker) untuk API FastAPI, sehingga resource dapat di-scale up secara otomatis saat ada proses AI yang berat.

---

## F. Detail Teknis Modul untuk "Vibe Coding"
Bagian ini adalah spesifikasi modular yang bisa langsung dijadikan System Prompt atau Context kepada AI coding assistant (seperti Cursor/Copilot) untuk men-generate kode secara akurat.

### Modul 1: Autentikasi & Dasbor Pengguna
**Konteks AI / Prompting:**  
"Buat modul autentikasi dan profil pengguna menggunakan Nuxt 3 dan Supabase Auth."

#### Frontend (Nuxt 3)
- Pages: `/login`, `/register`, `/dashboard/profile`
- Composables: `useAuth.ts` (mengelola sesi login, logout, dan pengecekan state pengguna menggunakan `@nuxtjs/supabase`)
- Middleware: `auth.ts` (melindungi route `/dashboard` agar hanya bisa diakses user yang sudah login)

#### Backend (FastAPI)
- Terbantu oleh Supabase Auth. Backend hanya perlu memverifikasi JWT Token dari header `Authorization: Bearer <token>` menggunakan dependensi `fastapi.security`.

#### Database Schema (Supabase)
- `users` (`id`, `email`, `full_name`, `company_name`, `created_at`)

---

### Modul 2: Token Management & Billing
**Konteks AI / Prompting:**  
"Buat sistem manajemen saldo token dan riwayat transaksi. Integrasikan simulasi pemotongan token sebelum eksekusi AI."

#### Frontend (Nuxt 3)
- Pages: `/dashboard/billing`, `/dashboard/topup`
- State: Pinia store `useTokenStore.ts` untuk memantau saldo saat ini secara real-time

#### Backend (FastAPI)
- Endpoints:
  - `GET /api/v1/billing/balance` (Cek saldo)
  - `POST /api/v1/billing/deduct` (Potong 1 token, bungkus dalam database transaction agar aman dari race condition)
  - `GET /api/v1/billing/history` (Ambil invoice)

#### Database Schema
- `wallets` (`id`, `user_id`, `balance`). Alokasi awal: `balance = 3` saat user register.
- `transactions` (`id`, `user_id`, `amount`, `type` [topup/deduct], `description`, `created_at`)

---

### Modul 3: Input Geospasial & Pemrosesan AI (Core Engine)
**Konteks AI / Prompting:**  
"Buat API asynchronous di FastAPI untuk menerima input poligon wilayah, memproses data spasial dengan GeoPandas, dan mengembalikan hasil klasifikasi AI."

#### Frontend (Nuxt 3)
- Komponen: `<MapInput />` (Antarmuka peta sederhana bagi pengguna untuk menggambar poligon batas lahan atau memasukkan luas hektar & provinsi)
- Alur: Nuxt mengirim koordinat GeoJSON ke backend, lalu melakukan polling atau mendengarkan WebSocket/Server-Sent Events (SSE) sampai backend selesai memproses AI

#### Backend (FastAPI)
- Endpoint: `POST /api/v1/analysis/scan`
- Payload (Pydantic Model): Menerima `user_id` dan GeoJSON poligon wilayah
- Logic flow:
  1. Validasi saldo token pengguna (pastikan > 0)
  2. Potong 1 token
  3. Kirim task ke antrean Celery
  4. Worker AI Python mengambil data elevasi/iklim dasar dari koordinat tersebut
  5. Model AI mengevaluasi "Skor Kecocokan Kelapa Sawit"
  6. Simpan hasil analisis ke tabel `analysis_history`

#### Database Schema
- `analysis_history` (`id`, `user_id`, `area_polygon` [tipe GEOMETRY/PostGIS], `province`, `size_hectares`, `suitability_score`, `result_metadata` [JSONB], `created_at`)

---

### Modul 4: Rendering Peta 3D & Heatmap
**Konteks AI / Prompting:**  
"Buat komponen Nuxt 3 menggunakan Mapbox GL JS untuk menampilkan heatmap 3D dari data GeoJSON yang dihasilkan oleh backend."

#### Frontend (Nuxt 3)
- Komponen: `<ResultMap3D />`
- Library: `mapbox-gl` dan `vue-mapbox`
- Logic: Mengambil output `result_metadata` dari Modul 3 (berupa matriks koordinat dan nilai kecocokan 0–100%). Komponen akan menerjemahkan nilai tersebut menjadi gradasi warna:
  - Hijau (Sangat Cocok / >80%)
  - Kuning (Marjinal / 50–79%)
  - Merah (Tidak Cocok / <50%)
- Lakukan extrusion (efek 3D/timbul) pada poligon menggunakan properti `fill-extrusion` di Mapbox untuk memvisualisasikan elevasi atau skor.

#### Backend (FastAPI)
- Endpoint: `GET /api/v1/analysis/{id}/geojson` (Menyajikan data hasil AI dalam format standar GeoJSON yang siap di-render langsung oleh Mapbox di frontend)