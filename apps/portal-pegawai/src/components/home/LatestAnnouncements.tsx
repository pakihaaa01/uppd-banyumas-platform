
import React, { useEffect, useRef, useState } from 'react';
import { useSamsat } from '../../context/SamsatContext';
import { Announcement } from '../../types';
import {
  ArrowUpRight,
  X,
  FileText,
} from 'lucide-react';

export const LatestAnnouncements: React.FC = () => {
  const { announcements } = useSamsat();

  const [selectedAnn, setSelectedAnn] =
    useState<Announcement | null>(null);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    setSelectedAnn(null);
  };

  const openModal = (ann: Announcement) => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    setSelectedAnn(ann);
  };

  // Mengatur interaksi modal
  useEffect(() => {
    if (!selectedAnn) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }

      // Menjaga fokus keyboard tetap di dalam modal
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => !element.hasAttribute('disabled'));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);

      previousFocusRef.current?.focus();
    };
  }, [selectedAnn]);

  return (
    <section aria-labelledby="announcements-title" className="bg-white py-16 sm:py-20 lg:py-[92px]">
      <div className="mx-auto grid w-full max-w-[1240px] gap-9 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.55fr] lg:gap-14 lg:px-10">
        <div className="lg:pt-1">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#005BAC]">Kabar UPPD Banyumas</p>
          <h2 id="announcements-title" className="max-w-[330px] text-[26px] font-bold leading-tight tracking-[-0.025em] text-[#172f43] sm:text-[34px]">Pengumuman dan informasi terbaru</h2>
          <p className="mt-4 max-w-[365px] text-sm leading-7 text-[#5c6e7b]">
            Ikuti pembaruan terkait jadwal pelayanan, kebijakan perpajakan, dan kegiatan SAMSAT Banyumas.
          </p>
          <div className="mt-7 flex items-center gap-3 border-t border-[#e4eaef] pt-5 text-xs text-[#6b7e8b]">
            <FileText size={18} className="text-[#005BAC]" aria-hidden="true" />
            <span>{announcements.length} informasi tercantum di portal</span>
          </div>
        </div>

        {announcements.length > 0 ? (
          <div className="border-t-[3px] border-[#005BAC]">
            {announcements.map((ann) => (
              <button
                key={ann.id}
                type="button"
                onClick={() => openModal(ann)}
                className="group block w-full border-b border-[#e4eaef] px-1 py-6 text-left transition-colors hover:bg-[#f8fbfd] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#005BAC] sm:px-4 sm:py-7"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                  <div className="shrink-0 text-[12px] leading-5 text-[#718492] sm:w-[112px]">{ann.date}</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.065em] text-[#005BAC]">
                      <span>{ann.category}</span>
                      {ann.isNew && <span className="border-l border-[#d6e0e8] pl-3 text-[#537587]">Terbaru</span>}
                    </div>
                    <h3 className="max-w-[540px] text-[16px] font-semibold leading-[1.5] tracking-[-0.01em] text-[#1c3347] transition-colors group-hover:text-[#005BAC] sm:text-[17px]">{ann.title}</h3>
                    <p className="mt-2 line-clamp-2 max-w-[560px] text-[13px] leading-[1.75] text-[#647785]">{ann.shortDescription}</p>
                    <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#005BAC]">Baca pengumuman <ArrowUpRight size={15} aria-hidden="true" /></span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center gap-4 border-y border-[#dce5eb] text-[#5f7381]">
            <FileText size={28} className="shrink-0 text-[#8b9aa6]" aria-hidden="true" />
            <div><h3 className="font-semibold text-[#1c3347]">Belum ada pengumuman</h3><p className="mt-1 text-sm">Informasi terbaru akan ditampilkan di sini.</p></div>
          </div>
        )}
      </div>

      {/* =================================
          ANNOUNCEMENT DETAIL MODAL
      ================================= */}
      {selectedAnn && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-slate-950/65 p-4
            sm:p-6
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-modal-title"
            aria-describedby="announcement-modal-description"
            className="
              relative flex max-h-[90dvh]
              w-full max-w-2xl
              flex-col overflow-hidden
              rounded-xl bg-white
              shadow-2xl
            "
          >
            {/* MODAL HEADER */}
            <div
              className="
                flex shrink-0 items-start
                justify-between gap-4
                border-b border-slate-100
                px-6 py-5 sm:px-8
              "
            >
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="
                    rounded-md bg-blue-50
                    px-3 py-1 text-xs
                    font-medium text-[#005BAC]
                  "
                >
                  {selectedAnn.category}
                </span>

                <span className="text-xs text-slate-500">
                  {selectedAnn.date}
                </span>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeModal}
                aria-label="Tutup pengumuman"
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-lg text-slate-500
                  transition-colors duration-200
                  hover:bg-slate-100
                  hover:text-slate-900
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-[#005BAC]
                "
              >
                <X
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="overflow-y-auto px-6 py-7 sm:px-8">
              <h2
                id="announcement-modal-title"
                className="
                  text-xl font-bold
                  leading-snug text-slate-900
                  sm:text-2xl
                "
              >
                {selectedAnn.title}
              </h2>

              <div
                id="announcement-modal-description"
                className="mt-6 space-y-5 text-sm leading-7 text-slate-700"
              >
                <p className="font-medium text-slate-900">
                  {selectedAnn.shortDescription}
                </p>

                <div className="border-t border-slate-100 pt-5">
                  <p className="whitespace-pre-line">
                    {selectedAnn.content}
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div
              className="
                flex shrink-0 justify-end
                border-t border-slate-100
                bg-slate-50 px-6 py-4
                sm:px-8
              "
            >
              <button
                type="button"
                onClick={closeModal}
                className="
                  min-h-10 rounded-lg
                  bg-[#005BAC] px-6 py-2.5
                  text-sm font-semibold text-white
                  transition-colors duration-200
                  hover:bg-[#004685]
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[#005BAC]
                "
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};