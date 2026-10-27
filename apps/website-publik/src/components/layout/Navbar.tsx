import {PublicNotifications} from './PublicNotifications';
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronRight, Menu, X } from 'lucide-react';
import { useSamsat } from '../../context/SamsatContext';
import type { PageRoute } from '../../types';
import { goToServiceSection } from '../../utils/serviceNavigation';

const navItems: { label: string; route: PageRoute }[] = [
  { label: 'Beranda', route: 'home' },
  { label: 'Profil', route: 'profile' },
  { label: 'Layanan', route: 'services' },
  { label: 'Informasi Publik', route: 'public-info' },
  { label: 'FAQ', route: 'faq' },
  { label: 'Kontak', route: 'contact' },
];

/**
 * Header institusi: identitas dan navigasi lebih diutamakan daripada efek
 * visual. Seluruh navigasi tetap memakai state dari SamsatContext.
 */
export const Navbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
  } = useSamsat();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setMobileMenuOpen(false);};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[]);

  const navigate = (route: PageRoute) => {
    setCurrentPage(route);
    setMobileMenuOpen(false);
  };

  const openTaxService = () => {
    setMobileMenuOpen(false);
    goToServiceSection(setCurrentPage, 'cek-pajak');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#dfe6ec] bg-white text-[#20344a] shadow-[0_2px_12px_rgba(15,36,54,0.045)]">
      {/* Baris identitas pemerintah - hanya di tablet dan desktop. */}
      <div className="hidden h-[27px] bg-[#153955] text-white md:block">
        <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between gap-4 px-5 text-[10px] font-medium tracking-[0.035em] sm:px-8 lg:px-10">
          <span>PORTAL INFORMASI & PELAYANAN PUBLIK</span>
          <span className="text-white/85">Bapenda Provinsi Jawa Tengah</span>
        </div>
      </div>

      <div className="mx-auto flex h-[74px] max-w-[1320px] items-center justify-between gap-2 px-3 sm:gap-3 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={() => navigate('home')}
          aria-label="UPPD Kabupaten Banyumas, ke beranda"
          className="flex min-w-0 shrink-0 items-center gap-1.5 rounded-sm text-left sm:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#005BAC]"
        >
          <img src="/logo-bapenda.png" alt="Bapenda Jawa Tengah" className="h-7 w-auto max-w-[84px] object-contain sm:h-11 sm:max-w-[132px]" />
          <span className="h-8 w-px bg-[#d8e0e7] sm:h-10" aria-hidden="true" />
          <span className="block max-w-[95px] sm:max-w-[170px]">
            <span className="block text-[11px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[14px]">UPPD Kabupaten Banyumas</span>
            <span className="mt-0.5 hidden text-[10px] font-medium leading-tight text-black sm:block">SAMSAT Purwokerto</span>
          </span>
        </button>

        <nav className="hidden h-full items-stretch gap-0.5 xl:flex" aria-label="Navigasi utama">
          {navItems.map(({ label, route }) => {
            const active = currentPage === route;
            return (
              <button
                key={route}
                type="button"
                onClick={() => navigate(route)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-full items-center px-3 text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#005BAC] ${active ? 'text-[#005BAC]' : 'text-black hover:text-[#005BAC]'}`}
              >
                {label}
                {active && <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-[3px] bg-[#005BAC]" />}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <PublicNotifications />

          <button
            type="button"
            onClick={openTaxService}
            className="hidden h-10 items-center gap-2 rounded-md bg-[#005BAC] px-3.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#004781] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC] lg:inline-flex"
          >
            Cek Pajak <ArrowUpRight size={15} aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-controls="navbar-mobile-menu"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            onClick={() => { setMobileMenuOpen(!mobileMenuOpen); }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#dce5eb] text-[#203b52] hover:bg-[#f3f7fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC] xl:hidden"
          >
            {mobileMenuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav id="navbar-mobile-menu" aria-label="Navigasi layar kecil" className="max-h-[calc(100dvh-74px)] overflow-y-auto border-t border-[#e6ebef] bg-white px-4 py-3 shadow-md sm:px-8 xl:hidden">
          <div className="mx-auto max-w-[1240px]">
            {navItems.map(({ label, route }) => (
              <button
                type="button"
                key={route}
                onClick={() => navigate(route)}
                aria-current={currentPage === route ? 'page' : undefined}
                className={`flex w-full items-center justify-between border-b border-[#eff2f4] px-2 py-3.5 text-left text-sm font-medium ${currentPage === route ? 'text-[#005BAC]' : 'text-[#2c4356]'}`}
              >
                {label} <ChevronRight size={16} className="text-black" aria-hidden="true" />
              </button>
            ))}
            <button type="button" onClick={openTaxService} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#005BAC] px-4 py-3 text-sm font-semibold text-white lg:hidden">
              Cek Pajak Kendaraan <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};


