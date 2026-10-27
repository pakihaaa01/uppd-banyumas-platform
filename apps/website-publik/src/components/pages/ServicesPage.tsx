import {useOperational} from '../../context/OperationalContext';
import React, { useEffect, useMemo, useState } from 'react';
import { useSamsat } from '../../context/SamsatContext';
import type { ServiceLocation } from '../../types';
import { EditorialAccordion } from '../shared/EditorialAccordion';
import { PageHeading } from '../shared/PageHeading';
import { VehicleTaxChecker } from '../services/VehicleTaxChecker';

const timelineSteps = [
  { title: 'Siapkan dokumen kendaraan', description: 'Persiapkan dokumen identitas dan kendaraan sesuai jenis layanan. Persyaratan pajak tahunan dan perpanjangan lima tahunan dapat berbeda.' },
  { title: 'Pilih tempat pelayanan', description: 'Datangi kantor SAMSAT atau titik pelayanan yang sesuai dengan kebutuhan. Untuk layanan tertentu, tersedia pula kanal digital.' },
  { title: 'Pemeriksaan dokumen', description: 'Petugas memeriksa kelengkapan dokumen. Pemeriksaan fisik kendaraan dilakukan apabila diwajibkan untuk jenis layanan yang dipilih.' },
  { title: 'Lakukan pembayaran', description: 'Selesaikan pembayaran pajak dan biaya terkait melalui metode pembayaran yang tersedia pada kanal pelayanan.' },
  { title: 'Terima hasil pelayanan', description: 'Terima bukti pembayaran dan dokumen pengesahan sesuai prosedur serta jenis layanan yang digunakan.' },
];

const serviceSections = [
  { id: 'cek-pajak', label: 'Cek Pajak Kendaraan' },
  { id: 'alur-pelayanan', label: 'Alur Pelayanan' },
  { id: 'lokasi-pelayanan', label: 'Lokasi Pelayanan' },
  { id: 'gerai-samsat', label: 'Gerai SAMSAT' },
  { id: 'layanan-digital', label: 'Layanan Digital SAMSAT' },
];

const locationTypes = [
  { id: 'all', label: 'Semua lokasi' },
  { id: 'induk', label: 'Induk' },
  { id: 'pembantu', label: 'Pembantu' },
  { id: 'gerai', label: 'Gerai' },
  { id: 'drive-thru', label: 'Drive Thru' },
  { id: 'keliling', label: 'Keliling' },
];

