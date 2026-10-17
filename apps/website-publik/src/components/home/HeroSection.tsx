import React, { useEffect, useState } from 'react';
import { useSamsat } from '../../context/SamsatContext';
import { goToServiceSection } from '../../utils/serviceNavigation';

/**
 * GANTI FOTO SENDIRI:
 * Taruh tiga gambar JPG di public/images/slider/ dengan nama 01.jpg, 02.jpg, dan 03.jpg.
 * Urutan slideshow ditentukan di sini. Lihat README_FOTO_SLIDESHOW.md.
 */
const heroPhotos = [
  { src: '/images/slider/01.jpg', label: 'Foto pelayanan 1' },
  { src: '/images/slider/02.jpg', label: 'Foto pelayanan 2' },
  { src: '/images/slider/03.jpg', label: 'Foto pelayanan 3' },
];

export const HeroSection: React.FC = () => {
  const { setCurrentPage } = useSamsat();
  const [activeIndex, setActiveIndex] = useState(0);
  // Foto berganti otomatis; tanpa kontrol navigasi atau tombol jeda.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroPhotos.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      aria-labelledby="hero-title"
      aria-roledescription="carousel"
      className="relative isolate flex min-h-[620px] items-center overflow-hidden bg-[#12314a] text-white sm:min-h-[670px] lg:min-h-[720px]"
    >
      <div className="absolute inset-0 -z-10">
        {heroPhotos.map((photo, index) => (
          <div
            key={photo.src}
            aria-hidden="true"
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 motion-reduce:transition-none ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url('${photo.src}')` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#082237]/95 via-[#11324b]/82 to-[#0f2d44]/38" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09243a]/55 via-transparent to-[#09243a]/18" />
      </div>
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#005BAC]" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-12 pt-[155px] sm:px-8 sm:pb-16 sm:pt-[170px] lg:px-10 lg:pb-20 lg:pt-[186px]">
        <div className="max-w-[690px]">
          <div className="mb-6 flex items-start gap-3">
            <span className="mt-[9px] h-[2px] w-7 shrink-0 bg-[#8fc2e5]" aria-hidden="true" />
            <p className="max-w-[500px] text-[11px] font-semibold uppercase leading-5 tracking-[0.12em] text-[#d0e6f5] sm:text-xs">
              Unit Pengelolaan Pendapatan Daerah Kabupaten Banyumas
            </p>
          </div>
          <h1 id="hero-title" className="max-w-[670px] text-[clamp(2.2rem,4.4vw,4.05rem)] font-bold leading-[1.12] tracking-[-0.035em] text-white">
            Informasi dan Pelayanan <span className="text-[#c5e6fc]">Pajak Kendaraan</span> di Banyumas
          </h1>
          <p className="mt-6 max-w-[560px] text-[15px] leading-[1.9] text-[#e0eaf1] sm:text-[16px]">
            Akses informasi persyaratan, prosedur, lokasi SAMSAT, dan layanan digital pajak kendaraan bermotor melalui satu halaman.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => goToServiceSection(setCurrentPage, 'cek-pajak')}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-6 py-3 text-[13px] font-semibold text-[#123b5d] transition-colors hover:bg-[#eaf3f9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Cek Pajak Kendaraan
            </button>
            <button
              type="button"
              onClick={() => goToServiceSection(setCurrentPage, 'layanan-digital')}
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/55 bg-[#143c59]/45 px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#153c5a]/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Layanan Digital SAMSAT
            </button>
          </div>
          <p className="mt-9 max-w-[560px] border-t border-white/30 pt-4 text-[12px] leading-5 text-[#d9e6ef]">
            Pelayanan untuk masyarakat Kabupaten Banyumas dan sekitarnya, Provinsi Jawa Tengah.
          </p>
        </div>


      </div>
    </section>
  );
};
