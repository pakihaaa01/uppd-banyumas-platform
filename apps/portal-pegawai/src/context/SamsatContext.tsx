import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type {
  PageRoute, Announcement, ServiceLocation, BUMDesPoster, PublicDocument,
  FAQItem, ContactMessage, ChatbotFAQ, PADTarget, PerformanceReport, DashboardStats
} from '../types';
import {
  PAD_TARGETS, PERFORMANCE_REPORTS, INITIAL_DASHBOARD_STATS
} from '../data/mockData';
import { SakpoleModal } from '../components/shared/SakpoleModal';
import { apiRequest } from '../lib/api';

export type ArchiveItem = { id: string; title: string; description: string; image: string };
type Toast = { id: string; type: 'success' | 'error' | 'info'; message: string };
type Content = {
  announcements: Announcement[]; locations: ServiceLocation[]; posters: BUMDesPoster[];
  documents: PublicDocument[]; faq: FAQItem[]; chatbot: ChatbotFAQ[];
  archive: ArchiveItem[]; messages?: ContactMessage[];
};
type New<T> = Omit<T,'id'>;
type AsyncAction = Promise<boolean>;
interface SamsatContextType {
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  announcements: Announcement[];
  serviceLocations: ServiceLocation[];
  bumdesPosters: BUMDesPoster[];
  documents: PublicDocument[];
  faqs: FAQItem[];
  chatbotFaqs: ChatbotFAQ[];
  contactMessages: ContactMessage[];
  visualArchive: ArchiveItem[];
  padTargets: PADTarget[];
  performanceReports: PerformanceReport[];
  stats: DashboardStats;
  backendReady: boolean;
  refreshData: () => Promise<void>;
  hasNewNotification: boolean;
  clearNotificationBadge: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  addAnnouncement: (ann: New<Announcement>) => AsyncAction;
  updateAnnouncement: (id: string, ann: Partial<Announcement>) => AsyncAction;
  deleteAnnouncement: (id: string) => AsyncAction;
  addServiceLocation: (loc: New<ServiceLocation>) => AsyncAction;
  updateServiceLocation: (id: string, loc: Partial<ServiceLocation>) => AsyncAction;
  deleteServiceLocation: (id: string) => AsyncAction;
  addBumdesPoster: (poster: New<BUMDesPoster>) => AsyncAction;
  deleteBumdesPoster: (id: string) => AsyncAction;
  addDocument: (doc: New<PublicDocument>) => AsyncAction;
  deleteDocument: (id: string) => AsyncAction;
  addFaq: (faq: Omit<FAQItem,'id' | 'viewCount'>) => AsyncAction;
  updateFaq: (id: string, faq: Partial<FAQItem>) => AsyncAction;
  deleteFaq: (id: string) => AsyncAction;
  addContactMessage: (msg: Omit<ContactMessage,'id'|'createdAt'|'status'>) => AsyncAction;
  updateMessageStatus: (id: string, status: ContactMessage['status']) => AsyncAction;
  deleteContactMessage: (id: string) => AsyncAction;
  addChatbotFaq: (data: Omit<ChatbotFAQ,'id'|'clickCount'>) => AsyncAction;
  updateChatbotFaq: (id: string, data: Partial<ChatbotFAQ>) => AsyncAction;
  toggleChatbotFaqStatus: (id: string) => AsyncAction;
  deleteChatbotFaq: (id: string) => AsyncAction;
  addArchiveItem: (data: New<ArchiveItem>) => AsyncAction;
  updateArchiveItem: (id: string, data: Partial<ArchiveItem>) => AsyncAction;
  deleteArchiveItem: (id: string) => AsyncAction;
  trackLocationClick: (name: string) => void;
  trackAppDownload: (app: 'signal'|'sekpole') => void;
  sakpoleModalOpen: boolean;
  openSakpoleModal: () => void;
  closeSakpoleModal: () => void;
}
const SamsatContext=createContext<SamsatContextType | undefined>(undefined);
export const SamsatProvider: React.FC<{children:ReactNode}> = ({children}) => {
  const [currentPage,setCurrentPageState]=useState<PageRoute>('home');
  const [toasts,setToasts]=useState<Toast[]>([]);
  const [backendReady,setBackendReady]=useState(false);
  const [hasNewNotification,setHasNewNotification]=useState(true);
  const [sakpoleModalOpen,setSakpoleModalOpen]=useState(false);
  const [announcements,setAnnouncements]=useState<Announcement[]>([]);
  const [serviceLocations,setServiceLocations]=useState<ServiceLocation[]>([]);
  const [bumdesPosters,setBumdesPosters]=useState<BUMDesPoster[]>([]);
  const [documents,setDocuments]=useState<PublicDocument[]>([]);
  const [faqs,setFaqs]=useState<FAQItem[]>([]);
  const [chatbotFaqs,setChatbotFaqs]=useState<ChatbotFAQ[]>([]);
  const [visualArchive,setVisualArchive]=useState<ArchiveItem[]>([]);
  const [contactMessages,setContactMessages]=useState<ContactMessage[]>([]);
  const [stats,setStats]=useState<DashboardStats>(INITIAL_DASHBOARD_STATS);
  const [padTargets]=useState<PADTarget[]>(PAD_TARGETS);
  const [performanceReports]=useState<PerformanceReport[]>(PERFORMANCE_REPORTS);
  const refreshData=useCallback(async()=>{
    try {
      const health = await apiRequest<{status:string;database:string}>('/api/v1/health/db');
      setBackendReady(health.status === 'ok' && health.database === 'connected');
    } catch {
      setBackendReady(false);
    }

    const requests = await Promise.allSettled([
      apiRequest<{announcements: Announcement[]}>('/api/v1/announcements'),
      apiRequest<{locations: ServiceLocation[]}>('/api/v1/locations'),
      apiRequest<{documents: PublicDocument[]}>('/api/v1/documents'),
      apiRequest<{faqs: FAQItem[]}>('/api/v1/faqs'),
      apiRequest<{messages: ContactMessage[]}>('/api/v1/messages'),
      apiRequest<{chatbot: ChatbotFAQ[]}>('/api/v1/chatbot'),
      apiRequest<{archive: ArchiveItem[]}>('/api/v1/archive')
    ]);

    const [ann, loc, doc, faq, msg, bot, arc] = requests;
    if (ann.status === 'fulfilled') setAnnouncements(ann.value.announcements);
    if (loc.status === 'fulfilled') setServiceLocations(loc.value.locations);
    if (doc.status === 'fulfilled') setDocuments(doc.value.documents);
    if (faq.status === 'fulfilled') setFaqs(faq.value.faqs);
    if (msg.status === 'fulfilled') setContactMessages(msg.value.messages);
    if (bot.status === 'fulfilled') setChatbotFaqs(bot.value.chatbot);
    if (arc.status === 'fulfilled') setVisualArchive(arc.value.archive);
  },[]);
  useEffect(()=>{
    void refreshData();
    const interval=window.setInterval(()=>{ if(!document.hidden) void refreshData(); },12000);
    const onFocus=()=>void refreshData();
    const onLogin=()=>void refreshData();
    window.addEventListener('focus',onFocus);
    window.addEventListener('uppd-auth-change',onLogin);
    return ()=>{window.clearInterval(interval);window.removeEventListener('focus',onFocus);window.removeEventListener('uppd-auth-change',onLogin);};
  },[refreshData]);
  useEffect(()=>{
    setStats(p=>({...p,totalLocations:serviceLocations.length,totalDocuments:documents.length,totalPosters:bumdesPosters.length,totalFaqs:faqs.length,unreadMessages:contactMessages.filter(m=>m.status==='New').length}));
  },[serviceLocations,documents,bumdesPosters,faqs,contactMessages]);
  const setCurrentPage=(page:PageRoute)=>{setCurrentPageState(page);window.scrollTo({top:0,behavior:'smooth'});};
  const clearNotificationBadge=()=>setHasNewNotification(false);
  const removeToast=(id:string)=>setToasts(prev=>prev.filter(t=>t.id!==id));
  const showToast=(message:string,type:Toast['type']='success')=>{
    const id=crypto.randomUUID();setToasts(prev=>[...prev,{id,message,type}]);
    window.setTimeout(()=>removeToast(id),4500);
  };
  const change = async (kind:string,method:'POST'|'PUT'|'DELETE',id?:string,data?:unknown,success='Perubahan berhasil disimpan'):AsyncAction=>{
    try {
      await apiRequest(`/api/admin/${kind}${id?`/${encodeURIComponent(id)}`:''}`,method,data);
      await refreshData();showToast(success);return true;
    } catch(e){showToast(e instanceof Error?e.message:'Gagal menyimpan data','error');return false;}
  };
  const addAnnouncement=(data:New<Announcement>)=>change('announcements','POST',undefined,{...data,isNew:true},'Pengumuman berhasil diterbitkan');
  const updateAnnouncement=(id:string,data:Partial<Announcement>)=>change('announcements','PUT',id,data,'Pengumuman berhasil diperbarui');
  const deleteAnnouncement=(id:string)=>change('announcements','DELETE',id,undefined,'Pengumuman berhasil dihapus');
  const addServiceLocation=(data:New<ServiceLocation>)=>change('locations','POST',undefined,data,'Titik layanan berhasil ditambahkan');
  const updateServiceLocation=(id:string,data:Partial<ServiceLocation>)=>change('locations','PUT',id,data,'Titik layanan diperbarui');
  const deleteServiceLocation=(id:string)=>change('locations','DELETE',id,undefined,'Titik layanan dihapus');
  const addBumdesPoster=(data:New<BUMDesPoster>)=>change('posters','POST',undefined,data,'Poster berhasil ditambahkan');
  const deleteBumdesPoster=(id:string)=>change('posters','DELETE',id,undefined,'Poster dihapus');
  const addDocument=(data:New<PublicDocument>)=>change('documents','POST',undefined,data,'Dokumen berhasil ditambahkan');
  const deleteDocument=(id:string)=>change('documents','DELETE',id,undefined,'Dokumen dihapus');
  const addFaq=(data:Omit<FAQItem,'id'|'viewCount'>)=>change('faq','POST',undefined,{...data,viewCount:0},'FAQ ditambahkan');
  const updateFaq=(id:string,data:Partial<FAQItem>)=>change('faq','PUT',id,data,'FAQ diperbarui');
  const deleteFaq=(id:string)=>change('faq','DELETE',id,undefined,'FAQ dihapus');
  const addContactMessage=async(data:Omit<ContactMessage,'id'|'createdAt'|'status'>):AsyncAction=>{
    try { await apiRequest('/api/contact','POST',data);showToast('Pesan contoh tersimpan pada server lokal (bukan dikirim ke instansi).');return true; }
    catch(e){showToast(e instanceof Error?e.message:'Gagal mengirim pesan','error');return false;}
  };
  const updateMessageStatus=(id:string,status:ContactMessage['status'])=>change('messages','PUT',id,{status},'Status pesan diperbarui');
  const deleteContactMessage=(id:string)=>change('messages','DELETE',id,undefined,'Pesan dihapus');
  const updateChatbotList=async():Promise<void>=>{
    const response=await apiRequest<{chatbot:ChatbotFAQ[]}>('/api/v1/chatbot');
    setChatbotFaqs(response.chatbot);
  };
  const addChatbotFaq=async(data:Omit<ChatbotFAQ,'id'|'clickCount'>):AsyncAction=>{
    try {
      const {isEnabled: _ignored, ...payload}=data;
      await apiRequest('/api/v1/chatbot','POST',payload);
      await updateChatbotList();
      showToast('Jawaban chatbot disimpan sebagai Nonaktif. Aktifkan untuk menampilkan di website.');
      return true;
    } catch(e){showToast(e instanceof Error?e.message:'Gagal menambah jawaban chatbot','error');return false;}
  };
  const updateChatbotFaq=async(id:string,data:Partial<ChatbotFAQ>):AsyncAction=>{
    try {
      const payload={question:data.question,answer:data.answer,keywords:data.keywords,category:data.category};
      await apiRequest('/api/v1/chatbot/'+encodeURIComponent(id),'PATCH',payload);
      await updateChatbotList();showToast('Jawaban chatbot diperbarui.');return true;
    }catch(e){showToast(e instanceof Error?e.message:'Gagal memperbarui jawaban chatbot','error');return false;}
  };
  const toggleChatbotFaqStatus=async(id:string):AsyncAction=>{
    const current=chatbotFaqs.find(f=>f.id===id);
    if(!current)return false;
    try {
      await apiRequest('/api/v1/chatbot/'+encodeURIComponent(id)+'/toggle','POST',{isEnabled:!current.isEnabled});
      await updateChatbotList();showToast(current.isEnabled?'Jawaban disembunyikan dari website.':'Jawaban diaktifkan di website.');return true;
    }catch(e){showToast(e instanceof Error?e.message:'Gagal mengubah status chatbot','error');return false;}
  };
  const deleteChatbotFaq=async(id:string):AsyncAction=>{
    try {
      await apiRequest('/api/v1/chatbot/'+encodeURIComponent(id),'DELETE');
      await updateChatbotList();showToast('Jawaban chatbot dihapus.');return true;
    }catch(e){showToast(e instanceof Error?e.message:'Gagal menghapus jawaban chatbot','error');return false;}
  };
  const addArchiveItem=(data:New<ArchiveItem>)=>change('archive','POST',undefined,data,'Dokumentasi ditambahkan');
  const updateArchiveItem=(id:string,data:Partial<ArchiveItem>)=>change('archive','PUT',id,data,'Dokumentasi diperbarui');
  const deleteArchiveItem=(id:string)=>change('archive','DELETE',id,undefined,'Dokumentasi dihapus');
  const trackLocationClick=(name:string)=>setStats(prev=>({...prev,locationClicks:prev.locationClicks.map(p=>p.locationName===name?{...p,clicks:p.clicks+1}:p)}));
  const trackAppDownload=(app:'signal'|'sekpole')=>setStats(prev=>({...prev,appDownloadsSignal:prev.appDownloadsSignal+(app==='signal'?1:0),appDownloadsSekpole:prev.appDownloadsSekpole+(app==='sekpole'?1:0)}));
  const openSakpoleModal=()=>setSakpoleModalOpen(true);
  const closeSakpoleModal=()=>setSakpoleModalOpen(false);
  return <SamsatContext.Provider value={{currentPage,setCurrentPage,announcements,serviceLocations,bumdesPosters,documents,faqs,chatbotFaqs,contactMessages,visualArchive,padTargets,performanceReports,stats,backendReady,refreshData,hasNewNotification,clearNotificationBadge,toasts,showToast,removeToast,addAnnouncement,updateAnnouncement,deleteAnnouncement,addServiceLocation,updateServiceLocation,deleteServiceLocation,addBumdesPoster,deleteBumdesPoster,addDocument,deleteDocument,addFaq,updateFaq,deleteFaq,addContactMessage,updateMessageStatus,deleteContactMessage,addChatbotFaq,updateChatbotFaq,toggleChatbotFaqStatus,deleteChatbotFaq,addArchiveItem,updateArchiveItem,deleteArchiveItem,trackLocationClick,trackAppDownload,sakpoleModalOpen,openSakpoleModal,closeSakpoleModal}}>
    {children}
    {sakpoleModalOpen&&<SakpoleModal />}
    <div className="pointer-events-none fixed bottom-6 left-6 z-[100] flex max-w-sm flex-col gap-2">
      {toasts.map(t=><div key={t.id} role="status" className={`pointer-events-auto flex items-center justify-between gap-4 rounded border px-4 py-3 text-sm shadow-md ${t.type==='error'?'border-red-300 bg-red-50 text-red-800':'border-[#cbdfe9] bg-white text-[#23465c]'}`}><span>{t.message}</span><button onClick={()=>removeToast(t.id)} aria-label="Tutup notifikasi">×</button></div>)}
    </div>
  </SamsatContext.Provider>;
};
export const useSamsat=()=>{
  const ctx=useContext(SamsatContext);
  if(!ctx)throw new Error('useSamsat harus berada di dalam SamsatProvider');
  return ctx;
};
