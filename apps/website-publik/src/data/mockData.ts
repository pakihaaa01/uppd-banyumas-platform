import {
  Announcement,
  ServiceLocation,
  BUMDesPoster,
  PublicDocument,
  FAQItem,
  ContactMessage,
  ChatbotFAQ,
  PADTarget,
  PerformanceReport,
  DashboardStats
} from '../types';

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Jateng Bebas Sanksi Administratif dan Progresif 2026',
    date: '18 September 2026',
    category: 'Kebijakan Pajak',

    shortDescription:
    'Pemerintah Provinsi Jawa Tengah memberlakukan pembebasan denda keterlambatan Pajak Kendaraan Bermotor (PKB) dan pajak progresif pada 21 September–28 Desember 2026. Masyarakat dapat memanfaatkan program ini untuk menyelesaikan kewajiban pajak kendaraannya sesuai ketentuan yang berlaku.',
    
    content:
    'Pemerintah Provinsi Jawa Tengah mengadakan program Jateng Bebas Sanksi Administratif dan Progresif 2026 yang berlangsung mulai 21 September hingga 28 Desember 2026. Selama periode tersebut, wajib pajak dapat melakukan pembayaran Pajak Kendaraan Bermotor (PKB) tanpa dikenakan denda keterlambatan sesuai ketentuan program.\n\n' +
    'Selain pembebasan denda PKB, program ini juga mencakup pembebasan pajak progresif bagi pemilik kendaraan yang memenuhi persyaratan. Pembayaran pokok pajak kendaraan tetap menjadi kewajiban wajib pajak karena program ini tidak memberikan pembebasan seluruh tagihan pajak.\n\n' +
    'Masyarakat Kabupaten Banyumas dapat mengakses layanan pembayaran melalui kantor SAMSAT dan kanal pembayaran resmi yang mendukung program tersebut. Sebelum melakukan pembayaran, masyarakat disarankan untuk memeriksa rincian tagihan, persyaratan, dan jadwal pelayanan melalui informasi resmi Bapenda Jawa Tengah.',
    
    isNew: true,
    isImportant: true,
  },
  {
    id: 'ann-2',
    title: 'Penambahan Jam Layanan SAMSAT Malam Minggu di Alun-Alun Purwokerto',
    date: '28 Juli 2026',
    category: 'Informasi Pelayanan',
    
    shortDescription: 'SAMSAT Banyumas menyediakan layanan tambahan setiap Sabtu pukul 18.30–21.00 WIB di Alun-Alun Purwokerto, tepatnya di depan Pendopo Sipanji. Layanan ini meliputi pengesahan STNK tahunan dan pembayaran Pajak Kendaraan Bermotor (PKB).',
    
    content:
    'Bagi masyarakat yang tidak sempat mengurus pajak kendaraan pada hari kerja, SAMSAT Banyumas menyediakan pelayanan tambahan pada Sabtu malam. Pelayanan dilaksanakan pukul 18.30–21.00 WIB di kawasan Alun-Alun Purwokerto, tepatnya di depan Pendopo Sipanji.\n\n' +
    'Masyarakat dapat melakukan pembayaran Pajak Kendaraan Bermotor (PKB) sekaligus pengesahan STNK tahunan melalui layanan ini. Sebelum datang, pastikan dokumen kendaraan dan identitas pemilik sudah disiapkan sesuai persyaratan pelayanan.\n\n' +
    'Jadwal pelayanan dapat mengalami perubahan, terutama apabila terdapat kegiatan tertentu di kawasan Alun-Alun Purwokerto. Masyarakat disarankan untuk memeriksa informasi jadwal terbaru melalui kanal resmi SAMSAT Banyumas sebelum berkunjung.',
    
    isNew: true,
    isImportant: true,
  },
  {
    id: 'ann-3',
    title: 'Peningkatan Kualitas Pelayanan SAMSAT di Mal Pelayanan Publik (MPP) Purwokerto',
    date: '15 Juli 2026',
    category: 'Inovasi Layanan',
    
    shortDescription: 'Gerai SAMSAT di Mal Pelayanan Publik (MPP) Purwokerto menyediakan layanan pengesahan STNK tahunan dan pembayaran Pajak Kendaraan Bermotor (PKB) sebagai alternatif bagi masyarakat yang ingin mengurus kewajiban pajak kendaraannya.',
    
    content:
    'Gerai SAMSAT di Mal Pelayanan Publik (MPP) Purwokerto menjadi salah satu pilihan pelayanan bagi masyarakat Kabupaten Banyumas. Melalui gerai ini, masyarakat dapat mengurus pengesahan STNK tahunan dan pembayaran Pajak Kendaraan Bermotor (PKB) tanpa harus datang ke kantor SAMSAT induk.\n\n' +
    'Pelayanan di MPP Purwokerto bertujuan memudahkan masyarakat dalam mengakses layanan administrasi kendaraan bermotor. Dengan tersedianya layanan SAMSAT bersama berbagai layanan publik lainnya dalam satu lokasi, masyarakat dapat menyesuaikan kunjungan berdasarkan kebutuhan dan jadwal pelayanan yang tersedia.\n\n' +
    'Masyarakat yang akan menggunakan layanan ini disarankan menyiapkan dokumen kendaraan dan identitas sesuai persyaratan. Informasi mengenai jam operasional dan jenis pelayanan dapat diperiksa melalui kanal resmi SAMSAT Banyumas atau Mal Pelayanan Publik Kabupaten Banyumas sebelum berkunjung.',

    isNew: false,
    isImportant: false,
  },
  {
    id: 'ann-4',
    title: 'Sosialisasi Pembayaran Pajak Melalui BUMDes Mitra SAMSAT Banyumas',
    date: '02 Juli 2026',
    category: 'Kemitraan',
    
    shortDescription: 'SAMSAT Banyumas bekerja sama dengan BUMDes untuk mendekatkan layanan pembayaran Pajak Kendaraan Bermotor (PKB) tahunan kepada masyarakat desa. Layanan ini menjadi alternatif bagi warga yang ingin membayar pajak kendaraan tanpa harus pergi ke pusat kota Purwokerto.',
    
    content:
    'Melalui kerja sama dengan Badan Usaha Milik Desa (BUMDes), SAMSAT Banyumas berupaya memperluas jangkauan layanan pembayaran Pajak Kendaraan Bermotor (PKB) tahunan. Masyarakat dapat memanfaatkan BUMDes yang telah menjadi mitra pelayanan untuk mengurus pembayaran pajak kendaraan di wilayah masing-masing.\n\n' +
    'Keberadaan layanan ini diharapkan dapat memudahkan masyarakat, terutama warga yang tinggal cukup jauh dari kantor SAMSAT induk. Dengan adanya titik pelayanan melalui BUMDes, masyarakat memiliki pilihan lokasi pembayaran yang lebih dekat dengan tempat tinggalnya.\n\n' +
    'Tidak semua BUMDes menyediakan layanan pembayaran pajak kendaraan. Oleh karena itu, masyarakat disarankan untuk memastikan terlebih dahulu daftar BUMDes mitra yang aktif, jadwal pelayanan, serta dokumen yang perlu disiapkan sebelum melakukan pembayaran.',
    
    isNew: false,
    isImportant: false,
  }
];

