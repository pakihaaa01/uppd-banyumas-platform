# Mengganti Foto Background Beranda

Folder foto hero: `public/images/slider/`

Tersedia tiga slot, dengan gambar bawaan sebagai contoh sementara:

- `01.jpg` — foto pertama (saat halaman dibuka)
- `02.jpg` — foto kedua
- `03.jpg` — foto ketiga

Cara mengganti:
1. Siapkan foto horizontal, disarankan rasio 16:9, ukuran sekitar 1920 × 1080 piksel, format JPG.
2. Ubah nama sesuai slot, misalnya foto baru menjadi `01.jpg`.
3. Ganti file di `public/images/slider/` (gunakan nama dan ekstensi yang sama).
4. Jalankan `npm run dev`, lalu refresh website. Jika gambar lama masih muncul, gunakan Ctrl+F5.

Tidak perlu mengubah file React jika hanya mengganti tiga foto tersebut. Teks utama Hero tidak berubah saat foto berganti.

**Perilaku:** foto berubah otomatis setiap 6,5 detik tanpa tombol Sebelumnya/Berikutnya, jeda/putar, atau indikator pilihan foto. Animasi perpindahan memakai efek fade; pada perangkat yang meminta pengurangan gerakan, transisi visual diminimalkan.

Jika ingin menambah slide ke-4: taruh `04.jpg` di folder yang sama dan tambah entri `{ src: '/images/slider/04.jpg', label: 'Foto pelayanan 4' }` pada array `heroPhotos` di `src/components/home/HeroSection.tsx`.
