import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';

export const archiveRouter = Router();
archiveRouter.use(requireAdministrator);
const permitted = new Set([
  '/images/maklumat.jpeg', '/images/sop1.jpg', '/images/sop2.jpg',
  '/images/sipp1.jpg', '/images/sipp2.jpg'
]);
function validate(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const v = input as Record<string, unknown>;
  if (Object.keys(v).some(key => !['title', 'description', 'image'].includes(key))) return null;
  if (typeof v.title !== 'string' || !v.title.trim() || v.title.length > 200) return null;
  if (typeof v.description !== 'string' || v.description.length > 3000) return null;
  if (typeof v.image !== 'string' || !permitted.has(v.image)) return null;
  return {title:v.title.trim(),description:v.description.trim(),image:v.image};
}
archiveRouter.get('/', async (_req,res) => {
  try { res.json({archive:await prisma.visualArchive.findMany({orderBy:{createdAt:'asc'}})}); }
  catch(error) { console.error(error); res.status(500).json({message:'Gagal memuat dokumentasi'}); }
});
archiveRouter.post('/', async(req,res)=>{
  const data=validate(req.body);
  if(!data){res.status(400).json({message:'Isi data dan pilih gambar yang tersedia'});return;}
  try { const item=await prisma.visualArchive.create({data});res.status(201).json({item}); }
  catch(error){console.error(error);res.status(500).json({message:'Gagal menambah dokumentasi'});}
});
archiveRouter.patch('/:id',async(req,res)=>{
  const data=validate(req.body);
  if(!data){res.status(400).json({message:'Data dokumentasi tidak valid'});return;}
  try{
    const result=await prisma.visualArchive.updateMany({where:{id:req.params.id,isPublished:false},data});
    if(!result.count){res.status(404).json({message:'Draft tidak ditemukan'});return;}
    res.json({message:'Draft diperbarui'});
  }catch(error){console.error(error);res.status(500).json({message:'Gagal memperbarui dokumentasi'});}
});
archiveRouter.delete('/:id',async(req,res)=>{
  try{
    const result=await prisma.visualArchive.deleteMany({where:{id:req.params.id,isPublished:false}});
    if(!result.count){res.status(404).json({message:'Draft tidak ditemukan'});return;}
    res.json({message:'Draft dihapus'});
  }catch(error){console.error(error);res.status(500).json({message:'Gagal menghapus dokumentasi'});}
});
archiveRouter.post('/:id/publish',async(req,res)=>{
  try{
    const result=await prisma.visualArchive.updateMany({where:{id:req.params.id,isPublished:false},data:{isPublished:true}});
    if(!result.count){res.status(404).json({message:'Draft tidak ditemukan'});return;}
    res.json({message:'Dokumentasi diterbitkan'});
  }catch(error){console.error(error);res.status(500).json({message:'Gagal menerbitkan dokumentasi'});}
});
archiveRouter.post('/:id/unpublish',async(req,res)=>{
  try{
    const result=await prisma.visualArchive.updateMany({where:{id:req.params.id,isPublished:true},data:{isPublished:false}});
    if(!result.count){res.status(404).json({message:'Dokumentasi terbit tidak ditemukan'});return;}
    res.json({message:'Publikasi ditarik'});
  }catch(error){console.error(error);res.status(500).json({message:'Gagal menarik dokumentasi'});}
});