export const INITIAL_SERVICE_LOCATIONS: ServiceLocation[] = [
  {
    id: 'loc-1',
    name: 'SAMSAT Induk Purwokerto',
    address: 'Jl. Prof. Dr. Suharso No. 12, Arcawinangun, Purwokerto Timur, Kabupaten Banyumas',
    operatingHours: 'Senin - Kamis: 08.00 - 13.00 WIB | Jumat: 08.00 - 11.00 WIB | Sabtu: 08.00 - 12.00 WIB',
    phone: '(0281) 635123',
    mapsUrl: 'https://maps.google.com/?q=SAMSAT+Induk+Purwokerto+Banyumas',
    mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.321!2d109.2451!3d-7.4215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e655c2f5b555555%3A0x123456789abcdef!2sSAMSAT+Purwokerto!5e0!3m2!1sid!2sid!4v1600000000000',
    isMain: true,
    type: 'induk',
    description: 'Pusat pelayanan utama SAMSAT Kabupaten Banyumas untuk semua pengurusan PKB, BBNKB, ganti plat 5 tahunan, dan mutasi kendaraan.'
  },
  {
    id: 'loc-2',
    name: 'SAMSAT Cepat Purwokerto',
    address: 'Jl. Jend. Sudirman No. 450, Purwokerto Barat, Banyumas',
    operatingHours: 'Senin - Sabtu: 08.00 - 12.00 WIB',
    phone: '(0281) 636789',
    mapsUrl: 'https://maps.google.com/?q=SAMSAT+Cepat+Purwokerto',
    type: 'cepat',
    description: 'Loket khusus pengesahan STNK tahunan dan pembayaran Pajak Kendaraan Bermotor dengan waktu penyelesaian cepat tanpa ganti plat.'
  },
  {
    id: 'loc-3',
    name: 'SAMSAT Pembantu Wangon',
    address: 'Jl. Raya Klapasawit No. 88, Wangon, Kabupaten Banyumas',
    operatingHours: 'Senin - Kamis: 08.00 - 12.30 WIB | Jumat - Sabtu: 08.00 - 11.30 WIB',
    phone: '(0281) 510112',
    mapsUrl: 'https://maps.google.com/?q=SAMSAT+Wangon+Banyumas',
    type: 'pembantu',
    description: 'Melayani masyarakat Banyumas wilayah barat (Wangon, Jatilawang, Lumbir, Gumelar) untuk pembayaran PKB tahunan dan pendaftaran kendaraan.'
  },
  {
    id: 'loc-4',
    name: 'SAMSAT Cepat Wangon',
    address: 'Area Terminal Bus Wangon, Jl. Raya Bandung-Purwokerto, Wangon',
    operatingHours: 'Senin - Sabtu: 08.00 - 11.30 WIB',
    phone: '(0281) 510223',
    mapsUrl: 'https://maps.google.com/?q=SAMSAT+Cepat+Wangon',
    type: 'cepat',
    description: 'Layanan pendaftaran express pembayaran pajak tahunan bagi pengendara di kawasan transit Wangon.'
  },
  {
    id: 'loc-5',
    name: 'SAMSAT Paten Sokaraja',
    address: 'Kantor Kecamatan Sokaraja, Jl. Menteri Supeno No. 1, Sokaraja, Banyumas',
    operatingHours: 'Senin - Kamis: 08.00 - 12.00 WIB | Jumat - Sabtu: 08.00 - 11.00 WIB',
    phone: '(0281) 644321',
    mapsUrl: 'https://maps.google.com/?q=SAMSAT+Paten+Sokaraja',
    type: 'paten',
    description: 'Pelayanan Administrasi Terpadu Kecamatan Sokaraja untuk kemudahan masyarakat Sokaraja, Kalibagor, dan sekitarnya.'
  },
  {
    id: 'loc-6',
    name: 'SAMSAT Drive Thru Purwokerto',
    address: 'Halaman SAMSAT Induk, Jl. Prof. Dr. Suharso No. 12, Purwokerto',
    operatingHours: 'Senin - Sabtu: 08.00 - 12.00 WIB',
    phone: '(0281) 635123',
    mapsUrl: 'https://maps.google.com/?q=SAMSAT+Drive+Thru+Purwokerto',
    isDriveThru: true,
    type: 'drive-thru',
    description: 'Bayar pajak kendaraan tanpa turun dari mobil atau sepeda motor! Cukup bawa STNK asli dan KTP asli pemohon.'
  },
  {
    id: 'loc-7',
    name: 'SAMSAT MPP Purwokerto',
    address: 'Mal Pelayanan Publik Kab. Banyumas, Jl. Dr. Angka No. 45, Purwokerto',
    operatingHours: 'Senin - Kamis: 08.00 - 14.00 WIB | Jumat: 08.00 - 11.00 WIB',
    phone: '(0281) 621999',
    mapsUrl: 'https://maps.google.com/?q=Mal+Pelayanan+Publik+Purwokerto',
    type: 'mpp',
    description: 'Layanan SAMSAT terintegrasi di Mal Pelayanan Publik Kabupaten Banyumas bersama puluhan instansi pemerintah lainnya.'
  },
  {
    id: 'loc-8',
    name: 'SAMSAT Keliling (Si-Mpling Banyumas)',
    address: 'Jadwal Bergilir: Ajibarang, Cilongok, Sumpiuh, Kembaran, Sumbang, Baturraden',
    operatingHours: 'Senin - Sabtu: 08.30 - 11.30 WIB (Sesuai Jadwal Mingguan)',
    phone: '0812-2345-6789',
    mapsUrl: 'https://maps.google.com/?q=SAMSAT+Keliling+Banyumas',
    type: 'keliling',
    description: 'Bus Pelayanan Keliling SAMSAT yang mendatangi pusat kecamatan dan pasar tradisional di seluruh penjuru Kabupaten Banyumas.'
  },
  {
    id: 'loc-9',
    name: 'SAMSAT Rita SuperMall',
    address: 'Lantai Ground Rita SuperMall Purwokerto, Jl. Jend. Sudirman No. 296',
    operatingHours: 'Senin - Minggu: 10.00 - 15.00 WIB',
    phone: '(0281) 684888',
    mapsUrl: 'https://maps.google.com/?q=Rita+SuperMall+Purwokerto',
    type: 'gerai',
    description: 'Layanan pajak kendaraan di pusat perbelanjaan terbesar Purwokerto. Buka setiap hari termasuk hari libur dan akhir pekan.'
  },
  {
    id: 'loc-10',
    name: 'SAMSAT Malam Minggu (SamMalMu)',
    address: 'Area Alun-Alun Purwokerto (Depan Pendopo Sipanji Kabupaten Banyumas)',
    operatingHours: 'Sabtu Malam: 18.30 - 21.00 WIB',
    phone: '0812-9988-7766',
    mapsUrl: 'https://maps.google.com/?q=Alun-Alun+Purwokerto',
    type: 'gerai',
    description: 'Layanan santai malam minggu sambil rekreasi keluarga di pusat kota Purwokerto untuk pengesahan STNK tahunan.'
  }
];

