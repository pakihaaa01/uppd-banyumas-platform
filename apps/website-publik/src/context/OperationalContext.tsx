import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {apiRequest} from '../lib/api';
import type {ServiceLocation} from '../types';
import {configureAnalytics} from '../lib/analytics';
export type OperationalSettings={contact:{phone:string;whatsapp:string;email:string;mainLocationId:string};hero:{slides:string[];seconds:number};features:{taxEnabled:boolean;chatbotEnabled:boolean;taxMessage:string;chatbotMessage:string}};
const defaults:OperationalSettings={contact:{phone:'',whatsapp:'',email:'',mainLocationId:''},hero:{slides:['/images/slider/01.jpg','/images/slider/02.jpg','/images/slider/03.jpg'],seconds:6.5},features:{taxEnabled:true,chatbotEnabled:true,taxMessage:'Layanan dalam pemeliharaan.',chatbotMessage:'Chat dalam pemeliharaan.'}};
type State={settings:OperationalSettings;mainLocation:ServiceLocation|null;ready:boolean;failed:boolean;analyticsReady:boolean};
const Context=createContext<State>({settings:defaults,mainLocation:null,ready:false,failed:false,analyticsReady:false});
export function OperationalProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<State>({settings:defaults,mainLocation:null,ready:false,failed:false,analyticsReady:false});
 useEffect(()=>{let active=true;let busy=false;async function refresh(){if(busy)return;busy=true;try{
  const data=await apiRequest<{settings:OperationalSettings;mainLocation:ServiceLocation|null;analytics:{measurementId:string;testing:boolean}}>('/api/v1/public/settings');
  if(active){configureAnalytics(data.analytics.measurementId,data.analytics.testing);setState({...data,ready:true,failed:false,analyticsReady:!!data.analytics.measurementId});}
 }catch{if(active)setState(s=>({...s,ready:false,failed:true}));}finally{busy=false;}}
 void refresh();const id=window.setInterval(()=>{if(!document.hidden)void refresh();},12000);window.addEventListener('focus',refresh);
 return()=>{active=false;clearInterval(id);window.removeEventListener('focus',refresh);};},[]);
 return <Context.Provider value={state}>{children}</Context.Provider>;
}
export function useOperational(){return useContext(Context);}
