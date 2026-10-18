
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

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPopular: boolean;
  isEnabled: boolean;
  viewCount: number;
};

type FAQForm = {
  question: string;
  answer: string;
  category: string;
  isPopular: boolean;
};

const API = '/api/v1/faqs';

const field =
  'w-full rounded border border-[#cbd9e2] bg-white px-3.5 py-2.5 text-[13px] text-[#233e52] outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#e3eff8]';

const label =
  'mb-1.5 block text-xs font-semibold text-[#385469]';

function emptyForm(): FAQForm {
  return {
    question: '',
    answer: '',
    category: 'Informasi Pelayanan',
    isPopular: false
  };
}

export function OperatorFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [form, setForm] = useState<FAQForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(false);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Mengambil daftar FAQ dari PostgreSQL.
  useEffect(() => {
    let active = true;

    apiRequest<{ faqs: FAQ[] }>(API)
      .then((result) => {
        if (active) setFaqs(result.faqs);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal memuat FAQ.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = faqs.filter((item) =>
    `${item.question} ${item.answer} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function startCreate() {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
    setPreview(false);
    setError('');
    setInfo('');
  }

  function startEdit(item: FAQ) {
    if (item.isEnabled) return;

    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category,
      isPopular: item.isPopular
    });

    setEditingId(item.id);
    setShowForm(true);
    setPreview(false);
    setError('');
    setInfo('');
  }

  // Tambah atau edit FAQ melalui backend.
  async function saveFAQ(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError('');
    setInfo('');

    try {
      if (editingId) {
        await apiRequest(
          `${API}/${encodeURIComponent(editingId)}`,
          'PATCH',
          form
        );
      } else {
        await apiRequest(API, 'POST', form);
      }

      setShowForm(false);
      setEditingId(null);
      setPreview(false);
      setInfo('FAQ berhasil disimpan ke PostgreSQL.');

      try {
        const result = await apiRequest<{ faqs: FAQ[] }>(API);
        setFaqs(result.faqs);
      } catch {
        setError(
          'FAQ tersimpan, tetapi daftar gagal dimuat. Silakan refresh.'
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan FAQ.'
      );
    } finally {
      setSaving(false);
    }
  }

  // Menghapus FAQ nonaktif dari database.
  async function deleteFAQ(item: FAQ) {
    if (item.isEnabled || deletingId !== null) return;

    const confirmed = window.confirm(
      `Yakin ingin menghapus FAQ "${item.question}" secara permanen?`
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

      setFaqs((current) =>
        current.filter((faq) => faq.id !== item.id)
      );

      setInfo('FAQ berhasil dihapus dari PostgreSQL.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menghapus FAQ.'
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#193a52]">
            Kelola FAQ
          </h2>

          <p className="mt-1 text-xs text-[#647b8d]">
            Kelola pertanyaan dan jawaban menggunakan PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded bg-[#005BAC] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004783]"
        >
          <Plus size={16} />
          Tambah FAQ
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {info && (
        <p
          role="status"
          className="border border-[#cbd9e2] bg-[#eff6fb] p-3 text-sm text-[#193a52]"
        >
          {info}
        </p>
      )}

      {showForm ? (
        <form
          onSubmit={saveFAQ}
          className="space-y-5 border border-[#dce5eb] bg-[#fbfcfd] p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#193a52]">
              {editingId ? 'Edit FAQ' : 'Tambah FAQ'}
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

          {/* Pertanyaan */}
          <div>
            <label htmlFor="faq-question" className={label}>
              Pertanyaan
            </label>

            <textarea
              id="faq-question"
              rows={3}
              required
              maxLength={500}
              className={field}
              value={form.question}
              onChange={(e) =>
                setForm({
                  ...form,
                  question: e.target.value
                })
              }
              placeholder="Masukkan pertanyaan yang sering diajukan"
            />
          </div>

          {/* Kategori */}
          <div>
            <label htmlFor="faq-category" className={label}>
              Kategori
            </label>

            <input
              id="faq-category"
              required
              maxLength={100}
              className={field}
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value
                })
              }
              placeholder="Contoh: Informasi Pelayanan"
            />
          </div>

          {/* Jawaban */}
          <div>
            <label htmlFor="faq-answer" className={label}>
              Jawaban
            </label>

            <textarea
              id="faq-answer"
              rows={6}
              required
              maxLength={20000}
              className={field}
              value={form.answer}
              onChange={(e) =>
                setForm({
                  ...form,
                  answer: e.target.value
                })
              }
              placeholder="Masukkan jawaban FAQ"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-[#385469]">
            <input
              type="checkbox"
              checked={form.isPopular}
              onChange={(e) =>
                setForm({
                  ...form,
                  isPopular: e.target.checked
                })
              }
            />
            Tandai sebagai FAQ populer
          </label>

          {/* Pratinjau */}
          {preview && (
            <section className="border border-[#dce5eb] bg-white p-5">
              <p className="mb-3 text-xs font-semibold text-[#005BAC]">
                PRATINJAU FAQ
              </p>

              <h4 className="font-semibold text-[#193a52]">
                {form.question || 'Pertanyaan FAQ'}
              </h4>

              <p className="mt-2 text-xs text-[#647b8d]">
                Kategori: {form.category}
              </p>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#36546b]">
                {form.answer || 'Jawaban FAQ'}
              </p>
            </section>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-[#e6edf2] pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => setPreview(!preview)}
              className="inline-flex items-center gap-2 rounded border border-[#cbd9e2] px-4 py-2 text-xs font-semibold text-[#36546b]"
            >
              <Eye size={15} />
              Pratinjau
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#005BAC] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan FAQ'}
            </button>
          </div>
        </form>
      ) : loading ? (
        <p className="text-sm text-[#647b8d]">
          Memuat FAQ dari database...
        </p>
      ) : (
        <>
          {/* Pencarian */}
          <div className="flex items-center gap-2 rounded border border-[#dce5eb] bg-white px-3 py-2">
            <Search size={17} className="text-[#647b8d]" />

            <input
              aria-label="Cari FAQ"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pertanyaan atau kategori..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="border border-dashed border-[#cbd9e2] p-8 text-center text-sm text-[#647b8d]">
              {error
                ? 'Daftar FAQ belum dapat ditampilkan.'
                : 'Belum ada FAQ yang sesuai.'}
            </div>
          ) : (
            <div className="divide-y divide-[#e6edf2] border border-[#dce5eb]">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-4 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#193a52]">
                      {item.question}
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#61798a]">
                      {item.answer}
                    </p>

                    <p className="mt-3 text-xs text-[#647b8d]">
                      {item.category}
                      {' · '}
                      {item.isEnabled ? 'Aktif' : 'Nonaktif'}
                      {item.isPopular ? ' · Populer' : ''}
                    </p>
                  </div>

                  {!item.isEnabled && (
                    <div className="flex shrink-0 items-center gap-2">
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
                        onClick={() => deleteFAQ(item)}
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

      <p className="text-xs text-[#647b8d]">
        FAQ baru tersimpan dengan status nonaktif.
        Pengaktifan FAQ pada website publik belum tersedia
        dalam API backend saat ini.
      </p>
    </div>
  );
}