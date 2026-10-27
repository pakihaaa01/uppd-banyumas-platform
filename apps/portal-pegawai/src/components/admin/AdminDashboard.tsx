import { useCallback, useState } from 'react';
import { useSamsat } from '../../context/SamsatContext';
import type { PortalUser } from './AdminGate';
import { AdminAnnouncements } from './AdminAnnouncements';
import { AdminLocations } from './AdminLocations';
import { AdminDocuments } from './AdminDocuments';
import { AdminArchive } from './AdminArchive';
import { AdminMessages } from './AdminMessages';
import { AdminFAQ } from './AdminFAQ';
import { AdminChatbot } from './AdminChatbot';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminHelp } from './AdminHelp';
import { AdminSettings } from './AdminSettings';

const menus = [
  { id: 'overview', label: 'Ringkasan', description: 'Ringkasan konten dan pesan masyarakat yang tersimpan pada portal.' },
  { id: 'announcements', label: 'Pengumuman', description: 'Kelola informasi dan pemberitahuan untuk masyarakat.' },
  { id: 'locations', label: 'Titik Layanan', description: 'Perbarui alamat, jam pelayanan, dan tautan Google Maps.' },
  { id: 'documents', label: 'Dokumen Publik', description: 'Kelola dokumen yang tersedia untuk diunduh masyarakat.' },
  { id: 'archive', label: 'Dokumentasi Pelayanan', description: 'Kelola gambar dokumentasi pada halaman Informasi Publik.' },
  { id: 'faqs', label: 'Pertanyaan Umum', description: 'Kelola pertanyaan dan jawaban pada halaman FAQ.' },
  { id: 'messages', label: 'Pesan Masyarakat', description: 'Periksa pesan masuk dan kelola balasannya.' },
  { id: 'chatbot', label: 'Jawaban Chatbot', description: 'Jawaban aktif ditampilkan melalui Mas Sajak di website publik.' },
  { id: 'analytics', label: 'Statistik Kunjungan', description: 'Aktivitas pengunjung website publik yang tercatat oleh Google Analytics.' },
  { id: 'help', label: 'Bantuan Pegawai', description: 'Panduan penggunaan portal untuk pekerjaan sehari-hari.' },
  { id: 'settings', label: 'Pengaturan', description: 'Kelola kontak, beranda, template balasan, status fitur, dan akun Anda.' },
] as const;
type Tab = typeof menus[number]['id'];
export function AdminDashboard({ user }: { user: PortalUser }) {
  const [tab, setTab] = useState<Tab>('overview');
  const { summary, announcements, loading, dataErrors, refreshData } = useSamsat();
  const selected = menus.find(item => item.id === tab)!;
  const counts: Partial<Record<Tab, number>> = summary ? { ...summary, messages: summary.newMessages } : {};
  const select = (id: Tab) => { setTab(id); void refreshData(); };
  const updated = useCallback(() => { void refreshData(); }, [refreshData]);
  const publicUrl = new URL(window.location.origin); publicUrl.port = '3000';
  return <div className="mx-auto max-w-[1320px] px-4 pb-20 pt-8 text-black sm:px-8 lg:px-10">
    <header className="mb-8 border-b border-[#dce5eb] pb-7">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#005BAC]">Pengelolaan website</p>
      <h1 className="mt-2 text-2xl font-bold leading-tight text-[#193a52] sm:text-3xl">Portal Pegawai UPPD Kabupaten Banyumas</h1>
      <p className="mt-3 text-sm leading-6">Kelola informasi layanan, dokumen publik, dan pesan masyarakat dari satu tempat.</p>
    </header>
    <div className="grid items-start gap-7 lg:grid-cols-[235px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-[#dce5eb] bg-white p-3 lg:sticky lg:top-[104px]">
        <h2 className="px-3 py-3 text-xs font-semibold uppercase tracking-wide">Menu pengelolaan</h2>
        <nav aria-label="Navigasi dashboard" className="flex gap-1 overflow-x-auto border-t border-[#e7edf1] pt-2 lg:flex-col lg:overflow-visible">
          {menus.map(item => <button key={item.id} type="button" onClick={() => select(item.id)} aria-current={tab === item.id ? 'page' : undefined}
            className={`flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC] ${tab === item.id ? 'bg-[#eaf3fa] font-semibold text-[#005BAC]' : 'text-black hover:bg-[#f3f7fa]'}`}>
            <span className="whitespace-nowrap">{item.label}</span>{counts[item.id] !== undefined && <span className="rounded bg-[#eef2f5] px-2 py-0.5 text-xs tabular-nums text-black">{counts[item.id]}</span>}
          </button>)}
        </nav>
      </aside>
      <main className="min-w-0">
        <div className="mb-6"><h2 className="text-xl font-bold text-[#193a52]">{selected.label}</h2><p className="mt-2 text-sm leading-6">{selected.description}</p></div>
        {dataErrors.length > 0 && <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm"><p>Data belum berhasil dimuat: {dataErrors.join(', ')}.</p><button type="button" disabled={loading} onClick={updated} className="mt-2 font-semibold underline disabled:opacity-50">{loading ? 'Memuat…' : 'Coba lagi'}</button></div>}
        {tab === 'analytics' ? <AdminAnalytics/> : tab === 'help' ? <AdminHelp/> : tab === 'settings' ? <AdminSettings user={user} /> : tab === 'chatbot' ? <AdminChatbot /> : tab === 'overview' ? <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(['announcements', 'locations', 'documents', 'messages'] as const).map(id => <button key={id} type="button" onClick={() => select(id)} className="rounded-lg border border-[#dce5eb] bg-white p-5 text-left hover:border-[#005BAC] focus-visible:outline-2 focus-visible:outline-[#005BAC]">
              <p className="text-sm">{id === 'messages' ? 'Pesan baru' : menus.find(item => item.id === id)!.label}</p><p className="mt-3 text-3xl font-bold tabular-nums text-[#193a52]">{counts[id] ?? '—'}</p><p className="mt-4 text-xs font-semibold text-[#005BAC]">Lihat data</p>
            </button>)}
          </div>
          <section className="rounded-lg border border-[#dce5eb] bg-white p-5 sm:p-6">
            <h3 className="font-semibold text-[#193a52]">Pengumuman terbaru</h3>
            {dataErrors.includes('Pengumuman') ? <p className="mt-4 text-sm">Pengumuman belum dapat dimuat.</p> : loading && !announcements.length ? <p className="mt-4 text-sm">Memuat pengumuman…</p> : !announcements.length ? <p className="mt-4 text-sm">Belum ada pengumuman.</p> : <div className="mt-4 divide-y divide-[#e7edf1]">{announcements.slice(0, 5).map(item => <div key={item.id} className="py-3"><p className="text-xs">{item.date.slice(0, 10)} · {item.category}</p><p className="mt-1 text-sm font-semibold">{item.title}</p></div>)}</div>}
          </section>
          <a href={publicUrl.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-md border border-[#005BAC] px-4 py-2 text-sm font-semibold text-[#005BAC] hover:bg-blue-50">Lihat website publik</a>
        </div> : <section className="rounded-lg border border-[#dce5eb] bg-white p-5 sm:p-6">
          {tab === 'announcements' && <AdminAnnouncements onAnnouncementsChange={updated} />}
          {tab === 'locations' && <AdminLocations onLocationsChange={updated} />}
          {tab === 'documents' && <AdminDocuments onDocumentsChange={updated} />}
          {tab === 'archive' && <AdminArchive onChange={updated} />}
          {tab === 'messages' && <AdminMessages onChange={updated} />}
          {tab === 'faqs' && <AdminFAQ onChange={updated} />}
        </section>}
      </main>
    </div>
  </div>;
}
