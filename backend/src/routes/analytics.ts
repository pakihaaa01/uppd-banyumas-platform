import { Router } from 'express';
import { createSign } from 'node:crypto';
import { requireAdministrator } from '../middleware/auth';

export const analyticsRouter=Router();
analyticsRouter.use(requireAdministrator);
let token: {value:string;until:number}|null=null;
const cache=new Map<string,{until:number;value:unknown}>();
const pending=new Map<string,Promise<unknown>>();
function configuration(){return {property:process.env.GA_PROPERTY_ID??'',email:process.env.GA_CLIENT_EMAIL??'',key:(process.env.GA_PRIVATE_KEY??'').replace(/\\n/g,'\n')};}
async function accessToken(){
 if(token && token.until>Date.now())return token.value;
 const c=configuration();const now=Math.floor(Date.now()/1000);
 const encode=(v:object)=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const unsigned=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:c.email,scope:'https://www.googleapis.com/auth/analytics.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
 const signature=createSign('RSA-SHA256').update(unsigned).sign(c.key,'base64url');
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:unsigned+'.'+signature}),signal:AbortSignal.timeout(15000)});
 const data=await r.json() as {access_token?:string;expires_in?:number};
 if(!r.ok || !data.access_token)throw Error('Autentikasi statistik belum berhasil. Hubungi pengelola website.');
 token={value:data.access_token,until:Date.now()+Math.max(0,Math.min(data.expires_in??3600,3600)-60)*1000};return token.value;
}
type Report={rows?:{dimensionValues?:{value?:string}[];metricValues?:{value?:string}[]}[]};
async function report(method:string,body:object):Promise<Report>{
 const r=await fetch('https://analyticsdata.googleapis.com/v1beta/properties/'+configuration().property+':'+method,{method:'POST',headers:{Authorization:'Bearer '+await accessToken(),'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 if(!r.ok){if(r.status===401)token=null;throw Error(r.status===403?'Akses statistik belum diberikan. Hubungi pengelola website.':r.status===429?'Batas pembaruan statistik tercapai. Silakan coba lagi nanti.':'Statistik belum dapat diperbarui. Silakan coba lagi.');}
 return await r.json() as Report;
}
const metrics=(r:Report)=>r.rows?.[0]?.metricValues?.map(v=>Number(v.value??0))??[];
const rows=(r:Report)=>r.rows?.map(row=>({label:row.dimensionValues?.[0]?.value??'',value:Number(row.metricValues?.[0]?.value??0)}))??[];
async function collect(days:number){
 const period={dateRanges:[{startDate:(days-1)+'daysAgo',endDate:'today'}]};
 const [total,daily,pages,events,realtime]=await Promise.all([
 report('runReport',{...period,metrics:[{name:'totalUsers'},{name:'sessions'},{name:'screenPageViews'}]}),
 report('runReport',{...period,dimensions:[{name:'date'}],metrics:[{name:'screenPageViews'}],orderBys:[{dimension:{dimensionName:'date'}}]}),
 report('runReport',{...period,dimensions:[{name:'pageTitle'}],metrics:[{name:'screenPageViews'}],orderBys:[{metric:{metricName:'screenPageViews'},desc:true}],limit:10}),
 report('runReport',{...period,dimensions:[{name:'eventName'}],metrics:[{name:'eventCount'}],dimensionFilter:{filter:{fieldName:'eventName',inListFilter:{values:['open_chatbot','open_maps','open_document','open_digital_service']}}}}),
 report('runRealtimeReport',{metrics:[{name:'activeUsers'},{name:'screenPageViews'}]})
 ]);
 const totals=metrics(total);const rt=metrics(realtime);
 return {configured:true,testing:process.env.GA_ENVIRONMENT!=='production',updatedAt:new Date().toISOString(),days,totals:{users:totals[0]??0,sessions:totals[1]??0,views:totals[2]??0},realtime:{users:rt[0]??0,views:rt[1]??0},daily:rows(daily),pages:rows(pages),events:rows(events)};
}
analyticsRouter.get('/',async(req,res)=>{
 const days=Number(req.query.days??7);
 if(![1,7,30].includes(days)){res.status(400).json({message:'Pilih periode 1, 7, atau 30 hari.'});return;}
 const c=configuration();
 if(!/^\d+$/.test(c.property)||!c.email||!c.key){res.json({configured:false,message:'Statistik belum terhubung. Pengelola website perlu menyelesaikan pemasangan Google Analytics.'});return;}
 const key=String(days);const hit=cache.get(key);
 if(hit&&hit.until>Date.now()){res.json(hit.value);return;}
 try{
  let task=pending.get(key);if(!task){task=collect(days);pending.set(key,task);}
  const data=await task;cache.set(key,{value:data,until:Date.now()+60000});res.json(data);
 }catch(e){res.status(502).json({message:e instanceof Error?e.message:'Statistik gagal dimuat.'});}
 finally{pending.delete(key);}
});
