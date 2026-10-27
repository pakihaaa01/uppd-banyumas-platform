# Pengaturan operasional dan statistik kunjungan

Pembaruan 27 Oktober 2026. Portal memakai satu peran aktif: **Administrator**. Akun Operator dan Penanggung Jawab dinonaktifkan oleh migrasi, bukan dihapus, agar hubungan penulis dan riwayat konten tetap utuh. Sesi mereka dicabut. Pengumuman yang masih menunggu review atau ditolak dikembalikan menjadi Draft agar dapat dikelola Administrator.

## Mengaktifkan pembaruan lokal

Di checkout Anda, pastikan pekerjaan lokal sudah disimpan, lalu ambil branch `feat/admin-direct-publishing-20261024`:

```bash
git pull --ff-only
cd backend
npx prisma migrate deploy --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
npm run dev
```

Jalankan aplikasi publik dan portal pada terminal masing-masing:

```bash
cd apps/website-publik
npm run dev
```

```bash
cd apps/portal-pegawai
npm run dev
```

Website publik berada di `http://localhost:3000`, portal pegawai di `http://localhost:3001`, API di `http://localhost:4000`. Gunakan akun Administrator yang sudah ada. Tidak perlu menjalankan seed ulang. Cadangkan database sebelum menerapkan migrasi pada database berisi data penting. Migrasi ini tidak dijalankan otomatis pada database komputer Anda oleh perubahan kode.

## Lokasi fitur

| Menu | Penggunaan |
| --- | --- |
| Pengaturan → Informasi Kantor | Telepon, WhatsApp, email, dan pilihan kantor utama. Alamat/jam diedit melalui Titik Layanan. |
| Pengaturan → Tampilan Beranda | Unggah JPG/PNG/WebP maksimal 5 MB, urutan 1–8 foto, jeda 3–30 detik. Unggah belum menerbitkan foto sampai Simpan Perubahan. |
| Pengaturan → Template Balasan | Tambah/edit/hapus template. `{{nama}}` dan `{{subjek}}` diisi dari pesan yang dipilih. |
| Pengaturan → Status Fitur | Aktif/pemeliharaan Simulasi Cek Pajak dan Chatbot; Administrator mengedit keterangannya. |
| Pengaturan → Akun Saya | Nama tampilan dan password. Password baru membutuhkan password lama dan mencabut sesi perangkat lain. |
| Pengumuman | Penanda tampil di lonceng, penting, dan waktu kedaluwarsa notifikasi dalam WIB. Tidak ada marquee/banner baru. |
| Statistik Kunjungan | GA4, laporan 1/7/30 hari dan aktivitas 30 menit terakhir. |
| Bantuan Pegawai | Panduan kerja dan tombol cetak/simpan PDF. |

Pemberitahuan dibaca melalui tombol lonceng. Klik membuka isi pengumuman; tanda belum dibaca tersimpan per sesi browser dan muncul kembali ketika pengumuman diperbarui. Kedaluwarsa hanya menyembunyikan notifikasi, tidak menghapus pengumuman di Informasi Publik. Perubahan publik dimuat ulang setiap sekitar 12 detik selama tab aktif.

Template tidak mengirim email secara otomatis. Di Pesan Masyarakat, pilih template, periksa isi, Simpan Draft, kemudian Kirim via Gmail. Tombol kirim tidak aktif jika perubahan draf belum disimpan. Koneksi Gmail yang sudah ada tetap diperlukan; pengujian pembaruan ini tidak mengirim email.

## Setup Google Analytics untuk demonstrasi

Statistik **bisa tampil saat localhost/testing**, asalkan tag terpasang, komputer terhubung internet, dan properti menerima aktivitas penguji. Tidak perlu menunggu masyarakat memakai website. Tidak ada angka atau grafik kunjungan buatan. Portal pegawai tidak memasang tag kunjungan.

1. Buat properti GA4 khusus pengujian, misalnya `UPPD Banyumas — Testing`, pada Google Analytics. Pilih zona waktu Jakarta (GMT+07:00). Jangan gabungkan pengujian dengan properti produksi.
2. Tambahkan Web data stream. Catat **Measurement ID** berformat `G-...`. Jika antarmuka setup meminta domain valid, pakai domain proyek yang dikelola; tag dengan ID yang sama tetap dapat diuji pada localhost. Tidak perlu menjadikan localhost sebagai website publik.
3. Pada setelan stream, matikan **Enhanced measurement** untuk pengujian ini. Aplikasi mengirim `page_view` sendiri saat navigasi state berubah, sehingga tidak memerlukan penghitungan otomatis tambahan. Jangan menambahkan tag Google yang sama lewat GTM atau HTML lagi.
4. Catat **Property ID** numerik dari detail properti; berbeda dari Measurement ID dan Stream ID.
5. Pada Google Cloud, pilih/buat proyek, aktifkan **Google Analytics Data API**, lalu buat service account. Jika kebijakan organisasi mengizinkan, buat kunci JSON service account untuk backend lokal. Simpan hanya di komputer pengelola, bukan repository.
6. Di pengelolaan akses properti GA4, tambahkan alamat email service account sebagai **Viewer**. Akses Google Cloud saja tidak otomatis memberi akses properti Analytics.
7. Tambahkan ke `backend/.env` yang sudah berisi `DATABASE_URL` (jangan menimpa konfigurasi Gmail yang sudah ada):

