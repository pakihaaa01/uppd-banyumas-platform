import React from 'react';
import { EditorialAccordion } from '../../shared/EditorialAccordion';

/** Konten periode 2018–2023 dipertahankan dari arsip project, hanya penyajiannya yang diubah. */
const missionItems = [
  'Membangun masyarakat Jawa Tengah yang religius, toleran dan guyub untuk menjaga Negara Kesatuan Republik Indonesia',
  'Mempercepat reformasi birokrasi yang dinamis serta memperluas sasaran ke pemerintahan Kabupaten/Kota',
  'Memperkuat kapasitas ekonomi rakyat dan membuka lapangan kerja baru untuk mengurangi kemiskinan dan pengangguran',
  'Menjadikan rakyat Jawa Tengah lebih sehat, lebih pintar, lebih berbudaya dan mencintai lingkungan',
];

const flagshipPrograms = [
  { title: 'Pendidikan, demokrasi, dan pelatihan siswa', description: 'Sekolah tanpa sekat; pelatihan tentang demokrasi dan pemilu, gender, anti korupsi dan magang gubernur untuk siswa SMA/SMK;' },
  { title: 'Peran rumah ibadah dan pendidik keagamaan', description: 'Peningkatan peran rumah ibadah, fasilitasi pendakwah dan guru ngaji;' },
  { title: 'Reformasi birokrasi dan layanan terintegrasi', description: 'Reformasi birokrasi di kabupaten/kota yang dinamis berbasis teknologi informasi dan sistem layanan terintegrasi;' },
  { title: 'Pengentasan kemiskinan dan bantuan desa', description: 'Satgas kemiskinan, bantuan desa, rumah sederhana layak huni;' },
  { title: 'Pembiayaan daerah dan penguatan usaha masyarakat', description: 'Obligasi daerah, kemudahan akses kredit UMKM, penguatan BUMDes dan pelatihan startup untuk Wirausaha Muda;' },
  { title: 'Perlindungan petani dan nelayan', description: 'Menjaga harga komoditas dan asuransi gagal panen untuk petani serta melindungi kepentingan nelayan;' },
  { title: 'Transportasi dan pembangunan infrastruktur', description: 'Pengembangan transportasi massal, revitaliasi jalur kereta dan bandara serta pembangunan embung/irigasi;' },
  { title: 'Kawasan industri dan pertanian terintegrasi', description: 'Pembukaan kawasan industri baru dan rintisan pertanian terintegrasi; Afirmasi kebijakan tumbuhnya kawasan industri baru di perbatasan barat dan selatan, dalam mempercepat proses persebaran pusat-pusat pertumbuhan ekonomi.' },
  { title: 'Kesehatan dan akses pendidikan', description: 'Rumah sakit tanpa dinding, sekolah biaya pemerintah khusus untuk siswa miskin (SMAN, SMKN, SLB) dan bantuan sekolah swasta, ponpes, madrasah dan difabel;' },
  { title: 'Kebudayaan, olahraga, dan lingkungan', description: 'Festival seni serta pengembangan infrastruktur olahraga, rumah kebudayaan dan kepedulian lingkungan.' },
];

const operationalTargets = [
  {
    title: 'Masyarakat religius, toleran dan guyub',
    details: [
      ['Tujuan', 'Membangun masyarakat yang semakin religius, toleran, dan guyub.'],
      ['Sasaran', 'Terciptanya kohesi sosial masyarakat secara utuh.'],
      ['Indikator', 'Indeks toleransi terjaga & persentase tindak pidana SARA tertangani.'],
    ],
  },
  {
    title: 'Reformasi birokrasi yang dinamis',
    details: [
      ['Tujuan', 'Mewujudkan tata kelola pemerintahan yang baik & bersih (Good Governance).'],
      ['Sasaran', 'Meningkatnya kualitas pelayanan publik, efektivitas manajemen, dan profesionalitas ASN.'],
    ],
  },
  {
    title: 'Kapasitas ekonomi & lapangan kerja',
    details: [
      ['Tujuan', 'Menurunkan kemiskinan merata & stabilitas ekonomi daerah yang inklusif.'],
      ['Sasaran', 'Kualitas hidup penduduk miskin naik, pengangguran terbuka turun, sektor unggulan & investasi tumbuh.'],
    ],
  },
  {
    title: 'Kualitas SDM & kelestarian lingkungan',
    details: [
      ['Tujuan', 'Membangun SDM berkualitas (IPM) & SDA yang lestari (IKLH).'],
      ['Sasaran', 'Meningkatnya derajat kesehatan, tingkat pendidikan masyarakat, serta kualitas air, udara & tutupan hutan.'],
    ],
  },
];

