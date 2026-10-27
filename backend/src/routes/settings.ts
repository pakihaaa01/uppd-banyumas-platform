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
  res.json({settings,mainLocation,analytics:{measurementId:/^G-[A-Z0-9]+$/.test(process.env.GA_MEASUREMENT_ID??'')?process.env.GA_MEASUREMENT_ID:'',testing:process.env.GA_ENVIRONMENT!=='production'}});
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
