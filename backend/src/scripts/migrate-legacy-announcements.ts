/**
 * Migrasi satu kali pengumuman contoh website publik ke PostgreSQL.
 * Secara default hanya menampilkan pratinjau. Tambahkan --apply untuk menyimpan.
 * Tidak menerbitkan konten: semua pengumuman baru berstatus DRAFT.
 */
import { prisma } from '../lib/prisma';
import { INITIAL_ANNOUNCEMENTS } from '../../../apps/website-publik/src/data/mockData';

const monthNumbers: Record<string, number> = {
  Januari: 1, Februari: 2, Maret: 3, April: 4, Mei: 5, Juni: 6,
  Juli: 7, Agustus: 8, September: 9, Oktober: 10, November: 11, Desember: 12,
};

function parseDate(value: string): Date {
  const match = /^(\d{1,2}) (\w+) (\d{4})$/.exec(value);
  if (!match || !monthNumbers[match[2] ?? ""]) throw new Error(`Tanggal tidak dikenal: ${value}`);
  const day = Number(match[1]), month = monthNumbers[match[2] ?? ""]!, year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCDate() !== day || date.getUTCMonth() !== month - 1) {
    throw new Error(`Tanggal tidak valid: ${value}`);
  }
  return date;
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const author = await prisma.user.findFirst({
    where: { role: 'ADMINISTRATOR' },
    select: { id: true, username: true },
  });
  if (!author) throw new Error('Akun Administrator tidak ditemukan. Migrasi dibatalkan.');

  console.log(apply ? 'MODE SIMPAN — DRAFT SAJA' : 'MODE PRATINJAU — TIDAK MENGUBAH DATABASE');
  console.log(`Penulis migrasi: ${author.username}`);
  let inserted = 0, skipped = 0;

  for (const item of INITIAL_ANNOUNCEMENTS) {
    const existing = await prisma.announcement.findFirst({
      where: { title: { equals: item.title, mode: 'insensitive' } },
      select: { id: true, status: true },
    });
    if (existing) {
      console.log(`LEWATI (sudah ada: ${existing.status}): ${item.title}`);
      skipped++;
      continue;
    }

    const data = {
      title: item.title,
      date: parseDate(item.date),
      category: item.category,
      shortDescription: item.shortDescription,
      content: item.content,
      isNew: item.isNew ?? false,
      isImportant: item.isImportant ?? false,
      status: 'DRAFT' as const,
      createdById: author.id,
    };
    if (apply) {
      await prisma.announcement.create({ data });
      console.log(`DITAMBAHKAN sebagai DRAFT: ${item.title}`);
      inserted++;
    } else {
      console.log(`AKAN DITAMBAHKAN sebagai DRAFT: ${item.title}`);
    }
  }
  console.log(`Selesai. ${apply ? `${inserted} ditambahkan` : 'Tidak ada data yang diubah'}, ${skipped} dilewati.`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

