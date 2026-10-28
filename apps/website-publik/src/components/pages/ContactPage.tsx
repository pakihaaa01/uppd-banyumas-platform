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
  const {settings,ready,offices}=useOperational();
  const [selectedOffice,setSelectedOffice]=useState('');
  const office=offices.find(o=>o.id===selectedOffice)??null;
  const contact={phone:office?.phone??'',whatsapp:office?.whatsapp??'',email:office?.email??''};
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
              <label className="mt-5 block text-sm font-semibold">Kantor<select className={fieldClass} value={office?.id??''} onChange={e=>setSelectedOffice(e.target.value)}><option value="">Pilih Kantor</option>{offices.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
              {!office&&<p className="mt-4 text-sm">Pilih kantor untuk melihat alamat, saluran kontak, dan jadwal pelayanan.</p>}
              {office&&<>
              <dl className="mt-6 space-y-6 border-t border-[#e2e9ee] pt-6">
                <div><dt className="text-[13px] font-bold text-[#1f3b51]">Alamat</dt><dd className="mt-1 text-sm leading-6 text-black">{office.address} — <a href={office.mapsUrl} onClick={()=>trackEvent('open_maps')} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#005BAC] underline">Lihat di Google Maps</a></dd></div>
                <div>
                    <dt className="text-[13px] font-bold text-[#1f3b51]">Telepon dan WhatsApp</dt>
                    <dd className="mt-1 space-y-1.5 text-sm text-black">
                      <p><a className="hover:underline" href={contact.phone ? "tel:"+contact.phone.replace(/[^+0-9]/g,"") : undefined}>{contact.phone || "Belum tersedia"}</a></p>
                      <p><a className="inline-flex items-center gap-1 font-semibold text-[#005BAC] hover:underline" href={contact.whatsapp ? "https://wa.me/"+contact.whatsapp : undefined} target="_blank" rel="noopener noreferrer">{contact.whatsapp || "Belum tersedia"}</a></p>
                    </dd>
                </div>
                <div><dt className="text-[13px] font-bold text-[#1f3b51]">Email</dt><dd className="mt-1 text-sm text-black"><a href={contact.email ? "mailto:"+contact.email : undefined} className="break-all hover:underline">{contact.email || "Belum tersedia"}</a></dd></div>
                <div><dt className="text-[13px] font-bold text-[#1f3b51]">Jam pelayanan</dt><dd className="mt-3 overflow-hidden rounded border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3 font-semibold">Hari</th><th className="p-3 font-semibold">Pelayanan (WIB)</th></tr></thead><tbody>{office.serviceSchedule?.length?office.serviceSchedule.map((row,i)=><tr key={i} className="border-t"><td className="p-3 align-top">{row.day}</td><td className="p-3">{row.closed?'Tutup':row.open+'–'+row.close}{row.note&&<p className="mt-1 text-xs leading-5">{row.note}</p>}</td></tr>):<tr className="border-t"><td className="p-3 align-top">Jadwal kantor</td><td className="whitespace-pre-line p-3">{office.operatingHours||'Belum tersedia'}</td></tr>}</tbody></table></dd></div>
              </dl></>}
            </section>
          </div>

          <section className="border border-[#dce5eb] bg-white p-6 sm:p-8" aria-labelledby="contact-form-title">
            <div className="border-b border-[#e3eaf0] pb-6">
                <h2 id="contact-form-title" className="text-xl font-bold text-[#1d3b53]">Formulir Pesan</h2>
                <p className="mt-2 text-sm leading-6 text-black">Sampaikan pertanyaan seputar pelayanan, permintaan informasi tambahan, saran, atau pengaduan masyarakat melalui formulir ini.</p>
            </div>
            <p className="mt-4 text-sm leading-6">Seluruh pesan dan pengaduan melalui formulir ini diterima oleh pengelolaan UPPD Kabupaten Banyumas. Pilihan kantor hanya mengubah informasi kontak yang ditampilkan.</p>
            {settings.contact.email&&<p className="mt-2 text-sm">Email pengaduan pusat: <a className="text-[#005BAC] underline" href={'mailto:'+settings.contact.email}>{settings.contact.email}</a></p>}
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
        <section aria-labelledby="contact-guidance" className="mt-8 border border-[#dce5eb] bg-white p-6 sm:p-8">
          <h2 id="contact-guidance" className="mb-5 text-xl font-bold text-[#1d3b53]">Panduan Menghubungi Layanan</h2>
          <EditorialAccordion headingLevel="h3" initialOpen="channels" items={[
            {id:'channels',title:'Pilih saluran komunikasi sesuai kebutuhan',content:<p>Untuk pertanyaan singkat tentang lokasi, persyaratan, atau jadwal, gunakan telepon atau WhatsApp kantor yang dipilih. Gunakan formulir untuk pertanyaan, saran, atau pengaduan yang memerlukan penjelasan lebih lengkap. Seluruh pesan formulir dikelola UPPD pusat.</p>},
            {id:'service',title:'Cara menanyakan informasi pelayanan',content:<p>Sebutkan jenis layanan yang Anda perlukan, nama kantor terkait, dan hal yang ingin diketahui. Contoh: “Apa persyaratan pembayaran pajak tahunan di kantor ini?” Periksa jadwal kantor sebelum menghubungi atau datang langsung.</p>},
            {id:'complaint',title:'Cara menyampaikan pengaduan',content:<p>Tulis pokok pengaduan pada subjek. Jelaskan kejadian secara berurutan, tanggal kejadian, kantor atau lokasi pelayanan, dan hal yang Anda harapkan untuk ditindaklanjuti. Gunakan bahasa yang jelas dan santun agar petugas dapat memahami persoalan.</p>},
            {id:'prepare',title:'Informasi yang perlu disiapkan',content:<p>Isi nama dan alamat email yang dapat dihubungi. Berikan rincian yang berkaitan dengan pertanyaan atau kejadian. Jangan mencantumkan password, kode OTP, nomor rekening, atau data pribadi sensitif yang tidak diperlukan. Selama pengujian website, gunakan contoh data.</p>},
            {id:'reply',title:'Setelah menyampaikan pesan',content:<p>Pastikan muncul pemberitahuan bahwa pesan berhasil disimpan. Penanganan pesan dilakukan oleh pengelola pusat pada jam kerja. Periksa kotak masuk dan folder spam email yang Anda cantumkan. Waktu tanggapan mengikuti proses penanganan yang berlaku; pengiriman pesan tidak berarti urusan pelayanan langsung selesai.</p>}
          ]}/>
        </section>

      </div>
    </main>
  );
};


