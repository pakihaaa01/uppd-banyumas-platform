import React from 'react';
import { useSamsat } from '../../context/SamsatContext';

/** Ringkasan jumlah konten portal; bukan angka kinerja atau survei yang belum diverifikasi. */
export const PublicSatisfactionStats: React.FC = () => {
  const { serviceLocations, faqs, announcements } = useSamsat();
  const items = [
    { number: serviceLocations.length, title: 'Titik pelayanan', caption: 'Entri lokasi dalam direktori layanan' },
    { number: announcements.length, title: 'Pengumuman', caption: 'Informasi yang ditampilkan di portal' },
    { number: faqs.length, title: 'Pertanyaan umum', caption: 'Jawaban yang tersedia di halaman FAQ' },
  ];

  return (
    <section aria-labelledby="public-stats-title" className="border-y border-[#dde5eb] bg-[#f3f6f8] py-14 sm:py-16 lg:py-[74px]">
      <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.5fr] lg:gap-14 lg:px-10">
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#005BAC]">Sekilas portal</p>
          <h2 id="public-stats-title" className="text-[25px] font-bold leading-tight tracking-[-0.02em] text-[#172f43] sm:text-[30px]">Informasi yang tersedia</h2>
          <p className="mt-3 max-w-[345px] text-sm leading-7 text-[#617482]">Ringkasan konten pelayanan yang dapat Anda akses melalui website ini.</p>
        </div>
        <div className="grid gap-6 border-t-[3px] border-[#005BAC] pt-6 sm:grid-cols-3 sm:gap-5">
          {items.map((item) => (
            <div key={item.title} className="border-b border-[#dce4eb] pb-5 sm:border-b-0 sm:border-l sm:pl-5">
              <p className="text-[38px] font-semibold leading-none tracking-[-0.045em] text-[#123955] sm:text-[43px]">{item.number.toLocaleString('id-ID')}</p>
              <h3 className="mt-4 text-[13px] font-semibold text-[#1b3448]">{item.title}</h3>
              <p className="mt-1 max-w-[180px] text-[12px] leading-5 text-[#657b89]">{item.caption}</p>
            </div>
          ))}
          <p className="text-[11px] leading-5 text-[#6c7f8b] sm:col-span-3">* Jumlah di atas berasal dari data konten portal, bukan statistik jumlah pengunjung atau hasil survei kepuasan masyarakat.</p>
        </div>
      </div>
    </section>
  );
};
