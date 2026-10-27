import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';
export const templatesRouter=Router();
templatesRouter.use(requireAdministrator);
templatesRouter.get('/',async(_req,res)=>{res.json({templates:await prisma.replyTemplate.findMany({orderBy:{title:'asc'}})});});
function validate(v: any){return v && typeof v.title==='string' && v.title.trim().length>0 && v.title.length<=100 && typeof v.body==='string' && v.body.trim().length>0 && v.body.length<=10000;}
templatesRouter.post('/',async(req,res)=>{
 if(!validate(req.body)){res.status(400).json({message:'Isi judul (maks. 100 karakter) dan template (maks. 10.000 karakter).'});return;}
 res.status(201).json({template:await prisma.replyTemplate.create({data:{title:req.body.title.trim(),body:req.body.body.trim()}})});
});
templatesRouter.patch('/:id',async(req,res)=>{
 if(!validate(req.body)||!Number.isInteger(req.body.version)){res.status(400).json({message:'Isi template atau versi tidak valid.'});return;}
 const r=await prisma.replyTemplate.updateMany({where:{id:String(req.params.id),version:req.body.version},data:{title:req.body.title.trim(),body:req.body.body.trim(),version:{increment:1}}});
 if(!r.count){res.status(409).json({message:'Template sudah berubah atau dihapus. Muat ulang.'});return;}
 res.json({message:'Template diperbarui.'});
});
templatesRouter.delete('/:id',async(req,res)=>{
 if(!Number.isInteger(req.body?.version)){res.status(400).json({message:'Versi wajib diisi.'});return;}
 const r=await prisma.replyTemplate.deleteMany({where:{id:String(req.params.id),version:req.body.version}});
 if(!r.count){res.status(409).json({message:'Template sudah berubah atau dihapus. Muat ulang.'});return;}
 res.json({message:'Template dihapus. Draf balasan sebelumnya tetap disimpan.'});
});
