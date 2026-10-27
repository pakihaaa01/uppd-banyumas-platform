import {useEffect,useRef,useState} from 'react';
import {Bell,X} from 'lucide-react';
import {useSamsat} from '../../context/SamsatContext';
import type {Announcement} from '../../types';
const readKey='uppd-read-notifications';
const version=(a:Announcement)=>a.id+':'+(a.updatedAt??a.date);
export function PublicNotifications(){
 const {announcements}=useSamsat();
 const [open,setOpen]=useState(false);const [selected,setSelected]=useState<Announcement|null>(null);
 const [now,setNow]=useState(Date.now());const box=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);const close=useRef<HTMLButtonElement>(null);const dialog=useRef<HTMLDivElement>(null);
 const [read,setRead]=useState<string[]>(()=>{try{const v=JSON.parse(sessionStorage.getItem(readKey)??'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];}catch{return [];}});
 const items=announcements.filter(a=>a.showInNotifications!==false&&(!a.notificationExpiresAt||Date.parse(a.notificationExpiresAt)>now)).sort((a,b)=>Number(!!b.isImportant)-Number(!!a.isImportant)||b.date.localeCompare(a.date));
 const unread=items.some(a=>!read.includes(version(a)));
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{if(!open&&!selected)return;const outside=(e:MouseEvent)=>{if(box.current&&!box.current.contains(e.target as Node))setOpen(false);};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);setSelected(null);trigger.current?.focus();}};document.addEventListener('mousedown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',escape);};},[open,selected]);
 useEffect(()=>{if(!selected)return;close.current?.focus();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;trigger.current?.focus();};},[selected]);
 function select(a:Announcement){setSelected(a);setOpen(false);const next=[...new Set([...read,version(a)])].slice(-500);setRead(next);try{sessionStorage.setItem(readKey,JSON.stringify(next));}catch{}}
 return <div ref={box} className="relative">
  <button ref={trigger} type="button" aria-label={unread?'Ada pemberitahuan baru':'Buka pemberitahuan'} aria-expanded={open} onClick={()=>setOpen(v=>!v)} className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-black focus-visible:outline-2 focus-visible:outline-blue-700"><Bell size={18}/>{unread&&<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600"/>}</button>
  {open&&<section aria-label="Pemberitahuan" className="absolute right-0 top-12 w-[min(360px,calc(100vw-25px))] rounded-lg border border-slate-200 bg-white text-black shadow-xl"><h2 className="border-b p-4 font-semibold">Pemberitahuan</h2><div className="max-h-80 overflow-auto">{!items.length?<p className="p-5 text-sm">Belum ada pemberitahuan aktif.</p>:items.map(a=><button type="button" key={a.id} onClick={()=>select(a)} className="block w-full border-b p-4 text-left hover:bg-blue-50"><p className="text-xs">{a.date}{a.isImportant?' · Penting':''}{!read.includes(version(a))?' · Baru':''}</p><p className="mt-1 text-sm font-semibold">{a.title}</p><p className="mt-1 line-clamp-2 text-xs">{a.shortDescription}</p></button>)}</div></section>}
  {selected&&<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
   <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="notification-title" className="max-h-[85dvh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 text-black" onKeyDown={e=>{if(e.key==='Tab'){const els=dialog.current?.querySelectorAll<HTMLElement>('button,a,input');const first=els?.[0],last=els?.[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}}>
   <div className="flex items-center justify-between gap-4"><p className="text-sm">{selected.category} · {selected.date}</p><button ref={close} type="button" aria-label="Tutup pemberitahuan" onClick={()=>setSelected(null)} className="rounded border p-2"><X size={20}/></button></div><h2 id="notification-title" className="mt-5 text-xl font-bold">{selected.title}</h2><p className="mt-4 font-medium">{selected.shortDescription}</p><p className="mt-5 whitespace-pre-line border-t pt-5 text-sm leading-7">{selected.content}</p>
   </div></div>}
 </div>;
}
