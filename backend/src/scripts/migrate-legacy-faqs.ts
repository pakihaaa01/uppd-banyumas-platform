import { prisma } from '../lib/prisma';
import { INITIAL_FAQS } from '../../../apps/website-publik/src/data/mockData';

async function main() {
  const apply = process.argv.includes('--apply');
  let inserted=0,skipped=0;
  console.log(apply ? 'MODE SIMPAN — semua FAQ sebagai nonaktif' : 'MODE PRATINJAU — database tidak diubah');
  for(const item of INITIAL_FAQS) {
    const existing=await prisma.fAQ.findFirst({
      where:{question:{equals:item.question,mode:'insensitive'}},select:{id:true}
    });
    if(existing){console.log('LEWATI (sudah ada): '+item.question);skipped++;continue;}
    if(!apply){console.log('AKAN DITAMBAHKAN (nonaktif): '+item.question);continue;}
    await prisma.fAQ.create({data:{
      question:item.question,answer:item.answer,category:item.category,
      isPopular:item.isPopular ?? false,isEnabled:false,viewCount:0
    }});
    inserted++;
    console.log('DITAMBAHKAN (nonaktif): '+item.question);
  }
  console.log(`Selesai. Ditambahkan: ${inserted}; dilewati: ${skipped}.`);
}
main().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>prisma.$disconnect());