```dotenv
GA_MEASUREMENT_ID=G_ID_DARI_WEB_STREAM
GA_PROPERTY_ID=ID_NUMERIK_PROPERTI
GA_CLIENT_EMAIL=EMAIL_SERVICE_ACCOUNT
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nISI_KUNCI_DARI_JSON\n-----END PRIVATE KEY-----\n"
GA_ENVIRONMENT=testing
```

Ganti placeholder dengan nilai sebenarnya. Measurement ID harus berformat `G-XXXXXXXXXX`. `GA_PRIVATE_KEY` diambil dari `private_key` JSON; pertahankan `\n` di dalam tanda kutip ganda. Jangan mengirim kunci melalui chat, memasukkannya ke variabel `VITE_`, atau melakukan commit kunci. Frontend hanya menerima Measurement ID publik dan label lingkungan.

8. Restart backend dan muat ulang website publik. Portal menampilkan label **Data pengujian** ketika `GA_ENVIRONMENT` bukan `production`.
9. Buka beberapa halaman publik, chatbot, peta, atau dokumen. Di portal, buka Statistik Kunjungan → Perbarui statistik. Gunakan **Aktivitas 30 menit terakhir** untuk demonstrasi langsung. Backend memakai cache maksimal satu menit; Google juga memerlukan waktu pemrosesan beberapa menit. Laporan harian dapat memerlukan 24–48 jam.
10. Periksa DebugView/Realtime di GA4 bila data belum masuk. Untuk properti testing, pastikan filter internal/developer traffic tidak aktif mengecualikan aktivitas penguji. Event testing memakai `debug_mode`. Periksa pemblokir iklan/pelacakan, internet, Measurement ID, izin Viewer, dan aktivasi Data API bila grafik tidak muncul.

Membuka banyak halaman dari satu browser biasanya menghasilkan beberapa tayangan/sesi, bukan banyak pengguna unik. Lakukan uji sehari sebelumnya bila ingin laporan harian berisi data saat presentasi. Siapkan koneksi internet saat demo. Tanpa kredensial, portal menampilkan “Statistik belum terhubung”; kegagalan koneksi tidak diganti dengan angka nol palsu.

Ketika website digunakan masyarakat, gunakan properti produksi dan ganti kelima konfigurasi dengan properti/kredensial produksi serta `GA_ENVIRONMENT=production`. Label testing saja tidak memisahkan data: pemisahan sebenarnya dilakukan dengan properti GA4 yang berbeda.

### Data yang dikirim aplikasi

`page_view` menggunakan judul halaman tetap dan alamat halaman tanpa query pengguna. Event interaksi adalah `open_chatbot`, `open_maps`, `open_document`, `open_digital_service`. Isi pesan, isi chat, nama warga, email, password, dan nomor kendaraan tidak dimasukkan sebagai parameter event oleh kode aplikasi. Google tetap melakukan pengukuran browser sesuai konfigurasi GA4. Penyiapan kebijakan privasi/consent produksi mengikuti kebijakan instansi.

Dashboard memakai Data API melalui backend, bukan iframe dashboard Google yang membutuhkan login pegawai. Kunci service account tidak dikembalikan lewat endpoint publik. Kesalahan akses dan batas kuota ditampilkan sebagai status gagal memuat.

## Validasi pengembang

```bash
cd backend
npx prisma generate --config prisma7.config.ts
npx tsc --noEmit
```

Pada masing-masing aplikasi: `npx tsc --noEmit` dan `npm run build`.

Uji integrasi membutuhkan database **terpisah** yang namanya diawali `uppd_test`, sudah dimigrasi. Jangan gunakan database kerja/produksi. Set `TEST_DATABASE_URL`, lalu:

```bash
node --import tsx tests/operational.integration.ts
```

Test mengubah pengaturan database uji dan mencakup penolakan akses peran lama, validasi, konflik versi, unggah gambar, template, publikasi notifikasi, password dan pencabutan sesi, serta respons GA tanpa konfigurasi/sukses/cache/gagal. Permintaan Google dimock dalam test; tidak ada kredensial atau pengiriman email sungguhan.

Referensi resmi:

- [Google Analytics Data API quickstart](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart)
- [Realtime reports](https://developers.google.com/analytics/devguides/reporting/data/v1/realtime-basics)
- [Verifikasi pemasangan Analytics](https://developers.google.com/analytics/devguides/collection/ga4/troubleshoot)
- [Keaktualan data](https://support.google.com/analytics/answer/11198161?hl=id)
