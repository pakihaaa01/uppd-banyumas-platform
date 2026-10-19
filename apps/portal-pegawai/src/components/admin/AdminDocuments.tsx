
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  FileText, Plus, Pencil, Trash2, Search, ExternalLink,
  X, RefreshCw, Save, AlertCircle
} from 'lucide-react';

type Category = 'sop' | 'wbk' | 'sipp' | 'pad' | 'evaluasi';

type PublicDocument = {
  id: string;
  title: string;
  category: Category;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  updateDate: string;
  description: string | null;
  isPublished: boolean;
};

type DocumentForm = {
  title: string;
  category: Category;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  updateDate: string;
  description: string;
};

const categories: { value: Category; label: string }[] = [
  { value: 'sop', label: 'SOP' },
  { value: 'wbk', label: 'WBK' },
  { value: 'sipp', label: 'SIPP' },
  { value: 'pad', label: 'PAD' },
  { value: 'evaluasi', label: 'Evaluasi' },
];

const createEmptyForm = (): DocumentForm => ({
  title: '',
  category: 'sop',
  fileType: 'PDF',
  fileSize: '-',
  downloadUrl: '',
  updateDate: new Date().toISOString().slice(0, 10),
  description: '',
});

const inputClass =
  'w-full border border-[#dce5eb] bg-white px-3 py-2.5 text-sm text-[#243f52] outline-none focus:border-[#005BAC]';

const labelClass =
  'mb-1.5 block text-xs font-semibold text-[#405c70]';

