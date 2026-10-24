/**
 * Impor lokasi contoh dari website publik sebagai Draft di PostgreSQL.
 * Dry-run default. Gunakan --apply untuk menyimpan lokasi yang belum ada.
 * Data tidak dipublikasikan otomatis; periksa alamat/jadwal sebelum terbit.
 */
import { prisma } from '../lib/prisma';
import { INITIAL_SERVICE_LOCATIONS } from '../../../apps/website-publik/src/data/mockData';

async function main() {
  const apply = process.argv.includes('--apply');
  let inserted = 0;
  let skipped = 0;
  console.log(apply ? 'MODE SIMPAN: Draft saja' : 'MODE PRATINJAU: database tidak diubah');

  for (const location of INITIAL_SERVICE_LOCATIONS) {
    const existing = await prisma.serviceLocation.findFirst({
      where: { name: { equals: location.name, mode: 'insensitive' } },
      select: { id: true, isPublished: true }
    });
    if (existing) {
      console.log(`LEWATI (sudah ada): ${location.name}`);
      skipped++;
      continue;
    }
    if (!apply) {
      console.log(`AKAN DITAMBAHKAN sebagai Draft: ${location.name}`);
      continue;
    }
    await prisma.serviceLocation.create({
      data: {
        name: location.name,
        address: location.address,
        operatingHours: location.operatingHours,
        phone: location.phone,
        mapsUrl: location.mapsUrl,
        mapsEmbedUrl: location.mapsEmbedUrl || null,
        description: location.description || null,
        type: location.type === 'drive-thru' ? 'drive_thru' : location.type,
        isMain: location.isMain ?? false,
        isDriveThru: location.isDriveThru ?? false,
        isPublished: false
      }
    });
    inserted++;
    console.log(`DITAMBAHKAN sebagai Draft: ${location.name}`);
  }
  console.log(`Selesai. Ditambahkan: ${inserted}, dilewati: ${skipped}.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
