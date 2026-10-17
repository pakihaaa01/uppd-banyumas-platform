import type { PageRoute } from '../types';

/** Buka halaman Layanan lalu scroll ke section target setelah React selesai merender. */
export function goToServiceSection(
  setCurrentPage: (page: PageRoute) => void,
  sectionId: 'cek-pajak' | 'alur-pelayanan' | 'lokasi-pelayanan' | 'gerai-samsat' | 'layanan-digital',
) {
  setCurrentPage('services');
  window.setTimeout(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 120);
}