async function documentRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`/api/v1/documents${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result &&
      typeof result === 'object' &&
      'message' in result &&
      typeof result.message === 'string'
        ? result.message
        : `Permintaan gagal (${response.status}).`;

    throw new Error(message);
  }

  return result as T;
}

export function AdminDocuments() {
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DocumentForm>(createEmptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await documentRequest<{
        documents: PublicDocument[];
      }>('');

      setDocuments(result.documents ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat dokumen.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const filteredDocuments = documents.filter((doc) => {
    const keyword = search.toLowerCase().trim();

    return (
      doc.title.toLowerCase().includes(keyword) ||
      doc.category.toLowerCase().includes(keyword) ||
      (doc.description ?? '').toLowerCase().includes(keyword)
    );
  });

  function openCreate() {
    setEditingId(null);
    setForm(createEmptyForm());
    setError('');
    setNotice('');
    setDialogOpen(true);
  }

  function openEdit(doc: PublicDocument) {
    if (doc.isPublished) return;

    setEditingId(doc.id);
    setForm({
      title: doc.title,
      category: doc.category,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      downloadUrl: doc.downloadUrl,
      updateDate: doc.updateDate,
      description: doc.description ?? '',
    });
    setError('');
    setNotice('');
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;
    setDialogOpen(false);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Judul dokumen wajib diisi.');
      return;
    }

    if (
      form.downloadUrl.trim() &&
      form.downloadUrl.trim() !== '#'
    ) {
      try {
        const url = new URL(form.downloadUrl, window.location.origin);

        if (!['http:', 'https:'].includes(url.protocol)) {
          setError('Tautan dokumen harus menggunakan HTTP atau HTTPS.');
          return;
        }
      } catch {
        setError('Tautan dokumen tidak valid.');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        downloadUrl: form.downloadUrl.trim() || '#',
        description: form.description.trim(),
      };

      if (editingId) {
        await documentRequest(`/${encodeURIComponent(editingId)}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await documentRequest('', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setDialogOpen(false);
      setEditingId(null);
      setNotice(
        editingId
          ? 'Dokumen berhasil diperbarui.'
          : 'Dokumen berhasil ditambahkan sebagai draft.'
      );

      await loadDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan dokumen.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(doc: PublicDocument) {
    if (doc.isPublished) return;

    const confirmed = window.confirm(
      `Hapus dokumen "${doc.title}"?`
    );

    if (!confirmed) return;

    setError('');
    setNotice('');

    try {
      await documentRequest(`/${encodeURIComponent(doc.id)}`, {
        method: 'DELETE',
      });

      setNotice('Dokumen berhasil dihapus.');
      await loadDocuments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menghapus dokumen.'
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#1d3b52]">
            Manajemen Dokumen Publik
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#687e8e]">
            Kelola informasi, kategori, dan tautan dokumen pelayanan.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadDocuments()}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-[#dce5eb] px-3 py-2.5 text-xs font-semibold text-[#405c70] hover:bg-[#f1f6f9] disabled:opacity-50"
          >
            <RefreshCw size={15} />
            Muat Ulang
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-[#005BAC] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004b8e]"
          >
            <Plus size={16} />
            Tambah Dokumen
          </button>
        </div>
      </div>

      {notice && (
        <div role="status" className="border border-[#b9d9c4] bg-[#f0faf3] px-4 py-3 text-sm text-[#286642]">
          {notice}
        </div>
      )}

      {error && !dialogOpen && (
        <div role="alert" className="flex items-start gap-2 border border-[#edc6c6] bg-[#fff5f5] px-4 py-3 text-sm text-[#a23b3b]">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4ebef] pb-4">
        <p className="text-xs text-[#657a8c]">
          {filteredDocuments.length} dokumen ditampilkan
        </p>

        <div className="relative w-full sm:max-w-[300px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8ba0ae]"
          />
          <input
            type="search"
            aria-label="Cari dokumen"
            placeholder="Cari dokumen..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-[#708392]">
          Memuat dokumen...
        </p>
      ) : filteredDocuments.length === 0 ? (
        <div className="py-12 text-center">
          <FileText size={30} className="mx-auto text-[#9aafbd]" />
          <p className="mt-3 text-sm text-[#708392]">
            Belum ada dokumen yang ditampilkan.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#e7edf1]">
          {filteredDocuments.map((doc) => (
            <article
              key={doc.id}
              className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-start"
            >
              <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#eef5f9] text-[#005BAC]">
                  <FileText size={20} />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="bg-[#edf4f9] px-2 py-1 text-[10px] font-bold uppercase text-[#005BAC]">
                      {doc.category}
                    </span>

                    <span className={`px-2 py-1 text-[10px] font-semibold ${
                      doc.isPublished
                        ? 'bg-[#eaf6ed] text-[#33744b]'
                        : 'bg-[#fff4de] text-[#936719]'
                    }`}>
                      {doc.isPublished ? 'Terbit' : 'Draft'}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold leading-6 text-[#243f52]">
                    {doc.title}
                  </h4>

                  <p className="mt-1 text-xs text-[#687e8e]">
                    {doc.fileType} · {doc.fileSize} · {doc.updateDate}
                  </p>

                  {doc.description && (
                    <p className="mt-2 text-xs leading-5 text-[#687e8e]">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {doc.downloadUrl && doc.downloadUrl !== '#' && (
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 border border-[#dce5eb] px-3 py-2 text-xs font-semibold text-[#405c70] hover:bg-[#f1f6f9]"
                  >
                    <ExternalLink size={14} />
                    Lihat
                  </a>
                )}

                {!doc.isPublished && (
                  <>
                    <button
                      type="button"
                      onClick={() => openEdit(doc)}
                      className="inline-flex items-center gap-1 border border-[#dce5eb] px-3 py-2 text-xs font-semibold text-[#005BAC] hover:bg-[#eef5f9]"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(doc)}
                      className="inline-flex items-center gap-1 border border-[#edcaca] px-3 py-2 text-xs font-semibold text-[#af4646] hover:bg-[#fff5f5]"
                    >
                      <Trash2 size={14} />
                      Hapus
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {dialogOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b2235]/70 px-4 py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="documents-form-title"
            className="max-h-[90dvh] w-full max-w-[600px] overflow-y-auto border border-[#dce5eb] bg-white p-5 shadow-xl sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between border-b border-[#e4ebef] pb-4">
              <h3 id="documents-form-title" className="text-lg font-bold text-[#1d3b52]">
                {editingId ? 'Edit Dokumen' : 'Tambah Dokumen'}
              </h3>

              <button
                type="button"
                onClick={closeDialog}
                disabled={saving}
                aria-label="Tutup formulir"
                className="border border-[#dce5eb] p-2 text-[#4f6678]"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <p role="alert" className="mb-4 bg-[#fff5f5] p-3 text-xs text-[#a23b3b]">
                {error}
              </p>
            )}

            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
              <div>
                <label htmlFor="document-title" className={labelClass}>Judul Dokumen</label>
                <input
                  id="document-title"
                  required
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="document-category" className={labelClass}>Kategori</label>
                  <select
                    id="document-category"
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="document-type" className={labelClass}>Format</label>
                  <input
                    id="document-type"
                    required
                    className={inputClass}
                    value={form.fileType}
                    onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="document-size" className={labelClass}>Ukuran File</label>
                  <input
                    id="document-size"
                    required
                    className={inputClass}
                    placeholder="Contoh: 1.5 MB"
                    value={form.fileSize}
                    onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="document-date" className={labelClass}>Tanggal Pembaruan</label>
                  <input
                    id="document-date"
                    type="date"
                    required
                    className={inputClass}
                    value={form.updateDate}
                    onChange={(e) => setForm({ ...form, updateDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="document-url" className={labelClass}>URL Dokumen</label>
                <input
                  id="document-url"
                  className={inputClass}
                  placeholder="https://contoh.go.id/dokumen.pdf"
                  value={form.downloadUrl}
                  onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-[#718696]">
                  Kosongkan jika berkas belum tersedia.
                </p>
              </div>

              <div>
                <label htmlFor="document-description" className={labelClass}>Keterangan</label>
                <textarea
                  id="document-description"
                  rows={3}
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#e4ebef] pt-4">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={saving}
                  className="border border-[#dce5eb] px-4 py-2.5 text-sm text-[#536d80]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-[#005BAC] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Menyimpan...' : 'Simpan Dokumen'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