export const SAMSAT_GERAI_FEATURED = {
  title: 'Gerai SAMSAT Sinergi BUMDes & Pusat Layanan Publik',
  address: 'Gedung SAMSAT Corner, Jl. Jend. Sudirman No. 296 & Terhubung 32 BUMDes Se-Banyumas',
  description: 'Gerai SAMSAT Banyumas merupakan wujud kemitraan inovatif antara Pemerintah Provinsi Jawa Tengah, Bapenda, Polda Jateng, PT Jasa Raharja, serta Pemerintah Kabupaten Banyumas melalui Badan Usaha Milik Desa (BUMDes). Layanan ini dirancang mendekatkan titik bayar hingga tingkat desa.',
  businessHours: 'Senin - Sabtu: 08.00 - 15.00 WIB | Malam Minggu: 18.30 - 21.00 WIB',
  photoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
  mapsUrl: 'https://maps.google.com/?q=Gerai+SAMSAT+Banyumas'
};

export const INITIAL_BUMDES_POSTERS: BUMDesPoster[] = Array.from({ length: 32 }, (_, index) => {
  const villages = [
    { v: 'Karanglewas Kidul', d: 'Karanglewas' },
    { v: 'Sokaraja Tengah', d: 'Sokaraja' },
    { v: 'Cilongok Pasar', d: 'Cilongok' },
    { v: 'Wangon Jaya', d: 'Wangon' },
    { v: 'Sumpiuh Sejahtera', d: 'Sumpiuh' },
    { v: 'Baturraden Asri', d: 'Baturraden' },
    { v: 'Ajibarang Kulon', d: 'Ajibarang' },
    { v: 'Rawalo Makmur', d: 'Rawalo' },
    { v: 'Jatilawang Berseri', d: 'Jatilawang' },
    { v: 'Kembaran Mandiri', d: 'Kembaran' },
    { v: 'Sumbang Murni', d: 'Sumbang' },
    { v: 'Kedungbanteng Maju', d: 'Kedungbanteng' },
    { v: 'Patikraja Utama', d: 'Patikraja' },
    { v: 'Kalibagor Berkah', d: 'Kalibagor' },
    { v: 'Tambak Sembada', d: 'Tambak' },
    { v: 'Lumbir Sentosa', d: 'Lumbir' }
  ];
  const item = villages[index % villages.length];
  const num = index + 1;
  return {
    id: `poster-${num}`,
    title: `Poster Layanan Pembayaran Pajak BUMDes ${item.v}`,
    village: item.v,
    district: item.d,
    imageUrl: `https://images.unsplash.com/photo-${1550000000000 + (num * 12345) % 10000000}?auto=format&fit=crop&w=600&q=80`,
    dateAdded: `2026-0${(num % 6) + 1}-15`,
    downloads: 120 + num * 18
  };
});

