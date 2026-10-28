import React, { useMemo, useState } from 'react';
import { EditorialAccordion } from '../shared/EditorialAccordion';
import { useSamsat } from '../../context/SamsatContext';
import { PageHeading } from '../shared/PageHeading';

/** Daftar tanya jawab informatif tanpa banner animasi dan maskot dekoratif. */
export const FaqPage: React.FC = () => {
  const { faqs, setCurrentPage } = useSamsat();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = useMemo(() => [
    'Semua', ...Array.from(new Set(faqs.filter((item) => item.isEnabled).map((item) => item.category))),
  ], [faqs]);

  const filteredFaqs = useMemo(() => {
    const term = searchQuery.trim().toLocaleLowerCase('id-ID');
    return faqs.filter((faq) =>
      faq.isEnabled &&
      (selectedCategory === 'Semua' || faq.category === selectedCategory) &&
      (!term || `${faq.question} ${faq.answer}`.toLocaleLowerCase('id-ID').includes(term))
    );
  }, [faqs, searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#f7f9fb] pb-24 pt-[112px] md:pt-[140px]">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <PageHeading
          eyebrow="Pusat bantuan"
          title="Pertanyaan yang Sering Diajukan"
          description="Jawaban atas pertanyaan umum mengenai persyaratan, proses pelayanan, lokasi, dan layanan digital SAMSAT di wilayah Banyumas."
        />
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-[132px]">
            <div className="border border-[#dce5eb] bg-white p-5">
              <h2 className="text-[14px] font-bold text-[#1d3b53]">Cari informasi</h2>
              <label htmlFor="faq-search" className="mt-4 block text-xs font-semibold text-black">Kata kunci pertanyaan</label>
              <input id="faq-search" type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Contoh: pajak tahunan" className="mt-2 w-full rounded-md border border-[#ccd9e2] bg-white px-3 py-3 text-sm outline-none placeholder:text-black focus:border-[#005BAC] focus:ring-2 focus:ring-[#e5f0f9]" />
              <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-[0.08em] text-black">Kategori</h3>
              <div className="flex flex-wrap gap-2 lg:flex-col" role="group" aria-label="Filter kategori FAQ">
                {categories.map((category) => (
                  <button key={category} type="button" aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}
                    className={`rounded-md border px-3 py-2.5 text-left text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC] ${selectedCategory === category ? 'border-[#005BAC] bg-[#eaf3fa] text-[#005BAC]' : 'border-[#dce5eb] bg-white text-black hover:border-[#005BAC] hover:text-[#005BAC]'}`}>
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-l-[3px] border-[#005BAC] bg-[#edf4f9] p-5">
              <h2 className="text-sm font-bold text-[#1a3a53]">Belum menemukan jawaban?</h2>
              <p className="mt-2 text-[13px] leading-6 text-black">Lihat kanal kontak untuk bertanya langsung kepada pihak layanan.</p>
              <button type="button" onClick={() => setCurrentPage('contact')} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#005BAC] hover:underline">Lihat kontak</button>
            </div>
          </aside>
          <section aria-label="Daftar pertanyaan" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[20px] font-bold text-[#1d3b53]">Daftar Tanya Jawab</h2>

            </div>
            {filteredFaqs.length ? (
              <EditorialAccordion
                headingLevel="h3"
                items={filteredFaqs.map((faq) => ({
                  id: faq.id,
                  title: faq.question,
                  eyebrow: faq.category,
                  content: <p className="whitespace-pre-line">{faq.answer}</p>,
                }))}
              />
            ) : (
              <div className="border border-[#dce5eb] bg-white px-7 py-10">
                <h3 className="font-semibold text-[#1e3c53]">Pertanyaan tidak ditemukan</h3>
                <p className="mt-2 text-sm text-black">Coba kata kunci lain atau pilih kategori berbeda.</p>
                <button type="button" onClick={() => { setSearchQuery(''); setSelectedCategory('Semua'); }} className="mt-5 text-sm font-semibold text-[#005BAC] underline">Reset pencarian</button>
              </div>
            )}
            <p className="mt-5 text-xs leading-6 text-black">Informasi dapat berubah mengikuti ketentuan yang berlaku. Konfirmasi syarat dan biaya melalui kanal resmi sebelum mengurus layanan.</p>
          </section>
        </div>
      </div>
    </main>
  );
};


