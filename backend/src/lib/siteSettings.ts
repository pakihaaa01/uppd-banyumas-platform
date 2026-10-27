import { prisma } from './prisma';

export const defaultSettings = {
  contact: { phone: '(0281) 637801', whatsapp: '6285112680759', email: 'Up3adbms@gmail.com', mainLocationId: '' },
  hero: { slides: ['/images/slider/01.jpg', '/images/slider/02.jpg', '/images/slider/03.jpg'], seconds: 6.5 },
  features: { taxEnabled: true, chatbotEnabled: true, taxMessage: 'Simulasi cek pajak sementara dalam pemeliharaan. Silakan mencoba kembali nanti.', chatbotMessage: 'Chat bantuan sementara dalam pemeliharaan. Silakan lihat FAQ atau halaman Kontak.' }
};
export type SiteSettings = typeof defaultSettings;
export function validateSettings(section: string, value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Pengaturan tidak valid.';
  const v = value as Record<string, unknown>;
  const text = (key: string, max: number) => typeof v[key] === 'string' && (v[key] as string).length <= max;
  if (section === 'contact') {
    if (Object.keys(v).sort().join() !== ['phone','whatsapp','email','mainLocationId'].sort().join()) return 'Kolom kontak tidak sesuai.';
    if (!text('phone', 80) || !text('whatsapp', 20) || !text('email', 254) || !text('mainLocationId', 100)) return 'Kontak tidak valid.';
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email as string)) return 'Format email tidak valid.';
    if (v.whatsapp && !/^62\d{7,15}$/.test(v.whatsapp as string)) return 'WhatsApp menggunakan kode 62, tanpa spasi atau tanda +.';
  } else if (section === 'hero') {
    if (Object.keys(v).sort().join() !== ['slides','seconds'].sort().join()) return 'Kolom foto tidak sesuai.';
    if (typeof v.seconds !== 'number' || !Number.isFinite(v.seconds) || v.seconds < 3 || v.seconds > 30) return 'Durasi harus 3–30 detik.';
    if (!Array.isArray(v.slides) || !v.slides.length || v.slides.length > 8 || new Set(v.slides).size !== v.slides.length || v.slides.some(p => typeof p !== 'string' || !/^(\/images\/slider\/0[123]\.jpg|\/api\/v1\/public\/hero-images\/[0-9a-f-]{36})$/.test(p))) return 'Pilih 1–8 foto yang sudah diunggah, tanpa duplikasi.';
  } else if (section === 'features') {
    if (Object.keys(v).sort().join() !== ['taxEnabled','chatbotEnabled','taxMessage','chatbotMessage'].sort().join()) return 'Kolom status tidak sesuai.';
    if (typeof v.taxEnabled !== 'boolean' || typeof v.chatbotEnabled !== 'boolean' || !text('taxMessage', 500) || !text('chatbotMessage', 500) || !(v.taxMessage as string).trim() || !(v.chatbotMessage as string).trim()) return 'Isi pesan pemeliharaan, maksimal 500 karakter.';
  } else return 'Bagian pengaturan tidak ditemukan.';
  return null;
}
export async function readSettings() {
  const row = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
  return { settings: row ? row.value as unknown as SiteSettings : structuredClone(defaultSettings), version: row?.version ?? 0 };
}
export function imageMime(data: Buffer): string | null {
  if (data.length < 12 || data.length > 5 * 1024 * 1024) return null;
  if (data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (data[0] === 255 && data[1] === 216 && data[2] === 255) return 'image/jpeg';
  if (data.toString('ascii',0,4)==='RIFF' && data.toString('ascii',8,12)==='WEBP') return 'image/webp';
  return null;
}
