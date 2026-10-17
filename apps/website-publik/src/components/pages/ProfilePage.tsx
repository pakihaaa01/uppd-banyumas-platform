import React, { useState } from 'react';
import { PageHeading } from '../shared/PageHeading';
import { EditorialAccordion } from '../shared/EditorialAccordion';
import { ProfileVision } from './profile/ProfileVision';
import { ProfileTerritory } from './profile/ProfileTerritory';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Target,
  Network,
  UserCheck,
  Users,
  ScrollText,
  ShieldCheck,
  CheckCircle2,
  Award,
  ChevronRight,
  Crown,
  HeartHandshake,
  Zap,
  Compass,
  X,
  FileText,
  Check
} from 'lucide-react';

type ProfileSection = 'vision' | 'territory' | 'history' | 'structure' | 'organizer' | 'implementer' | 'charter' | 'sop' | 'sipp';

interface PersonDetail {
  role: string;
  name: string;
  image: string;
}

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileSection>('vision');
  const [performanceTab, setPerformanceTab] = useState<'apbd' | 'pad'>('apbd');
  
  // State untuk modal zoom struktur organisasi & grafik kinerja
  const [selectedPerson, setSelectedPerson] = useState<PersonDetail | null>(null);

  // Menu Navigasi dengan Wilayah Kerja & Jenis Pendapatan tepat di bawah Visi & Misi
  const menuItems: { id: ProfileSection; label: string }[] = [
    { id: 'vision', label: 'Visi & Misi' },
    { id: 'territory', label: 'Wilayah Kerja & Jenis Pendapatan' },
    { id: 'history', label: 'Sejarah SAMSAT' },
    { id: 'structure', label: 'Struktur Organisasi' },
    { id: 'organizer', label: 'Profil Penyelenggara' },
    { id: 'implementer', label: 'Penilaian Kinerja' },
    { id: 'charter', label: 'Maklumat Pelayanan' },
    { id: 'sop', label: 'Standar Operasional Prosedur' },
    { id: 'sipp', label: 'SIPP Pelayanan Publik' },
  ];

  return (
    <div className="profile-editorial min-h-screen bg-[#f7f9fb] pb-24 pt-[112px] md:pt-[140px]">
      
      {/* ================= MODAL ZOOM POP-UP (KONDISIONAL: STRUKTUR ORANG VS TABEL APBD) ================= */}
      <AnimatePresence>
        {selectedPerson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPerson(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`relative bg-white rounded-lg shadow-md border border-slate-200 p-6 sm:p-8 z-10 overflow-hidden flex flex-col ${
                selectedPerson.role === 'Grafik Kinerja'
                  ? 'max-w-5xl w-full max-h-[92vh]'
                  : 'max-w-md w-full text-center'
              }`}
            >
              <button
                onClick={() => setSelectedPerson(null)}
                className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-full transition-colors z-20 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Jika yang diklik adalah Tabel APBD (Grafik Kinerja) */}
              {selectedPerson.role === 'Grafik Kinerja' ? (
                <div className="flex flex-col h-full overflow-hidden text-left">
                  <div className="mb-3 pr-10">
                    <span className="text-xs font-bold text-[#005BAC] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
                      Detail Dokumen
                    </span>
                    <h3 className="font-bold text-xl text-slate-900 tracking-tight">
                      {selectedPerson.name}
                    </h3>
                  </div>

                  {/* Area Kotak Gambar Penuh Utuh Tanpa Terpotong Bulat */}
                  <div className="relative bg-slate-100 border border-slate-200 rounded-md p-4 overflow-auto flex-grow flex items-center justify-center my-2 max-h-[70vh]">
                    <img
                      src={selectedPerson.image}
                      alt={selectedPerson.name}
                      className="w-auto h-auto max-w-full max-h-[65vh] object-contain rounded-xl shadow-sm bg-white"
                    />
                  </div>
                </div>
              ) : (
                /* Jika yang diklik adalah Profil Orang (Struktur Organisasi) */
                <div className="py-4">
                  <div className="relative inline-block mx-auto mb-4 mt-2">
                    <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl"></div>
                    <img
                      src={selectedPerson.image}
                      alt={selectedPerson.name}
                      className="relative w-32 h-32 object-cover rounded-full border-4 border-blue-50 shadow-sm mx-auto bg-white"
                    />
                  </div>

                  <span className="text-xs font-bold text-[#005BAC] bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-wider inline-block mb-3">
                    {selectedPerson.role}
                  </span>
                  <h3 className="font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                    {selectedPerson.name}
                  </h3>
                  <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                    Unit Pelayanan Pendapatan Daerah (UPPD) Kabupaten Banyumas Badan Pengelola Pendapatan Daerah Provinsi Jawa Tengah.
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedPerson(null)}
                className="mt-4 w-full bg-[#005BAC] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm shadow-blue-600/30 text-sm shrink-0"
              >
                Tutup Detail
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <PageHeading
          eyebrow="Tentang instansi"
          title="Profil UPPD Kabupaten Banyumas"
          description="Informasi kelembagaan, sejarah, wilayah kerja, penyelenggara, dan dokumen pelayanan UPPD Kabupaten Banyumas pada lingkungan Bapenda Provinsi Jawa Tengah."
        />
        <div className="mt-7 border-l-[3px] border-[#c08c33] bg-[#fff9ed] px-5 py-3 text-[13px] leading-6 text-[#715727]">
          Sejumlah materi profil masih merujuk pada periode 2018–2023 dan data arsip project. Verifikasi serta perbarui informasi sebelum digunakan sebagai profil resmi terkini.
        </div>

        {/* Navigasi profil dipertahankan, disederhanakan untuk desktop dan mobile. */}
        <div className="mt-9 grid grid-cols-1 items-start gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
          <nav aria-label="Menu profil" className="border border-[#dce5eb] bg-white p-3 lg:sticky lg:top-[130px]">
            <h2 className="border-b border-[#e2eaf0] px-3 pb-3 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5d7385]">
              Topik Profil
            </h2>
            <div className="mt-2 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {menuItems.map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active ? 'true' : undefined}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex shrink-0 items-center justify-between gap-4 rounded-sm border-l-[3px] px-3 py-3 text-left text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC] lg:w-full ${active ? 'border-[#005BAC] bg-[#ebf3fa] text-[#005BAC]' : 'border-transparent text-[#466174] hover:bg-[#f3f7fa] hover:text-[#005BAC]'}`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main Content Area */}
          <div className="min-w-0 border border-[#dce5eb] bg-white p-5 sm:p-8">
            
            {/* Visi, Misi, Program dan Tujuan dalam accordion berisi teks arsip yang sama. */}
            {activeTab === 'vision' && <ProfileVision />}

            {/* Jenis Pendapatan serta peta Wilayah Kerja dalam accordion. */}
            {activeTab === 'territory' && (
              <ProfileTerritory
                onOpenMap={() => setSelectedPerson({
                  role: 'Grafik Kinerja',
                  name: 'Wilayah Kerja UPPD Purwokerto',
                  image: '/images/wilayah_kerja.jpeg',
                })}
              />
            )}

            {/* Sejarah dibagi menurut periode, mengikuti konsep accordion Bapenda Jabar. */}
            {activeTab === 'history' && (
              <section className="space-y-6" aria-labelledby="sejarah-title">
                <div className="border-b border-[#e2eaf0] pb-4">
                  <h2 id="sejarah-title" className="text-2xl font-semibold text-[#1d3b53]">Sejarah Bapenda Jawa Tengah dan SAMSAT Banyumas</h2>
                  <p className="mt-2 text-sm leading-6 text-[#617586]">Perjalanan perkembangan kelembagaan berdasarkan bahan sejarah yang sudah tersedia dalam project.</p>
                </div>
                <figure className="max-w-lg overflow-hidden border border-[#dce5eb] bg-white">
                  <img src="/images/gedung.jpeg" alt="Dokumentasi gedung UPPD Kabupaten Banyumas" loading="lazy" className="h-60 w-full object-cover sm:h-72" />
                  <figcaption className="p-3 text-xs text-[#5b6f7f]">Dokumentasi UPPD Kabupaten Banyumas</figcaption>
                </figure>
                <EditorialAccordion
                  initialOpen="periode-1967"
                  items={[
                    {
                      id: 'periode-1967', eyebrow: '5 Juli 1967', title: 'Cikal Bakal DIPENDA Jawa Tengah',
                      content: <p>Cikal bakal Dinas Pendapatan Daerah (DIPENDA) Provinsi Jawa Tengah dibentuk berdasarkan Keputusan Gubernur Jawa Tengah.</p>
                    },
                    {
                      id: 'periode-1968', eyebrow: '11 Oktober 1968', title: 'Pembentukan Resmi Kelembagaan',
                      content: <p>Secara kelembagaan resmi dibentuk melalui Surat Keputusan Gubernur Kepala Daerah Tingkat I Jawa Tengah Nomor Huk.G.23/2/18 tentang Pembentukan Dinas Pendapatan Daerah Provinsi Daerah Tingkat I Jawa Tengah.</p>
                    },
                    {
                      id: 'periode-2008', eyebrow: 'Tahun 2008', title: 'Perubahan ke DPPAD',
                      content: <p>Nomenklatur kelembagaan berubah dari DIPENDA menjadi Dinas Pendapatan dan Pengelolaan Aset Daerah (DPPAD) berdasarkan Peraturan Daerah Provinsi Jawa Tengah Nomor 6 Tahun 2008 tentang Organisasi dan Tata Kerja Dinas Daerah Provinsi Jawa Tengah.</p>
                    },
                    {
                      id: 'periode-2016', eyebrow: 'Tahun 2016', title: 'Perubahan ke BPPD dan Penguatan UPPD',
                      content: <p>Nomenklatur DPPAD berubah menjadi Badan Pengelola Pendapatan Daerah (BPPD) berdasarkan Peraturan Daerah Provinsi Jawa Tengah Nomor 9 Tahun 2016 serta Peraturan Gubernur Jawa Tengah Nomor 81 Tahun 2016 tentang Organisasi dan Tata Kerja Badan Pengelola Pendapatan Daerah Provinsi Jawa Tengah.</p>
                    },
                    {
                      id: 'periode-2019', eyebrow: 'Tahun 2019', title: 'Penggunaan Nomenklatur BAPENDA',
                      content: <p>Bahan sejarah dalam project menyebut penggunaan nomenklatur BAPENDA yang terkait dengan Keputusan Gubernur Jawa Tengah Nomor 061/44 Tahun 2019. Periksa kembali sumber kebijakan untuk memastikan status dan istilah hukum yang berlaku.</p>
                    },
                    {
                      id: 'dasar-pelaksanaan', eyebrow: 'Dasar hukum dalam bahan arsip', title: 'Dasar Pelaksanaan UPPD dan SAMSAT Banyumas',
                      content: <div className="space-y-3"><p>Pelaksanaan operasional pada bahan arsip project merujuk antara lain pada:</p><ul className="list-disc space-y-2 pl-5"><li>Undang-Undang Republik Indonesia Nomor 28 Tahun 2009 tentang Pajak Daerah dan Retribusi Daerah (ketentuan historis).</li><li>Peraturan Gubernur Jawa Tengah Nomor 25 Tahun 2018 tentang Organisasi dan Tata Kerja Unit Pelaksana Teknis Badan Pengelola Pendapatan Daerah Provinsi Jawa Tengah.</li></ul><p>Peraturan dan nomenklatur perlu diverifikasi terhadap kebijakan yang berlaku saat publikasi.</p></div>
                    }
                  ]}
                />
              </section>
            )}

            {/* Organizational Structure */}
            {activeTab === 'structure' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Struktur Organisasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Bagan Tata Kerja UPPD SAMSAT Kabupaten Banyumas. (Klik kartu untuk memperbesar)
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-md border border-slate-200">
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setSelectedPerson({ role: 'Kepala UPPD Purwokerto', name: 'ERRY RAHARJONO, S.SOS, MSI.', image: '/images/kepala-uppd.jpeg' })}
                      className="w-full max-w-sm bg-[#005BAC] text-white rounded-xl shadow-md p-4 text-center cursor-pointer relative group"
                    >
                      <div className="absolute top-2 right-3 text-amber-300"></div>
                      <img
                        src="/images/kepala-uppd.jpeg"
                        alt="Kepala UPPD Purwokerto"
                        className="w-20 h-20 object-cover rounded-full mx-auto mb-3 border-4 border-white"
                      />
                      <p className="text-xs font-bold text-sky-200 uppercase">
                        KEPALA UPPD PURWOKERTO
                      </p>
                      <p className="font-bold text-base mt-1">
                        ERRY RAHARJONO, S.SOS, MSI.
                      </p>
                      <p className="text-xs text-white mt-1 font-medium tracking-wide">
                        NIP. 19690905 198803 1 00 1
                      </p>
                    </motion.div>

                    <div className="flex justify-center">
                      <div className="w-0.5 h-8 bg-slate-400"></div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setSelectedPerson({ role: 'Kepala Subbag Tata Usaha', name: 'NOVY SETIAWAN, SH.', image: '/images/kepala-kasubag.jpeg' })}
                      className="w-full max-w-sm bg-white rounded-xl border border-slate-300 shadow-sm p-5 text-center cursor-pointer hover:border-[#005BAC] transition-all"
                    >
                      <img
                        src="/images/kepala-kasubag.jpeg"
                        alt="Kepala Subbag Tata Usaha"
                        className="w-20 h-20 object-cover rounded-full mx-auto mb-3 border-4 border-blue-100"
                      />
                      <p className="text-[11px] font-bold text-[#005BAC] uppercase leading-tight">
                        KEPALA SUBBAG
                        <br />
                        TATA USAHA
                      </p>
                      <p className="font-bold text-sm text-slate-800 mt-2">
                        NOVY SETIAWAN, SH.
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
                        NIP. 19851126 201101 1 006
                      </p>
                    </motion.div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-0.5 h-8 bg-slate-400"></div>
                  </div>

                  <div className="relative max-w-3xl mx-auto">
                    <div className="hidden md:block absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-400"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="relative pt-6">
                        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-400"></div>
                        <motion.div 
                          whileHover={{ scale: 1.03 }}
                          onClick={() => setSelectedPerson({ role: 'Seksi PPD', name: 'RIZA UYUN INDRIYANI, SE, M.AKUN.', image: '/images/kepala-ppd.jpeg' })}
                          className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 text-center cursor-pointer hover:border-[#005BAC] transition-all"
                        >
                          <img
                            src="/images/kepala-ppd.jpeg"
                            alt="Kepala Seksi Pelayanan Pajak Daerah"
                            className="w-20 h-20 object-cover rounded-full mx-auto mb-3 border-4 border-blue-100"
                          />
                          <p className="text-[11px] font-bold text-[#005BAC] uppercase leading-tight">
                            KEPALA SEKSI PELAYANAN
                            <br />
                            PAJAK DAERAH (PPD)
                          </p>
                          <p className="font-bold text-sm text-slate-800 mt-2">
                            RIZA UYUN INDRIYANI, SE, M.AKUN.
                          </p>
                          <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
                            NIP. 198811192011012011
                          </p>
                        </motion.div>
                      </div>

                      <div className="relative pt-6">
                        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-400"></div>
                        <motion.div 
                          whileHover={{ scale: 1.03 }}
                          onClick={() => setSelectedPerson({ role: 'Seksi PRPL & PAD', name: 'FAJAR POEROESAKTI, SH, MH.', image: '/images/kepala-prpl.jpeg' })}
                          className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 text-center cursor-pointer hover:border-[#005BAC] transition-all"
                        >
                          <img
                            src="/images/kepala-prpl.jpeg"
                            alt="Kepala Seksi Pelayanan Retribusi"
                            className="w-20 h-20 object-cover rounded-full mx-auto mb-3 border-4 border-blue-100"
                          />
                          <p className="text-[11px] font-bold text-[#005BAC] uppercase leading-tight">
                            KEPALA SEKSI PELAYANAN
                            <br />
                            RETRIBUSI, PENDAPATAN LAIN
                            <br />
                            DAN PEMANFAATAN ASET DAERAH
                            <br />
                            (PRPL & PAD)
                          </p>
                          <p className="font-bold text-sm text-slate-800 mt-2">
                            FAJAR POEROESAKTI, SH, MH.
                          </p>
                          <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
                            NIP. 19730124 200801 1 001
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slot foto personel: ganti file JPEG tanpa perlu mengedit source code. */}
                <section aria-labelledby="struktur-personil-title" className="mt-10 border-t border-slate-200 pt-8">
                  <h3 id="struktur-personil-title" className="text-lg font-semibold text-[#1e3c53]">
                    Dokumentasi Struktur Organisasi
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Foto atau bagan personel UPPD Kabupaten Banyumas.
                  </p>
                  <figure className="mt-5 overflow-hidden rounded-md border border-[#dce5eb] bg-[#f6f9fb]">
                    <img
                      src="/images/struktur-personil.jpeg"
                      alt="Tempat foto struktur organisasi dan personel UPPD Kabupaten Banyumas"
                      loading="lazy"
                      className="block h-auto w-full object-contain"
                    />
                    <figcaption className="border-t border-[#dce5eb] bg-white px-4 py-3 text-xs text-[#647788]">
                      Foto dokumentasi struktur organisasi dan personel UPPD Kabupaten Banyumas.
                    </figcaption>
                  </figure>
                </section>
              </motion.div>
            )}

            {/* Organizer Profile */}
            {activeTab === 'organizer' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Profil Penyelenggara
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    KEBIJAKAN MUTU & MAKLUMAT PELAYANAN UNIT PELAYANAN PENDAPATAN DAERAH (UPPD) KABUPATEN BANYUMAS
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-6 bg-blue-50/60 rounded-md border border-blue-200/80 shadow-sm text-center flex flex-col justify-center min-h-[220px]">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#005BAC] leading-relaxed">
                      BADAN PENGELOLA PENDAPATAN DAERAH JAWA TENGAH
                    </h3>
                    <h3 className="text-base font-semibold text-[#005BAC] uppercase tracking-wide mb-3 mt-1">
                      KEBIJAKAN MUTU
                    </h3>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      UNIT PELAYANAN PENDAPATAN DAERAH (UPPD)
                    </p>
                    <p className="text-sm text-slate-700 font-semibold mt-2">
                      BERKOMITMEN
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                      Mewujudkan Pelayanan Prima Dengan Cara Melakukan Perbaikan Pengelolaan Pendapatan Daerah Secara Berkesinambungan
                    </p>
                  </div>

                  <div className="p-6 bg-blue-50/60 rounded-md border border-blue-200/80 shadow-sm text-center flex flex-col justify-center min-h-[220px]">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#005BAC] leading-relaxed">
                      MAKLUMAT PELAYANAN
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 mt-3 leading-relaxed italic font-medium px-2">
                      "DENGAN INI KAMI MENYATAKAN SANGGUP MELAKSANAKAN PELAYANAN SESUAI DENGAN STANDAR PELAYANAN YANG DITETAPKAN DAN APABILA TIDAK MENEPATI KAMI BERSEDIA MENERIMA SANKSI DAN/ATAU MEMBERIKAN KOMPENSASI SESUAI DENGAN PERATURAN PERUNDANG-UNDANGAN"
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-white p-6 rounded-md border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-6 pb-2 border-b border-slate-100">
                    Pejabat Penanggung Jawab Pelayanan SAMSAT
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase leading-snug">
                          Dirlantas Kepolisian Daerah<br />Jawa Tengah
                        </p>
                      </div>
                      <div className="my-4 py-2">
                        <span className="font-serif italic text-slate-400 text-sm select-none"></span>
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-900">AGUS SURYO NUGROHO</p>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Komisaris Besar Polisi</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase leading-snug">
                          Plt. Kepala Badan Pengelola Pendapatan Daerah<br />Provinsi Jawa Tengah
                        </p>
                      </div>
                      <div className="my-4 py-2">
                        <span className="font-serif italic text-slate-400 text-sm select-none"></span>
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-900">EDDY S. BRAMIYANTO</p>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Pembina Utama Muda</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase leading-snug">
                          PT. Jasa Raharja<br />Cabang Utama Jawa Tengah
                        </p>
                      </div>
                      <div className="my-4 py-2">
                        <span className="font-serif italic text-slate-400 text-sm select-none"></span>
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-900">SIGIT HARISMUN</p>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">Kepala Cabang</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Implementer Profile */}
            {activeTab === 'implementer' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Penilaian Kinerja
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Target dan realisasi penerimaan daerah UPPD Kabupaten Banyumas. (Klik gambar tabel untuk memperbesar)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                  {[
                    { id: 'apbd', label: 'Target Realisasi APBD', icon: Target },
                    { id: 'pad', label: 'Target Penerimaan PAD', icon: Award },
                  ].map((tab) => {
                    const isActive = performanceTab === tab.id;
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setPerformanceTab(tab.id as 'apbd' | 'pad')}
                        className={`p-5 rounded-md border text-left transition-colors duration-200 relative overflow-hidden z-10 ${
                          isActive
                            ? 'text-white border-[#005BAC] shadow-md'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-[#005BAC]'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activePerformanceTab"
                            className="absolute inset-0 bg-[#005BAC] rounded-md -z-10"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <div className="flex items-center gap-3 relative z-10">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                              isActive ? 'bg-white/20' : 'bg-blue-100'
                            }`}
                          >
                            <IconComponent
                              className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#005BAC]'}`}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-base">{tab.label}</h3>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-slate-50 rounded-md border border-slate-200 p-6">
                  {performanceTab === 'apbd' && (
                    <motion.div
                      key="apbd"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h3 className="text-xl font-semibold text-[#005BAC] mb-3">
                        Target Realisasi APBD
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Informasi mengenai target dan realisasi Anggaran Pendapatan dan Belanja Daerah (APBD) UPPD Kabupaten Banyumas.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                        {[
                          { src: '/images/target1.png', alt: 'Target Realisasi APBD 1' },
                          { src: '/images/target2.png', alt: 'Target Realisasi APBD 2' },
                          { src: '/images/target3.png', alt: 'Target Realisasi APBD 3' },
                          { src: '/images/target4.png', alt: 'Target Realisasi APBD 4' },
                        ].map((item, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedPerson({ role: 'Grafik Kinerja', name: item.alt, image: item.src })}
                            className="bg-white rounded-md border border-slate-200 shadow-sm p-3 cursor-pointer group relative overflow-hidden"
                          >
                            <img
                              src={item.src}
                              alt={item.alt}
                              className="w-full h-64 object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors rounded-md flex items-end justify-center pb-4">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                                Klik untuk Memperbesar Tabel
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {performanceTab === 'pad' && (
                    <motion.div
                      key="pad"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h3 className="text-xl font-semibold text-[#005BAC] mb-3">
                        Target Penerimaan PAD
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Informasi mengenai target penerimaan Pendapatan Asli Daerah (PAD).
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Charter / Maklumat Pelayanan */}
            {activeTab === 'charter' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Maklumat Pelayanan
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Dokumen resmi Maklumat Pelayanan SAMSAT Kabupaten Banyumas.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-md border border-slate-200 p-12 text-center flex flex-col items-center justify-center">

                  <h3 className="font-semibold text-base text-slate-800 mb-1">
                    Dokumen Belum Tersedia
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Berkas gambar Maklumat Pelayanan saat ini belum diunggah atau sedang dalam tahap pembaruan data.
                  </p>
                </div>
              </motion.div>
            )}

            {/* SOP (Standar Operasional Prosedur) */}
            {activeTab === 'sop' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Standar Operasional Prosedur (SOP)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Dokumen dan alur Standar Operasional Prosedur pelayanan SAMSAT Kabupaten Banyumas. (Klik gambar untuk memperbesar)
                  </p>
                </div>

                <div className="bg-slate-50 rounded-md border border-slate-200 p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { src: '/images/sop1.jpg', alt: 'Standar Operasional Prosedur 1' },
                      { src: '/images/sop2.jpg', alt: 'Standar Operasional Prosedur 2' },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPerson({ role: 'Grafik Kinerja', name: item.alt, image: item.src })}
                        className="bg-white rounded-md border border-slate-200 shadow-sm p-3 cursor-pointer group relative overflow-hidden"
                      >
                        <img
                          src={item.src}
                          alt={item.alt}
                          className="w-full h-64 object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors rounded-md flex items-end justify-center pb-4">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                            Klik untuk Memperbesar Dokumen
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SIPP Pelayanan Publik */}
            {activeTab === 'sipp' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    SIPP Pelayanan Publik
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Sistem Informasi Pelayanan Publik (SIPP) UPPD Kabupaten Banyumas. (Klik gambar untuk memperbesar)
                  </p>
                </div>

                <div className="bg-slate-50 rounded-md border border-slate-200 p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                      { src: '/images/sipp1.jpg', alt: 'SIPP Pelayanan Publik 1' },
                      { src: '/images/sipp2.jpg', alt: 'SIPP Pelayanan Publik 2' },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPerson({ role: 'Grafik Kinerja', name: item.alt, image: item.src })}
                        className="bg-white rounded-md border border-slate-200 shadow-sm p-3 cursor-pointer group relative overflow-hidden"
                      >
                        <img
                          src={item.src}
                          alt={item.alt}
                          className="w-full h-64 object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors rounded-md flex items-end justify-center pb-4">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                            Klik untuk Memperbesar Dokumen
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};