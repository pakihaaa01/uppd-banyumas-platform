import React from 'react';
import { EditorialAccordion } from '../../shared/EditorialAccordion';

interface ProfileTerritoryProps { onOpenMap: () => void }

const incomeTypes = [
  {
    title: 'Pajak Kendaraan Bermotor (PKB)',
    description: 'Pajak atas kepemilikan dan/atau penguasaan kendaraan bermotor yang terdaftar di wilayah kerja UPPD Purwokerto.',
    details: ['Pendaftaran kendaraan baru & perpanjangan STNK tahunan', 'Pengesahan ulang / ganti plat nomor 5 tahunan'],
  },
  {
    title: 'Bea Balik Nama (BBN) Kendaraan Bermotor',
    description: 'Pajak atas penyerahan hak milik kendaraan bermotor sebagai akibat perjanjian penyerahan atau perbuatan hukum lainnya.',
    details: ['Balik nama kepemilikan kendaraan bekas (BBN II)', 'Mutasi masuk kendaraan dari luar daerah'],
  },
  {
    title: 'Pajak Air Permukaan',
    description: 'Pajak atas pengambilan dan/atau pemanfaatan air permukaan untuk berbagai keperluan di wilayah daerah.',
    details: ['Pengelolaan dan pendataan pemanfaatan air permukaan'],
  },
  {
    title: 'Pelayanan Retribusi, Pendapatan Lain dan Pemanfaatan Aset Daerah (PRPLPAD)',
    description: 'Pendapatan asli daerah sah lainnya yang bersumber dari pemanfaatan fasilitas daerah, pelayanan administrasi khusus, dan pengelolaan aset di lingkungan UPPD.',
    details: ['Pelayanan administrasi dokumen dan optimalisasi kerja sama pemanfaatan aset daerah'],
  },
  {
    title: 'Pajak Alat Berat',
    description: 'Pajak atas kepemilikan dan/atau penguasaan alat berat yang beroperasi di wilayah kerja daerah.',
    details: ['Pendataan dan pengawasan unit alat berat'],
  },
];

export const ProfileTerritory: React.FC<ProfileTerritoryProps> = ({ onOpenMap }) => (
  <div className="space-y-8">
    <header className="border-b border-[#e2eaf0] pb-5">
      <h2 className="text-2xl font-semibold text-[#1d3b53]">Wilayah Kerja &amp; Jenis Pendapatan</h2>
      <p className="mt-2 text-sm leading-6 text-[#607586]">Informasi lengkap cakupan wilayah operasional dan rincian jenis pendapatan yang dikelola oleh UPPD Purwokerto.</p>
    </header>

    <section aria-labelledby="income-title">
      <h3 id="income-title" className="mb-3 text-lg font-semibold text-[#1d3b53]">Jenis Pendapatan yang Dikelola UPPD Purwokerto</h3>
      <p className="mb-5 text-[14px] leading-7 text-[#526a7b]">Rincian komponen pajak dan retribusi daerah yang dikelola.</p>
      <EditorialAccordion headingLevel="h4" items={incomeTypes.map((income, index) => ({
        id: `income-${index + 1}`,
        eyebrow: `Jenis pendapatan ${String(index + 1).padStart(2, '0')}`,
        title: income.title,
        content: <div className="space-y-4">
          <p>{income.description}</p>
          <ul className="list-disc space-y-2 pl-5">{income.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        </div>,
      }))} initialOpen="income-1" />
    </section>

    <section className="border-t border-[#e2eaf0] pt-7" aria-labelledby="area-title">
      <h3 id="area-title" className="mb-3 text-lg font-semibold text-[#1d3b53]">Wilayah Kerja UPPD Purwokerto</h3>
      <p className="mb-5 text-[14px] leading-7 text-[#526a7b]">Cakupan administratif wilayah pelayanan operasional.</p>
      <EditorialAccordion headingLevel="h4" items={[{
        id: 'area-map',
        title: 'Lihat peta wilayah kerja',
        eyebrow: 'Dokumentasi wilayah',
        content: (
          <figure className="space-y-3">
            <button
              type="button"
              onClick={onOpenMap}
              className="block w-full cursor-zoom-in overflow-hidden rounded-sm border border-[#dce5eb] bg-white p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]"
              aria-label="Perbesar peta Wilayah Kerja UPPD Purwokerto"
            >
              <img src="/images/wilayah_kerja.jpeg" alt="Peta wilayah kerja UPPD Purwokerto" loading="lazy" className="mx-auto h-auto max-h-[530px] w-full object-contain" />
            </button>
            <figcaption className="text-xs text-[#657c8c]">Pilih gambar untuk melihat peta dalam ukuran lebih besar.</figcaption>
          </figure>
        ),
      }]} />
    </section>
  </div>
);
