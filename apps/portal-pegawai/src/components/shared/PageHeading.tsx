import React from 'react';
import { useSamsat } from '../../context/SamsatContext';

type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
};

/** Header editorial yang sama untuk setiap halaman publik. */
export const PageHeading: React.FC<PageHeadingProps> = ({ eyebrow, title, description, className = '' }) => {
  const { setCurrentPage } = useSamsat();
  return (
    <header className={`border-b border-[#d9e3e9] pb-8 sm:pb-9 ${className}`}>
      <nav className="mb-7 flex flex-wrap items-center gap-2 text-xs text-[#6c7d89]" aria-label="Breadcrumb">
        <button type="button" onClick={() => setCurrentPage('home')} className="text-[#425f75] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]">Beranda</button>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-semibold text-[#213f55]">{title}</span>
      </nav>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#005BAC]">{eyebrow}</p>
      <h1 className="max-w-[830px] text-[30px] font-bold leading-[1.18] tracking-[-0.025em] text-[#19364b] sm:text-[39px]">{title}</h1>
      <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-[#586e7e]">{description}</p>
    </header>
  );
};
