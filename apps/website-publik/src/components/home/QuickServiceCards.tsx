import React from 'react';
import { ArrowRight, ArrowUpRight, FileText, MapPin, Store, Smartphone, HelpCircle, ReceiptText } from 'lucide-react';
import { useSamsat } from '../../context/SamsatContext';
import { goToServiceSection } from '../../utils/serviceNavigation';

/** Direktori layanan: dua kebutuhan utama, diikuti empat akses pendukung. */
export const QuickServiceCards: React.FC = () => {
  const { setCurrentPage } = useSamsat();

  const primaryServices = [
    {
      number: '01',
      title: 'Panduan Pembayaran Pajak',
      description: 'Pelajari alur pelayanan, dokumen yang perlu disiapkan, dan ketentuan administrasi kendaraan bermotor.',
      link: 'Baca panduan layanan',
      icon: FileText,
      action: () => goToServiceSection(setCurrentPage, 'alur-pelayanan'),
    },
    {
      number: '02',
      title: 'Lokasi & Jadwal SAMSAT',
      description: 'Temukan kantor SAMSAT, gerai pelayanan, dan informasi jam operasional di wilayah Kabupaten Banyumas.',
      link: 'Cari titik pelayanan',
      icon: MapPin,
      action: () => goToServiceSection(setCurrentPage, 'lokasi-pelayanan'),
    },
  ];

  const otherServices = [
    {
      title: 'Gerai SAMSAT & BUMDes',
      desc: 'Pilihan titik pelayanan lainnya',
      icon: Store,
      action: () => goToServiceSection(setCurrentPage, 'gerai-samsat'),
    },
    {
      title: 'Aplikasi SIGNAL',
      desc: 'Informasi layanan Samsat Digital Nasional',
      icon: Smartphone,
      action: () => goToServiceSection(setCurrentPage, 'layanan-digital'),
    },
    {
      title: 'Layanan SAKPOLE',
      desc: 'Akses layanan digital Samsat Jawa Tengah',
      icon: ReceiptText,
      action: () => goToServiceSection(setCurrentPage, 'layanan-digital'),
    },
    {
      title: 'Pertanyaan Umum',
      desc: 'Jawaban pertanyaan seputar pelayanan',
      icon: HelpCircle,
      action: () => setCurrentPage('faq'),
    },
  ];

  return (
    <section aria-labelledby="quick-services-title" className="border-b border-[#e4eaf0] bg-[#f7f9fb] py-16 sm:py-20 lg:py-[90px]">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="mb-9 flex flex-col gap-4 sm:mb-11 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[670px]">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#005BAC]">Akses pelayanan</p>
            <h2 id="quick-services-title" className="text-[26px] font-bold leading-tight tracking-[-0.025em] text-[#172f43] sm:text-[34px]">Apa yang ingin Anda urus?</h2>
            <p className="mt-3 text-sm leading-7 text-black sm:text-[15px]">Pilih informasi sesuai kebutuhan Anda sebelum datang ke kantor atau menggunakan layanan digital.</p>
          </div>
          <span className="border-l-2 border-[#005BAC] pl-3 text-xs leading-5 text-black">Layanan pajak kendaraan bermotor<br />di Kabupaten Banyumas</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {primaryServices.map(({ number, title, description, link, icon: Icon, action }) => (
            <button
              type="button"
              key={number}
              onClick={action}
              className="group flex min-h-[245px] flex-col items-start border border-[#dce5eb] bg-white p-6 text-left transition-colors hover:border-[#96b8d4] hover:bg-[#fcfdff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC] sm:p-8"
            >
              <div className="flex w-full items-start justify-between">
                <Icon className="h-7 w-7 text-[#005BAC]" strokeWidth={1.6} aria-hidden="true" />
                <span className="text-[12px] font-medium tracking-[0.09em] text-black">{number} / 06</span>
              </div>
              <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.015em] text-[#1b3348]">{title}</h3>
              <p className="mt-2 max-w-[445px] text-[13px] leading-6 text-black sm:text-sm">{description}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[12px] font-semibold text-[#005BAC]">{link}<ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-px border border-[#dce5eb] bg-[#dce5eb] sm:grid-cols-2 lg:grid-cols-4">
          {otherServices.map(({ title, desc, icon: Icon, action }) => (
            <button
              key={title}
              type="button"
              onClick={action}
              className="group flex min-h-[174px] flex-col items-start bg-white p-5 text-left transition-colors hover:bg-[#f0f6fa] focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#005BAC] sm:p-6"
            >
              <div className="flex w-full items-center justify-between">
                <Icon size={23} strokeWidth={1.6} className="text-[#005BAC]" aria-hidden="true" />
                <ArrowUpRight size={17} className="text-black transition-colors group-hover:text-[#005BAC]" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-[14px] font-semibold text-[#20394e]">{title}</h3>
              <p className="mt-1 text-[12px] leading-5 text-black">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

