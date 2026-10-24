import { prisma } from '../lib/prisma';
const entries = [
  { title: 'Maklumat Pelayanan', description: 'Gambar dokumentasi maklumat pelayanan yang disertakan pada project.', image: '/images/maklumat.jpeg' },
  { title: 'Standar Operasional Prosedur', description: 'Gambar prosedur pelayanan yang tersedia dalam aset website.', image: '/images/sop1.jpg' },
  { title: 'Sistem Informasi Pelayanan Publik', description: 'Dokumentasi pelayanan publik yang tersedia di project.', image: '/images/sipp2.jpg' }
];
async function main() {
  const apply = process.argv.includes('--apply');
  console.log(apply ? 'MODE SIMPAN — sebagai Draft' : 'MODE PRATINJAU — tanpa perubahan database');
  let inserted=0,skipped=0;
  for(const item of entries) {
    const match=await prisma.visualArchive.findFirst({where:{image:item.image},select:{id:true}});
    if(match){console.log('LEWATI (sudah ada): '+item.title);skipped++;continue;}
    if(!apply){console.log('AKAN DITAMBAHKAN sebagai Draft: '+item.title);continue;}
    await prisma.visualArchive.create({data:{...item,isPublished:false}});
    console.log('DITAMBAHKAN sebagai Draft: '+item.title);inserted++;
  }
  console.log(`Selesai. Ditambahkan: ${inserted}, dilewati: ${skipped}`);
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>prisma.$disconnect());