export const INITIAL_DOCUMENTS: PublicDocument[] = [
  {
    id: 'doc-1',
    title: 'SOP Pelayanan Pengesahan STNK 1 Tahunan SAMSAT Banyumas',
    category: 'sop',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    downloadUrl: '#',
    updateDate: '10 Januari 2026',
    description: 'Standard Operating Procedure langkah demi langkah pelayanan loket pendaftaran, penetapan, dan kasir.'
  },
  {
    id: 'doc-2',
    title: 'SOP Pelayanan Perpanjangan STNK 5 Tahunan & Ganti Plat',
    category: 'sop',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    downloadUrl: '#',
    updateDate: '12 Januari 2026',
    description: 'Prosedur standar cek fisik kendaraan bermotor, mutasi masuk/keluar, dan penerbitan TNKB baru.'
  },
  {
    id: 'doc-3',
    title: 'SOP Pelayanan Bebas Bea Balik Nama (BBNKB II)',
    category: 'sop',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    downloadUrl: '#',
    updateDate: '15 Februari 2026',
    description: 'Panduan tata cara permohonan pembebasan bea balik nama kendaraan second hand.'
  },
  {
    id: 'doc-4',
    title: 'Sertifikat Wilayah Bebas dari Korupsi (WBK) UPPD Banyumas 2025',
    category: 'wbk',
    fileType: 'PDF',
    fileSize: '4.5 MB',
    downloadUrl: '#',
    updateDate: '20 Desember 2025',
    description: 'Piagam Penghargaan Zona Integritas dari Kementerian PANRB atas komitmen anti korupsi dan gratifikasi.'
  },
  {
    id: 'doc-5',
    title: 'Laporan Monitoring Maklumat Pelayanan & Integritas Pegawai Q1 2026',
    category: 'wbk',
    fileType: 'PDF',
    fileSize: '1.9 MB',
    downloadUrl: '#',
    updateDate: '05 April 2026',
    description: 'Hasil evaluasi internal transparansi biaya, ketepatan waktu, dan standar etika petugas SAMSAT.'
  },
  {
    id: 'doc-6',
    title: 'Sistem Informasi Pelayanan Publik (SIPP) Komprehensif SAMSAT Banyumas',
    category: 'sipp',
    fileType: 'PDF',
    fileSize: '5.2 MB',
    downloadUrl: '#',
    updateDate: '01 Februari 2026',
    description: 'Katalog standar pelayanan publik terpadu sesuai UU No. 25 Tahun 2009 tentang Pelayanan Publik.'
  },
  {
    id: 'doc-7',
    title: 'Brosur Hak & Kewajiban Wajib Pajak Kendaraan Bermotor',
    category: 'sipp',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    downloadUrl: '#',
    updateDate: '18 Maret 2026',
    description: 'Panduan kewajiban SWDKLLJ Jasa Raharja dan rincian tarif pajak daerah.'
  },
  {
    id: 'doc-8',
    title: 'Laporan Realisasi Target Pendapatan Asli Daerah (PAD) Semester I 2026',
    category: 'pad',
    fileType: 'PDF',
    fileSize: '3.8 MB',
    downloadUrl: '#',
    updateDate: '10 Juli 2026',
    description: 'Data capaian penerimaan Pajak Kendaraan Bermotor (PKB) dan BBNKB Kabupaten Banyumas.'
  },
  {
    id: 'doc-9',
    title: 'Laporan Evaluasi Kinerja & Survei Kepuasan Masyarakat (SKM) Tahun 2025',
    category: 'evaluasi',
    fileType: 'PDF',
    fileSize: '2.9 MB',
    downloadUrl: '#',
    updateDate: '25 Januari 2026',
    description: 'Hasil Indeks Kepuasan Masyarakat (IKM) SAMSAT Banyumas dengan predikat Sangat Baik (98.4%).'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Apa saja syarat untuk bayar pajak kendaraan tahunan (STNK 1 Tahunan)?',
    answer: 'Syarat bayar pajak tahunan sangat mudah: 1) STNK Asli dan fotokopi, 2) KTP Asli pemilik sesuai nama di STNK dan fotokopi, 3) BPKB Asli (untuk verifikasi / bila diminta). Jika bayar via Drive Thru, cukup tunjukkan KTP Asli dan STNK Asli.',
    category: 'Persyaratan',
    viewCount: 4520,
    isPopular: true,
    isEnabled: true
  },
  {
    id: 'faq-2',
    question: 'Bagaimana prosedur perpanjangan STNK 5 Tahunan & Ganti Plat Nomor?',
    answer: 'Untuk perpanjangan 5 tahunan: 1) Bawa kendaraan ke area Cek Fisik SAMSAT Induk Purwokerto / Wangon, 2) Lakukan gesek nomor rangka & mesin, 3) Bawa hasil gesek fisik, STNK Asli, BPKB Asli, dan KTP Asli ke Loket Pendaftaran 5 Tahunan, 4) Lakukan pembayaran di kasir, 5) Ambil STNK baru dan Plat Nomor (TNKB) di loket penyerahan.',
    category: 'Prosedur',
    viewCount: 3890,
    isPopular: true,
    isEnabled: true
  },
  {
    id: 'faq-3',
    question: 'Apakah bisa bayar pajak kendaraan jika KTP belum balik nama / KTP beda pemilik?',
    answer: 'Untuk pembayaran pajak tahunan diutamakan menggunakan KTP asli pemilik yang tertera di STNK. Namun jika kendaraan belum di-balik nama, disarankan memanfaatkan Program Pemutihan BBNKB II (Bebas Bea Balik Nama) agar dokumen kendaraan sesuai dengan nama identitas Anda.',
    category: 'Persyaratan',
    viewCount: 2980,
    isPopular: true,
    isEnabled: true
  },
  {
    id: 'faq-4',
    question: 'Bagaimana cara bayar pajak kendaraan secara online via SIGNAL?',
    answer: 'Download aplikasi SIGNAL di Google Play / App Store, daftar akun dengan NIK & foto KTP, tambahkan data kendaraan (NRKB), lakukan pengesahan STNK digital, dan bayar via Transfer Bank / E-Wallet / QRIS. Dokumen stiker pengesahan atau E-TDPKP dapat dicetak mandiri atau dikirim ke alamat rumah via PT Pos Indonesia.',
    category: 'Layanan Digital',
    viewCount: 5120,
    isPopular: true,
    isEnabled: true
  },
  {
    id: 'faq-5',
    question: 'Dimana saja lokasi SAMSAT Keliling Banyumas dan jam berapa bukanya?',
    answer: 'SAMSAT Keliling melayani setiap hari Senin - Sabtu pukul 08.30 - 11.30 WIB di lokasi bergilir seperti Alun-Alun Banyumas, Pasar Ajibarang, Kecamatan Cilongok, Sumpiuh, dan Tambak. Anda dapat mengecek jadwal mingguan di menu "Titik Layanan" website ini.',
    category: 'Lokasi & Jadwal',
    viewCount: 3100,
    isPopular: true,
    isEnabled: true
  },
  {
    id: 'faq-6',
    question: 'Apakah ada layanan SAMSAT yang buka pada hari libur atau malam hari?',
    answer: 'Ya! SAMSAT Rita SuperMall buka setiap hari termasuk Sabtu-Minggu pukul 10.00 - 15.00 WIB. Selain itu, ada SAMSAT Malam Minggu (SamMalMu) setiap Sabtu malam pukul 18.30 - 21.00 WIB di Alun-Alun Purwokerto.',
    category: 'Lokasi & Jadwal',
    viewCount: 2750,
    isPopular: false,
    isEnabled: true
  },
  {
    id: 'faq-7',
    question: 'Berapa denda jika terlambat membayar pajak kendaraan bermotor?',
    answer: 'Denda keterlambatan PKB dihitung sebesar 25% per tahun dari pokok pajak ditambah denda SWDKLLJ Jasa Raharja (sebesar Rp 32.000 untuk sepeda motor dan Rp 100.000 untuk mobil). Selama masa Program Pemutihan Pajak, denda keterlambatan dihapuskan (GRATIS)!',
    category: 'Biaya & Denda',
    viewCount: 4100,
    isPopular: true,
    isEnabled: true
  }
];

