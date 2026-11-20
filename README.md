# MEMORIES 2027 — BUKU KENANGAN SMPN 1 RAJAPOLAH
> **Digital Yearbook Angkatan 2026/2027**  
> *“One School, Many Stories, A Thousand Memories.”*

Aplikasi berbasis web modern, interaktif, responsif, dan fungsional penuh untuk buku kenangan digital siswa **SMP Negeri 1 Rajapolah** Tahun Pelajaran 2026/2027.

---

## 🌟 FITUR UTAMA APLIKASI

### 1. Landing Page Interaktif (`/`)
- **Hero Section Cinematic:** Tipografi editorial elegan *“THE BEST YEARS. THE BEAUTIFUL MEMORIES.”*, gradient overlay navy, tombol eksplorasi.
- **Statistik Dinamis Database:** Total siswa, total kelas, total foto kenangan, dan total cerita terhubung langsung ke database.
- **Kilas Perjalanan 3 Tahun:** Narasi visual masa SMP (Tahun 1, Tahun 2, Tahun 3).
- **Featured Students:** Kartu profil majalah dengan hover effect.
- **Class Directory Preview:** Menampilkan kartu kelas 9A hingga 9G.
- **Memory Wall Preview:** Cuplikan dokumentasi foto kegiatan sekolah.
- **Quotes Siswa & Apresiasi Guru:** Kartu tipografi kata mutiara dan profil dewan guru.

### 2. Direktori Siswa & Halaman Majalah Yearbook
- **Direktori Siswa (`/students`):** Pencarian real-time nama/panggilan/motto/cita-cita, filter kelas (9A-9G), sorting.
- **Halaman Profil Majalah Siswa (`/students/[slug]`):**
  - Desain editorial scrapbook majalah eksklusif.
  - Foto potret besar, nama lengkap, panggilan, motto hidup.
  - Badge *“Three Words That Describe Me”*.
  - Fun Q&A (Mapel, makanan, lagu, film, dan tempat favorit).
  - Kisah berkesan, momen lucu, dan kenangan tak terlupakan.
  - Cita-cita dan surat untuk diri sendiri di masa depan (10 tahun lagi).
  - Galeri foto kenangan pribadi siswa dengan viewer popup.
  - Pesan perpisahan untuk teman seangkatan.
  - Tombol navigasi Siswa Sebelumnya & Siswa Selanjutnya.
  - Tombol Cetak / Simpan ke PDF Yearbook & Bagikan Tautan.

### 3. Direktori & Halaman Kelas (`/classes` & `/classes/[slug]`)
- Kartu kelas 9A, 9B, 9C, 9D, 9E, 9F, 9G.
- Halaman detail kelas dengan banner foto kelas, wali kelas, motto, deskripsi, seluruh daftar siswa sekelas, dan foto kenangan kelas.

### 4. Memory Wall / Galeri Kenangan (`/memories`)
- Grid album foto dengan filter kategori (*First Day of School*, *Classroom Moments*, *School Events*, *Sports Day*, *Competitions*, *Study Tour*, *Graduation*, *Behind the Scenes*, *Friendship*, *Random Memories*).
- **Fullscreen Lightbox Viewer:** Tampilan foto layar penuh dengan caption, tanggal, pengunggah, dan navigasi panah kiri/kanan.
- **Fitur Suka (Reaksi Heart):** Like counter tersimpan di database.
- **Modal Unggah Foto:** Form upload foto siswa/admin langsung ke server.

### 5. Apresiasi Guru & Staf (`/teachers`)
- Profil penghormatan untuk Kepala Sekolah, dewan guru, dan staf pengajar.
- Menampilkan foto, mata pelajaran, jabatan, profil, serta pesan/kutipan bijak guru untuk angkatan 2027.

### 6. Wall of Messages / Surat Perpisahan (`/messages`)
- Surat terbuka bertema scrapbook & sticky notes.
- Kategori surat: Untuk Sahabat, Guru, Sekolah, Diri Sendiri di Masa Depan, dan Ucapan Wisuda.
- Form interaktif **"Tulis Pesan Perpisahan"** dengan opsi anonim.

### 7. Quote Wall (`/quotes`)
- Typographic poster cards kutipan siswa per kategori (*Friendship*, *Dreams*, *Life*, *School*, *Graduation*, *Funny Quotes*).
- Fitur salin kutipan ke clipboard.

### 8. Pencarian Global (`/search`)
- Pencarian cerdas terintegrasi mencakup siswa, kelas, guru, galeri foto, dan quotes.

### 9. Dashboard Siswa (`/student/dashboard`)
- Pesan selamat datang personal: *“Hi, [Nama Siswa]! Let’s make your memories unforgettable.”*
- **Progress Bar Kelengkapan Profil (%)** yang dihitung otomatis berdasarkan field yang terisi.
- Status Verifikasi (*Draft*, *Pending Review*, *Approved*, *Rejected* disertai catatan perbaikan dari admin).
- Countdown batas waktu pengisian (Deadline: 30 Mei 2027).
- **Form Profil Wizard 7 Langkah (`/student/profile/edit`):**
  1. *Identitas Pribadi:* Nama lengkap, panggilan, upload foto profil, hobi, motto, Instagram.
  2. *Tentang Saya:* 10 pertanyaan seru (3 kata deskripsi, mapel, lagu, makanan favorit, dll).
  3. *Kenangan Sekolah:* Cerita berkesan, momen lucu, kenangan tak terlupakan.
  4. *Cita-Cita:* Cita-cita masa depan, target SMA/SMK, pesan untuk diri sendiri 10 tahun lagi, quote favorit.
  5. *Foto Pribadi:* Upload hingga 5 foto kenangan pribadi lengkap dengan caption.
  6. *Pesan Perpisahan:* Pesan untuk teman, guru, dan almamater.
  7. *Pratinjau & Pengajuan:* Review tampilan, simpan draft, atau ajukan (Submit for Review).
