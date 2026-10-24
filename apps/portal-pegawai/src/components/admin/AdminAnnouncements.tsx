
import { useEffect, useState, type FormEvent } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Eye
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

export function AdminAnnouncements() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [form, setForm] = useState<DraftForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(false);
  const [search, setSearch] = useState('');

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
    `${item.title} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
    <div className="space-y-5">
      {/* Header halaman */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#193a52]">
            Daftar Pengumuman
          </h2>

          <p className="mt-1 text-xs text-[#647b8d]">
            Pengelolaan draft dan publikasi langsung melalui PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded bg-[#005BAC] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004783]"
        >
          <Plus size={16} />
          Tambah Pengumuman
        </button>
      </div>

      {/* Pesan kesalahan */}
      {error && (
        <p
          role="alert"
          className="border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Pesan keberhasilan */}
      {info && (
        <p
          role="status"
          className="border border-[#cbd9e2] bg-[#eff6fb] p-3 text-sm text-[#193a52]"
        >
          {info}
        </p>
      )}

      {showForm ? (
        /* Form tambah dan edit pengumuman */
        <form
          id="admin-announcement-form"
          onSubmit={saveDraft}
          className="space-y-5 border border-[#dce5eb] bg-[#fbfcfd] p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#193a52]">
              {editingId ? 'Edit Draft' : 'Buat Pengumuman'}
            </h3>

            <button
              type="button"
              aria-label="Tutup formulir"
              disabled={saving}
              onClick={() => setShowForm(false)}
            >
              <X size={19} />
            </button>
          </div>

          {/* Judul */}
          <div>
            <label htmlFor="ann-title" className={label}>
              Judul Pengumuman
            </label>

            <input
              id="ann-title"
              required
              maxLength={200}
              className={field}
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
          </div>

          {/* Tanggal */}
          <div>
            <label htmlFor="ann-date" className={label}>
              Tanggal Pengumuman
            </label>

            <input
              id="ann-date"
              type="date"
              required
              className={field}
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />
          </div>

          {/* Kategori */}
          <div>
            <label htmlFor="ann-category" className={label}>
              Kategori
            </label>

            <select
              id="ann-category"
              className={field}
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option>Informasi Pelayanan</option>
              <option>Berita Kegiatan</option>
              <option>Pengumuman Umum</option>
              <option>Kebijakan Pelayanan</option>
            </select>
          </div>

          {/* Ringkasan */}
          <div>
            <label htmlFor="ann-short" className={label}>
              Ringkasan
            </label>

            <textarea
              id="ann-short"
              rows={3}
              required
              maxLength={500}
              className={field}
              value={form.shortDescription}
              onChange={(e) =>
                setForm({
                  ...form,
                  shortDescription: e.target.value
                })
              }
            />
          </div>

          {/* Isi pengumuman */}
          <div>
            <label htmlFor="ann-content" className={label}>
              Isi Pengumuman
            </label>

            <textarea
              id="ann-content"
              rows={6}
              required
              maxLength={50000}
              className={field}
              value={form.content}
              onChange={(e) =>
                setForm({ ...form, content: e.target.value })
              }
            />
          </div>

          {/* Opsi pengumuman */}
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-xs text-[#385469]">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isNew: e.target.checked
                  })
                }
              />
              Tandai sebagai baru
            </label>

            <label className="flex items-center gap-2 text-xs text-[#385469]">
              <input
                type="checkbox"
                checked={form.isImportant}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isImportant: e.target.checked
                  })
                }
              />
              Pengumuman penting
            </label>
          </div>

          {/* Pratinjau */}
          {preview && (
            <section className="border border-[#dce5eb] bg-white p-5">
              <p className="mb-2 text-xs font-semibold text-[#005BAC]">
                PRATINJAU
              </p>

              <h4 className="text-lg font-bold text-[#193a52]">
                {form.title || 'Judul Pengumuman'}
              </h4>

              <p className="mt-2 text-xs text-[#647b8d]">
                {form.date} · {form.category}
              </p>

              <p className="mt-3 text-sm text-[#647b8d]">
                {form.shortDescription}
              </p>

              <p className="mt-4 whitespace-pre-wrap text-sm text-[#233e52]">
                {form.content}
              </p>
            </section>
          )}

          {/* Tombol aksi form */}
          <div className="flex flex-wrap justify-end gap-2 border-t border-[#e6edf2] pt-4">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded border border-[#cbd9e2] px-4 py-2 text-xs font-semibold text-[#36546b]"
            >
              <Eye size={15} />
              Pratinjau
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#005BAC] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004783] disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan Draft'}
            </button>
            <button type="button" onClick={() => void publishForm()} disabled={saving} className="rounded bg-[#176b45] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">Publikasikan</button>
          </div>
        </form>
      ) : loading ? (
        /* Loading data */
        <p className="text-sm text-[#647b8d]">
          Memuat pengumuman dari database...
        </p>
      ) : (
        <>
          {/* Pencarian */}
          <div className="flex items-center gap-2 rounded border border-[#dce5eb] bg-white px-3 py-2">
            <Search size={17} className="text-[#647b8d]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengumuman..."
              aria-label="Cari pengumuman"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* Daftar pengumuman */}
          {filtered.length === 0 ? (
            <div className="border border-dashed border-[#cbd9e2] p-8 text-center text-sm text-[#647b8d]">
              {error
                ? 'Daftar pengumuman belum dapat ditampilkan.'
                : 'Belum ada pengumuman yang sesuai.'}
            </div>
          ) : (
            <div className="divide-y divide-[#e6edf2] border border-[#dce5eb]">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-semibold text-[#193a52]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-[#647b8d]">
                      {item.category} · {item.date.slice(0, 10)} · {item.status}
                    </p>
                  </div>

                  <button type="button" disabled={saving} onClick={() => void changePublication(item)} className="rounded border border-[#005BAC] px-3 py-2 text-xs font-semibold text-[#005BAC] disabled:opacity-50">{item.status === 'PUBLISHED' ? 'Tarik Publikasi' : 'Publikasikan'}</button>
                  {/* Tombol Edit dan Hapus */}
                  {item.status === 'DRAFT' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={deletingId !== null}
                        onClick={() => startEdit(item)}
                        className="inline-flex items-center gap-2 rounded border border-[#cbd9e2] px-3 py-2 text-xs text-[#36546b] disabled:opacity-50"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={deletingId !== null}
                        onClick={() => deleteDraft(item)}
                        className="inline-flex items-center gap-2 rounded border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {deletingId === item.id
                          ? 'Menghapus...'
                          : 'Hapus'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Keterangan integrasi */}
      <p className="text-xs text-[#647b8d]">
        Administrator dapat menyimpan draft, menerbitkan, dan menarik publikasi tanpa persetujuan role lain.
      </p>
    </div>
  );
}