export const INITIAL_CHATBOT_FAQS: ChatbotFAQ[] = [
  {
    id: 'bot-1',
    question: 'Cara Bayar Pajak',
    answer: 'Langkah bayar pajak tahunan:\n1. Siapkan KTP Asli & STNK Asli\n2. Datang ke SAMSAT Induk / Drive Thru / SAMSAT Keliling / BUMDes terdekat\n3. Lakukan verifikasi & pembayaran kasir\n4. Terima lembar SKPD / pengesahan STNK.\nAtau gunakan aplikasi SIGNAL / Sekpole secara full online!',
    keywords: ['bayar', 'pajak', 'cara', 'prosedur', 'alur', 'stnk'],
    category: 'Prosedur',
    isEnabled: true,
    clickCount: 1420
  },
  {
    id: 'bot-2',
    question: 'Lokasi SAMSAT',
    answer: 'SAMSAT Banyumas memiliki 10 titik layanan:\n• SAMSAT Induk Purwokerto (Jl. Prof. Dr. Suharso)\n• SAMSAT Drive Thru (Halaman SAMSAT Induk)\n• SAMSAT Pembantu Wangon\n• SAMSAT Cepat Purwokerto & Wangon\n• SAMSAT Paten Sokaraja\n• SAMSAT MPP Purwokerto\n• SAMSAT Keliling\n• SAMSAT Rita SuperMall\n• SAMSAT Malam Minggu (Alun-Alun)',
    keywords: ['lokasi', 'alamat', 'dimana', 'titik', 'kantor', 'mpp', 'mall'],
    category: 'Lokasi',
    isEnabled: true,
    clickCount: 1180
  },
  {
    id: 'bot-3',
    question: 'Jadwal SAMSAT Keliling',
    answer: 'Jadwal SAMSAT Keliling Banyumas (08.30 - 11.30 WIB):\n• Senin: Kec. Ajibarang & Kec. Sumbang\n• Selasa: Kec. Cilongok & Kec. Kembaran\n• Rabu: Kec. Wangon & Kec. Sokaraja\n• Kamis: Kec. Sumpiuh & Kec. Baturraden\n• Jumat: Kec. Jatilawang & Kec. Kedungbanteng\n• Sabtu: Kec. Patikraja & Alun-Alun Banyumas',
    keywords: ['jadwal', 'keliling', 'bus', 'mpling', 'hari', 'jam', 'waktu'],
    category: 'Jadwal',
    isEnabled: true,
    clickCount: 950
  },
  {
    id: 'bot-4',
    question: 'Download SIGNAL',
    answer: 'Aplikasi SIGNAL (Samsat Digital Nasional) adalah aplikasi resmi Korlantas Polri untuk bayar pajak kendaraan secara online nasional.\nBisa diunduh gratis di Google Play Store & Apple App Store.',
    keywords: ['signal', 'aplikasi', 'download', 'playstore', 'online', 'apk'],
    category: 'Aplikasi',
    isEnabled: true,
    clickCount: 820
  },
  {
    id: 'bot-5',
    question: 'Download Sekpole',
    answer: 'Aplikasi Sekpole (Sistem Informasi Pajak Kendaraan Online Jawa Tengah) memudahkan masyarakat Banyumas untuk cek estimasi nominal pajak, info tunggakan, dan kode bayar e-Samsat Jawa Tengah.',
    keywords: ['sekpole', 'jateng', 'cek pajak', 'estimasi', 'nomor polisi', 'pelat'],
    category: 'Aplikasi',
    isEnabled: true,
    clickCount: 740
  },
  {
    id: 'bot-6',
    question: 'Persyaratan Pajak',
    answer: 'Syarat Pajak Tahunan:\n• STNK Asli\n• KTP Asli pemilik kendaraan sesuai STNK\n\nSyarat Pajak 5 Tahunan (Ganti Plat):\n• STNK Asli & BPKB Asli\n• KTP Asli pemilik\n• Hasil Cek Fisik Kendaraan\n• Kendaraan wajib dihadirkan ke SAMSAT Induk.',
    keywords: ['syarat', 'persyaratan', 'dokumen', 'ktp', 'bpkb', 'dibawa'],
    category: 'Persyaratan',
    isEnabled: true,
    clickCount: 1350
  },
  {
    id: 'bot-7',
    question: 'Hubungi Petugas',
    answer: 'Anda dapat menghubungi Layanan Informasi & Pengaduan SAMSAT Banyumas:\n• Call Center: (0281) 635123\n• WhatsApp Resmi: 0812-2345-6789\n• Email: samsat.banyumas@jatengprov.go.id\n• jam kerja: Senin - Sabtu 08.00 - 13.00 WIB.',
    keywords: ['hubungi', 'petugas', 'kontak', 'whatsapp', 'wa', 'telepon', 'admin', 'cs'],
    category: 'Kontak',
    isEnabled: true,
    clickCount: 680
  }
];

