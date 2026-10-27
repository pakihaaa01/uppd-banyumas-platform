/** Run only against an isolated, migrated database whose name starts with uppd_test. */
import assert from 'node:assert/strict';
import {createHash,generateKeyPairSync,randomUUID} from 'node:crypto';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
const url=process.env.TEST_DATABASE_URL;
if(!url || !new URL(url).pathname.startsWith('/uppd_test'))throw Error('TEST_DATABASE_URL must point to an isolated uppd_test database.');
process.env.DATABASE_URL=url;
for(const key of ['GA_PROPERTY_ID','GA_CLIENT_EMAIL','GA_PRIVATE_KEY','GA_MEASUREMENT_ID'])delete process.env[key];
const {prisma}=await import('../src/lib/prisma');
const {settingsRouter,publicSettingsRouter}=await import('../src/routes/settings');
const {templatesRouter}=await import('../src/routes/templates');
const {authRouter}=await import('../src/routes/auth');
const {analyticsRouter}=await import('../src/routes/analytics');
const {announcementsRouter}=await import('../src/routes/announcements');
const {publicRouter}=await import('../src/routes/public');
const app=express();app.use(express.json(),cookieParser());app.use('/settings',settingsRouter);app.use('/public',publicSettingsRouter,publicRouter);app.use('/templates',templatesRouter);app.use('/auth',authRouter);app.use('/analytics',analyticsRouter);app.use('/announcements',announcementsRouter);
app.use((e:any,_q:express.Request,r:express.Response,_n:express.NextFunction)=>r.status(e.status??500).json({message:e.message}));
const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
const address=server.address();assert(address&&typeof address!=='string');const base='http://127.0.0.1:'+address.port;
const nativeFetch=globalThis.fetch;let checks=0;
const suffix=randomUUID();let cookie='';const password='Testing-Password-123!';
const admin=await prisma.user.create({data:{username:'test-'+suffix,displayName:'Test Admin',passwordHash:await bcrypt.hash(password,4),role:'ADMINISTRATOR'}});
const operator=await prisma.user.create({data:{username:'operator-'+suffix,displayName:'Test Operator',passwordHash:await bcrypt.hash(password,4),role:'OPERATOR'}});
async function call(path:string,method='GET',body?:unknown,expected=200,session=cookie){
 const r=await nativeFetch(base+path,{method,headers:{...(session?{cookie:session}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 assert.equal(r.status,expected,path+' '+await r.clone().text());checks++;return {data:await r.json() as any,response:r};
}
try{
 await call('/settings','GET',undefined,401);
 await call('/auth/login','POST',{username:operator.username,password},401);
 const login=await call('/auth/login','POST',{username:admin.username,password});cookie=login.response.headers.get('set-cookie')!.split(';')[0]!;
 const second=await call('/auth/login','POST',{username:admin.username,password});const otherCookie=second.response.headers.get('set-cookie')!.split(';')[0]!;
 const token='test-retired-'+suffix;await prisma.session.create({data:{userId:operator.id,tokenHash:createHash('sha256').update(token).digest('hex'),expiresAt:new Date(Date.now()+60000)}});
 await call('/settings','GET',undefined,401,'uppd_session='+token);
 const current=(await call('/settings')).data;let version=current.version;const settings=current.settings;
 await call('/settings/contact','PUT',{value:{...settings.contact,email:'invalid'},version},400);
 await call('/settings/hero','PUT',{value:{slides:['https://example.com/file.svg'],seconds:5},version},400);
 await call('/settings/contact','PUT',{value:{...settings.contact,mainLocationId:'missing'},version},400);
 const changed=await call('/settings/contact','PUT',{value:{...settings.contact,phone:'0281-123456'},version});assert.equal(changed.data.settings.contact.phone,'0281-123456');
 await call('/settings/contact','PUT',{value:settings.contact,version},409);version=changed.data.version;
 const features={...settings.features,taxEnabled:false,chatbotEnabled:false,taxMessage:'Pemeliharaan uji',chatbotMessage:'Chat uji'};
 version=(await call('/settings/features','PUT',{value:features,version})).data.version;
 const pub=(await call('/public/settings')).data;assert.equal(pub.settings.features.taxEnabled,false);assert.equal(pub.settings.features.taxMessage,'Pemeliharaan uji');assert.equal(pub.analytics.measurementId,'');assert(!JSON.stringify(pub).includes('passwordHash'));
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aG1sAAAAASUVORK5CYII=','base64');
 const upload=await nativeFetch(base+'/settings/hero-images',{method:'POST',headers:{cookie,'Content-Type':'image/png'},body:png});assert.equal(upload.status,201);checks++;const image=(await upload.json() as any).url as string;
 const img=await nativeFetch(base+image.replace('/api/v1/public','/public'));assert.equal(img.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await img.arrayBuffer()),png);checks++;
 version=(await call('/settings/hero','PUT',{value:{slides:[image],seconds:5},version})).data.version;
 const invalid=await nativeFetch(base+'/settings/hero-images',{method:'POST',headers:{cookie,'Content-Type':'image/png'},body:'<script>alert(1)</script>'});assert.equal(invalid.status,400);checks++;
 await call('/templates','POST',{title:'',body:'x'},400);
 const t=(await call('/templates','POST',{title:'Uji',body:'Yth {{nama}}, {{subjek}}'},201)).data.template;
 await call('/templates/'+t.id,'PATCH',{title:'Uji2',body:'Jawaban',version:0});
 await call('/templates/'+t.id,'DELETE',{version:0},409);
 await call('/templates/'+t.id,'DELETE',{version:1});
 const ann=(await call('/announcements','POST',{title:'Notifikasi uji',date:'2026-10-27',category:'Test',shortDescription:'Ringkasan',content:'Isi lengkap',isImportant:true,showInNotifications:true,notificationExpiresAt:'2026-10-28T10:00:00+07:00'},201)).data.announcement;
 await call('/announcements/'+ann.id+'/publish','POST');
 const published=(await call('/public/announcements')).data.announcements.find((a:any)=>a.id===ann.id);assert(published);assert.equal(published.showInNotifications,true);assert.equal(published.notificationExpiresAt,'2026-10-28T03:00:00.000Z');
 await call('/announcements/'+ann.id+'/unpublish','POST');await call('/announcements/'+ann.id,'DELETE');
 await call('/settings/account/me','PATCH',{displayName:'Updated',currentPassword:'incorrect',newPassword:'New-Password-123!'},400);
 await call('/settings/account/me','PATCH',{displayName:'Updated',currentPassword:password,newPassword:'New-Password-123!'});
 assert.equal((await call('/auth/me')).data.user.displayName,'Updated');await call('/auth/me','GET',undefined,401,otherCookie);
 assert.equal((await call('/analytics')).data.configured,false);await call('/analytics?days=2','GET',undefined,400);
 process.env.GA_PROPERTY_ID='123456';process.env.GA_CLIENT_EMAIL='test@example.com';process.env.GA_PRIVATE_KEY=generateKeyPairSync('rsa',{modulusLength:2048}).privateKey.export({type:'pkcs8',format:'pem'}).toString();
 let oauthCalls=0;let reportCalls=0;
 globalThis.fetch=async(input,init)=>{
  const uri=String(input);if(uri.includes('oauth2.googleapis.com')){oauthCalls++;return new Response(JSON.stringify({access_token:'test-token',expires_in:3600}),{status:200});}
  if(uri.includes('analyticsdata.googleapis.com')){reportCalls++;const b=JSON.parse(String(init?.body));return new Response(JSON.stringify({rows:[{dimensionValues:b.dimensions?[{value:b.dimensions[0].name==='date'?'20261027':'Beranda'}]:[],metricValues:b.metrics.map(()=>({value:'3'}))}]}),{status:200});}
  throw Error('Unexpected outbound request');
 };
 const stats=(await call('/analytics')).data;assert.equal(stats.configured,true);assert.equal(stats.testing,true);assert.equal(stats.realtime.users,3);assert.equal(stats.totals.views,3);assert.equal(stats.daily[0].label,'20261027');assert.equal(reportCalls,5);
 await call('/analytics');assert.equal(reportCalls,5);assert(oauthCalls>=1);
 globalThis.fetch=async()=>new Response('{}',{status:403});await call('/analytics?days=30','GET',undefined,502);
 console.log(`${checks} HTTP assertions passed: authorization, conflicts, settings, image bytes, templates, publication, password/session revocation, GA unset/success/cache/error.`);
}finally{
 globalThis.fetch=nativeFetch;
 await prisma.announcement.deleteMany({where:{createdById:admin.id}});await prisma.user.deleteMany({where:{id:{in:[admin.id,operator.id]}}});
 await prisma.$disconnect();await new Promise<void>((r,j)=>server.close(e=>e?j(e):r()));
}
