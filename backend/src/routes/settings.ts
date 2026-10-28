import { Router, raw } from 'express';
import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';
import { defaultSettings, imageMime, readSettings, validateSettings } from '../lib/siteSettings';

export const settingsRouter = Router();
export const publicSettingsRouter = Router();
settingsRouter.use(requireAdministrator);
settingsRouter.get('/', async (_req,res) => { res.json(await readSettings()); });
settingsRouter.put('/:section', async (req,res) => {
  const section = String(req.params.section);
  const { value, version } = req.body ?? {};
  const error = validateSettings(section,value);
  if (error || !Number.isInteger(version) || version < 0) { res.status(400).json({message:error || 'Versi tidak valid.'}); return; }
  if (section === 'contact' && value.mainLocationId && !await prisma.serviceLocation.findFirst({where:{id:value.mainLocationId,isPublished:true}})) { res.status(400).json({message:'Pilih kantor yang sudah dipublikasikan.'}); return; }
  if (section === 'hero') {
    for (const url of value.slides as string[]) if (url.startsWith('/api/')) {
      if (!await prisma.heroImage.findUnique({where:{id:url.split('/').at(-1)!},select:{id:true}})) {res.status(400).json({message:'Foto tidak ditemukan. Unggah kembali.'});return;}
    }
  }
  const result = await prisma.$transaction(async tx => {
    await tx.siteSettings.upsert({where:{id:'main'},create:{id:'main',value:defaultSettings},update:{}});
    const current=await tx.siteSettings.findUniqueOrThrow({where:{id:'main'}});
    const merged={...(current.value as object),[section]:value};
    return tx.siteSettings.updateMany({where:{id:'main',version},data:{value:merged,version:{increment:1}}});
  });
  if (!result.count) {res.status(409).json({message:'Pengaturan telah berubah. Muat ulang sebelum menyimpan.'});return;}
  res.json(await readSettings());
});
settingsRouter.post('/hero-images', rateLimit({windowMs:60000,limit:20}), raw({type:['image/jpeg','image/png','image/webp'],limit:'5mb'}), async(req,res)=>{
  const data=req.body;
  const mime=Buffer.isBuffer(data)?imageMime(data):null;
  if(!mime){res.status(400).json({message:'Gunakan gambar JPG, PNG, atau WebP maksimal 5 MB.'});return;}
  const row=await prisma.heroImage.create({data:{mime,data},select:{id:true}});
  res.status(201).json({url:'/api/v1/public/hero-images/'+row.id});
});
publicSettingsRouter.get('/settings',async(_req,res)=>{
  const {settings}=await readSettings();
  const mainLocation = settings.contact.mainLocationId
    ? await prisma.serviceLocation.findFirst({where:{id:settings.contact.mainLocationId,isPublished:true}})
    : await prisma.serviceLocation.findFirst({where:{isMain:true,isPublished:true},orderBy:{createdAt:'asc'}});
  const offices=await prisma.serviceLocation.findMany({where:{isPublished:true},select:{id:true,name:true,address:true,phone:true,whatsapp:true,email:true,operatingHours:true,serviceSchedule:true,mapsUrl:true},orderBy:[{isMain:'desc'},{name:'asc'}]});
  res.json({settings,mainLocation,offices,analytics:{measurementId:/^G-[A-Z0-9]+$/.test(process.env.GA_MEASUREMENT_ID??'')?process.env.GA_MEASUREMENT_ID:'',testing:process.env.GA_ENVIRONMENT!=='production'}});
});
publicSettingsRouter.get('/hero-images/:id',async(req,res)=>{
  const item=await prisma.heroImage.findUnique({where:{id:String(req.params.id)}});
  if(!item){res.status(404).end();return;}
  res.set({'Content-Type':item.mime,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=86400'}).send(Buffer.from(item.data));
});
settingsRouter.get('/account/me',async(_req,res)=>{
  res.json({user:await prisma.user.findUnique({where:{id:res.locals.currentUser.id},select:{displayName:true,username:true}})});
});
settingsRouter.patch('/account/me',rateLimit({windowMs:15*60*1000,limit:15}),async(req,res)=>{
  const {displayName,currentPassword,newPassword}=req.body??{};
  if(typeof displayName!=='string'||displayName.trim().length<2||displayName.trim().length>100){res.status(400).json({message:'Nama harus 2–100 karakter.'});return;}
  const changes: {displayName:string; passwordHash?:string}={displayName:displayName.trim()};
  if(newPassword!==undefined){
    if(typeof newPassword!=='string'||newPassword.length<12||Buffer.byteLength(newPassword,'utf8')>72||typeof currentPassword!=='string'||currentPassword.length>256){res.status(400).json({message:'Password baru minimal 12 karakter, maksimal 72 byte. Isi password lama.'});return;}
    const user=await prisma.user.findUniqueOrThrow({where:{id:res.locals.currentUser.id}});
    if(!await bcrypt.compare(currentPassword,user.passwordHash)){res.status(400).json({message:'Password lama tidak sesuai.'});return;}
    changes.passwordHash=await bcrypt.hash(newPassword,12);
  }
  await prisma.$transaction(async tx=>{
    await tx.user.update({where:{id:res.locals.currentUser.id},data:changes});
    if(changes.passwordHash){const tokenHash=createHash('sha256').update(req.cookies.uppd_session).digest('hex');await tx.session.deleteMany({where:{userId:res.locals.currentUser.id,tokenHash:{not:tokenHash}}});}
  });
  res.json({message:'Akun berhasil diperbarui.'});
});

// Office contact editor shares ServiceLocation records with the service directory.
settingsRouter.patch('/offices/:id', async(req,res)=>{
 const v=req.body??{};
 const allowed=['address','phone','whatsapp','email','mapsUrl','operatingHours','serviceSchedule','updatedAt'];
 if(Object.keys(v).some(k=>!allowed.includes(k)) || !['address','phone','whatsapp','email','mapsUrl','operatingHours','updatedAt'].every(k=>typeof v[k]==='string') || !v.address.trim() || v.address.length>1000 || v.phone.length>100 || v.operatingHours.length>500 || v.whatsapp.length>20 || (v.whatsapp&&!/^62\d{7,15}$/.test(v.whatsapp)) || v.email.length>254 || (v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) || !Number.isFinite(Date.parse(v.updatedAt))){res.status(400).json({message:'Informasi kantor tidak valid. Periksa alamat, nomor, dan email.'});return;}
 try{const url=new URL(v.mapsUrl);if(!['https:','http:'].includes(url.protocol)||v.mapsUrl.length>2048)throw Error();}catch{res.status(400).json({message:'Tautan Maps harus berupa URL HTTP/HTTPS.'});return;}
 const schedule=v.serviceSchedule;
 const time=(t:unknown)=>typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t);
 if(!Array.isArray(schedule)||schedule.length>8||schedule.some((row:any)=>!row||typeof row.day!=='string'||!row.day.trim()||row.day.length>40||typeof row.closed!=='boolean'||typeof row.note!=='string'||row.note.length>150||typeof row.open!=='string'||typeof row.close!=='string'||(!row.closed&&(!time(row.open)||!time(row.close)||row.close<=row.open)))){res.status(400).json({message:'Periksa hari dan jam pelayanan. Jam tutup harus setelah jam buka.'});return;}
 const hours=schedule.length?schedule.map((row:any)=>row.day+': '+(row.closed?'Tutup':row.open+'–'+row.close)+(row.note?' ('+row.note+')':'')).join('; '):v.operatingHours;
 if(hours.length>500){res.status(400).json({message:'Ringkas jadwal dan catatan hingga maksimal 500 karakter.'});return;}
 const result=await prisma.serviceLocation.updateMany({where:{id:String(req.params.id),updatedAt:new Date(v.updatedAt)},data:{address:v.address.trim(),phone:v.phone.trim(),whatsapp:v.whatsapp,email:v.email,mapsUrl:v.mapsUrl,operatingHours:hours,serviceSchedule:schedule}});
 if(!result.count){res.status(409).json({message:'Informasi kantor berubah atau dihapus. Pilih ulang kantor untuk memuat versi terbaru.'});return;}
 res.json({location:await prisma.serviceLocation.findUnique({where:{id:String(req.params.id)}})});
});
