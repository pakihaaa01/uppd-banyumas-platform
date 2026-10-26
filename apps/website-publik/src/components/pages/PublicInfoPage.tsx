import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, X } from 'lucide-react';
import { EditorialAccordion } from '../shared/EditorialAccordion';
import { useSamsat } from '../../context/SamsatContext';
import { PageHeading } from '../shared/PageHeading';

const categoryLabels: Record<string, string> = {
  sop: 'Prosedur Pelayanan', wbk: 'Integritas & Tata Kelola', sipp: 'Informasi Pelayanan',
  pad: 'Pendapatan Daerah', evaluasi: 'Evaluasi',
};

export const PublicInfoPage: React.FC = () => {
  const { documents, visualArchive } = useSamsat();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('semua');
  const [selectedImage, setSelectedImage] = useState<(typeof visualArchive)[number] | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const openImage = (item: (typeof visualArchive)[number]) => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setSelectedImage(item);
  };

  const closeImage = () => setSelectedImage(null);

  useEffect(() => {
    if (!selectedImage) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeImage();
      }
      // Tombol tutup adalah satu-satunya kontrol di modal.
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousFocusRef.current?.focus();
    };
  }, [selectedImage]);
  const categories = ['semua', ...Object.keys(categoryLabels)];
  const displayedDocuments = useMemo(() => documents.filter((document) => {
    const term = search.trim().toLocaleLowerCase('id-ID');
    return (category === 'semua' || document.category === category) &&
      (!term || `${document.title} ${document.description ?? ''}`.toLocaleLowerCase('id-ID').includes(term));
  }), [documents, search, category]);

  return (
    <main className="min-h-screen bg-[#f7f9fb] pb-24 pt-[112px] md:pt-[140px]">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <PageHeading
          eyebrow="Keterbukaan informasi"
          title="Informasi Publik"
          description="Akses dokumentasi dan daftar informasi pelayanan yang tersedia pada portal. Keabsahan dan kemutakhiran setiap dokumen perlu diperiksa pada kanal resmi instansi."
        />
        <section aria-labelledby="public-archive-title" className="mt-10">
          <div className="mb-6">
            <h2 id="public-archive-title" className="text-xl font-bold text-[#1d3b53]">Dokumentasi Pelayanan</h2>
            <p className="mt-1 text-sm leading-6 text-[#607587]">Pratinjau gambar arsip yang sudah tersedia di dalam project.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {visualArchive.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => openImage(item)}
                aria-label={`Lihat gambar ${item.title}`}
                className="group flex w-full flex-col overflow-hidden border border-[#dce5eb] bg-white text-left transition-colors hover:border-[#005BAC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]"
              >
                <div className="flex h-[205px] w-full items-center justify-center border-b border-[#e5ebf0] bg-[#eef2f5] p-4">
                  <img src={item.image} alt={`Pratinjau ${item.title}`} loading="lazy" className="h-full w-full object-contain" />
                </div>
                <div className="flex w-full flex-1 flex-col p-5">
                  <h3 className="text-[15px] font-bold leading-6 text-[#1d3b53]">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#66798a]">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#005BAC]">
                    Lihat gambar <ArrowUpRight size={15} aria-hidden="true" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="public-document-title" className="mt-14">
          <div className="border-b border-[#dce5eb] pb-6">
            <h2 id="public-document-title" className="text-xl font-bold text-[#1d3b53]">Daftar Dokumen pada Portal</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#607587]">Daftar ini mengikuti data yang tersedia di dashboard admin. Sebagian entri masih berupa data contoh dan belum memiliki file unduhan; informasi tersebut ditandai secara jelas.</p>
          </div>
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div className="min-w-[220px] flex-1 sm:max-w-md"><label htmlFor="public-doc-search" className="mb-2 block text-xs font-semibold text-[#526879]">Cari dokumen</label><input id="public-doc-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Judul atau keterangan" className="w-full rounded-md border border-[#cfdce5] bg-white px-3 py-3 text-sm outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#e5eff8]" /></div>
            <div className="w-full sm:w-[220px]"><label htmlFor="public-doc-category" className="mb-2 block text-xs font-semibold text-[#526879]">Kategori</label><select id="public-doc-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-md border border-[#cfdce5] bg-white px-3 py-3 text-sm text-[#344f63] focus:border-[#005BAC] focus:outline-none focus:ring-2 focus:ring-[#e5eff8]">{categories.map((item) => <option key={item} value={item}>{item === 'semua' ? 'Semua kategori' : categoryLabels[item]}</option>)}</select></div>
          </div>
          <p className="mb-4 mt-5 text-xs text-[#657a8b]" aria-live="polite">{displayedDocuments.length} entri dokumen ditampilkan</p>
          {displayedDocuments.length ? (
            <EditorialAccordion
              headingLevel="h3"
              initialOpen={displayedDocuments[0]?.id}
              items={displayedDocuments.map((doc) => {
                const hasFile = Boolean(doc.downloadUrl && doc.downloadUrl !== '#');
                return {
                  id: doc.id,
                  title: doc.title,
                  eyebrow: categoryLabels[doc.category] ?? doc.category,
                  content: (
                    <div className="space-y-3">
                      {doc.description && <p>{doc.description}</p>}
                      <p className="text-[12px] text-[#6a7f90]">Metadata entri: {doc.fileType} · {doc.fileSize} · {doc.updateDate}</p>
                      {hasFile ? (
                        <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-block font-semibold text-[#005BAC] underline underline-offset-4">Buka berkas dokumen</a>
                      ) : (
                        <p className="inline-block border border-[#dae3e9] bg-[#f2f5f7] px-3 py-2 text-[12px] text-[#637889]">Berkas belum tersedia untuk diunduh</p>
                      )}
                    </div>
                  ),
                };
              })}
            />
          ) : (
            <div className="border border-[#dce5eb] bg-white px-6 py-10 text-sm text-[#647889]">Dokumen yang dicari tidak ditemukan.</div>
          )}
        </section>

      </div>
      {selectedImage && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-image-title"
          aria-describedby="preview-image-description"
          className="fixed inset-0 z-[100] flex flex-col bg-[#081b2a]/95 p-4 sm:p-7"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeImage();
          }}
        >
          <div className="pointer-events-none mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
            <div className="mb-4 flex justify-end">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeImage}
                className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-md border border-white/35 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Tutup pratinjau gambar dan kembali ke Informasi Publik"
              >
                <X size={19} aria-hidden="true" /> Tutup
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="pointer-events-auto max-h-full max-w-full object-contain"
              />
            </div>
            <div className="mt-4 text-center">
              <h2 id="preview-image-title" className="text-base font-semibold text-white sm:text-lg">
                {selectedImage.title}
              </h2>
              <p id="preview-image-description" className="mt-2 text-xs leading-5 text-[#cfdae4] sm:text-sm">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
};
