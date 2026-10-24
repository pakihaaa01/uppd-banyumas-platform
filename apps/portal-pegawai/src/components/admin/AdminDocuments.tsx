import { useEffect, useState, type FormEvent } from 'react';
import { FileText, Plus, Pencil, Trash2, ExternalLink, Search, X } from 'lucide-react';
import { apiRequest } from '../../lib/api';

type Category = 'sop' | 'wbk' | 'sipp' | 'pad' | 'evaluasi';
type DocumentItem = {
  id: string; title: string; category: Category; fileType: string;
  fileSize: string; downloadUrl: string; updateDate: string;
  description: string | null; isPublished: boolean;
};
type DocumentForm = Omit<DocumentItem, 'id' | 'isPublished'>;
const API = '/api/v1/documents';
const categories: { value: Category; label: string }[] = [
  { value: 'sop', label: 'SOP' }, { value: 'wbk', label: 'WBK' },
  { value: 'sipp', label: 'SIPP' }, { value: 'pad', label: 'PAD' },
  { value: 'evaluasi', label: 'Evaluasi' }
];
const inputStyle = 'w-full rounded-lg border border-[#cbd9e2] bg-white px-3.5 py-2.5 text-[13px] text-[#233e52] outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#e3eff8]';
const buttonStyle = 'min-h-9 rounded-lg border border-[#d4e0e8] px-3 text-xs font-semibold text-[#36546b] hover:bg-[#f4f8fb] disabled:opacity-50';
const newForm = (): DocumentForm => ({
  title: '', category: 'sop', fileType: 'PDF', fileSize: '-',
  downloadUrl: '', updateDate: new Date().toLocaleDateString('en-CA'),
  description: ''
});
export function AdminDocuments({ onDocumentsChange }: { onDocumentsChange?: (count: number) => void }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [form, setForm] = useState<DocumentForm>(newForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  useEffect(() => { onDocumentsChange?.(documents.length); }, [documents, onDocumentsChange]);

  useEffect(() => {
    let active = true;
    apiRequest<{ documents: DocumentItem[] }>(API)
      .then(data => { if (active) setDocuments(data.documents); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Gagal memuat dokumen'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function refresh() {
    const data = await apiRequest<{ documents: DocumentItem[] }>(API);
    setDocuments(data.documents);
  }
  function create() { setForm(newForm()); setEditingId(null); setShowForm(true); setError(''); setInfo(''); }
  function edit(item: DocumentItem) {
    if (item.isPublished) return;
    setForm({
      title: item.title, category: item.category, fileType: item.fileType,
      fileSize: item.fileSize, downloadUrl: item.downloadUrl,
      updateDate: item.updateDate.slice(0, 10), description: item.description ?? ''
    });
    setEditingId(item.id); setShowForm(true); setError(''); setInfo('');
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setInfo('');
    try {
      const payload = { ...form, title: form.title.trim(), downloadUrl: form.downloadUrl.trim(),
        description: form.description?.trim() || null };
      if (editingId) await apiRequest(`${API}/${encodeURIComponent(editingId)}`, 'PATCH', payload);
      else await apiRequest(API, 'POST', payload);
      setShowForm(false); setEditingId(null);
      await refresh(); setInfo('Dokumen tersimpan sebagai Draft.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Gagal menyimpan dokumen'); }
    finally { setBusy(false); }
  }
  async function toggle(item: DocumentItem) {
    if (busy) return;
    setBusy(true); setError(''); setInfo('');
    try {
      await apiRequest(`${API}/${encodeURIComponent(item.id)}/${item.isPublished ? 'unpublish' : 'publish'}`, 'POST');
      await refresh();
      setInfo(item.isPublished ? 'Dokumen ditarik dari website publik.' : 'Dokumen diterbitkan ke website publik.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Gagal mengubah publikasi'); }
    finally { setBusy(false); }
  }
  async function remove(item: DocumentItem) {
    if (item.isPublished || busy || !window.confirm(`Hapus Draft "${item.title}"?`)) return;
    setBusy(true); setError(''); setInfo('');
    try {
      await apiRequest(`${API}/${encodeURIComponent(item.id)}`, 'DELETE');
      await refresh(); setInfo('Draft berhasil dihapus.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Gagal menghapus Draft'); }
    finally { setBusy(false); }
  }
  const filtered = documents.filter(item =>
    (filter === 'ALL' || (filter === 'PUBLISHED' ? item.isPublished : !item.isPublished)) &&
    (item.title + ' ' + item.category + ' ' + (item.description ?? '')).toLowerCase().includes(search.trim().toLowerCase())
  );
  const published = documents.filter(item => item.isPublished).length;
  return <section className="space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="text-lg font-bold text-[#193a52]">Kelola Dokumen Publik</h3>
        <p className="mt-1 text-xs leading-5 text-[#647b8d]">Kelola metadata dan tautan dokumen resmi yang ditampilkan di website publik.</p></div>
      {!showForm && <button type="button" onClick={create} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#005BAC] px-4 text-xs font-semibold text-white hover:bg-[#004783]"><Plus size={16}/> Tambah Dokumen</button>}
    </header>
    <div className="grid grid-cols-3 gap-3">
      {[[ 'Total Dokumen', documents.length ], [ 'Dipublikasikan', published ], [ 'Draft', documents.length - published ]].map(([title, count]) =>
        <div key={title} className="rounded-xl border border-[#dce5eb] bg-white p-4">
          <p className="text-[11px] text-[#647b8d]">{title}</p><p className="mt-2 text-2xl font-bold text-[#193a52]">{count}</p>
        </div>)}
    </div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {info && <p role="status" className="rounded-lg border border-[#c4ddcd] bg-[#f0f9f3] p-3 text-sm text-[#246247]">{info}</p>}
    {showForm ? <form onSubmit={save} className="overflow-hidden rounded-xl border border-[#dce5eb] bg-white">
      <div className="flex items-center justify-between border-b border-[#e6edf2] p-5">
        <h4 className="font-semibold text-[#193a52]">{editingId ? 'Edit Draft Dokumen' : 'Tambah Dokumen'}</h4>
        <button type="button" disabled={busy} onClick={() => setShowForm(false)} aria-label="Tutup formulir"><X size={18}/></button>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <label className="sm:col-span-2 text-xs font-semibold text-[#385469]">Judul Dokumen<input required maxLength={200} className={inputStyle + ' mt-2'} value={form.title} onChange={e => setForm({...form,title:e.target.value})}/></label>
        <label className="text-xs font-semibold text-[#385469]">Kategori<select className={inputStyle + ' mt-2'} value={form.category} onChange={e => setForm({...form,category:e.target.value as Category})}>{categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
        <label className="text-xs font-semibold text-[#385469]">Tanggal Pembaruan<input type="date" required className={inputStyle + ' mt-2'} value={form.updateDate} onChange={e => setForm({...form,updateDate:e.target.value})}/></label>
        <label className="text-xs font-semibold text-[#385469]">Jenis Berkas<input required maxLength={30} className={inputStyle + ' mt-2'} value={form.fileType} onChange={e => setForm({...form,fileType:e.target.value})}/></label>
        <label className="text-xs font-semibold text-[#385469]">Ukuran Berkas<input required maxLength={50} placeholder="Contoh: 2 MB" className={inputStyle + ' mt-2'} value={form.fileSize} onChange={e => setForm({...form,fileSize:e.target.value})}/></label>
        <label className="sm:col-span-2 text-xs font-semibold text-[#385469]">Tautan Dokumen (HTTPS/HTTP)<input type="url" required maxLength={2048} placeholder="https://..." className={inputStyle + ' mt-2'} value={form.downloadUrl} onChange={e => setForm({...form,downloadUrl:e.target.value})}/></label>
        <label className="sm:col-span-2 text-xs font-semibold text-[#385469]">Keterangan<textarea rows={4} maxLength={5000} className={inputStyle + ' mt-2'} value={form.description ?? ''} onChange={e => setForm({...form,description:e.target.value})}/></label>
        <p className="sm:col-span-2 text-xs leading-5 text-[#728697]">Tahap ini menggunakan tautan dokumen yang sudah tersedia secara online. Fitur unggah PDF langsung belum tersedia di backend baru.</p>
      </div>
      <div className="flex justify-end gap-2 border-t border-[#e6edf2] p-5">
        <button type="button" className={buttonStyle} disabled={busy} onClick={() => setShowForm(false)}>Batal</button>
        <button type="submit" disabled={busy} className="min-h-9 rounded-lg bg-[#005BAC] px-4 text-xs font-semibold text-white disabled:opacity-50">{busy ? 'Menyimpan...' : 'Simpan Draft'}</button>
      </div>
    </form> :
    <div className="overflow-hidden rounded-xl border border-[#dce5eb] bg-white">
      <div className="flex flex-wrap gap-3 border-b border-[#e6edf2] p-4 sm:items-center">
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-lg border border-[#dce5eb] px-3"><Search size={16} className="text-[#7c90a0]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari dokumen..." className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"/></div>
        <select aria-label="Filter publikasi" value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} className="rounded-lg border border-[#dce5eb] px-3 text-xs"><option value="ALL">Semua</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Dipublikasikan</option></select>
      </div>
      {loading ? <p className="p-8 text-center text-sm text-[#647b8d]">Memuat dokumen...</p> : filtered.length === 0 ?
      <div className="p-10 text-center text-sm text-[#647b8d]"><FileText size={28} className="mx-auto mb-3"/>Tidak ada dokumen sesuai pencarian.</div> :
      <div className="divide-y divide-[#e6edf2]">{filtered.map(item => <article key={item.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={'rounded-full px-2.5 py-1 text-[11px] font-semibold ' + (item.isPublished ? 'bg-[#eaf6ee] text-[#27734a]' : 'bg-[#eef2f5] text-[#647b8d]')}>{item.isPublished ? 'Dipublikasikan' : 'Draft'}</span>
            <span className="text-[11px] text-[#005BAC]">{categories.find(c=>c.value===item.category)?.label ?? item.category}</span>
          </div>
          <h4 className="break-words text-[15px] font-bold text-[#193a52]">{item.title}</h4>
          <p className="mt-1 text-xs text-[#718596]">{item.updateDate.slice(0,10)} · {item.fileType} · {item.fileSize}</p>
          {item.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#667e8c]">{item.description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className={buttonStyle + ' inline-flex items-center gap-1'}><ExternalLink size={13}/> Lihat</a>
          <button type="button" disabled={busy} onClick={() => void toggle(item)} className={buttonStyle}>{item.isPublished ? 'Tarik Publikasi' : 'Publikasikan'}</button>
          {!item.isPublished && <><button type="button" disabled={busy} onClick={() => edit(item)} className={buttonStyle + ' inline-flex items-center gap-1'}><Pencil size={13}/> Edit</button>
          <button type="button" disabled={busy} onClick={() => void remove(item)} className={buttonStyle + ' inline-flex items-center gap-1 text-red-700'}><Trash2 size={13}/> Hapus</button></>}
        </div>
      </article>)}</div>}
    </div>}
  </section>;
}
