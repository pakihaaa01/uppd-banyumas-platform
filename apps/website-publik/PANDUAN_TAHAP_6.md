# UPPD Banyumas — Redesign Tahap 6

## Perubahan

Perubahan berikut hanya menyasar halaman **Profil**:

1. **Visi & Misi:** kartu Sejahtera dan Berdikari menjadi accordion; empat Misi Pembangunan, sepuluh Program Unggulan, dan empat rincian Tujuan/Sasaran yang ada di project Tahap 5 menjadi accordion bertingkat tanpa efek hover kartu statis.
2. **Wilayah Kerja & Jenis Pendapatan:** lima jenis pendapatan menjadi accordion. Peta wilayah kerja juga berada di dalam accordion; tombol memperbesar peta tetap dapat diklik.
3. **Banner visi:** teks asli tahun 2018–2023 tetap berada di atas background foto batik dengan overlay biru gelap untuk menjaga keterbacaan.
4. **Bagian lain:** navbar, slideshow hero otomatis, sejarah, Struktur Organisasi, Layanan, Informasi Publik, FAQ, Kontak, dan Admin tidak diubah pada tahap ini.

## Mengganti gambar batik

- Lokasi: `public/images/batik-visi.jpg`
- Dalam ZIP sudah ada placeholder JPG polos agar tampilannya tetap stabil sebelum foto asli dipasang.
- Ganti file itu dengan foto batik sendiri. **Nama dan ekstensi harus sama**, yaitu `batik-visi.jpg`.
- Disarankan gambar mendatar ukuran 1600×900 atau 1920×1080 piksel, JPG.
- Warna gelap bukan diterapkan pada foto aslinya. Overlay otomatis berasal dari `src/components/pages/profile/ProfileVision.tsx`, sehingga foto tidak perlu diedit manual.
- Posisi gambar menggunakan `background-size: cover` dan `background-position: center`, sehingga sisi gambar mungkin terpotong sesuai layar. Letakkan elemen penting gambar di area tengah.
- Jika foto belum diperbarui ketika website dibuka, coba `Ctrl+F5` atau bersihkan cache browser.

## Menjalankan di Windows

Ekstrak ZIP, lalu buka terminal PowerShell **di folder yang berisi `package.json`**.

```powershell
npm install
npm run dev
```

Lalu jalankan pemeriksaan:

```powershell
npm run lint
npm run build
```

## Batasan data

- Teks kebijakan 2018–2023 dipertahankan dari project Tahap 5 sebagai **materi historis**, bukan klaim kebijakan terkini.
- Pada materi asli tertulis **6 tujuan dan 10 sasaran**, sementara kartu yang benar-benar tersedia di source Tahap 5 hanya empat kelompok. Tahap 6 tidak membuat data tambahan yang tidak ada di project lama.
- Informasi jenis pendapatan yang tercantum tetap harus diverifikasi berdasarkan ketentuan terbaru sebelum dipublikasikan secara resmi.

## Pengujian

- `npm run lint` (TypeScript `tsc --noEmit`) berhasil pada lingkungan pengujian.
- Build penuh tidak dapat diuji di lingkungan Linux ini karena dependensi opsional `@rollup/rollup-linux-x64-gnu` tidak terdapat pada `node_modules` milik arsip lama. Jalankan `npm install` dan `npm run build` pada Windows untuk memverifikasi build lengkap.
