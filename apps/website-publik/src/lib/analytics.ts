let measurementId='';
let testing=true;
let lastPage='';
const titles:Record<string,string>={home:'Beranda',profile:'Profil',services:'Layanan','public-info':'Informasi Publik',faq:'FAQ',contact:'Kontak'};
declare global {interface Window {dataLayer:unknown[];gtag:(...args:unknown[])=>void;}}
export function configureAnalytics(id:string,isTesting:boolean){
 if(!/^G-[A-Z0-9]+$/.test(id)||measurementId===id)return;
 measurementId=id;testing=isTesting;
 window.dataLayer=window.dataLayer||[];
 window.gtag=function(){window.dataLayer.push(arguments);};
 window.gtag('js',new Date());
 window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
 const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(script);
}
export function trackPage(page:string){
 if(!measurementId||!titles[page]||lastPage===page)return;
 lastPage=page;
 window.gtag('event','page_view',{send_to:measurementId,page_title:titles[page],page_location:window.location.origin+'/'+page,page_referrer:'',...(testing?{debug_mode:true}:{})});
}
export function trackEvent(name:'open_chatbot'|'open_maps'|'open_document'|'open_digital_service'){
 if(measurementId)window.gtag('event',name,{send_to:measurementId,...(testing?{debug_mode:true}:{})});
}