- Akses kelas saya, kenangan saya, dan ganti password akun.

### 10. Dashboard & Panel Admin (`/admin/dashboard`)
- **Overview Statistik:** Total siswa, akun aktif, kelas, foto, pesan, dan antrean moderasi.
- **Manajemen Data Siswa (`/admin/students`):** CRUD siswa, filter status & kelas, reset password akun, aktifkan/nonaktifkan akun, tambah siswa baru dengan pembuatan akun login otomatis.
- **Manajemen Kelas (`/admin/classes`):** CRUD 7 kelas, penugasan wali kelas, upload foto kelas, pengaturan motto & deskripsi.
- **Manajemen Guru (`/admin/teachers`):** CRUD guru & staf pengajar.
- **Manajemen Foto Kenangan (`/admin/memories`):** Moderasi foto, tandai foto unggulan (featured) di homepage, hapus foto.
- **Pusat Moderasi Konten (`/admin/moderation`):** Antrean satu pintu untuk menyetujui (Approve) atau menolak (Reject dengan catatan revisi) profil siswa, foto, dan pesan.
- **Manajemen Pesan & Quotes (`/admin/messages` & `/admin/quotes`).**
- **Manajemen Akun Siswa (`/admin/accounts`).**
- **Pengaturan Website (`/admin/settings`):** Konfigurasi nama sekolah, tahun pelajaran, tagline, deadline pengisian profil, teks hero, dan teks footer.
- **Export Data & Cetak PDF (`/admin/export`):** Unduh file CSV lengkap seluruh siswa dan dialog cetak PDF buku kenangan.

---

## 🔐 KREDENSIAL AKUN UJI COBA (DEMO)

Tersedia tombol pintas **"Akses Cepat Uji Coba"** pada halaman `/login`:

### 1. Akun Admin (Full Control)
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `ADMIN`

### 2. Akun Siswa Contoh (Kelas 9A)
- **Username:** `siswa9a1`
- **Password:** `siswa123`
- **Nama Siswa:** Ahmad Faiz Pratama (Kelas 9A)
- **Role:** `STUDENT`

*(Tersedia akun siswa untuk kelas lainnya: `siswa9a2`, `siswa9b1`, `siswa9c1`, `siswa9d1`, `siswa9e1`, `siswa9f1`, `siswa9g1` dengan password `siswa123`)*

---

## 💻 TEKNOLOGI YANG DIGUNAKAN

- **Frontend & Fullstack Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling & Design System:** Tailwind CSS
  - Midnight Navy (`#17243A`)
  - Soft Cream (`#F8F5EF`)
  - Warm White (`#FFFFFF`)
  - Muted Gold (`#C6A66B`)
  - Dusty Blue (`#A9BDD2`)
  - Soft Sage (`#A9B7A3`)
  - Charcoal (`#333842`)
- **Typography:** Playfair Display (Heading) & Inter (Body)
- **Icons:** Lucide React
- **Database ORM:** Prisma ORM
- **Database Engine (Lokal):** SQLite (`prisma/dev.db`) — Siap jalan langsung tanpa setup eksternal
- **Database Engine (Cloud/Supabase):** Disediakan file skrip lengkap di `supabase/schema.sql` (PostgreSQL, RLS Policies, Indexes, Storage Buckets)
- **Autentikasi & Keamanan:** bcryptjs (Password Hashing) + JSON Web Token (JWT) tersimpan dalam Secure HTTP-Only Cookie
- **Penyimpanan Berkas (Upload):** Endpoint `/api/upload` dengan validasi MIME (JPG/PNG/WEBP) dan batasan 5 MB per foto, tersimpan di `public/uploads/`

---

## 🚀 CARA MENJALANKAN APLIKASI

Aplikasi saat ini telah aktif di:
👉 **`http://localhost:3000`**

Untuk menjalankan kembali di kemudian hari:

1. **Jalankan Aplikasi:**
   - Cukup klik dua kali berkas: `start-app.bat`
   - Atau melalui terminal:
     ```bash
     cd C:\memories_app
     npx next start -p 3000
     ```

2. **Buka di Browser:**
   - Kunjungi: `http://localhost:3000`

3. **Reset / Isi Ulang Sample Data (Opsional):**
   - Klik dua kali berkas: `seed-db.bat`

---

## ☁️ PANDUAN DEPLOY KE VERCEL & SUPABASE

1. **Supabase Setup:**
   - Buat proyek baru di [supabase.com](https://supabase.com).
   - Masuk ke SQL Editor, jalankan seluruh isi berkas `supabase/schema.sql`.
   - Salin Connection String PostgreSQL ke environment variable `DATABASE_URL`.

2. **Vercel Setup:**
   - Hubungkan repositori ke Vercel.
   - Atur Environment Variables:
     - `DATABASE_URL`: URI PostgreSQL Supabase
     - `JWT_SECRET`: Kunci rahasia session
     - `NEXT_PUBLIC_APP_NAME`: `MEMORIES 2027`
     - `NEXT_PUBLIC_SCHOOL_NAME`: `SMPN 1 RAJAPOLAH`
     - `NEXT_PUBLIC_ACADEMIC_YEAR`: `2026/2027`
   - Deploy!

---

*© 2027 Digital Yearbook SMPN 1 Rajapolah. Made with memories, made with love.*
