# Redesign Tahap 3 — Halaman internal UPPD Banyumas

## Fokus visual

Desain mengikuti karakter portal pelayanan publik: header dan hero beranda Tahap 2 dipertahankan; seluruh halaman internal memakai judul, breadcrumb, tipografi, batas bidang, dan warna identitas yang konsisten. Tidak ada desain ulang halaman admin pada tahap ini.

## File yang diperbarui

- `src/components/shared/PageHeading.tsx` — komponen baru untuk judul dan breadcrumb seragam.
- `src/components/pages/ProfilePage.tsx` — menyederhanakan tata letak profil menjadi navigasi samping desktop / navigasi horizontal mobile, merapikan tipografi dan tampilan kartu, mempertahankan 9 topik serta modal foto/detail, menambahkan catatan arsip historis.
- `src/components/pages/ServicesPage.tsx` — judul seragam, tautan pintas ke empat bagian, jarak antarseksi dan scroll anchor; data, filter lokasi, peta, SIGNAL, SAKPOLE tetap tersedia.
- `src/components/pages/PublicInfoPage.tsx` — arsip gambar, daftar dokumen berbasis data dashboard admin, pencarian, filter kategori, penanda berkas belum tersedia (tanpa memalsukan unduhan), tautan portal resmi.
- `src/components/pages/FaqPage.tsx` — mengganti animasi mengetik, maskot dan efek hover dengan pencarian, kategori otomatis, accordion aksesibel, empty state dan tombol ke Kontak.
- `src/components/pages/ContactPage.tsx` — menata kontak dan peta, meningkatkan label/formulir, mempertahankan penyimpanan demo; status keberhasilan kini jujur menyatakan tersimpan di browser, **bukan** terkirim ke instansi.

## Pemeriksaan

- `npm run lint` (TypeScript): **lolos** setelah menghubungkan dependensi yang sudah terpasang pada sesi pengujian.
- `npm run build`: **belum dapat diverifikasi** di lingkungan pengujian Linux karena modul native `@rollup/rollup-linux-x64-gnu` tidak tersedia. Build tidak dinyatakan sukses.
- `Navbar.tsx` dan `HeroSection.tsx`: identik (tidak berubah) dengan Tahap 2.
- Semua gambar statis yang dirujuk secara literal oleh lima halaman tersedia di folder `public`.

## Penting sebelum dipakai secara publik

- Isi profil mencantumkan rujukan historis 2018–2023; jangan disajikan sebagai kebijakan terbaru tanpa pembaruan/validasi.
- Data pada `src/data/mockData.ts` termasuk dokumen, status capaian, kontak, dan jadwal adalah bahan pengembangan. Sebagian URL dokumen masih `#` dan kini tampil `Berkas belum tersedia`.
- Form kontak **tidak** terhubung server; penyimpanan masih menggunakan `localStorage`. Jangan gunakan sebagai kanal pengaduan sungguhan, dan jangan memasukkan data sensitif.
- Login dashboard admin masih demonstrasi client-side; produksi membutuhkan backend autentikasi dan kontrol akses.
- Komponen foto background Hero menggunakan `/images/uppd1.jpg` seperti versi yang disetujui pengguna.

## Cara menjalankan di Windows

Ekstrak ZIP, buka terminal di folder yang berisi `package.json`, lalu:

```powershell
npm install
npm run dev
```

Untuk pemeriksaan:

```powershell
npm run lint
npm run build
```

Jika ada masalah native dependency akibat sisa instalasi lama, hapus `node_modules` pada project baru, lalu lakukan `npm install` dari awal sesuai sistem operasi Anda.