export const ServicesPage: React.FC = () => {
  const {settings,ready,failed}=useOperational();
  const { serviceLocations, trackLocationClick, trackAppDownload } = useSamsat();
  const [locationSearch, setLocationSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeSection, setActiveSection] = useState('cek-pajak');

  useEffect(() => {
    // Tunjukkan bagian yang sedang dibaca pada sidebar, seperti menu Profil.
    const updateActive = () => {
      let current = serviceSections[0].id;
      for (const section of serviceSections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= 180) current = section.id;
      }
      setActiveSection(current);
    };
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, []);

  const navigateSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredLocations = useMemo(() => {
    const query = locationSearch.trim().toLocaleLowerCase('id-ID');
    return serviceLocations.filter((loc) =>
      (filterType === 'all' || loc.type === filterType) &&
      `${loc.name} ${loc.address}`.toLocaleLowerCase('id-ID').includes(query)
    );
  }, [serviceLocations, locationSearch, filterType]);

  // Gunakan tautan Google Maps milik lokasi yang tercatat di data portal.
  // Jika tautan kosong / bukan domain Google Maps, buka pencarian berdasarkan
  // nama dan alamatnya agar tombol tidak mengarah ke halaman yang tidak aman.
  const getGoogleMapsUrl = (loc: ServiceLocation) => {
    try {
      const url = new URL(loc.mapsUrl);
      const acceptedHosts = [
        'maps.google.com',
        'google.com',
        'www.google.com',
        'maps.app.goo.gl',
        'goo.gl',
      ];
      if (url.protocol === 'https:' && acceptedHosts.includes(url.hostname)) {
        return loc.mapsUrl;
      }
    } catch {
      // Data alamat tetap bisa digunakan untuk pencarian lokasi.
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.name} ${loc.address}`)}`;
  };

  // Samsat Malam Minggu memiliki dua titik layanan; pengunjung memilih tujuan.
  const isSamsatMalamMinggu = (loc: ServiceLocation) =>
    /samsat\s+malam\s+minggu/i.test(loc.name);

  const malamMingguLocations = [
    { name: 'Alun-Alun Banyumas', query: 'Alun-Alun Banyumas, Kabupaten Banyumas, Jawa Tengah' },
    { name: 'Taman Kebokura, Sumpiuh', query: 'Taman Kebokura, Sumpiuh, Kabupaten Banyumas, Jawa Tengah' },
  ];

  return (
    <main className="min-h-screen bg-[#f7f9fb] pb-24 pt-[112px] md:pt-[140px]">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <PageHeading
          eyebrow="Panduan pelayanan"
          title="Informasi Layanan SAMSAT"
          description="Informasi alur pelayanan pajak kendaraan, lokasi SAMSAT di wilayah Kabupaten Banyumas, gerai, dan aplikasi digital yang tersedia."
        />
        <div className="mt-9 grid items-start gap-8 lg:grid-cols-[245px_minmax(0,1fr)]">
          <aside className="min-w-0 lg:sticky lg:top-[132px]" aria-label="Navigasi bagian layanan">
            <nav className="border border-[#dce5eb] bg-white p-3" aria-label="Topik layanan">
              <h2 className="border-b border-[#e2eaf0] px-3 pb-3 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-black">TOPIK LAYANAN</h2>
              <div className="mt-2 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                {serviceSections.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => navigateSection(id)}
                    aria-current={activeSection === id ? 'location' : undefined}
                    className={`flex shrink-0 items-center rounded-sm border-l-[3px] px-3 py-3 text-left text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC] lg:w-full ${activeSection === id ? 'border-[#005BAC] bg-[#ebf3fa] text-[#005BAC]' : 'border-transparent text-black hover:bg-[#f3f7fa] hover:text-[#005BAC]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </nav>
          </aside>

          <div className="min-w-0">
            <section id="cek-pajak" className="mb-16 scroll-mt-36">
              {!ready ? <p role="status" className="border border-slate-200 bg-white p-6 text-black">{failed?'Status layanan belum dapat dimuat. Silakan coba lagi.':'Memuat layanan…'}</p> : settings.features.taxEnabled ? <VehicleTaxChecker /> : <section className="border border-slate-200 bg-white p-6 text-black" role="status"><h2 className="text-xl font-semibold">Simulasi Cek Pajak dalam pemeliharaan</h2><p className="mt-3 whitespace-pre-line">{settings.features.taxMessage}</p></section>}
            </section>

            <section id="alur-pelayanan" className="mb-16 scroll-mt-36">
              <div className="mb-6">
                <h2 className="text-[24px] font-bold text-[#1d3b53]">Alur Pelayanan Pajak Kendaraan</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-black">Klik tahap pelayanan untuk membaca penjelasannya. Prosedur dapat berbeda berdasarkan jenis pelayanan yang dipilih.</p>
              </div>
              <EditorialAccordion
                headingLevel="h3"
                initialOpen="step-1"
                items={timelineSteps.map((step, index) => ({
                  id: `step-${index + 1}`,
                  eyebrow: `Langkah ${index + 1}`,
                  title: step.title,
                  content: <p>{step.description}</p>,
                }))}
              />
              <p className="mt-4 text-xs leading-6 text-black">Pastikan persyaratan, biaya, dan metode pembayaran melalui kanal resmi sebelum berkunjung.</p>
            </section>

            <section id="lokasi-pelayanan" className="mb-16 scroll-mt-36">
              <h2 className="text-[24px] font-bold text-[#1d3b53]">Lokasi Pelayanan SAMSAT</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-black">Cari nama, alamat, jam pelayanan, dan kontak berdasarkan data lokasi yang tersedia pada portal.</p>
              <div className="mt-7 space-y-4">
                <div className="max-w-lg">
                  <label htmlFor="location-search" className="mb-2 block text-xs font-semibold text-black">Cari nama atau alamat lokasi</label>
                  <input id="location-search" type="search" value={locationSearch} onChange={(event) => setLocationSearch(event.target.value)} placeholder="Contoh: Purwokerto atau Wangon" className="w-full rounded-md border border-[#cfdce5] bg-white px-4 py-3 text-sm text-[#203b51] outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#e5eff8]" />
                </div>
                <div aria-label="Filter jenis lokasi pelayanan" className="flex flex-wrap gap-2">
                  {locationTypes.map((item) => (
                    <button key={item.id} type="button" aria-pressed={filterType === item.id} onClick={() => setFilterType(item.id)}
                      className={`rounded-md border px-3 py-2 text-[12px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC] ${filterType === item.id ? 'border-[#005BAC] bg-[#eaf3fa] text-[#005BAC]' : 'border-[#d4e1ea] bg-white text-black hover:border-[#005BAC]'}`}>{item.label}</button>
                  ))}
                </div>
                <p aria-live="polite" className="text-xs text-black">{filteredLocations.length} dari {serviceLocations.length} lokasi ditampilkan</p>
              </div>

              {filteredLocations.length ? (
                <div className="mt-6">
                  <EditorialAccordion
                    headingLevel="h3"
                    items={filteredLocations.map((loc) => ({
                      id: loc.id,
                      eyebrow: loc.type.replace(/-/g, ' '),
                      title: loc.name,
                      content: (
                        <div className="space-y-5">
                          {loc.description && (
                            <p className="text-[13px] leading-7 text-black">{loc.description}</p>
                          )}
                          <dl className="grid gap-4 border-t border-[#e3ebf0] pt-5 text-[13px] leading-6 sm:grid-cols-2">
                            <div>
                              <dt className="font-semibold text-[#28485e]">Alamat</dt>
                              <dd className="mt-1 text-black">{loc.address}</dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-[#28485e]">Jam pelayanan</dt>
                              <dd className="mt-1 text-black">{loc.operatingHours || 'Belum tersedia'}</dd>
                            </div>
                            {loc.phone && (
                              <div>
                                <dt className="font-semibold text-[#28485e]">Telepon</dt>
                                <dd className="mt-1 text-black">{loc.phone}</dd>
                              </div>
                            )}
                          </dl>
                          {isSamsatMalamMinggu(loc) ? (
                            <div className="space-y-3">
                              <p className="text-[13px] font-semibold text-[#28485e]">Pilih lokasi Samsat Malam Minggu</p>
                              <div className="flex flex-wrap gap-3">
                                {malamMingguLocations.map((place) => (
                                  <a
                                    key={place.name}
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.query)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackLocationClick(loc.name)}
                                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#005BAC] bg-white px-4 py-3 text-[13px] font-semibold text-[#005BAC] transition-colors hover:bg-[#ebf4fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]"
                                    aria-label={`Buka ${place.name} di Google Maps`}
                                  >
                                    Buka Maps: {place.name}
                                  </a>
                                ))}
                              </div>
                              <p className="text-xs leading-6 text-black">Pilih salah satu titik tujuan. Tautan membuka pencarian tempat di Google Maps; periksa pin sebelum berangkat.</p>
                            </div>
                          ) : (
                            <a
                              href={getGoogleMapsUrl(loc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => trackLocationClick(loc.name)}
                              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#005BAC] px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#004781] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]"
                              aria-label={`Buka lokasi ${loc.name} di Google Maps`}
                            >
                              Buka lokasi di Google Maps
                            </a>
                          )}
                        </div>
                      ),
                    }))}
                  />
                </div>
              ) : (
                <div className="mt-6 border border-[#dce5eb] bg-white p-8">
                  <p className="font-semibold text-[#1e3c53]">Lokasi tidak ditemukan.</p>
                  <button type="button" onClick={() => { setLocationSearch(''); setFilterType('all'); }} className="mt-3 text-sm font-semibold text-[#005BAC] underline">Tampilkan semua lokasi</button>
                </div>
              )}
            </section>

            <section id="gerai-samsat" className="mb-16 scroll-mt-36">
              <h2 className="text-[24px] font-bold text-[#1d3b53]">Gerai SAMSAT</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-black">Alternatif titik layanan yang dapat membantu masyarakat mengakses pelayanan lebih dekat.</p>
              <div className="mt-6 grid overflow-hidden border border-[#dce5eb] bg-white lg:grid-cols-[0.9fr_1.1fr]">
                <img src="/images/samsat_ritamall.jpeg" alt="Dokumentasi gerai SAMSAT Rita SuperMall" loading="lazy" className="h-[260px] w-full object-cover lg:h-full" />
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-[#1e3c53]">Pelayanan lebih dekat dengan masyarakat</h3>
                  <p className="mt-4 text-sm leading-7 text-black">Gerai SAMSAT menjadi salah satu alternatif lokasi pelayanan bagi masyarakat yang ingin mengurus pajak kendaraan. Tidak semua layanan tersedia pada setiap gerai.</p>
                  <div className="mt-6">
                    <EditorialAccordion items={[
                      { id: 'gerai-contoh', title: 'Contoh lokasi gerai', content: <p>Rita SuperMall Purwokerto dan gerai lain yang tercantum pada daftar lokasi pelayanan.</p> },
                      { id: 'gerai-persiapan', title: 'Persiapan sebelum datang', content: <p>Periksa kembali jenis layanan, jadwal terbaru, dan persyaratan dokumen yang berlaku pada gerai tujuan.</p> },
                    ]} headingLevel="h4" initialOpen="gerai-contoh" />
                  </div>
                </div>
              </div>
            </section>

            <section id="layanan-digital" className="scroll-mt-36">
              <h2 className="text-[24px] font-bold text-[#1d3b53]">Layanan Digital SAMSAT</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-black">Informasi aplikasi pelayanan pajak kendaraan nasional dan Provinsi Jawa Tengah.</p>
              <div className="mt-6">
                <EditorialAccordion
                  headingLevel="h3"
                  initialOpen="app-signal"
                  items={[
                    {
                      id: 'app-signal',
                      eyebrow: 'Samsat Digital Nasional',
                      title: 'SIGNAL',
                      content: (
                        <div className="space-y-5">
                          <div className="flex items-center gap-4">
                            <img src="/images/signal.jpg" alt="Logo SIGNAL" className="h-14 w-14 object-contain" loading="lazy" />
                            <p className="text-[13px] font-medium text-black">Samsat Digital Nasional</p>
                          </div>
                          <p className="text-[14px] leading-7 text-black">Aplikasi layanan Samsat Digital Nasional yang menyediakan fasilitas pengesahan STNK tahunan serta pembayaran pajak kendaraan bermotor sesuai ketentuan.</p>
                          <a href="https://play.google.com/store/apps/details?id=app.signal.id&hl=id" target="_blank" rel="noopener noreferrer" onClick={() => trackAppDownload('signal')} className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#005BAC] px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#004781] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]">Buka SIGNAL di Google Play</a>
                        </div>
                      ),
                    },
                    {
                      id: 'app-sakpole',
                      eyebrow: 'Layanan Pajak Kendaraan Jawa Tengah',
                      title: 'New SAKPOLE',
                      content: (
                        <div className="space-y-5">
                          <div className="flex items-center gap-4">
                            <img src="/images/new_sakpole.jpeg" alt="Logo New SAKPOLE" className="h-14 w-14 object-contain" loading="lazy" />
                            <p className="text-[13px] font-medium text-black">Layanan Pajak Kendaraan Jawa Tengah</p>
                          </div>
                          <p className="text-[14px] leading-7 text-black">Layanan digital pajak kendaraan Jawa Tengah untuk mengakses informasi pajak dan fasilitas pembayaran sesuai layanan yang tersedia.</p>
                          <a href="https://play.google.com/store/apps/details?id=com.jatengprov.bapenda.newsakpole&hl=id" target="_blank" rel="noopener noreferrer" onClick={() => trackAppDownload('sekpole')} className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#005BAC] px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#004781] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]">Buka New SAKPOLE di Google Play</a>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};


