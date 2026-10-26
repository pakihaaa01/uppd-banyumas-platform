import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type {
  PageRoute, Announcement, ServiceLocation, BUMDesPoster, PublicDocument,
  FAQItem, ContactMessage, ChatbotFAQ, PADTarget, PerformanceReport, DashboardStats
} from '../types';
import {
  INITIAL_ANNOUNCEMENTS, INITIAL_SERVICE_LOCATIONS, INITIAL_BUMDES_POSTERS,
  INITIAL_DOCUMENTS, INITIAL_FAQS, INITIAL_CHATBOT_FAQS, INITIAL_CONTACT_MESSAGES,
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
  addContactMessage: (msg: Omit<ContactMessage,'id'|'createdAt'|'status'|'phone'>) => AsyncAction;
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
  const [bumdesPosters,setBumdesPosters]=useState<BUMDesPoster[]>(INITIAL_BUMDES_POSTERS);
  const [documents,setDocuments]=useState<PublicDocument[]>([]);
  const [faqs,setFaqs]=useState<FAQItem[]>([]);
  const [chatbotFaqs,setChatbotFaqs]=useState<ChatbotFAQ[]>([]);
  const [visualArchive,setVisualArchive]=useState<ArchiveItem[]>([]);
  const [contactMessages,setContactMessages]=useState<ContactMessage[]>(INITIAL_CONTACT_MESSAGES);
  const [stats,setStats]=useState<DashboardStats>(INITIAL_DASHBOARD_STATS);
  const [padTargets]=useState<PADTarget[]>(PAD_TARGETS);
  const [performanceReports]=useState<PerformanceReport[]>(PERFORMANCE_REPORTS);
  const refreshData=useCallback(async()=>{
    try {
      const publicData=await apiRequest<Content>('/api/content');
      setBumdesPosters(publicData.posters);
      setVisualArchive(publicData.archive);
      setBackendReady(true);
      try {
        const privateData=await apiRequest<Content>('/api/admin/content');
        setContactMessages(privateData.messages||[]);
      } catch { setContactMessages([]); }
    } catch { setBackendReady(false); }
    try {
      const response = await apiRequest<{announcements: Announcement[]}>('/api/v1/public/announcements');
      setAnnouncements(response.announcements);
    } catch (error) {
      console.error('Gagal mengambil pengumuman publik:', error);
      setAnnouncements([]);
    }
    try {
      const response = await apiRequest<{locations: ServiceLocation[]}>('/api/v1/public/locations');
      setServiceLocations(response.locations);
    } catch (error) {
      console.error('Gagal mengambil titik layanan publik:', error);
      setServiceLocations([]);
    }
    try {
      const response = await apiRequest<{ documents: PublicDocument[] }>('/api/v1/public/documents');
      setDocuments(response.documents);
    } catch (error) {
      console.error('Gagal mengambil dokumen publik:', error);
      setDocuments([]);
    }
    try {
      const response = await apiRequest<{faqs: FAQItem[]}>('/api/v1/public/faqs');
      setFaqs(response.faqs);
    } catch (error) {
      console.error('Gagal mengambil FAQ publik:', error);
      setFaqs([]);
    }
    try {
      const response = await apiRequest<{chatbot: ChatbotFAQ[]}>('/api/v1/public/chatbot');
      setChatbotFaqs(response.chatbot.filter(item => item.isEnabled));
    } catch (error) {
      console.error('Gagal memuat jawaban chatbot publik:', error);
      setChatbotFaqs([]);
    }
    try {
      const result = await apiRequest<{archive: ArchiveItem[]}>('/api/v1/public/archive');
      setVisualArchive(result.archive);
    } catch (error) {
      console.error('Gagal mengambil dokumentasi publik:', error);
      setVisualArchive([]);
    }
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
  const addContactMessage=async(data:Omit<ContactMessage,'id'|'createdAt'|'status'|'phone'>):AsyncAction=>{
    try { await apiRequest('/api/v1/contact','POST',data);showToast('Pesan contoh tersimpan pada server lokal (bukan dikirim ke instansi).');return true; }
    catch(e){showToast(e instanceof Error?e.message:'Gagal mengirim pesan','error');return false;}
  };
  const updateMessageStatus=(id:string,status:ContactMessage['status'])=>change('messages','PUT',id,{status},'Status pesan diperbarui');
  const deleteContactMessage=(id:string)=>change('messages','DELETE',id,undefined,'Pesan dihapus');
  const addChatbotFaq=(data:Omit<ChatbotFAQ,'id'|'clickCount'>)=>change('chatbot','POST',undefined,{...data,clickCount:0},'Jawaban chatbot ditambahkan');
  const updateChatbotFaq=(id:string,data:Partial<ChatbotFAQ>)=>change('chatbot','PUT',id,data,'Jawaban chatbot diperbarui');
  const toggleChatbotFaqStatus=(id:string)=>{
    const current=chatbotFaqs.find(f=>f.id===id);
    return current?change('chatbot','PUT',id,{isEnabled:!current.isEnabled},'Status jawaban chatbot diperbarui'):Promise.resolve(false);
  };
  const deleteChatbotFaq=(id:string)=>change('chatbot','DELETE',id,undefined,'Jawaban chatbot dihapus');
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
