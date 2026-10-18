
import { useState, type FormEvent } from 'react';
import { Plus, Search, Pencil, X, Eye } from 'lucide-react';

type Draft = {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  content: string;
};

type FormData = Omit<Draft, 'id'>;

const emptyForm: FormData = {
  title: '',
  category: 'Informasi Pelayanan',
  shortDescription: '',
  content: ''
};

const field =
  'w-full rounded border border-[#cbd9e2] bg-white px-3.5 py-2.5 text-[13px] text-[#233e52] outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#e3eff8]';

const label =
  'mb-1.5 block text-xs font-semibold text-[#385469]';

export function OperatorAnnouncements() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = drafts.filter((item) =>
    `${item.title} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function startCreate() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setPreview(false);
    setShowForm(true);
  }

  function startEdit(item: Draft) {
    setForm({
      title: item.title,
      category: item.category,
      shortDescription: item.shortDescription,
      content: item.content
    });
    setEditingId(item.id);
    setPreview(false);
    setShowForm(true);
  }

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId) {
      setDrafts((current) =>
        current.map((item) =>
          item.id === editingId ? { ...form, id: item.id } : item
        )
      );
    } else {
      setDrafts((current) => [
        { ...form, id: crypto.randomUUID() },
        ...current
      ]);
    }

    setShowForm(false);
    setPreview(false);
    setEditingId(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#193a52]">
            Daftar Pengumuman
          </h2>
          <p className="mt-1 text-xs text-[#647b8d]">
            Prototipe frontend — draft belum tersimpan di database.
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

      {showForm ? (
        <form
          onSubmit={saveDraft}
          className="space-y-5 border border-[#dce5eb] bg-[#fbfcfd] p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-[#193a52]">
              {editingId ? 'Edit Draft' : 'Buat Pengumuman'}
            </h3>

            <button
              type="button"
              aria-label="Tutup formulir"
              onClick={() => setShowForm(false)}
            >
              <X size={19} />
            </button>
          </div>

          <div>
            <label htmlFor="ann-title" className={label}>
              Judul Pengumuman
            </label>
            <input
              id="ann-title"
              required
              maxLength={180}
              className={field}
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
          </div>

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

          <div>
            <label htmlFor="ann-short" className={label}>
              Ringkasan
            </label>
            <textarea
              id="ann-short"
              rows={3}
              required
              className={field}
              value={form.shortDescription}
              onChange={(e) =>
                setForm({ ...form, shortDescription: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="ann-content" className={label}>
              Isi Pengumuman
            </label>
            <textarea
              id="ann-content"
              rows={6}
              required
              className={field}
              value={form.content}
              onChange={(e) =>
                setForm({ ...form, content: e.target.value })
              }
            />
          </div>

          {preview && (
            <section className="border border-[#dce5eb] bg-white p-5">
              <p className="mb-2 text-xs font-semibold text-[#005BAC]">
                PRATINJAU
              </p>
              <h4 className="text-lg font-bold text-[#193a52]">
                {form.title || 'Judul Pengumuman'}
              </h4>
              <p className="mt-2 text-sm text-[#647b8d]">
                {form.shortDescription}
              </p>
              <p className="mt-4 whitespace-pre-wrap text-sm text-[#233e52]">
                {form.content}
              </p>
            </section>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-[#e6edf2] pt-4">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="inline-flex items-center gap-2 rounded border border-[#cbd9e2] px-4 py-2 text-xs font-semibold text-[#36546b]"
            >
              <Eye size={15} />
              Pratinjau
            </button>

            <button
              type="submit"
              className="rounded bg-[#005BAC] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004783]"
            >
              Simpan Draft Sementara
            </button>
          </div>
        </form>
      ) : (
        <>
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

          {filtered.length === 0 ? (
            <div className="border border-dashed border-[#cbd9e2] p-8 text-center text-sm text-[#647b8d]">
              Belum ada draft pengumuman dalam sesi ini.
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
                      {item.category} · Draft lokal
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="inline-flex items-center gap-2 rounded border border-[#cbd9e2] px-3 py-2 text-xs text-[#36546b]"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-xs text-[#647b8d]">
        Draft pada tahap ini hanya tersimpan dalam memori halaman.
        Data akan hilang ketika halaman dimuat ulang.
        Belum tersedia publikasi atau pengiriman persetujuan.
      </p>
    </div>
  );
}