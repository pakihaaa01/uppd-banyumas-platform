import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { PageRoute, Announcement, ServiceLocation, PublicDocument, FAQItem, ContactMessage, ChatbotFAQ } from '../types';
import { SakpoleModal } from '../components/shared/SakpoleModal';
import { apiRequest, ApiError } from '../lib/api';

export type ArchiveItem = { id: string; title: string; description: string; image: string };
export type DashboardSummary = { announcements: number; locations: number; documents: number; archive: number; faqs: number; chatbot: number; newMessages: number };
type Toast = { id: string; type: 'success' | 'error' | 'info'; message: string };
const PORTAL = true;

function usePortalState() {
  const [currentPage, setPage] = useState<PageRoute>('home');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>([]);
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [chatbotFaqs, setChatbotFaqs] = useState<ChatbotFAQ[]>([]);
  const [visualArchive, setVisualArchive] = useState<ArchiveItem[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataErrors, setDataErrors] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(true);
  const [sakpoleModalOpen, setSakpoleModalOpen] = useState(false);
  const requestVersion = useRef(0);

  const refreshData = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    let administrator = false;
    if (PORTAL) {
      try {
        const result = await apiRequest<{ user: { role: string } }>('/api/v1/auth/me');
        administrator = result.user.role === 'ADMINISTRATOR';
      } catch (error) {
        if (version !== requestVersion.current) return;
        setAnnouncements([]); setServiceLocations([]); setDocuments([]); setFaqs([]); setChatbotFaqs([]); setVisualArchive([]); setSummary(null);
        setBackendReady(false); setLoading(false);
        setDataErrors(error instanceof ApiError && error.status === 401 ? [] : ['Koneksi portal']);
        return;
      }
    }
    const prefix = administrator ? '/api/v1' : '/api/v1/public';
    // Each endpoint is backed by Prisma/PostgreSQL. Never fall back to sample records.
    const requests = [
      apiRequest<{ announcements: Announcement[] }>(prefix + '/announcements'),
      apiRequest<{ locations: ServiceLocation[] }>(prefix + '/locations'),
      apiRequest<{ documents: PublicDocument[] }>(prefix + '/documents'),
      apiRequest<{ faqs: FAQItem[] }>(prefix + '/faqs'),
      apiRequest<{ chatbot: ChatbotFAQ[] }>(prefix + '/chatbot'),
      apiRequest<{ archive: ArchiveItem[] }>(prefix + '/archive'),
      administrator ? apiRequest<{ summary: DashboardSummary }>('/api/v1/dashboard') : Promise.resolve({ summary: null }),
    ] as const;
    const [a, l, d, f, c, v, s] = await Promise.allSettled(requests);
    if (version !== requestVersion.current) return;
    setAnnouncements(a.status === 'fulfilled' ? a.value.announcements : []);
    setServiceLocations(l.status === 'fulfilled' ? l.value.locations : []);
    setDocuments(d.status === 'fulfilled' ? d.value.documents : []);
    setFaqs(f.status === 'fulfilled' ? f.value.faqs : []);
    setChatbotFaqs(c.status === 'fulfilled' ? c.value.chatbot : []);
    setVisualArchive(v.status === 'fulfilled' ? v.value.archive : []);
    setSummary(s.status === 'fulfilled' ? s.value.summary : null);
    const names = ['Pengumuman', 'Titik Layanan', 'Dokumen Publik', 'FAQ', 'Jawaban Chatbot', 'Dokumentasi', 'Ringkasan'];
    const failed = [a, l, d, f, c, v, s].flatMap((result, i) => result.status === 'rejected' ? [names[i]] : []);
    setDataErrors(failed); setBackendReady(failed.length === 0); setLoading(false);
  }, []);

  useEffect(() => {
    void refreshData();
    const refresh = () => { if (!document.hidden) void refreshData(); };
    const interval = window.setInterval(refresh, 12000);
    window.addEventListener('focus', refresh);
    window.addEventListener('uppd-auth-change', refresh);
    return () => { ++requestVersion.current; window.clearInterval(interval); window.removeEventListener('focus', refresh); window.removeEventListener('uppd-auth-change', refresh); };
  }, [refreshData]);

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID(); setToasts(prev => [...prev, { id, message, type }]);
    window.setTimeout(() => removeToast(id), 4500);
  };
  const changeChatbot = async (path: string, method: string, data: unknown, message: string) => {
    try {
      await apiRequest('/api/v1/chatbot' + path, method, data);
      await refreshData(); showToast(message); return true;
    } catch (error) { showToast(error instanceof Error ? error.message : 'Gagal menyimpan jawaban', 'error'); return false; }
  };
  const addChatbotFaq = (data: Omit<ChatbotFAQ, 'id' | 'clickCount'>) => {
    const { question, answer, category, keywords } = data;
    return changeChatbot('', 'POST', { question, answer, category, keywords }, 'Jawaban disimpan sebagai Nonaktif. Aktifkan untuk menampilkan di website.');
  };
  const updateChatbotFaq = (id: string, data: Partial<ChatbotFAQ>) => {
    const { question, answer, category, keywords } = data;
    return changeChatbot('/' + encodeURIComponent(id), 'PATCH', { question, answer, category, keywords }, 'Jawaban diperbarui.');
  };
  const toggleChatbotFaqStatus = (id: string) => {
    const item = chatbotFaqs.find(f => f.id === id);
    return item ? changeChatbot('/' + encodeURIComponent(id) + '/toggle', 'POST', { isEnabled: !item.isEnabled }, item.isEnabled ? 'Jawaban dinonaktifkan.' : 'Jawaban diaktifkan.') : Promise.resolve(false);
  };
  const deleteChatbotFaq = (id: string) => changeChatbot('/' + encodeURIComponent(id), 'DELETE', undefined, 'Jawaban dihapus.');
  const addContactMessage = async (data: Omit<ContactMessage, 'id' | 'createdAt' | 'status' | 'phone' | 'subject'>) => {
    try {
      const { name, email, message } = data;
      await apiRequest('/api/v1/contact', 'POST', { name, email, message });
      showToast('Pesan berhasil disimpan.'); return true;
    } catch (error) { showToast(error instanceof Error ? error.message : 'Gagal mengirim pesan', 'error'); return false; }
  };
  return {
    currentPage, setCurrentPage: (page: PageRoute) => { setPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    announcements, serviceLocations, documents, faqs, chatbotFaqs, visualArchive, summary,
    backendReady, loading, dataErrors, refreshData, toasts, showToast, removeToast,
    hasNewNotification, clearNotificationBadge: () => setHasNewNotification(false),
    sakpoleModalOpen, openSakpoleModal: () => setSakpoleModalOpen(true), closeSakpoleModal: () => setSakpoleModalOpen(false),
    // Click analytics are not persisted; these hooks retain existing navigation behavior.
    trackLocationClick: (_name: string) => {}, trackAppDownload: (_app: 'signal' | 'sekpole') => {},
    addContactMessage, addChatbotFaq, updateChatbotFaq, toggleChatbotFaqStatus, deleteChatbotFaq,
  };
}
const SamsatContext = createContext<ReturnType<typeof usePortalState> | undefined>(undefined);
export function SamsatProvider({ children }: { children: ReactNode }) {
  const state = usePortalState();
  return <SamsatContext.Provider value={state}>
    {children}
    {state.sakpoleModalOpen && <SakpoleModal />}
    <div className="pointer-events-none fixed bottom-6 left-6 z-[100] flex max-w-sm flex-col gap-2">
      {state.toasts.map(t => <div key={t.id} role="status" className={`pointer-events-auto flex items-center justify-between gap-4 rounded border px-4 py-3 text-sm shadow-md ${t.type === 'error' ? 'border-red-300 bg-red-50 text-red-800' : 'border-[#cbdfe9] bg-white text-black'}`}><span>{t.message}</span><button onClick={() => state.removeToast(t.id)} aria-label="Tutup notifikasi">×</button></div>)}
    </div>
  </SamsatContext.Provider>;
}
export function useSamsat() {
  const ctx = useContext(SamsatContext);
  if (!ctx) throw new Error('useSamsat harus berada di dalam SamsatProvider');
  return ctx;
}
