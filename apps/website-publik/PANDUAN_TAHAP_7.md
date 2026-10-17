# Redesign Tahap 7 — Accordion Lokasi Pelayanan

Sumber: berkas `UPPD_Banyumas_Redesign_Tahap_6(1).zip` yang diberikan pengguna.

## Perubahan

- `src/components/pages/ServicesPage.tsx`: daftar kartu Lokasi Pelayanan SAMSAT diubah menjadi accordion yang dapat dibuka/tutup, memakai komponen `EditorialAccordion` yang sudah ada.
- Semua informasi lokasi dipertahankan: kategori, nama lokasi, deskripsi, alamat, jam pelayanan, dan nomor telepon.
- Tombol lokasi di dalam panel kini berupa tautan langsung ke `loc.mapsUrl` (Google Maps) dan tidak memunculkan modal dalam website.
- Jika link tidak memenuhi format URL Google Maps HTTPS, tombol menggunakan pencarian Google Maps berdasarkan nama dan alamat lokasi.
- Komponen `src/components/shared/LocationMapModal.tsx` dihapus karena tidak digunakan lagi.
- Filter dan pencarian lokasi, serta pencatatan klik lokasi, tetap berfungsi.
- Semua 27 aset di folder `public/` **sama persis secara byte** dengan ZIP terbaru yang diberikan, termasuk JPG yang sudah diedit.

## Cara menjalankan

Buka terminal di folder yang berisi `package.json`:

```powershell
npm install
npm run dev
```

## Catatan

- Alamat dan titik Google Maps diambil dari daftar `serviceLocations` milik project. Periksa kebenaran setiap link lokasi sebelum publikasi resmi.
- Ketika tautan Google Maps ditekan pada ponsel, sistem dapat membuka aplikasi Google Maps jika terpasang serta konfigurasi link mendukungnya; jika tidak, peta dibuka di browser.
- Pemeriksaan sintaks TSX berhasil; build aplikasi penuh perlu dijalankan setelah instalasi dependencies (`npm install`).
