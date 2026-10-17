# Tahap 10 — Pratinjau gambar Informasi Publik

## Perubahan
- Kartu dokumentasi Maklumat Pelayanan, SOP, dan SIPP sekarang membuka gambar di modal halaman, bukan tab baru.
- Modal memiliki tombol **Tutup (X)**, dapat ditutup dengan tombol **Esc**, dan dapat ditutup dengan klik pada bagian latar gelap di luar gambar.
- Posisi halaman dan fokus tombol asal dipulihkan setelah modal ditutup.
- Saat modal terbuka, scroll halaman latar dinonaktifkan.
- Pencarian/filter dokumen, accordion, dan tautan portal resmi tidak diubah.
- Seluruh 27 aset pada folder public dipertahankan sesuai project Tahap 9.

## File yang diedit
`src/components/pages/PublicInfoPage.tsx`

## Menjalankan di Windows
Buka PowerShell pada folder hasil ekstraksi yang langsung berisi `package.json` lalu jalankan:

```powershell
npm install
npm run dev
```

Jika berada pada folder induk, cari lokasi project dengan:

```powershell
Get-ChildItem -Recurse -Filter vite.config.ts -File | Select-Object -ExpandProperty FullName
```

## Pemeriksaan
Semua berkas .ts/.tsx telah diperiksa sintaks TSX (tanpa error). Build penuh belum diverifikasi pada lingkungan ini karena dependensi npm belum tersedia.