const sectionClass = 'border-t border-[#e1e8ed] pt-7';

export const ProfileVision: React.FC = () => (
  <div className="space-y-9">
    <header className="border-b border-[#e2eaf0] pb-5">
      <h2 className="text-2xl font-semibold text-[#1d3b53]">Visi &amp; Misi UPPD Purwokerto</h2>
      <p className="mt-2 text-sm leading-6 text-black">Landasan kerja operasional dalam melayani masyarakat Kabupaten Banyumas.</p>
    </header>

    <section aria-labelledby="vision-title">
      {/* Timpa file JPG pada path berikut dengan foto batik Anda; overlay gelap tetap diterapkan otomatis. */}
      <div
        className="relative isolate flex min-h-[295px] flex-col items-center justify-center overflow-hidden rounded-md bg-[#153955] bg-cover bg-center p-7 text-center sm:min-h-[355px] sm:p-10"
        style={{ backgroundImage: "url('/images/batik-visi.jpg')" }}
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071d2f]/86 via-[#102d43]/72 to-[#071d2f]/84" />
        <p className="text-sm font-semibold text-white sm:text-base">Visi Pembangunan Jawa Tengah 2018-2023</p>
        <h3 id="vision-title" className="mt-4 max-w-[680px] text-[26px] font-bold leading-[1.25] tracking-[-0.02em] text-white sm:text-[34px] lg:text-[38px]">
          “Menuju Jawa Tengah Sejahtera dan Berdikari”
        </h3>
        <p className="mt-6 border-t border-white/35 pt-4 text-sm font-semibold italic text-white sm:text-base">
          Tetep Mboten Korupsi, Mboten Ngapusi
        </p>
      </div>
      <p className="mt-6 text-[14px] leading-7 text-black">
        Visi pembangunan daerah Jawa Tengah tahun 2018-2023 merupakan keberlanjutan dari cita-cita pembangunan Jawa Tengah tahun 2013-2018. Makna yang terkandung dalam visi sebagai berikut:
      </p>
      <div className="mt-5">
        <EditorialAccordion headingLevel="h4" items={[
          {
            id: 'vision-sejahtera', title: 'Sejahtera', eyebrow: 'Makna visi',
            content: <p className="text-justify">Masyarakat Jawa Tengah Sejahtera adalah masyarakat yang tercukupi segala kebutuhan dasarnya secara adil dan merata berprinsip pada peri kemanusiaan dan peri keadilan. Masyarakat sejahtera juga terbebas dari ketidakmerdekaan, kebodohan, kesakitan, kelaparan, serta ancaman dari perlakuan atau tindak kekerasan fisik maupun non fisik. Dalam lingkungan masyarakat yang sejahtera akan tercipta hubungan sosial yang nyaman dan aman, tanpa adanya diskriminasi SARA, serta tercipta relasi yang dinamis, saling menghargai, saling pengertian, dan toleransi yang tinggi. Ketercukupan kebutuhan masyarakat didukung pemenuhan prasarana dasar, pelayanan publik, dan teknologi secara menerus.</p>,
          },
          {
            id: 'vision-berdikari', title: 'Berdikari', eyebrow: 'Makna visi',
            content: <p className="text-justify">Berdikari merupakan sebuah tujuan agar masyarakat mampu memenuhi segala kebutuhan dasarnya secara mandiri dan cukup. Dengan begitu, berdikari menjadi sebuah metode untuk mewujudkan kesejahteraan masyarakat dan lingkungan hidupnya berbasis modal pokok milik sendiri, baik sumberdaya alam, manusia, sosial, budaya, ekonomi, dan politik. Sedangkan sumberdaya yang berasal dari luar merupakan tambahan apabila diperlukan.</p>,
          },
        ]} initialOpen="vision-sejahtera" />
      </div>
      <p className="mt-5 border-l-[3px] border-[#005BAC] bg-[#f4f8fb] px-5 py-4 text-[14px] leading-7 text-black">
        Perwujudan masyarakat Jawa Tengah yang sejahtera dan berdikari dilandasi semangat dan nilai utama <strong className="font-semibold text-[#005BAC] italic">Mboten Korupsi, Mboten Ngapusi</strong>. Nilai ini dimanifestasi dalam sikap, tindakan, dan laku seluruh masyarakat Jawa Tengah untuk dapat bersama mencapai kesejahteraan yang berdikari.
      </p>
    </section>

    <section className={sectionClass} aria-labelledby="mission-title">
      <h3 id="mission-title" className="text-xl font-semibold text-[#1d3b53]">Misi Pembangunan</h3>
      <p className="my-4 text-[14px] leading-7 text-black">Dalam rangka upaya menuju pencapaian visi pembangunan daerah Jawa Tengah tahun 2018-2023, ditetapkan misi pembangunan daerah yaitu:</p>
      <EditorialAccordion headingLevel="h4" items={missionItems.map((mission, index) => ({
        id: `mission-${index + 1}`,
        eyebrow: `Misi ${index + 1}`,
        title: [
          'Masyarakat religius, toleran dan guyub',
          'Reformasi birokrasi yang dinamis',
          'Ekonomi rakyat dan lapangan kerja',
          'Kesehatan, pendidikan, budaya, dan lingkungan',
        ][index],
        content: <p>{mission}</p>,
      }))} />
    </section>

    <section className={sectionClass} aria-labelledby="flagship-title">
      <h3 id="flagship-title" className="text-xl font-semibold text-[#1d3b53]">Program Unggulan</h3>
      <p className="my-4 text-[14px] leading-7 text-black">Program unggulan Gubernur dan Wakil Gubernur Jawa Tengah tahun 2018-2019 harus diimplementasikan yaitu:</p>
      <EditorialAccordion headingLevel="h4" items={flagshipPrograms.map((program, index) => ({
        id: `program-${index + 1}`,
        eyebrow: `Program ${String(index + 1).padStart(2, '0')}`,
        title: program.title,
        content: <p>{program.description}</p>,
      }))} />
    </section>

    <section className={sectionClass} aria-labelledby="targets-title">
      <h3 id="targets-title" className="text-xl font-semibold text-[#1d3b53]">Tujuan dan Sasaran Operasional</h3>
      <p className="my-4 text-[14px] leading-7 text-black">Agar visi dan misi pembangunan daerah Jawa Tengah tahun 2018-2023 lebih terarah dalam implementasinya, misi tersebut dijabarkan secara operasional ke dalam <strong>6 Tujuan</strong> dan <strong>10 Sasaran</strong> beserta indikator kinerjanya sebagai berikut:</p>
      <EditorialAccordion headingLevel="h4" items={operationalTargets.map((target, index) => ({
        id: `target-${index + 1}`,
        eyebrow: `Bagian ${index + 1}`,
        title: target.title,
        content: <dl className="space-y-4">{target.details.map(([label, value]) => (
          <div key={label} className="sm:grid sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-4">
            <dt className="font-semibold text-[#24465c]">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}</dl>,
      }))} />
    </section>

    <figure className={sectionClass}>
      <img src="/images/visi-misi.jpg" alt="Dokumentasi visi dan misi UPPD Banyumas" loading="lazy" className="mx-auto h-auto w-full max-w-4xl border border-[#e2e8ee] object-contain" />
    </figure>
  </div>
);

