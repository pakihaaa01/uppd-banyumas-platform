import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAdministrator } from '../middleware/auth';

export const messageRepliesRouter = Router();
messageRepliesRouter.use(requireAdministrator);
const maxLength = 10000;

async function sendGmail(to: string, subject: string, body: string): Promise<string> {
  const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER_EMAIL } = process.env;
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !GMAIL_SENDER_EMAIL) {
    throw new Error('Gmail API belum dikonfigurasi. Isi kredensial OAuth di .env backend.');
  }
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID, client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN, grant_type: 'refresh_token'
    })
  });
  if (!tokenResponse.ok) throw new Error('Autentikasi Gmail gagal; periksa konfigurasi OAuth.');
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) throw new Error('Access token Gmail tidak tersedia');
  const clean = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();
  const mime = [
    'From: ' + clean(GMAIL_SENDER_EMAIL),
    'To: ' + clean(to),
    'Subject: =?UTF-8?B?' + Buffer.from(subject).toString('base64') + '?=',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(body,'utf8').toString('base64')
  ].join('\r\n');
  const raw = Buffer.from(mime,'utf8').toString('base64url');
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw })
  });
  const result = await response.json().catch(()=>({})) as {id?:string};
  if (!response.ok || !result.id) throw new Error('Gmail menolak pengiriman (' + response.status + ')');
  return result.id;
}
messageRepliesRouter.post('/:id/draft', async(req,res)=>{
  const body = req.body?.body;
  if(typeof body !== 'string' || !body.trim() || body.length > maxLength){
    res.status(400).json({message:'Isi balasan wajib diisi (maksimal 10.000 karakter)'});return;
  }
  try{
    const result=await prisma.contactMessage.updateMany({
      where:{id:req.params.id,replySentAt:null},
      data:{replyDraft:body.trim(),status:'IN_PROGRESS',replyLastError:null}
    });
    if(!result.count){res.status(409).json({message:'Pesan tidak ditemukan atau balasan sudah dikirim'});return;}
    res.json({message:'Draft balasan tersimpan; status Dalam Proses'});
  }catch(e){console.error(e);res.status(500).json({message:'Gagal menyimpan Draft'});}
});
messageRepliesRouter.post('/:id/send',async(req,res)=>{
  const current=await prisma.contactMessage.findUnique({where:{id:req.params.id}});
  if(!current){res.status(404).json({message:'Pesan tidak ditemukan'});return;}
  if(current.replySentAt){res.status(409).json({message:'Balasan sudah pernah dikirim'});return;}
  const body=current.replyDraft?.trim();
  if(!body){res.status(400).json({message:'Simpan Draft balasan terlebih dahulu'});return;}
  try{
    // Penyerahan ke Gmail sukses tidak menjamin email dibaca/diterima di inbox.
    const gmailId=await sendGmail(current.email,'Re: '+current.subject,body);
    await prisma.contactMessage.update({
      where:{id:current.id},
      data:{status:'COMPLETED',replySentAt:new Date(),replyGmailId:gmailId,replyLastError:null}
    });
    res.json({message:'Email diserahkan ke Gmail. Status Selesai.',gmailId});
  }catch(e){
    const reason=e instanceof Error?e.message:'Pengiriman gagal';
    await prisma.contactMessage.update({
      where:{id:current.id},data:{status:'IN_PROGRESS',replyLastError:reason}
    }).catch(console.error);
    res.status(502).json({message:reason});
  }
});