export const INITIAL_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    phone: '081328901234',
    subject: 'Pertanyaan Balik Nama Kendaraan Antar Kota',
    message: 'Selamat pagi, saya ingin menanyakan prosedur cabut berkas mutasi masuk sepeda motor dari SAMSAT Semarang ke SAMSAT Induk Purwokerto. Mohon informasi estimasi waktu dan biayanya.',
    status: 'New',
    createdAt: '2026-08-05 09:15'
  },
  {
    id: 'msg-2',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@yahoo.com',
    phone: '085712345678',
    subject: 'Konfirmasi Jadwal SAMSAT Keliling di Cilongok',
    message: 'Apakah SAMSAT Keliling hari Selasa depan tetap hadir di depan Pasar Cilongok? Terima kasih.',
    status: 'In Progress',
    createdAt: '2026-08-04 14:30'
  },
  {
    id: 'msg-3',
    name: 'Dwi Prasetyo',
    email: 'dwiprasetyo@hotmail.com',
    phone: '081298765432',
    subject: 'Apresiasi Pelayanan Cepat SAMSAT Drive Thru',
    message: 'Saya sangat puas dengan layanan Drive Thru Purwokerto pagi ini, hanya butuh 4 menit pajak tahunan motor saya langsung selesai. Petugas sangat ramah dan efisien. Pertahankan!',
    status: 'Completed',
    createdAt: '2026-08-03 11:00'
  }
];

