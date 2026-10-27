/**
 * Migrasi metadata dokumen contoh sebagai Draft tanpa PDF.
 * Dry-run secara default, tulis ke PostgreSQL hanya dengan --apply.
 * Judul diperiksa untuk mencegah entri ganda.
 */
import { prisma } from '../lib/prisma';
import { INITIAL_DOCUMENTS } from '../../../apps/website-publik/src/data/mockData';

const months: Record<string, number> = {
  Januari: 1, Februari: 2, Maret: 3, April: 4, Mei: 5, Juni: 6,
  Juli: 7, Agustus: 8, September: 9, Oktober: 10, November: 11, Desember: 12
};
function parseDate(value: string): Date {
  const match = /^(\d{1,2}) (\w+) (\d{4})$/.exec(value);
  if (!match || !months[match[2] ?? ""]) throw new Error('Format tanggal tidak valid: ' + value);
  const day = Number(match[1]), month = months[match[2] ?? ""]!, year = Number(match[3]);
  const result = new Date(Date.UTC(year, month - 1, day));
  if (result.getUTCDate() !== day || result.getUTCMonth() !== month - 1) {
    throw new Error('Tanggal tidak valid: ' + value);
  }
  return result;
}

async function main() {
  const apply = process.argv.includes('--apply');
  let added = 0, skipped = 0;
  console.log(apply ? 'MODE SIMPAN — semua dokumen sebagai Draft tanpa PDF' : 'MODE PRATINJAU — tidak mengubah database');
  for (const item of INITIAL_DOCUMENTS) {
    const existing = await prisma.publicDocument.findFirst({
      where: { title: { equals: item.title, mode: 'insensitive' } },
      select: { id: true, isPublished: true }
    });
    if (existing) {
      console.log('LEWATI (sudah ada): ' + item.title);
      skipped++;
      continue;
    }
    if (!apply) {
      console.log('AKAN DITAMBAHKAN sebagai Draft: ' + item.title);
      continue;
    }
    await prisma.publicDocument.create({
      data: {
        title: item.title,
        category: item.category,
        fileType: item.fileType,
        fileSize: item.fileSize,
        downloadUrl: '',
        updateDate: parseDate(item.updateDate),
        description: item.description ?? null,
        isPublished: false
      }
    });
    console.log('DITAMBAHKAN sebagai Draft: ' + item.title);
    added++;
  }
  console.log(`Selesai. Ditambahkan: ${added}; dilewati: ${skipped}.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });

