import React from 'react';
import { ArrowRight, FileCheck2, MapPinned, MessageCircleQuestion } from 'lucide-react';
import { useSamsat } from '../../context/SamsatContext';

/** Mengganti klaim promosi yang belum terverifikasi dengan panduan praktis. */
export const WhyChooseUs: React.FC = () => {
  const { setCurrentPage } = useSamsat();
  const steps = [
    { number: '01', title: 'Kenali jenis layanan', desc: 'Pastikan kebutuhan Anda adalah pembayaran pajak tahunan, pengesahan STNK, atau layanan administrasi lainnya.', icon: FileCheck2 },
    { number: '02', title: 'Periksa lokasi pelayanan', desc: 'Cermati lokasi dan jam operasional titik SAMSAT yang sesuai dengan layanan yang diperlukan.', icon: MapPinned },
    { number: '03', title: 'Siapkan dokumen', desc: 'Baca ketentuan dan persyaratan yang berlaku agar proses pelayanan dapat berlangsung lancar.', icon: MessageCircleQuestion },
  ];

  return (
    <section aria-labelledby="service-guide-title" className="bg-white py-16 sm:py-20 lg:py-[88px]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.45fr] lg:gap-16 lg:px-10">
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#005BAC]">Panduan masyarakat</p>
          <h2 id="service-guide-title" className="max-w-[380px] text-[26px] font-bold leading-tight tracking-[-0.025em] text-[#172f43] sm:text-[34px]">Sebelum datang ke SAMSAT</h2>
          <p className="mt-4 max-w-[365px] text-sm leading-7 text-[#617482]">Beberapa hal yang sebaiknya Anda periksa untuk mempersiapkan kunjungan pelayanan.</p>
          <button type="button" onClick={() => setCurrentPage('services')} className="mt-6 inline-flex min-h-10 items-center gap-2 border-b-2 border-[#005BAC] text-[13px] font-semibold text-[#005BAC] hover:text-[#003e77] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]">Buka panduan lengkap <ArrowRight size={16} aria-hidden="true" /></button>
        </div>
        <ol className="border-t border-[#dce5eb]">
          {steps.map(({ number, title, desc, icon: Icon }) => (
            <li key={number} className="grid grid-cols-[38px_1fr] gap-4 border-b border-[#dce5eb] py-6 sm:grid-cols-[48px_1fr_30px] sm:gap-5 sm:py-7">
              <span className="text-sm font-semibold text-[#005BAC]">{number}</span>
              <div><h3 className="text-[16px] font-semibold text-[#1a354b] sm:text-[17px]">{title}</h3><p className="mt-2 max-w-[475px] text-[13px] leading-6 text-[#607685]">{desc}</p></div>
              <Icon className="hidden h-6 w-6 text-[#7292a9] sm:block" strokeWidth={1.5} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
