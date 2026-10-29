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

## Pembaruan 28 Oktober 2026 — Pilihan kantor untuk masyarakat

Jalankan migrasi `20261028120000_office_contacts` lalu generate Prisma dan restart backend/aplikasi. Migrasi menambahkan WhatsApp, email kontak, dan jadwal terstruktur per kantor. Alamat, telepon, jadwal teks lama, serta pesan masyarakat tetap dipertahankan.

Pengaturan → Informasi Kantor sekarang mengedit setiap kantor dalam data Titik Layanan, termasuk kantor terbit. Pilih Kantor, perbarui informasi, dan simpan. Jadwal dapat ditulis per hari atau kelompok hari, dengan jam buka/tutup WIB, status Tutup, dan catatan. Jadwal lama ditampilkan sampai jadwal tabel disimpan. Jika jadwal teks di Titik Layanan diubah, tabel terstruktur dikosongkan agar sumber informasi tidak bertentangan.

Pada Kontak publik, pilihan kantor mengubah kartu informasi saja. Formulir tetap masuk ke daftar Pesan Masyarakat pusat; tidak ada alamat penerima atau kantor tujuan yang dikirim dari dropdown. Email kontak kantor terpisah dari email pengaduan pusat pada konfigurasi kontak global. Kontak footer tetap pusat. Kantor draft tidak ditampilkan publik.

Grafik statistik kini berupa area biru bergradasi dengan garis monotone, tooltip, pilihan metrik Pengguna/Sesi/Tayangan, serta tabel angka yang dapat dibuka untuk aksesibilitas. Backend mengambil ketiga metrik per tanggal dari GA4. Jumlah pengguna periode tidak dihitung dengan menjumlahkan pengguna harian karena orang yang sama dapat datang pada beberapa hari.

Panduan Kontak berada di bawah dua kolom dengan lebar penuh. Peta terpisah diganti tautan setelah alamat. Jumlah hasil FAQ dan paragraf petunjuk demonstrasi statistik dihapus.

## Koreksi formulir 29 Oktober 2026

Setelah penyimpanan informasi kantor berhasil, editor dikosongkan, pilihan kembali ke Pilih Kantor, dan halaman bergulir ke judul Informasi Kantor dengan pesan sukses. Jika gagal, isian tetap tersedia untuk diperbaiki.

Kartu Informasi Kantor dan Formulir Pesan menggunakan tinggi sejajar pada desktop; pada ponsel tinggi mengikuti isi masing-masing. Email pengaduan pusat serta kalimat penjelasan pilihan kantor di formulir dihapus dari tampilan.

Formulir publik hanya mengirim nama, email, dan isi pesan. Subjek tidak lagi menjadi kolom, validasi, atau payload dari masyarakat. Riwayat subjek pesan lama tetap disimpan; pesan baru memakai judul internal “Pesan masyarakat” agar balasan Gmail dan template lama tetap kompatibel. Tidak diperlukan migrasi database untuk koreksi ini. Restart backend dan frontend bersama-sama setelah pembaruan.

- Halaman Kontak menampilkan email pusat `up3adbms@gmail.com` untuk setiap pilihan kantor. Baris WhatsApp tidak ditampilkan jika nomornya kosong.

## Pengumuman kedaluwarsa dan balasan Gmail

- Batas tampil pengumuman berlaku untuk seluruh publikasi, bukan hanya lonceng. Field database `notificationExpiresAt` tetap digunakan sehingga tidak perlu migrasi. Jadwal yang sudah tersimpan juga mengikuti aturan baru.
- Backend mengubah pengumuman kedaluwarsa menjadi Draft saat startup, setiap 15 detik, dan sebelum permintaan pengelolaan pengumuman. API publik langsung menyaring batas waktu. Halaman publik yang sudah terbuka menghapus item kedaluwarsa setiap detik; daftar admin diperbarui setiap 15 detik.
- Backend harus berjalan untuk memperbarui status database. Jika mati, pembaruan dilakukan saat backend kembali berjalan. Isi pengumuman tidak dihapus. Perbarui atau kosongkan batas waktu sebelum menerbitkan ulang.
- Jam batas tampil menggunakan WIB. Tidak ada perubahan CAPTCHA maupun verifikasi penjumlahan.
- Gmail memakai nama pengirim `Demo Portal UPPD Banyumas` secara default. Atur `GMAIL_SENDER_NAME` di backend untuk nama yang sesuai. `GMAIL_SENDER_EMAIL` wajib sesuai akun OAuth atau alias pengirim yang telah diverifikasi Gmail; untuk testing gunakan alamat Gmail pribadi yang terhubung, bukan alamat kantor yang belum diotorisasi.
- Balasan memakai subjek yang jelas, Date, Message-ID unik, dan baris base64 MIME maksimal 76 karakter. Perubahan ini tidak menjamin lolos spam. Penyebab spam tetap memerlukan alasan Gmail dan hasil SPF/DKIM/DMARC dari pesan penerima. Jangan membagikan token OAuth.
- Tidak menjalankan pengujian atas perubahan ini sesuai permintaan pengguna.
