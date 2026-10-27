import { AdminMessages } from './AdminMessages';
import { AdminArchive } from './AdminArchive';
import { AdminDocuments } from './AdminDocuments';
import { AdminLocations } from './AdminLocations';
import { AdminAnnouncements } from './AdminAnnouncements';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { OperatorFAQ } from './OperatorFAQ';
import {
  BarChart3, Megaphone, MapPin, Images, FileText, CircleHelp, MessageSquare,
  Bot, Settings, Plus, Pencil, Trash2, ExternalLink, X, Search,
  ArrowRight, CheckCircle2,
} from 'lucide-react';
import { useSamsat } from '../../context/SamsatContext';
import type { ArchiveItem } from '../../context/SamsatContext';
import { apiRequest, uploadFile } from '../../lib/api';
import type { Announcement, ServiceLocation, PublicDocument, FAQItem, ChatbotFAQ, BUMDesPoster } from '../../types';

type Tab = 'overview' | 'announcements' | 'locations' | 'posters' | 'documents' | 'archive' | 'faq' | 'messages' | 'chatbot' | 'settings';
type EditableTab = Exclude<Tab, 'overview' | 'messages' | 'settings'>;

const menu: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }> }[] = [
  { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
  { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
  { id: 'locations', label: 'Titik Layanan', icon: MapPin },
  { id: 'documents', label: 'Dokumen Publik', icon: FileText },
  { id: 'archive', label: 'Dokumentasi Pelayanan', icon: Images },
  { id: 'faq', label: 'Pertanyaan Umum', icon: CircleHelp },
  { id: 'messages', label: 'Pesan Masyarakat', icon: MessageSquare },
  { id: 'chatbot', label: 'Jawaban Chatbot', icon: Bot },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

const pageInfo: Record<Tab, { title: string; desc: string }> = {
  overview: { title: 'Ringkasan Pengelolaan', desc: 'Lihat jumlah konten yang tersedia dan akses cepat ke pekerjaan pengelolaan.' },
  announcements: { title: 'Pengumuman', desc: 'Kelola informasi dan pemberitahuan yang ditampilkan di website publik.' },
  locations: { title: 'Titik Layanan SAMSAT', desc: 'Perbarui nama, alamat, jadwal, dan tautan Google Maps.' },
  posters: { title: 'Poster BUMDes', desc: 'Kelola referensi gambar poster yang tampil sebagai materi informasi.' },
  documents: { title: 'Informasi Publik', desc: 'Kelola daftar metadata dan tautan dokumen publik.' },
  faq: { title: 'Pertanyaan Umum', desc: 'Ubah informasi tanya jawab yang ditampilkan pada halaman FAQ.' },
  messages: { title: 'Pesan Masyarakat', desc: 'Kelola pesan dari formulir kontak website publik yang tersimpan di PostgreSQL.' },
  chatbot: { title: 'Jawaban Chatbot', desc: 'Kelola jawaban berbasis PostgreSQL. Hanya jawaban Aktif yang tampil pada chatbot website publik.' },
  settings: { title: 'Pengaturan Portal Pegawai', desc: 'Ringkasan lingkungan sistem, autentikasi, dan penyimpanan data Portal Pegawai.' },
  archive: { title: 'Dokumentasi Pelayanan', desc: 'Kelola tiga gambar dokumentasi yang ditampilkan pada halaman Informasi Publik.' },
};

const initialAnnouncement = { title: '', category: 'Informasi Pelayanan', shortDescription: '', content: '' };
const initialLocation = { name: '', address: '', operatingHours: '', phone: '', mapsUrl: '', type: 'induk' as ServiceLocation['type'] };
const initialPoster = { title: '', village: '', district: '', imageUrl: '' };
const initialDocument = { title: '', category: 'sop' as PublicDocument['category'], fileType: 'PDF', fileSize: '-', downloadUrl: '#', updateDate: '', description: '' };
const initialFaq = { question: '', answer: '', category: 'Umum', isEnabled: true };
const initialArchive = { title: '', description: '', image: '' };
const initialBot = { question: '', answer: '', keywords: '', category: 'Umum', isEnabled: true };
const field = 'w-full rounded border border-[#cbd9e2] bg-white px-3.5 py-2.5 text-[13px] text-[#233e52] outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#e3eff8]';
const label = 'mb-1.5 block text-xs font-semibold text-[#385469]';
const action = 'inline-flex min-h-10 items-center justify-center gap-2 rounded bg-[#005BAC] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#004783] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]';
const subtle = 'inline-flex min-h-9 items-center gap-1.5 rounded border border-[#d4e0e8] px-3 py-2 text-xs font-semibold text-[#36576e] hover:bg-[#edf4f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]';

const today = () => new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const safeLink = (value: string) => value.startsWith('https://') || value.startsWith('http://') || value.startsWith('/');

export const AdminDashboard: React.FC = () => {
  const {
    announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
    serviceLocations, addServiceLocation, updateServiceLocation, deleteServiceLocation,
    bumdesPosters, addBumdesPoster, deleteBumdesPoster,
    documents, addDocument, deleteDocument,
    faqs, addFaq, updateFaq, deleteFaq,
    contactMessages, updateMessageStatus, deleteContactMessage,
    chatbotFaqs, addChatbotFaq, updateChatbotFaq, toggleChatbotFaqStatus, deleteChatbotFaq,
    visualArchive,addArchiveItem,updateArchiveItem,deleteArchiveItem,backendReady,
    showToast,
  } = useSamsat();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [annForm, setAnnForm] = useState(initialAnnouncement);
  const [locForm, setLocForm] = useState(initialLocation);
  const [posterForm, setPosterForm] = useState(initialPoster);
  const [docForm, setDocForm] = useState(initialDocument);
  const [faqForm, setFaqForm] = useState(initialFaq);
  const [botForm, setBotForm] = useState(initialBot);
  const [archiveForm,setArchiveForm]=useState(initialArchive);
  const [uploading,setUploading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [dbAnnouncements, setDbAnnouncements] = useState<Announcement[] | null>(null);
  const [locationCount, setLocationCount] = useState<number | undefined>(undefined);
  const [documentCount, setDocumentCount] = useState<number | undefined>(undefined);
  const [archiveCount,setArchiveCount] = useState<number | undefined>(undefined);
  const [faqCount,setFaqCount] = useState<number | undefined>(undefined);
  const [newMessageCount,setNewMessageCount] = useState<number | undefined>(undefined);
  useEffect(() => {
    let active = true;
    apiRequest<{ announcements: Announcement[] }>('/api/v1/announcements')
      .then((data) => { if (active) setDbAnnouncements(data.announcements); })
      .catch((error) => { console.error('Gagal memuat ringkasan pengumuman:', error); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest<{ locations: { id: string }[] }>('/api/v1/locations')
      .then(data => { if (active) setLocationCount(data.locations.length); })
      .catch(error => console.error('Gagal memuat jumlah titik layanan:', error));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest<{ documents: { id: string }[] }>('/api/v1/documents')
      .then(data => { if (active) setDocumentCount(data.documents.length); })
      .catch(error => console.error('Gagal memuat jumlah dokumen:', error));
    return () => { active = false; };
  }, []);
  useEffect(() => { let active = true; apiRequest<{archive:{id:string}[]}>('/api/v1/archive').then(r=>{if(active)setArchiveCount(r.archive.length)}).catch(console.error);return()=>{active=false}; }, []);
  useEffect(() => { let active=true; apiRequest<{faqs:{id:string}[]}>('/api/v1/faqs').then(r=>{if(active)setFaqCount(r.faqs.length)}).catch(console.error);return()=>{active=false}; }, []);
  useEffect(() => { let active=true; apiRequest<{messages:{status:string}[]}>('/api/v1/messages').then(r=>{if(active)setNewMessageCount(r.messages.filter(m=>m.status==='New').length)}).catch(console.error);return()=>{active=false}; }, []);
  const counts: Partial<Record<Tab, number>> = {
    announcements: dbAnnouncements?.length, locations: locationCount,
    posters: bumdesPosters.length, documents: documentCount,
    faq: faqCount, messages: newMessageCount,
    chatbot: chatbotFaqs.length, archive: archiveCount,
  };

  const allRows = useMemo(() => {
    switch (activeTab) {
      case 'announcements': return announcements;
      case 'locations': return serviceLocations;
      case 'posters': return bumdesPosters;
      case 'documents': return documents;
      case 'archive': return visualArchive;
      case 'faq': return faqs;
      case 'messages': return contactMessages;
      case 'chatbot': return chatbotFaqs;
      default: return [];
    }
  }, [activeTab, announcements, serviceLocations, bumdesPosters, documents, visualArchive, faqs, contactMessages, chatbotFaqs]);
  const rows = useMemo(() => allRows.filter(item => JSON.stringify(item).toLocaleLowerCase('id-ID').includes(searchTerm.trim().toLocaleLowerCase('id-ID'))), [allRows, searchTerm]);

  const chooseTab = (tab: Tab) => { setActiveTab(tab); setSearchTerm(''); setDialogOpen(false); };
  const closeDialog = () => { setDialogOpen(false); setEditId(null); };
  const startForm = (item?: Announcement | ServiceLocation | BUMDesPoster | PublicDocument | FAQItem | ChatbotFAQ | ArchiveItem) => {
    setEditId(item?.id ?? null);
    if (activeTab === 'announcements') {
      const a = item as Announcement | undefined;
      setAnnForm(a ? { title: a.title, category: a.category, shortDescription: a.shortDescription, content: a.content } : initialAnnouncement);
    } else if (activeTab === 'locations') {
      const l = item as ServiceLocation | undefined;
      setLocForm(l ? { name: l.name, address: l.address, operatingHours: l.operatingHours, phone: l.phone, mapsUrl: l.mapsUrl, type: l.type } : initialLocation);
    } else if (activeTab === 'posters') {
      const p = item as BUMDesPoster | undefined;
      setPosterForm(p ? { title: p.title, village: p.village, district: p.district, imageUrl: p.imageUrl } : initialPoster);
    } else if (activeTab === 'documents') {
      const d = item as PublicDocument | undefined;
      setDocForm(d ? { title: d.title, category: d.category, fileType: d.fileType, fileSize: d.fileSize, downloadUrl: d.downloadUrl, updateDate: d.updateDate, description: d.description ?? '' } : { ...initialDocument, updateDate: today() });
    } else if (activeTab === 'archive') {
      const a=item as ArchiveItem|undefined;
      setArchiveForm(a?{title:a.title,description:a.description,image:a.image}:initialArchive);
    } else if (activeTab === 'faq') {
      const f = item as FAQItem | undefined;
      setFaqForm(f ? { question: f.question, answer: f.answer, category: f.category, isEnabled: f.isEnabled } : initialFaq);
    } else if (activeTab === 'chatbot') {
      const b = item as ChatbotFAQ | undefined;
      setBotForm(b ? { question: b.question, answer: b.answer, keywords: b.keywords.join(', '), category: b.category, isEnabled: b.isEnabled } : initialBot);
    }
    setDialogOpen(true);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    let ok=false;
    try {
      if (activeTab === 'announcements') {
        const data={...annForm,content:annForm.content||annForm.shortDescription};
        ok=editId ? await updateAnnouncement(editId,data) : await addAnnouncement({...data,date:today()});
      } else if (activeTab === 'locations') {
        const data={...locForm,mapsUrl:locForm.mapsUrl||`https://maps.google.com/?q=${encodeURIComponent(locForm.address)}`};
        if(!safeLink(data.mapsUrl)){showToast('Tautan Maps tidak valid.','error');return;}
        ok=editId ? await updateServiceLocation(editId,data) : await addServiceLocation(data);
      } else if (activeTab === 'posters') {
        if(!safeLink(posterForm.imageUrl)){showToast('Masukkan URL gambar yang valid.','error');return;}
        ok=await addBumdesPoster({...posterForm,dateAdded:new Date().toISOString().slice(0,10),downloads:0});
      } else if (activeTab === 'documents') {
        if (docForm.downloadUrl!=='#'&&!safeLink(docForm.downloadUrl)){showToast('Tautan dokumen tidak valid.','error');return;}
        ok=await addDocument(docForm);
      } else if (activeTab === 'archive') {
        if(!archiveForm.image){showToast('Masukkan gambar dokumentasi.','error');return;}
        ok=editId ? await updateArchiveItem(editId,archiveForm) : await addArchiveItem(archiveForm);
      } else if (activeTab === 'faq') {
        ok=editId ? await updateFaq(editId,faqForm) : await addFaq(faqForm);
      } else if (activeTab === 'chatbot') {
        const data={...botForm,keywords:botForm.keywords.split(',').map(t=>t.trim()).filter(Boolean)};
        ok=editId ? await updateChatbotFaq(editId,data) : await addChatbotFaq(data);
      }
      if(ok)closeDialog();
    } finally {setSaving(false);}
  };

  const handleUpload=async(file:File, target:'documents'|'posters'|'archive')=>{
    if (file.size>8*1024*1024) {showToast('Maksimal ukuran file 8 MB.','error');return;}
    if (target==='documents' ? file.type!=='application/pdf' : !['image/png','image/jpeg','image/webp'].includes(file.type)) {
      showToast('Jenis berkas tidak sesuai.','error');return;
    }
    setUploading(true);
    try {
      const uploaded=await uploadFile(file);
      if(target==='documents')setDocForm(p=>({...p,downloadUrl:uploaded.url,fileSize:uploaded.fileSize,fileType:uploaded.fileType}));
      else if(target==='posters')setPosterForm(p=>({...p,imageUrl:uploaded.url}));
      else setArchiveForm(p=>({...p,image:uploaded.url}));
      showToast('File tersimpan pada server lokal. Simpan formulir untuk menerbitkan.');
    } catch (error) {showToast(error instanceof Error?error.message:'Unggah gagal.','error');}
    finally {setUploading(false);}
  };

  const remove = async (id: string) => {
    if (!window.confirm('Hapus entri ini dari PostgreSQL? Tindakan ini tidak dapat dibatalkan.')) return;
    switch (activeTab) {
      case 'announcements': await deleteAnnouncement(id);break;
      case 'locations': await deleteServiceLocation(id);break;
      case 'posters': await deleteBumdesPoster(id);break;
      case 'documents': await deleteDocument(id);break;
      case 'archive': await deleteArchiveItem(id);break;
      case 'faq': await deleteFaq(id);break;
      case 'messages': await deleteContactMessage(id);break;
      case 'chatbot': await deleteChatbotFaq(id);break;
    }
  };

  useEffect(() => {
    if (!dialogOpen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDialog(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', onKey); };
  }, [dialogOpen]);

  const smallEdit = (item: Announcement | ServiceLocation | FAQItem | ChatbotFAQ | ArchiveItem) => (
    <button type="button" onClick={() => startForm(item)} className={subtle} aria-label={`Edit ${'title' in item ? item.title : 'name' in item ? item.name : 'question' in item ? item.question : 'entri'}`}><Pencil size={14} aria-hidden="true" /> Edit</button>
  );
  const smallDelete = (id: string) => <button type="button" onClick={() => remove(id)} className="inline-flex min-h-9 items-center gap-1 rounded border border-[#ead4d0] px-3 py-2 text-xs font-semibold text-[#9c453b] hover:bg-[#fff3f0]" aria-label="Hapus entri"><Trash2 size={14} aria-hidden="true" /> Hapus</button>;

  const renderRow = (item: Announcement | ServiceLocation | BUMDesPoster | PublicDocument | FAQItem | ChatbotFAQ | ArchiveItem | { id: string; status: string; name: string; email: string; subject: string; message: string }) => {
    if (activeTab === 'announcements') {
      const a = item as Announcement;
      return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="min-w-0"><p className="text-[11px] font-semibold text-[#005BAC]">{a.category} · {a.date}</p><h3 className="mt-1 text-sm font-semibold leading-6 text-[#243f52]">{a.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#687e8e]">{a.shortDescription}</p></div><div className="flex shrink-0 gap-2">{smallEdit(a)}{smallDelete(a.id)}</div></div>;
    }
    if (activeTab === 'locations') {
      const l = item as ServiceLocation;
      return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="min-w-0"><p className="text-[11px] font-semibold uppercase text-[#005BAC]">{l.type}</p><h3 className="mt-1 text-sm font-semibold text-[#243f52]">{l.name}</h3><p className="mt-1 text-xs leading-5 text-[#687e8e]">{l.address}</p><p className="mt-1 text-xs text-[#607587]">{l.operatingHours}</p></div><div className="flex shrink-0 gap-2">{smallEdit(l)}{smallDelete(l.id)}</div></div>;
    }
    if (activeTab === 'posters') {
      const p = item as BUMDesPoster;
      return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex min-w-0 items-center gap-4"><img src={p.imageUrl} alt="" className="h-16 w-16 shrink-0 border border-[#dce5eb] bg-[#edf2f6] object-cover" loading="lazy" /><div><h3 className="text-sm font-semibold text-[#243f52]">{p.title}</h3><p className="mt-1 text-xs text-[#687e8e]">{p.village} · {p.district}</p></div></div><div className="flex shrink-0 gap-2">{safeLink(p.imageUrl) && <a href={p.imageUrl} target="_blank" rel="noopener noreferrer" className={subtle}>Lihat <ExternalLink size={13} /></a>}{smallDelete(p.id)}</div></div>;
    }
    if (activeTab === 'documents') {
      const d = item as PublicDocument;
      return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="min-w-0"><p className="text-[11px] font-semibold uppercase text-[#005BAC]">{d.category} · {d.fileType}</p><h3 className="mt-1 text-sm font-semibold text-[#243f52]">{d.title}</h3><p className="mt-1 text-xs text-[#687e8e]">{d.updateDate} · {d.downloadUrl === '#' ? 'Belum ada berkas' : 'Ada tautan dokumen'}</p></div><div className="flex shrink-0 gap-2">{d.downloadUrl !== '#' && safeLink(d.downloadUrl) && <a href={d.downloadUrl} target="_blank" rel="noopener noreferrer" className={subtle}>Berkas <ExternalLink size={13} /></a>}{smallDelete(d.id)}</div></div>;
    }
    if (activeTab === 'archive') {
      const a=item as ArchiveItem;
      return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><img src={a.image} alt="" className="h-20 w-20 border border-[#dce5eb] object-contain"/><div><h3 className="text-sm font-semibold text-[#243f52]">{a.title}</h3><p className="mt-1 text-xs text-[#607587]">{a.description}</p></div></div><div className="flex gap-2">{smallEdit(a)}{smallDelete(a.id)}</div></div>;
    }
    if (activeTab === 'faq') {
      const f = item as FAQItem;
      return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="min-w-0"><p className="text-[11px] font-semibold text-[#005BAC]">{f.category} · {f.isEnabled ? 'Ditampilkan' : 'Disembunyikan'}</p><h3 className="mt-1 text-sm font-semibold leading-6 text-[#243f52]">{f.question}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#687e8e]">{f.answer}</p></div><div className="flex shrink-0 gap-2">{smallEdit(f)}{smallDelete(f.id)}</div></div>;
    }
    if (activeTab === 'chatbot') {
      const b = item as ChatbotFAQ;
      return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-[#005BAC]">{b.category}</p>
            <h3 className="mt-1 text-sm font-semibold text-[#243f52]">{b.question}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#687e8e]">{b.answer}</p>
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-2 self-start sm:self-center" aria-label={`Aksi jawaban: ${b.question}`}>
            <button
              type="button"
              className="inline-flex h-9 min-w-[86px] shrink-0 items-center justify-center whitespace-nowrap rounded border border-[#d4e0e8] px-3 text-xs font-semibold text-[#36576e] hover:bg-[#edf4f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]"
              onClick={() => void toggleChatbotFaqStatus(b.id)}
            >
              {b.isEnabled ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            {!b.isEnabled && (
              <>
                <button type="button" onClick={() => startForm(b)}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded border border-[#d4e0e8] px-3 text-xs font-semibold text-[#36576e] hover:bg-[#edf4f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]">
                  <Pencil size={14} aria-hidden="true" /> Edit
                </button>
                <button type="button" onClick={() => remove(b.id)}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded border border-[#ead4d0] px-3 text-xs font-semibold text-[#9c453b] hover:bg-[#fff3f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9c453b]">
                  <Trash2 size={14} aria-hidden="true" /> Hapus
                </button>
              </>
            )}
          </div>
        </div>
      );
    }
    const m = item as { id: string; status: string; name: string; email: string; subject: string; message: string };
    return <div className="space-y-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-[#243f52]">{m.subject}</h3><p className="mt-1 text-xs text-[#687e8e]">{m.name} · {m.email}</p></div><div className="flex items-center gap-2"><label className="sr-only" htmlFor={`status-${m.id}`}>Status pesan</label><select id={`status-${m.id}`} value={m.status} onChange={e => updateMessageStatus(m.id, e.target.value as 'New' | 'In Progress' | 'Completed')} className="rounded border border-[#d4e0e8] bg-white px-2 py-2 text-xs text-[#344d60]"><option value="New">Baru</option><option value="In Progress">Diproses</option><option value="Completed">Selesai</option></select>{smallDelete(m.id)}</div></div><p className="whitespace-pre-line text-[13px] leading-6 text-[#587081]">{m.message}</p></div>;
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-20 pt-8 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[#dce5eb] pb-7">
        <div><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[#005BAC]">Pengelolaan Konten</p><h1 className="text-[27px] font-bold tracking-[-0.025em] text-[#1b3b53] sm:text-[33px]">Portal Pegawai UPPD Kabupaten Banyumas</h1><p className="mt-2 max-w-[720px] text-[13px] leading-6 text-[#62798b]">Kelola informasi website publik melalui Portal Pegawai UPPD Kabupaten Banyumas. Data dinamis tersimpan melalui backend API pada PostgreSQL.</p></div>
        <span className="rounded border border-[#d3e2ea] bg-[#edf4f8] px-3 py-2 text-[11px] font-semibold text-[#335b73]">PostgreSQL · API Lokal</span>
      </div>
      <div className="grid items-start gap-7 lg:grid-cols-[252px_minmax(0,1fr)]">
        <aside className="min-w-0 border border-[#dce5eb] bg-white p-3 lg:sticky lg:top-[104px]">
          <h2 className="px-3 pb-3 pt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#718391]">Menu pengelolaan</h2>
          <nav aria-label="Navigasi dashboard" className="flex gap-1 overflow-x-auto border-t border-[#e7edf1] pt-2 lg:flex-col lg:overflow-visible">
            {menu.map(({ id, label: navLabel, icon: Icon }) => {
              const active = activeTab === id;
              return <button key={id} type="button" onClick={() => chooseTab(id)} aria-current={active ? 'page' : undefined} className={`flex min-h-11 shrink-0 items-center gap-3 border-l-[3px] px-3 py-2.5 text-left text-[13px] transition-colors lg:w-full ${active ? 'border-[#005BAC] bg-[#eaf3fa] font-semibold text-[#005BAC]' : 'border-transparent font-medium text-[#466174] hover:bg-[#f3f7fa] hover:text-[#005BAC]'}`}>
                <Icon size={17} aria-hidden={true}/><span className="flex-1 whitespace-nowrap">{navLabel}</span>{counts[id] !== undefined && <span className="rounded bg-[#eef2f5] px-2 py-0.5 text-[11px] tabular-nums text-[#60778a]">{counts[id]}</span>}
              </button>;
            })}
          </nav>
        </aside>
        <main className="min-w-0">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-[22px] font-bold text-[#1c3c53]">{pageInfo[activeTab].title}</h2><p className="mt-1 max-w-[700px] text-[13px] leading-6 text-[#607688]">{pageInfo[activeTab].desc}</p></div>
            {['posters', 'chatbot'].includes(activeTab) && <button type="button" onClick={() => startForm()} className={action}><Plus size={16} aria-hidden="true" /> Tambah Data</button>}
          </div>

          {activeTab === 'announcements' ? (
            <section className="border border-[#dce5eb] bg-white p-5 sm:p-6"><AdminAnnouncements onAnnouncementsChange={setDbAnnouncements} /></section>
          ) : activeTab === 'archive' ? (
            <section className="border border-[#dce5eb] bg-white p-5 sm:p-6"><AdminArchive onChange={setArchiveCount}/></section>
          ) : activeTab === 'documents' ? (
            <section className="border border-[#dce5eb] bg-white p-5 sm:p-6"><AdminDocuments onDocumentsChange={setDocumentCount} /></section>
          ) : activeTab === 'locations' ? (
            <section className="border border-[#dce5eb] bg-white p-5 sm:p-6">
              <AdminLocations onLocationsChange={setLocationCount} />
              </section>
          ) : activeTab === 'messages' ? (
            <section className="border border-[#dce5eb] bg-white p-5 sm:p-6"><AdminMessages onChange={setNewMessageCount}/></section>
          ) : activeTab === 'faq' ? (
              <section className="border border-[#dce5eb] bg-white p-5 sm:p-6">
                <OperatorFAQ onChange={setFaqCount} />
              </section>
            ) : activeTab === 'overview' ? (
            <div className="space-y-7">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Pengumuman', value: dbAnnouncements?.length ?? '—', tab: 'announcements' as Tab },
                  { label: 'Titik Layanan', value: locationCount ?? '—', tab: 'locations' as Tab },
                  { label: 'Dokumen', value: documentCount ?? '—', tab: 'documents' as Tab },
                  { label: 'Pesan Baru', value: newMessageCount ?? '—', tab: 'messages' as Tab },
                ].map(metric => <button key={metric.tab} type="button" onClick={() => chooseTab(metric.tab)} className="border border-[#dce5eb] bg-white px-5 py-5 text-left transition-colors hover:border-[#8fb9d7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]"><p className="text-[12px] font-medium text-[#617688]">{metric.label}</p><p className="mt-3 text-[29px] font-bold tabular-nums text-[#1b3a52]">{metric.value}</p><span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#005BAC]">Lihat data <ArrowRight size={13}/></span></button>)}
              </div>
              <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                <section className="border border-[#dce5eb] bg-white p-5 sm:p-6"><h3 className="text-base font-semibold text-[#1d3b52]">Pengumuman terbaru</h3><p className="mt-1 text-xs text-[#6b8090]">Pengumuman yang tersimpan pada PostgreSQL</p><div className="mt-5 divide-y divide-[#e7edf1]">{dbAnnouncements === null ? <p className="py-4 text-sm text-[#708392]">Memuat pengumuman...</p> : dbAnnouncements.length ? dbAnnouncements.slice(0, 5).map(a => <div key={a.id} className="py-3"><p className="text-[11px] text-[#6b8191]">{a.date} · {a.category}</p><p className="mt-1 text-[13px] font-semibold leading-5 text-[#2a465a]">{a.title}</p></div>) : <p className="py-4 text-sm text-[#708392]">Belum ada pengumuman.</p>}</div></section>
                <section className="border border-[#dce5eb] bg-white p-5 sm:p-6"><h3 className="text-base font-semibold text-[#1d3b52]">Pekerjaan pengelolaan</h3><p className="mt-1 text-xs text-[#6b8090]">Akses cepat ke modul yang paling sering diperbarui</p><div className="mt-5 divide-y divide-[#e7edf1]">{[{ tab: 'announcements' as Tab, text: 'Perbarui pengumuman' },{ tab: 'locations' as Tab, text: 'Periksa jadwal dan lokasi' },{ tab: 'documents' as Tab, text: 'Kelola dokumen publik' },{ tab: 'faq' as Tab, text: 'Perbarui pertanyaan umum' }].map(task => <button key={task.tab} type="button" onClick={() => chooseTab(task.tab)} className="flex w-full items-center justify-between gap-3 py-3 text-left text-[13px] font-medium text-[#3e5b70] hover:text-[#005BAC]">{task.text}<ArrowRight size={15} aria-hidden="true" /></button>)}</div></section>
              </div>
              <div className="border-l-[3px] border-[#005BAC] bg-[#eef5f9] px-5 py-4 text-[12px] leading-6 text-[#536f83]"><strong className="font-semibold text-[#23485f]">Lingkungan sistem:</strong> Portal Pegawai terhubung ke backend API lokal dengan autentikasi sesi dan basis data PostgreSQL. Perubahan konten yang dipublikasikan akan dibaca oleh website publik melalui API yang sama.</div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="space-y-5">
              <section className="border border-[#dce5eb] bg-white p-6 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#005BAC]">Portal Pegawai UPPD Kabupaten Banyumas</p>
                    <h3 className="mt-1 text-lg font-bold text-[#1d3b52]">Status Sistem</h3>
                    <p className="mt-1 text-xs leading-5 text-[#667c8c]">Ringkasan koneksi aplikasi, basis data, dan publikasi konten.</p>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${backendReady ? 'bg-[#e9f6ef] text-[#25704a]' : 'bg-[#fff1ef] text-[#a33c33]'}`}>
                    <span className={`h-2 w-2 rounded-full ${backendReady ? 'bg-[#2c8a5b]' : 'bg-[#c44c40]'}`} />
                    {backendReady ? 'Sistem terhubung' : 'Koneksi bermasalah'}
                  </span>
                </div>
              </section>

              <div className="grid gap-5 xl:grid-cols-2">
                <section className="border border-[#dce5eb] bg-white p-6 sm:p-7">
                  <div className="mb-5 flex items-center gap-2">
                    <CheckCircle2 size={19} className="text-[#005BAC]"/>
                    <h3 className="font-semibold text-[#1d3b52]">Konfigurasi Aplikasi</h3>
                  </div>
                  <dl className="divide-y divide-[#e4ebf0] text-sm">
                    <div className="grid gap-2 py-4 sm:grid-cols-[150px_1fr]"><dt className="font-semibold text-[#385469]">Portal</dt><dd className="text-[#607789]">Portal Pegawai UPPD Kabupaten Banyumas</dd></div>
                    <div className="grid gap-2 py-4 sm:grid-cols-[150px_1fr]"><dt className="font-semibold text-[#385469]">Backend</dt><dd className="text-[#607789]">Node.js dan Express API</dd></div>
                    <div className="grid gap-2 py-4 sm:grid-cols-[150px_1fr]"><dt className="font-semibold text-[#385469]">Basis data</dt><dd className="font-semibold text-[#25704a]">PostgreSQL · Prisma ORM</dd></div>
                    <div className="grid gap-2 py-4 sm:grid-cols-[150px_1fr]"><dt className="font-semibold text-[#385469]">Penyimpanan</dt><dd className="text-[#607789]">Data terstruktur di PostgreSQL; file unggahan disimpan pada server aplikasi</dd></div>
                  </dl>
                </section>

                <section className="border border-[#dce5eb] bg-white p-6 sm:p-7">
                  <div className="mb-5 flex items-center gap-2">
                    <Settings size={19} className="text-[#005BAC]"/>
                    <h3 className="font-semibold text-[#1d3b52]">Akses & Keamanan</h3>
                  </div>
                  <dl className="divide-y divide-[#e4ebf0] text-sm">
                    <div className="grid gap-2 py-4 sm:grid-cols-[150px_1fr]"><dt className="font-semibold text-[#385469]">Autentikasi</dt><dd className="text-[#607789]">Password hash dan cookie sesi HttpOnly</dd></div>
                    <div className="grid gap-2 py-4 sm:grid-cols-[150px_1fr]"><dt className="font-semibold text-[#385469]">Hak akses</dt><dd className="text-[#607789]">Administrator, Operator, dan Penanggung Jawab</dd></div>
                    <div className="grid gap-2 py-4 sm:grid-cols-[150px_1fr]"><dt className="font-semibold text-[#385469]">Website publik</dt><dd className="text-[#607789]">Konten aktif dibaca melalui API yang terhubung ke PostgreSQL</dd></div>
                    <div className="grid gap-2 py-4 sm:grid-cols-[150px_1fr]"><dt className="font-semibold text-[#385469]">Status database</dt><dd className={backendReady ? "font-semibold text-[#25704a]" : "font-semibold text-[#a33c33]"}>{backendReady ? 'PostgreSQL terhubung' : 'PostgreSQL tidak terhubung'}</dd></div>
                  </dl>
                </section>
              </div>

              <div className="border-l-[3px] border-[#005BAC] bg-[#eef5f9] px-5 py-4 text-xs leading-6 text-[#536f83]">
                Seluruh modul utama Portal Pegawai menggunakan backend API yang terhubung ke PostgreSQL sebagai basis data aplikasi.
              </div>
            </div>
          ) : (
            <section className="border border-[#dce5eb] bg-white p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-3 border-b border-[#e4ebef] pb-5 sm:flex-row sm:items-center"><p className="text-xs text-[#657a8c]">{rows.length} entri ditampilkan</p><div className="relative w-full sm:max-w-[280px]"><Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8ba0ae]"/><label className="sr-only" htmlFor="admin-search">Cari data</label><input id="admin-search" type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari dalam daftar..." className={`${field} pl-9`} /></div></div>
              <div className="divide-y divide-[#e7edf1]">{rows.length ? rows.map(item => <article key={item.id} className="py-5">{renderRow(item)}</article>) : <p className="py-12 text-center text-sm text-[#6c8192]">Belum ada data yang cocok dengan pencarian.</p>}</div>
              {activeTab === 'posters' && <p className="border-t border-[#e7edf1] pt-4 text-xs leading-5 text-[#718696]">Poster dapat menggunakan URL atau file JPG/PNG/WEBP yang diunggah ke server lokal.</p>}
              {activeTab === 'documents' && <p className="border-t border-[#e7edf1] pt-4 text-xs leading-5 text-[#718696]">Dokumen dapat menggunakan URL atau PDF yang diunggah ke server lokal.</p>}
              {activeTab === 'messages' && <p className="border-t border-[#e7edf1] pt-4 text-xs leading-5 text-[#718696]">Pesan berasal dari formulir publik dan tersimpan pada PostgreSQL. Balasan diproses melalui fitur Gmail yang tersedia pada Portal Pegawai.</p>}
            </section>
          )}
        </main>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0b2235]/70 px-4 py-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeDialog(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="admin-form-title" className="max-h-[90dvh] w-full max-w-[600px] overflow-y-auto border border-[#dce5eb] bg-white p-5 shadow-xl sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#e4ebef] pb-4"><div><p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#005BAC]">{pageInfo[activeTab].title}</p><h2 id="admin-form-title" className="text-lg font-bold text-[#1d3b52]">{editId ? 'Edit Data' : 'Tambah Data Baru'}</h2></div><button ref={closeRef} type="button" aria-label="Tutup formulir" onClick={closeDialog} className="rounded border border-[#dce5eb] p-2 text-[#4f6678] hover:bg-[#edf4f8]"><X size={18}/></button></div>
            <form onSubmit={save} className="space-y-4">
              {activeTab === 'announcements' && <>
                <div><label className={label} htmlFor="ann-title">Judul Pengumuman</label><input id="ann-title" required maxLength={180} className={field} value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })}/></div>
                <div><label className={label} htmlFor="ann-category">Kategori</label><input id="ann-category" required className={field} value={annForm.category} onChange={e => setAnnForm({ ...annForm, category: e.target.value })}/></div>
                <div><label className={label} htmlFor="ann-short">Ringkasan</label><textarea id="ann-short" rows={3} required className={field} value={annForm.shortDescription} onChange={e => setAnnForm({ ...annForm, shortDescription: e.target.value })}/></div>
                <div><label className={label} htmlFor="ann-content">Isi Pengumuman</label><textarea id="ann-content" rows={5} className={field} value={annForm.content} onChange={e => setAnnForm({ ...annForm, content: e.target.value })}/></div>
              </>}
              {activeTab === 'locations' && <>
                <div><label className={label} htmlFor="loc-name">Nama Lokasi</label><input id="loc-name" required className={field} value={locForm.name} onChange={e => setLocForm({ ...locForm, name: e.target.value })}/></div>
                <div><label className={label} htmlFor="loc-address">Alamat</label><textarea id="loc-address" required rows={2} className={field} value={locForm.address} onChange={e => setLocForm({ ...locForm, address: e.target.value })}/></div>
                <div><label className={label} htmlFor="loc-hours">Jam Pelayanan</label><input id="loc-hours" required className={field} value={locForm.operatingHours} onChange={e => setLocForm({ ...locForm, operatingHours: e.target.value })}/></div>
                <div className="grid gap-4 sm:grid-cols-2"><div><label className={label} htmlFor="loc-phone">Telepon</label><input id="loc-phone" className={field} value={locForm.phone} onChange={e => setLocForm({ ...locForm, phone: e.target.value })}/></div><div><label className={label} htmlFor="loc-type">Kategori</label><select id="loc-type" className={field} value={locForm.type} onChange={e => setLocForm({ ...locForm, type: e.target.value as ServiceLocation['type'] })}>{['induk','pembantu','cepat','drive-thru','keliling','mpp','gerai','paten'].map(type => <option value={type} key={type}>{type}</option>)}</select></div></div>
                <div><label className={label} htmlFor="loc-maps">Tautan Google Maps</label><input id="loc-maps" type="url" className={field} placeholder="https://maps.google.com/..." value={locForm.mapsUrl} onChange={e => setLocForm({ ...locForm, mapsUrl: e.target.value })}/></div>
              </>}
              {activeTab === 'posters' && <>
                <div><label className={label} htmlFor="poster-file">Unggah gambar poster (opsional)</label><input id="poster-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={e=>{const f=e.target.files?.[0];if(f)void handleUpload(f,'posters');}} className={field}/></div>
                <div><label className={label} htmlFor="poster-title">Judul Poster</label><input id="poster-title" required className={field} value={posterForm.title} onChange={e => setPosterForm({ ...posterForm, title: e.target.value })}/></div>
                <div className="grid gap-4 sm:grid-cols-2"><div><label className={label} htmlFor="poster-village">Desa</label><input id="poster-village" required className={field} value={posterForm.village} onChange={e => setPosterForm({ ...posterForm, village: e.target.value })}/></div><div><label className={label} htmlFor="poster-district">Kecamatan</label><input id="poster-district" required className={field} value={posterForm.district} onChange={e => setPosterForm({ ...posterForm, district: e.target.value })}/></div></div>
                <div><label className={label} htmlFor="poster-url">URL Gambar</label><input id="poster-url" required className={field} placeholder="https://... atau /images/nama.jpg" value={posterForm.imageUrl} onChange={e => setPosterForm({ ...posterForm, imageUrl: e.target.value })}/></div>
              </>}
              {activeTab === 'documents' && <>
                <div><label className={label} htmlFor="document-file">Unggah PDF (opsional, maksimal 8 MB)</label><input id="document-file" type="file" accept="application/pdf" disabled={uploading} onChange={e=>{const f=e.target.files?.[0];if(f)void handleUpload(f,'documents');}} className={field}/></div>
                <div><label className={label} htmlFor="doc-title">Judul Dokumen</label><input id="doc-title" required className={field} value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })}/></div>
                <div className="grid gap-4 sm:grid-cols-2"><div><label className={label} htmlFor="doc-category">Kategori</label><select id="doc-category" className={field} value={docForm.category} onChange={e => setDocForm({ ...docForm, category: e.target.value as PublicDocument['category'] })}>{['sop','wbk','sipp','pad','evaluasi'].map(type => <option key={type} value={type}>{type}</option>)}</select></div><div><label className={label} htmlFor="doc-type">Format</label><input id="doc-type" required className={field} value={docForm.fileType} onChange={e => setDocForm({ ...docForm, fileType: e.target.value })}/></div></div>
                <div className="grid gap-4 sm:grid-cols-2"><div><label className={label} htmlFor="doc-size">Ukuran</label><input id="doc-size" required className={field} value={docForm.fileSize} onChange={e => setDocForm({ ...docForm, fileSize: e.target.value })}/></div><div><label className={label} htmlFor="doc-date">Tanggal Diperbarui</label><input id="doc-date" required className={field} value={docForm.updateDate} onChange={e => setDocForm({ ...docForm, updateDate: e.target.value })}/></div></div>
                <div><label className={label} htmlFor="doc-url">Tautan Dokumen (# jika belum tersedia)</label><input id="doc-url" required className={field} value={docForm.downloadUrl} onChange={e => setDocForm({ ...docForm, downloadUrl: e.target.value })}/></div>
                <div><label className={label} htmlFor="doc-desc">Keterangan</label><textarea id="doc-desc" rows={3} className={field} value={docForm.description} onChange={e => setDocForm({ ...docForm, description: e.target.value })}/></div>
              </>}
              {activeTab === 'archive' && <>
                <div><label className={label} htmlFor="archive-title">Judul dokumentasi</label><input id="archive-title" required className={field} value={archiveForm.title} onChange={e=>setArchiveForm({...archiveForm,title:e.target.value})}/></div>
                <div><label className={label} htmlFor="archive-desc">Deskripsi</label><textarea id="archive-desc" rows={3} className={field} value={archiveForm.description} onChange={e=>setArchiveForm({...archiveForm,description:e.target.value})}/></div>
                <div><label className={label} htmlFor="archive-url">Alamat gambar</label><input id="archive-url" required className={field} value={archiveForm.image} onChange={e=>setArchiveForm({...archiveForm,image:e.target.value})}/></div>
                <div><label className={label} htmlFor="archive-file">Atau unggah gambar (JPG/PNG/WEBP)</label><input id="archive-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={e=>{const f=e.target.files?.[0];if(f)void handleUpload(f,'archive');}} className={field}/></div>
              </>}
              {activeTab === 'faq' && <>
                <div><label className={label} htmlFor="faq-question">Pertanyaan</label><textarea id="faq-question" required rows={2} className={field} value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}/></div>
                <div><label className={label} htmlFor="faq-answer">Jawaban</label><textarea id="faq-answer" required rows={5} className={field} value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}/></div>
                <div><label className={label} htmlFor="faq-category">Kategori</label><input id="faq-category" required className={field} value={faqForm.category} onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}/></div>
                <label className="flex items-center gap-2 text-xs text-[#385469]"><input type="checkbox" checked={faqForm.isEnabled} onChange={e => setFaqForm({ ...faqForm, isEnabled: e.target.checked })}/> Tampilkan di website publik</label>
              </>}
              {activeTab === 'chatbot' && <>
                <div><label className={label} htmlFor="bot-question">Pertanyaan</label><textarea id="bot-question" required rows={2} className={field} value={botForm.question} onChange={e => setBotForm({ ...botForm, question: e.target.value })}/></div>
                <div><label className={label} htmlFor="bot-answer">Jawaban</label><textarea id="bot-answer" required rows={4} className={field} value={botForm.answer} onChange={e => setBotForm({ ...botForm, answer: e.target.value })}/></div>
                <div><label className={label} htmlFor="bot-words">Kata Kunci (pisahkan dengan koma)</label><input id="bot-words" className={field} value={botForm.keywords} onChange={e => setBotForm({ ...botForm, keywords: e.target.value })}/></div>
                <div><label className={label} htmlFor="bot-category">Kategori</label><input id="bot-category" required className={field} value={botForm.category} onChange={e => setBotForm({ ...botForm, category: e.target.value })}/></div>
                <p className="text-xs leading-5 text-[#647b8d]">Jawaban baru disimpan sebagai Nonaktif. Setelah dicek, klik Aktifkan pada daftar. Untuk mengedit atau menghapus jawaban aktif, nonaktifkan terlebih dahulu.</p>
              </>}
              <div className="flex flex-wrap justify-end gap-2 border-t border-[#e6edf2] pt-5"><button type="button" onClick={closeDialog} className={subtle}>Batal</button><button type="submit" disabled={saving||uploading||!backendReady} className={action}>{editId ? 'Simpan Perubahan' : 'Simpan Data'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
