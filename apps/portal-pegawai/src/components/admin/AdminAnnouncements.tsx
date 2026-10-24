
import { useEffect, useState, type FormEvent } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Eye,
  CalendarDays,
  FileText,
  Send,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

type Draft = {
  id: string;
  title: string;
  date: string;
  category: string;
  shortDescription: string;
  content: string;
  isNew: boolean;
  isImportant: boolean;
  status: string;
};

type DraftForm = Omit<Draft, 'id' | 'status'>;

function localDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function emptyForm(): DraftForm {
  return {
    title: '',
    date: localDate(),
    category: 'Informasi Pelayanan',
    shortDescription: '',
    content: '',
    isNew: true,
    isImportant: false
  };
}

const field =
  'w-full rounded border border-[#cbd9e2] bg-white px-3.5 py-2.5 text-[13px] text-[#233e52] outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#e3eff8]';

const label =
  'mb-1.5 block text-xs font-semibold text-[#385469]';

const API = '/api/v1/announcements';

export function AdminAnnouncements({ onCountChange }: { onCountChange?: (count: number) => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  useEffect(() => { onCountChange?.(drafts.length); }, [drafts, onCountChange]);
  const [form, setForm] = useState<DraftForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Mengambil pengumuman dari PostgreSQL saat halaman dibuka.
  useEffect(() => {
    let active = true;

    apiRequest<{ announcements: Draft[] }>(API)
      .then((data) => {
        if (active) {
          setDrafts(data.announcements);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal memuat pengumuman.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Pencarian pengumuman berdasarkan judul dan kategori.
  const filtered = drafts.filter((item) =>
    (statusFilter === 'ALL' || item.status === statusFilter) &&
    (item.title + ' ' + item.category + ' ' + item.shortDescription)
      .toLocaleLowerCase('id-ID')
      .includes(search.trim().toLocaleLowerCase('id-ID'))
  );
  const publishedCount = drafts.filter((item) => item.status === 'PUBLISHED').length;
  const draftCount = drafts.filter((item) => item.status === 'DRAFT').length;
  const formatDate = (value: string) => {
    const iso = value.slice(0, 10);
    const date = new Date(iso + 'T12:00:00');
    return Number.isNaN(date.getTime()) ? iso : new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  };

  // Membuka formulir pengumuman baru.
  function startCreate() {
    setForm(emptyForm());
    setEditingId(null);
    setError('');
    setInfo('');
    setPreview(false);
    setShowForm(true);
  }

  // Membuka formulir untuk mengedit draft.
  function startEdit(item: Draft) {
    if (item.status !== 'DRAFT') return;

    setForm({
      title: item.title,
      date: item.date.slice(0, 10),
      category: item.category,
      shortDescription: item.shortDescription,
      content: item.content,
      isNew: item.isNew,
      isImportant: item.isImportant
    });

    setEditingId(item.id);
    setError('');
    setInfo('');
    setPreview(false);
    setShowForm(true);
  }

  // Aksi simpan draft atau publikasi langsung dengan API yang sudah divalidasi.
  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setInfo('');

    try {
      if (editingId) {
        await apiRequest(`${API}/${encodeURIComponent(editingId)}`, 'PATCH', form);
      } else {
        await apiRequest(API, 'POST', form);
      }

      setShowForm(false);
      setPreview(false);
      setEditingId(null);

      setInfo('Draft berhasil disimpan ke PostgreSQL.');

      // Memuat ulang daftar dari backend.
      try {
        const result = await apiRequest<{
          announcements: Draft[];
        }>(API);

        setDrafts(result.announcements);
      } catch {
        setError(
          'Draft berhasil disimpan, tetapi daftar gagal dimuat ulang. Silakan refresh halaman.'
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan draft pengumuman.'
      );
    } finally {
      setSaving(false);
    }
  }


  // Publikasi baru: buat draft dahulu, kemudian terbitkan melalui endpoint khusus.
  async function publishForm() {
    if (saving) return;
    const el = document.querySelector<HTMLFormElement>('#admin-announcement-form');
    if (!el?.reportValidity()) return;
    setSaving(true);
    setError('');
    setInfo('');
    try {
      let id = editingId;
      if (id) {
        await apiRequest(`${API}/${encodeURIComponent(id)}`, 'PATCH', form);
      } else {
        const created = await apiRequest<{announcement: Draft}>(API, 'POST', form);
        id = created.announcement.id;
      }
      await apiRequest(`${API}/${encodeURIComponent(id)}/publish`, 'POST');
      setShowForm(false);
      setEditingId(null);
      const result = await apiRequest<{announcements: Draft[]}>(API);
      setDrafts(result.announcements);
      setInfo('Pengumuman berhasil diterbitkan ke website publik.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publikasi gagal. Draft mungkin telah disimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function changePublication(item: Draft) {
    if (saving) return;
    setSaving(true);
    setError('');
    setInfo('');
    try {
      const action = item.status === 'PUBLISHED' ? 'unpublish' : 'publish';
      await apiRequest(`${API}/${encodeURIComponent(item.id)}/${action}`, 'POST');
      const result = await apiRequest<{announcements: Draft[]}>(API);
      setDrafts(result.announcements);
      setInfo(action === 'publish' ? 'Pengumuman berhasil diterbitkan.' : 'Pengumuman ditarik menjadi Draft.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status publikasi.');
    } finally {
      setSaving(false);
    }
  }

  // Menghapus draft melalui API backend.
  async function deleteDraft(item: Draft) {
    if (item.status !== 'DRAFT' || deletingId !== null) return;

    const confirmed = window.confirm(
      `Yakin ingin menghapus draft "${item.title}" secara permanen?`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError('');
    setInfo('');

    try {
      await apiRequest(
        `${API}/${encodeURIComponent(item.id)}`,
        'DELETE'
      );

      // Hapus dari daftar setelah backend mengonfirmasi.
      setDrafts((current) =>
        current.filter((draft) => draft.id !== item.id)
      );

      setInfo('Draft berhasil dihapus dari PostgreSQL.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menghapus draft.'
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#193a52]">Kelola Pengumuman</h2>
          <p className="mt-1 text-[13px] leading-6 text-[#657c8c]">Tulis, simpan draft, dan terbitkan informasi ke website publik.</p>
        </div>
        {!showForm && (
          <button type="button" onClick={startCreate} className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-[#005BAC] px-4 text-[13px] font-semibold text-white transition hover:bg-[#004783]">
            <Plus size={16} /> Tambah Pengumuman
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {([
          { label: 'Total Pengumuman', value: drafts.length, icon: FileText },
          { label: 'Dipublikasikan', value: publishedCount, icon: CheckCircle2 },
          { label: 'Draft', value: draftCount, icon: Pencil }
        ] as const).map(({ label: title, value, icon: Icon }) => (
          <div key={title} className="rounded-xl border border-[#dce5eb] bg-white px-4 py-4 sm:px-5">
            <div className="mb-3 flex items-center justify-between gap-2 text-[#728799]">
              <span className="text-[11px] font-medium sm:text-xs">{title}</span>
              <Icon size={16} className="hidden shrink-0 sm:block" />
            </div>
            <p className="text-2xl font-bold tabular-nums text-[#193a52]">{value}</p>
          </div>
        ))}
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}
      {info && <div role="status" className="rounded-lg border border-[#b9dccc] bg-[#f1f9f5] px-4 py-3 text-[13px] text-[#246247]">{info}</div>}

      {showForm ? (
        <form id="admin-announcement-form" onSubmit={saveDraft} className="overflow-hidden rounded-xl border border-[#dce5eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e7edf2] px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-[15px] font-bold text-[#193a52]">{editingId ? 'Edit Draft' : 'Pengumuman Baru'}</h3>
              <p className="mt-1 text-xs text-[#718596]">Lengkapi informasi sebelum disimpan atau diterbitkan.</p>
            </div>
            <button type="button" aria-label="Tutup formulir" disabled={saving} onClick={() => setShowForm(false)} className="rounded-lg p-2 text-[#647b8d] hover:bg-[#f1f5f8]"><X size={18} /></button>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2">
              <label htmlFor="ann-title" className={label}>Judul Pengumuman</label>
              <input id="ann-title" required maxLength={200} placeholder="Masukkan judul pengumuman" className={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label htmlFor="ann-date" className={label}>Tanggal Pengumuman</label>
              <input id="ann-date" type="date" required className={field} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label htmlFor="ann-category" className={label}>Kategori</label>
              <select id="ann-category" className={field} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {!['Informasi Pelayanan', 'Berita Kegiatan', 'Pengumuman Umum', 'Kebijakan Pelayanan', 'Kebijakan Pajak', 'Inovasi Layanan', 'Kemitraan'].includes(form.category) && <option value={form.category}>{form.category}</option>}
                <option>Informasi Pelayanan</option><option>Berita Kegiatan</option><option>Pengumuman Umum</option><option>Kebijakan Pelayanan</option><option>Kebijakan Pajak</option><option>Inovasi Layanan</option><option>Kemitraan</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ann-short" className={label}>Ringkasan</label>
              <textarea id="ann-short" rows={3} required maxLength={500} placeholder="Ringkasan yang tampil pada daftar pengumuman" className={field} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
              <p className="mt-1 text-right text-[11px] text-[#8a9aa7]">{form.shortDescription.length}/500</p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ann-content" className={label}>Isi Pengumuman</label>
              <textarea id="ann-content" rows={7} required maxLength={50000} placeholder="Tulis isi pengumuman selengkapnya" className={field} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 sm:col-span-2">
              <label className="flex items-center gap-2 text-[13px] text-[#385469]"><input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> Tandai sebagai baru</label>
              <label className="flex items-center gap-2 text-[13px] text-[#385469]"><input type="checkbox" checked={form.isImportant} onChange={(e) => setForm({ ...form, isImportant: e.target.checked })} /> Pengumuman penting</label>
            </div>
            {preview && <div className="rounded-lg border border-[#dce5eb] bg-[#f8fafc] p-5 sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#005BAC]">Pratinjau</p>
              <h4 className="mt-3 text-lg font-bold text-[#193a52]">{form.title || 'Judul Pengumuman'}</h4>
              <p className="mt-1 text-xs text-[#647b8d]">{formatDate(form.date)} · {form.category}</p>
              <p className="mt-4 text-sm text-[#587081]">{form.shortDescription}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#233e52]">{form.content}</p>
            </div>}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#e7edf2] bg-[#fafcfd] px-5 py-4 sm:px-6">
            <button type="button" onClick={() => setPreview(!preview)} disabled={saving} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd9e2] bg-white px-4 text-xs font-semibold text-[#36546b] hover:bg-[#f2f6f9]"><Eye size={15} /> {preview ? 'Tutup Pratinjau' : 'Pratinjau'}</button>
            <button type="submit" disabled={saving} className="min-h-10 rounded-lg border border-[#005BAC] bg-white px-4 text-xs font-semibold text-[#005BAC] hover:bg-[#eef5ff] disabled:opacity-50">{saving ? 'Memproses...' : 'Simpan Draft'}</button>
            <button type="button" onClick={() => void publishForm()} disabled={saving} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#005BAC] px-4 text-xs font-semibold text-white hover:bg-[#004783] disabled:opacity-50"><Send size={14} /> Publikasikan</button>
          </div>
        </form>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#dce5eb] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#e7edf2] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#dce5eb] bg-[#fbfcfd] px-3">
              <Search size={17} className="shrink-0 text-[#8294a1]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul, kategori, atau ringkasan..." aria-label="Cari pengumuman" className="h-10 w-full min-w-0 bg-transparent text-[13px] text-[#233e52] outline-none" />
            </div>
            <div className="flex shrink-0 gap-1 rounded-lg bg-[#eef3f7] p-1" aria-label="Filter status pengumuman">
              {([
                ['ALL','Semua'], ['DRAFT','Draft'], ['PUBLISHED','Terbit']
              ] as const).map(([value, title]) => (
                <button key={value} type="button" aria-pressed={statusFilter === value} onClick={() => setStatusFilter(value)} className={'rounded-md px-3 py-2 text-xs font-semibold transition ' + (statusFilter === value ? 'bg-white text-[#005BAC] shadow-sm' : 'text-[#647b8d] hover:text-[#193a52]')}>{title}</button>
              ))}
            </div>
          </div>
          <div className="border-b border-[#e7edf2] bg-[#fafcfd] px-5 py-3 text-xs text-[#718596]">{loading ? 'Memuat data...' : filtered.length + ' dari ' + drafts.length + ' pengumuman'}</div>
          {loading ? <div className="px-5 py-12 text-center text-sm text-[#647b8d]">Memuat pengumuman dari database...</div> :
          filtered.length === 0 ? <div className="px-5 py-12 text-center"><FileText size={28} className="mx-auto mb-3 text-[#a4b2bd]" /><p className="text-sm font-medium text-[#385469]">Tidak ada pengumuman yang sesuai.</p><p className="mt-1 text-xs text-[#8294a1]">Coba ubah pencarian atau filter status.</p></div> :
          <div className="divide-y divide-[#e7edf2]">
            {filtered.map((item) => (
              <article key={item.id} className="px-5 py-5 transition hover:bg-[#fbfdff] sm:px-6">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={'rounded-full px-2.5 py-1 text-[11px] font-semibold ' + (item.status === 'PUBLISHED' ? 'bg-[#eaf6ee] text-[#27734a]' : 'bg-[#f0f3f6] text-[#5c7081]')}>{item.status === 'PUBLISHED' ? 'Dipublikasikan' : 'Draft'}</span>
                      <span className="text-[11px] font-medium text-[#005BAC]">{item.category}</span>
                      {item.isImportant && <span className="rounded bg-[#fff1eb] px-2 py-0.5 text-[10px] font-semibold text-[#a45424]">Penting</span>}
                    </div>
                    <h3 className="break-words text-[15px] font-bold leading-6 text-[#193a52]">{item.title}</h3>
                    <p className="mt-1.5 line-clamp-2 break-words text-[12px] leading-5 text-[#6b8090]">{item.shortDescription}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#8a9aa7]"><CalendarDays size={13} /> {formatDate(item.date)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button type="button" disabled={saving || deletingId !== null} onClick={() => void changePublication(item)} className="inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#005BAC] px-3 text-xs font-semibold text-[#005BAC] hover:bg-[#eff6fb] disabled:opacity-50">
                      {item.status === 'PUBLISHED' ? <><RotateCcw size={13} /> Tarik Publikasi</> : <><Send size={13} /> Publikasikan</>}
                    </button>
                    {item.status === 'DRAFT' && <>
                      <button type="button" disabled={saving || deletingId !== null} onClick={() => startEdit(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#d4e0e8] px-3 text-xs font-medium text-[#36546b] hover:bg-[#f4f8fb] disabled:opacity-50"><Pencil size={13} /> Edit</button>
                      <button type="button" disabled={saving || deletingId !== null} onClick={() => void deleteDraft(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#efd7d6] px-3 text-xs font-medium text-[#b84c46] hover:bg-[#fff7f6] disabled:opacity-50"><Trash2 size={13} /> {deletingId === item.id ? 'Menghapus...' : 'Hapus'}</button>
                    </>}
                  </div>
                </div>
              </article>
            ))}
          </div>}
        </div>
      )}
      <p className="text-xs leading-5 text-[#80919d]">Pengumuman berstatus Dipublikasikan tampil di website publik. Draft hanya dapat dilihat Administrator.</p>
    </section>
  );
}
