# UPPD Banyumas — Tahap 10 + Admin dan Backend (perbaikan terbatas)

**Dasar project: ZIP Tahap 10, bukan Tahap 12.** Semua halaman publik dan 27 aset gambar Tahap 10 dipertahankan.

Hanya perubahan yang diminta setelah Tahap 10:
- Redesign **dashboard admin** (pengumuman, lokasi, dokumen, dokumentasi, FAQ, chatbot, poster, pesan).
- Akses admin terpisah di **`/admin`**, tanpa tombol di Navbar atau Footer.
- Backend Express dengan SQLite dan login admin yang diverifikasi di server.
- Konten yang diedit di admin dapat terlihat di website publik melalui API pada server lokal yang sama.
- Formulir Kontak tersimpan sebagai **pesan demonstrasi** di SQLite; bagian ini memakai teks yang diperjelas agar tidak menyesatkan.

**Jalankan Windows PowerShell** pada folder yang berisi `package.json`:

```powershell
node -v
npm install
npm run dev
```

Butuh Node.js 22.13+ (disarankan Node 24 LTS).
- Publik: http://localhost:3000/
- Admin: http://localhost:3000/admin
- API: http://localhost:3000/api/health

Pada awal instalasi, username **admin** dengan password acak; lihat output terminal pertama atau `server/data/KREDENSIAL_AWAL_ADMIN.txt`. Jangan bagikan password tersebut.

**Jangan salin folder `server/data` dari project Tahap 12** ke versi ini. Jika sudah pernah menyimpan data penting pada database lama, backup dulu folder tersebut dan pilih dengan sengaja dataset yang hendak dipakai. Data lokal sebelumnya (localStorage Tahap 10) tidak otomatis dimigrasikan ke database ini.

Untuk reset password: `npm run reset-admin`.

Catatan: Sistem lokal untuk demonstrasi magang, belum untuk produksi, dan hasil cek pajak tetap dummy.
