import React from 'react';
import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import { useSamsat } from '../../context/SamsatContext';
import { PageRoute } from '../../types';

const navLinks: { label: string; page: PageRoute }[] = [
  { label: 'Beranda', page: 'home' },
  { label: 'Profil UPPD', page: 'profile' },
  { label: 'Informasi Layanan', page: 'services' },
  { label: 'Informasi Publik', page: 'public-info' },
  { label: 'Pertanyaan Umum', page: 'faq' },
  { label: 'Kontak dan Pengaduan', page: 'contact' },
];

const socialLinks = [
  { name: 'Instagram', url: 'https://www.instagram.com/uppd_purwokerto', icon: Instagram },
  { name: 'Facebook', url: 'https://www.facebook.com/uppd.samsat.purwokerto', icon: Facebook },
  { name: 'YouTube', url: 'https://www.youtube.com/@uppdsamsatbanyumas6003', icon: Youtube },
  { name: 'X', url: 'https://x.com/samsat_bms', icon: Twitter },
];

export const Footer: React.FC = () => {
  const { setCurrentPage } = useSamsat();

  return (
    <footer className="bg-[#14334b] text-white">
      <div className="mx-auto max-w-[1240px] px-5 pb-7 pt-14 sm:px-8 sm:pt-[70px] lg:px-10">
        <div className="grid gap-11 border-b border-white/20 pb-12 sm:grid-cols-2 lg:grid-cols-[1.38fr_0.8fr_1fr_1.15fr] lg:gap-9">
          <div>
            <div className="inline-block bg-white px-3 py-2.5">
              <img src="/logo-bapenda.png" alt="Bapenda Provinsi Jawa Tengah" className="h-11 w-auto max-w-[190px] object-contain" loading="lazy" />
            </div>
            <h2 className="mt-6 text-[18px] font-semibold leading-[1.4] text-white">UPPD Kabupaten Banyumas</h2>
            <p className="mt-1 text-xs font-medium text-white">Badan Pengelola Pendapatan Daerah Provinsi Jawa Tengah</p>
            <p className="mt-4 max-w-[310px] text-[13px] leading-7 text-white">
              Portal informasi layanan pajak kendaraan bermotor, titik pelayanan, dan pengumuman bagi masyarakat Kabupaten Banyumas.
            </p>
          </div>

          <nav aria-label="Navigasi footer">
            <h3 className="mb-5 border-b border-white/20 pb-3 text-[13px] font-semibold text-white">Navigasi</h3>
            <ul className="space-y-3">
              {navLinks.map(({ label, page }) => (
                <li key={page}>
                  <button type="button" onClick={() => setCurrentPage(page)} className="text-left text-[13px] leading-5 text-white transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{label}</button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-5 border-b border-white/20 pb-3 text-[13px] font-semibold text-white">Akses layanan</h3>
            <p className="text-[13px] leading-6 text-white">Cari lokasi, jam pelayanan, dan informasi persyaratan melalui halaman layanan.</p>
            <button type="button" onClick={() => setCurrentPage('services')} className="mt-5 inline-flex items-center gap-2 border-b border-[#7db8df] pb-1.5 text-[13px] font-semibold text-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Lihat direktori layanan <ArrowUpRight size={15} aria-hidden="true" />
            </button>
            <div className="mt-6 flex items-start gap-2 text-[12px] leading-5 text-white">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#9ac4e0]" aria-hidden="true" />
              <span>Kabupaten Banyumas, Jawa Tengah</span>
            </div>
          </div>

          <div>
            <h3 className="mb-5 border-b border-white/20 pb-3 text-[13px] font-semibold text-white">Kontak</h3>
            <div className="space-y-4 text-[13px]">
              <a href="tel:+62281637801" className="flex items-start gap-3 text-white hover:text-white focus-visible:outline-2 focus-visible:outline-white"><Phone size={17} className="mt-0.5 shrink-0 text-[#9ac4e0]" aria-hidden="true" /><span>(0281) 637801</span></a>
              <a href="mailto:Up3adbms@gmail.com" className="flex items-start gap-3 break-all text-white hover:text-white focus-visible:outline-2 focus-visible:outline-white"><Mail size={17} className="mt-0.5 shrink-0 text-[#9ac4e0]" aria-hidden="true" /><span>Up3adbms@gmail.com</span></a>
              <button type="button" onClick={() => setCurrentPage('contact')} className="inline-flex items-center gap-2 text-left font-medium text-white hover:text-white focus-visible:outline-2 focus-visible:outline-white">Halaman kontak & pengaduan <ArrowUpRight size={15} aria-hidden="true" /></button>
            </div>
            <div className="mt-7 flex items-center gap-2" aria-label="Media sosial">
              {socialLinks.map(({ name, url, icon: Icon }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`Buka ${name} UPPD Banyumas`} className="flex h-9 w-9 items-center justify-center border border-white/25 text-white transition-colors hover:border-white/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Icon size={16} aria-hidden="true" /></a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-[11px] leading-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} UPPD Kabupaten Banyumas · Bapenda Provinsi Jawa Tengah</p>
        </div>
      </div>
    </footer>
  );
};