export const PAD_TARGETS: PADTarget[] = [
  { id: 'pad-1', year: 2026, category: 'Pajak Kendaraan Bermotor (PKB)', targetAmount: 185000000000, realizationAmount: 122500000000, percent: 66.2 },
  { id: 'pad-2', year: 2026, category: 'Bea Balik Nama Kendaraan (BBNKB)', targetAmount: 110000000000, realizationAmount: 74800000000, percent: 68.0 },
  { id: 'pad-3', year: 2026, category: 'Pajak Bahan Bakar Kendaraan (PBBKB)', targetAmount: 45000000000, realizationAmount: 31200000000, percent: 69.3 },
  { id: 'pad-4', year: 2025, category: 'Pajak Kendaraan Bermotor (PKB)', targetAmount: 175000000000, realizationAmount: 179200000000, percent: 102.4 },
  { id: 'pad-5', year: 2025, category: 'Bea Balik Nama Kendaraan (BBNKB)', targetAmount: 105000000000, realizationAmount: 108150000000, percent: 103.0 }
];

export const PERFORMANCE_REPORTS: PerformanceReport[] = [
  {
    id: 'perf-1',
    title: 'Evaluasi Kinerja Pelayanan Publik Triwulan II 2026',
    year: 2026,
    score: 98.6,
    grade: 'Sangat Baik (A+)',
    pdfUrl: '#',
    summary: 'SAMSAT Kabupaten Banyumas berhasil mencapai indeks kepuasan publik 98.6% dengan rata-rata durasi antrean pengesahan pajak 6.5 menit.'
  },
  {
    id: 'perf-2',
    title: 'Evaluasi Implementasi Zona Integritas & WBK 2025',
    year: 2025,
    score: 97.8,
    grade: 'Sangat Baik (A)',
    pdfUrl: '#',
    summary: 'Zero pengaduan pungli dan kepatuhan penuh terhadap standar pelayanan operasional terpadu.'
  }
];

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalVisitors: 148520,
  totalLocations: 10,
  totalDocuments: 9,
  totalPosters: 32,
  unreadMessages: 1,
  totalFaqs: 7,
  publicSatisfactionScore: 98.4,
  appDownloadsSignal: 18450,
  appDownloadsSekpole: 24100,
  sakpoleIntegrationClicks: 6280,
  messagesMonthly: [
    { month: 'Jan', count: 120 },
    { month: 'Feb', count: 145 },
    { month: 'Mar', count: 190 },
    { month: 'Apr', count: 210 },
    { month: 'Mei', count: 180 },
    { month: 'Jun', count: 240 },
    { month: 'Jul', count: 285 },
    { month: 'Agu', count: 310 }
  ],
  faqPopularity: [
    { question: 'Cara Bayar online SIGNAL', views: 5120 },
    { question: 'Syarat STNK 1 Tahunan', views: 4520 },
    { question: 'Denda Pajak & Pemutihan', views: 4100 },
    { question: 'Prosedur Ganti Plat 5 Tahun', views: 3890 },
    { question: 'Lokasi SAMSAT Keliling', views: 3100 }
  ],
  locationClicks: [
    { locationName: 'SAMSAT Induk Purwokerto', clicks: 8400 },
    { locationName: 'SAMSAT Drive Thru', clicks: 6200 },
    { locationName: 'SAMSAT MPP Purwokerto', clicks: 4500 },
    { locationName: 'SAMSAT Rita SuperMall', clicks: 3900 },
    { locationName: 'SAMSAT Pembantu Wangon', clicks: 2800 },
    { locationName: 'SAMSAT Keliling', clicks: 3500 }
  ]
};
