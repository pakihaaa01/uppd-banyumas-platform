import {trackEvent} from '../../lib/analytics';
import {useOperational} from '../../context/OperationalContext';
import React, { useState } from 'react';
import { EditorialAccordion } from '../shared/EditorialAccordion';
import { useSamsat } from '../../context/SamsatContext';
import { PageHeading } from '../shared/PageHeading';

const emptyForm = { name: '', email: '', subject: '', message: '' };
const fieldClass = 'mt-2 block w-full rounded-md border border-[#cfdce5] bg-white px-3.5 py-3 text-sm text-[#203b51] outline-none placeholder:text-black focus:border-[#005BAC] focus:ring-2 focus:ring-[#e7f2fb]';
const labelClass = 'block text-[13px] font-semibold text-[#354e60]';

export const ContactPage: React.FC = () => {
  const {settings,mainLocation,ready}=useOperational();
  const contact=settings.contact;
  const { addContactMessage } = useSamsat();
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) return;
    setSending(true);
    const saved = await addContactMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });
    setSending(false);
    if (!saved) return;
    setFormData(emptyForm);
    setIsSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#f7f9fb] pb-24 pt-[112px] md:pt-[140px]">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <PageHeading
          eyebrow="Hubungi kami"
          title="Kontak dan Informasi Pelayanan"
          description="Informasi lokasi, saluran komunikasi, dan panduan untuk menghubungi UPPD Kabupaten Banyumas serta SAMSAT Purwokerto."
        />
        {!ready && <p role="status" className="mt-6 text-black">Informasi kantor sedang dimuat atau belum tersedia.</p>}
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <section className="border border-[#dce5eb] bg-white p-6 sm:p-8" aria-labelledby="contact-details">
              <h2 id="contact-details" className="text-xl font-bold text-[#1d3b53]">Informasi Kantor</h2>
              <p className="mt-2 text-sm leading-6 text-black">UPPD Kabupaten Banyumas — {mainLocation?.name || "Kantor utama"}</p>
              <dl className="mt-6 space-y-6 border-t border-[#e2e9ee] pt-6">
                <div><dt className="text-[13px] font-bold text-[#1f3b51]">Alamat</dt><dd className="mt-1 text-sm leading-6 text-black">{mainLocation?.address || "Alamat kantor utama belum tersedia."}</dd></div>
                <div>
                    <dt className="text-[13px] font-bold text-[#1f3b51]">Telepon dan WhatsApp</dt>
                    <dd className="mt-1 space-y-1.5 text-sm text-black">
                      <p><a className="hover:underline" href={contact.phone ? "tel:"+contact.phone.replace(/[^+0-9]/g,"") : undefined}>{contact.phone || "Belum tersedia"}</a></p>
                      <p><a className="inline-flex items-center gap-1 font-semibold text-[#005BAC] hover:underline" href={contact.whatsapp ? "https://wa.me/"+contact.whatsapp : undefined} target="_blank" rel="noopener noreferrer">{contact.whatsapp || "Belum tersedia"}</a></p>
                    </dd>
                </div>
                <div><dt className="text-[13px] font-bold text-[#1f3b51]">Email</dt><dd className="mt-1 text-sm text-black"><a href={contact.email ? "mailto:"+contact.email : undefined} className="break-all hover:underline">{contact.email || "Belum tersedia"}</a></dd></div>
                <div><dt className="text-[13px] font-bold text-[#1f3b51]">Jam pelayanan kantor utama</dt>
                    <dd className="mt-1 text-sm leading-7 text-black">{mainLocation?.operatingHours || "Jadwal belum tersedia."}</dd>
                    <p className="mt-2 text-xs leading-5 text-black">Jadwal perlu dikonfirmasi kepada instansi sebelum berkunjung.</p>
                </div>
              </dl>
            </section>
            <section className="overflow-hidden border border-[#dce5eb] bg-white" aria-labelledby="contact-map">
              <div className="px-6 py-5"><h2 id="contact-map" className="text-lg font-bold text-[#1d3b53]">Peta Lokasi</h2><p className="mt-1 text-sm text-black">Arah menuju {mainLocation?.name || "kantor utama"}</p></div>
              {mainLocation && <a onClick={()=>trackEvent('open_maps')} href={mainLocation.mapsUrl || 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(mainLocation.name+' '+mainLocation.address)} target="_blank" rel="noopener noreferrer" className="mx-6 mb-6 inline-block rounded border border-blue-700 px-4 py-3 font-semibold text-blue-800">Buka lokasi di Google Maps</a>}

            </section>
            <section aria-labelledby="contact-guidance" className="border border-[#dce5eb] bg-white p-6 sm:p-8">
              <h2 id="contact-guidance" className="mb-4 text-lg font-bold text-[#1d3b53]">Panduan Menghubungi Layanan</h2>
              <EditorialAccordion
                headingLevel="h3"
                initialOpen="contact-hours"
                items={[
                  { id: 'contact-hours', title: 'Waktu yang tepat untuk menghubungi', content: <p>Hubungi kantor pada jam kerja yang berlaku. Jadwal di halaman ini merupakan data project dan dapat berubah; konfirmasikan terlebih dahulu melalui kanal resmi.</p> },
                  { id: 'contact-docs', title: 'Informasi yang perlu disiapkan', content: <p>Siapkan jenis layanan, pertanyaan yang ingin diajukan, dan rincian kebutuhan administrasi. Jangan pernah membagikan kata sandi, OTP, atau informasi pribadi sensitif melalui formulir demonstrasi.</p> },
                  { id: 'contact-channels', title: 'Saluran komunikasi alternatif', content: <p>Telepon, email, dan WhatsApp yang tercantum di bagian Informasi Kantor dapat digunakan untuk menanyakan layanan. Ketersediaan saluran perlu dikonfirmasi dengan kantor terkait.</p> },
                ]}
              />
            </section>
          </div>

          <section className="border border-[#dce5eb] bg-white p-6 sm:p-8" aria-labelledby="contact-form-title">
            <div className="border-b border-[#e3eaf0] pb-6">
                <h2 id="contact-form-title" className="text-xl font-bold text-[#1d3b53]">Formulir Pesan</h2>
                <p className="mt-2 text-sm leading-6 text-black">Simulasi formulir masukan untuk kebutuhan pengembangan website.</p>
            </div>
            <div className="mt-5 border-l-[3px] border-[#c08c33] bg-[#fff9ed] px-4 py-3 text-xs leading-6 text-[#715727]">
              <strong>Versi demonstrasi:</strong> Pesan demonstrasi disimpan di database lokal, bukan dikirim ke petugas UPPD. Jangan masukkan data pribadi sensitif atau pengaduan sebenarnya.
            </div>
            {isSubmitted && (
              <div role="status" className="mt-5 flex items-start gap-3 border border-[#b9d9c3] bg-[#f1faf3] px-4 py-4 text-sm text-[#245a39]">
                <p><strong>Contoh pesan tersimpan di database lokal.</strong> Pesan belum dikirim ke instansi. Gunakan telepon, email, atau WhatsApp untuk menghubungi kantor.</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div><label htmlFor="contact-name" className={labelClass}>Nama <span aria-hidden="true">*</span></label><input id="contact-name" type="text" autoComplete="name" required maxLength={100} value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Nama Anda" className={fieldClass} /></div>
                <div><label htmlFor="contact-email" className={labelClass}>Email <span aria-hidden="true">*</span></label><input id="contact-email" type="email" autoComplete="email" required maxLength={150} value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="nama@email.com" className={fieldClass} /></div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div><label htmlFor="contact-subject" className={labelClass}>Subjek <span aria-hidden="true">*</span></label><input id="contact-subject" type="text" required maxLength={150} value={formData.subject} onChange={(event) => setFormData({ ...formData, subject: event.target.value })} placeholder="Topik pesan" className={fieldClass} /></div>
              </div>
              <div><div className="flex items-center justify-between"><label htmlFor="contact-message" className={labelClass}>Isi pesan <span aria-hidden="true">*</span></label><span className="text-xs text-black">{formData.message.length}/1000</span></div><textarea id="contact-message" required rows={6} maxLength={1000} value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} placeholder="Tuliskan contoh pertanyaan atau saran..." className={`${fieldClass} resize-y`} /></div>
              <button type="submit" disabled={sending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#005BAC] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#004a89] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]">Simpan contoh pesan</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};


