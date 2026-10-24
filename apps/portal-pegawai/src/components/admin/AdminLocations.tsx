
import { useEffect, useState, type FormEvent } from 'react';
import {
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

type LocationType =
  | 'induk'
  | 'pembantu'
  | 'cepat'
  | 'drive-thru'
  | 'keliling'
  | 'mpp'
  | 'gerai'
  | 'paten';

type LocationForm = {
  name: string;
  address: string;
  operatingHours: string;
  phone: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  description: string;
  type: LocationType;
  isMain: boolean;
  isDriveThru: boolean;
};

type ServiceLocation = Omit<
  LocationForm,
  'mapsEmbedUrl' | 'description'
> & {
  id: string;
  mapsEmbedUrl: string | null;
  description: string | null;
  isPublished: boolean;
};

const API = '/api/v1/locations';

const field =
  'w-full rounded border border-[#cbd9e2] bg-white px-3.5 py-2.5 text-[13px] text-[#233e52] outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#e3eff8]';

const label =
  'mb-1.5 block text-xs font-semibold text-[#385469]';

const locationTypes: {
  value: LocationType;
  label: string;
}[] = [
  { value: 'induk', label: 'SAMSAT Induk' },
  { value: 'pembantu', label: 'SAMSAT Pembantu' },
  { value: 'cepat', label: 'SAMSAT Cepat' },
  { value: 'drive-thru', label: 'Drive Thru' },
  { value: 'keliling', label: 'SAMSAT Keliling' },
  { value: 'mpp', label: 'Mal Pelayanan Publik (MPP)' },
  { value: 'gerai', label: 'Gerai SAMSAT' },
  { value: 'paten', label: 'PATEN' },
];

function emptyForm(): LocationForm {
  return {
    name: '',
    address: '',
    operatingHours: '',
    phone: '',
    mapsUrl: '',
    mapsEmbedUrl: '',
    description: '',
    type: 'induk',
    isMain: false,
    isDriveThru: false,
  };
}

export function AdminLocations() {
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [form, setForm] = useState<LocationForm>(emptyForm);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Mengambil daftar lokasi dari backend PostgreSQL.
  useEffect(() => {
    let active = true;

    apiRequest<{ locations: ServiceLocation[] }>(API)
      .then((result) => {
        if (active) {
          setLocations(result.locations);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal memuat titik layanan.'
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

  // Pencarian berdasarkan nama, alamat, jenis, dan jam.
  const filtered = locations.filter((item) =>
    `${item.name} ${item.address} ${item.type} ${item.operatingHours}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  // Menyiapkan formulir tambah lokasi.
  function startCreate() {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
    setError('');
    setInfo('');
  }

  // Menyiapkan formulir edit lokasi.
  function startEdit(item: ServiceLocation) {
    if (item.isPublished) return;

    setForm({
      name: item.name,
      address: item.address,
      operatingHours: item.operatingHours,
      phone: item.phone,
      mapsUrl: item.mapsUrl,
      mapsEmbedUrl: item.mapsEmbedUrl ?? '',
      description: item.description ?? '',
      type: item.type,
      isMain: item.isMain,
      isDriveThru: item.isDriveThru,
    });

    setEditingId(item.id);
    setShowForm(true);
    setError('');
    setInfo('');
  }

  // Menyimpan lokasi baru atau hasil edit ke PostgreSQL.
  async function saveLocation(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setInfo('');

    const payload = {
      ...form,
      name: form.name.trim(),
      address: form.address.trim(),
      operatingHours: form.operatingHours.trim(),
      phone: form.phone.trim(),
      mapsUrl: form.mapsUrl.trim(),
      mapsEmbedUrl: form.mapsEmbedUrl.trim() || null,
      description: form.description.trim() || null,
    };

    try {
      if (editingId) {
        await apiRequest(
          `${API}/${encodeURIComponent(editingId)}`,
          'PATCH',
          payload
        );
      } else {
        await apiRequest(API, 'POST', payload);
      }

      setShowForm(false);
      setEditingId(null);

      setInfo(
        'Titik layanan berhasil disimpan ke PostgreSQL.'
      );

      // Memuat ulang daftar setelah penyimpanan.
      try {
        const result = await apiRequest<{
          locations: ServiceLocation[];
        }>(API);

        setLocations(result.locations);
      } catch {
        setError(
          'Data tersimpan, tetapi daftar gagal dimuat ulang. Silakan tekan F5.'
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan titik layanan.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function changePublication(item: ServiceLocation) {
    if (saving || deletingId !== null) return;
    setSaving(true);
    setError('');
    setInfo('');
    const action = item.isPublished ? 'unpublish' : 'publish';
    try {
      await apiRequest(`${API}/${encodeURIComponent(item.id)}/${action}`, 'POST');
      const result = await apiRequest<{ locations: ServiceLocation[] }>(API);
      setLocations(result.locations);
      setInfo(action === 'publish' ? 'Titik layanan tampil di website publik.' : 'Lokasi ditarik dari website publik.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui status publikasi.');
    } finally {
      setSaving(false);
    }
  }

  // Menghapus lokasi yang belum diterbitkan.
  async function deleteLocation(item: ServiceLocation) {
    if (item.isPublished || deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus titik layanan "${item.name}" secara permanen?`
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

      setLocations((current) =>
        current.filter(
          (location) => location.id !== item.id
        )
      );

      setInfo(
        'Titik layanan berhasil dihapus dari PostgreSQL.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menghapus titik layanan.'
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
          <h3 className="text-base font-semibold text-[#193a52]">
            Daftar Titik Layanan
          </h3>

          <p className="mt-1 text-xs text-[#647b8d]">
            Pengelolaan lokasi layanan khusus Administrator
            melalui PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded bg-[#005BAC] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#004783]"
        >
          <Plus size={16} />
          Tambah Titik Layanan
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
        <form
          onSubmit={saveLocation}
          className="space-y-5 border border-[#dce5eb] bg-[#fbfcfd] p-5"
        >
          {/* Header formulir */}
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold text-[#193a52]">
              {editingId
                ? 'Edit Titik Layanan'
                : 'Tambah Titik Layanan'}
            </h4>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={saving}
              aria-label="Tutup formulir"
              className="rounded p-1 text-[#647b8d] hover:bg-[#eaf2f7] disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>

          {/* Nama lokasi */}
          <div>
            <label
              htmlFor="loc-name"
              className={label}
            >
              Nama Lokasi
            </label>

            <input
              id="loc-name"
              required
              maxLength={200}
              className={field}
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              placeholder="Contoh: SAMSAT Induk Banyumas"
            />
          </div>

          {/* Jenis layanan */}
          <div>
            <label
              htmlFor="loc-type"
              className={label}
            >
              Jenis Layanan
            </label>

            <select
              id="loc-type"
              className={field}
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as LocationType
                })
              }
            >
              {locationTypes.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Alamat */}
          <div>
            <label
              htmlFor="loc-address"
              className={label}
            >
              Alamat Lengkap
            </label>

            <textarea
              id="loc-address"
              rows={3}
              required
              maxLength={1000}
              className={field}
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value
                })
              }
            />
          </div>

          {/* Jam operasional dan nomor telepon */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="loc-hours"
                className={label}
              >
                Jam Operasional
              </label>

              <input
                id="loc-hours"
                required
                maxLength={500}
                className={field}
                value={form.operatingHours}
                onChange={(e) =>
                  setForm({
                    ...form,
                    operatingHours: e.target.value
                  })
                }
                placeholder="Senin–Jumat 08.00–14.00"
              />
            </div>

            <div>
              <label
                htmlFor="loc-phone"
                className={label}
              >
                Telepon
              </label>

              <input
                id="loc-phone"
                type="tel"
                required
                maxLength={100}
                className={field}
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value
                  })
                }
                placeholder="Nomor telepon layanan"
              />
            </div>
          </div>

          {/* Google Maps */}
          <div>
            <label
              htmlFor="loc-maps"
              className={label}
            >
              Tautan Google Maps (URL)
            </label>

            <input
              id="loc-maps"
              type="url"
              required
              maxLength={2048}
              className={field}
              value={form.mapsUrl}
              onChange={(e) =>
                setForm({
                  ...form,
                  mapsUrl: e.target.value
                })
              }
              placeholder="https://maps.google.com/..."
            />
          </div>

          {/* Google Maps Embed */}
          <div>
            <label
              htmlFor="loc-embed"
              className={label}
            >
              URL Embed Maps (Opsional)
            </label>

            <input
              id="loc-embed"
              type="url"
              maxLength={2048}
              className={field}
              value={form.mapsEmbedUrl}
              onChange={(e) =>
                setForm({
                  ...form,
                  mapsEmbedUrl: e.target.value
                })
              }
              placeholder="https://www.google.com/maps/embed?..."
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label
              htmlFor="loc-description"
              className={label}
            >
              Deskripsi (Opsional)
            </label>

            <textarea
              id="loc-description"
              rows={3}
              maxLength={5000}
              className={field}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
            />
          </div>

          {/* Status lokasi */}
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-xs text-[#385469]">
              <input
                type="checkbox"
                checked={form.isMain}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isMain: e.target.checked
                  })
                }
              />
              Tandai sebagai lokasi utama
            </label>

            <label className="flex items-center gap-2 text-xs text-[#385469]">
              <input
                type="checkbox"
                checked={form.isDriveThru}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isDriveThru: e.target.checked
                  })
                }
              />
              Tersedia layanan Drive Thru
            </label>
          </div>

          {/* Tombol formulir */}
          <div className="flex justify-end gap-2 border-t border-[#e6edf2] pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => setShowForm(false)}
              className="rounded border border-[#cbd9e2] px-4 py-2 text-xs font-semibold text-[#36546b]"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#005BAC] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {saving
                ? 'Menyimpan...'
                : 'Simpan Titik Layanan'}
            </button>
          </div>
        </form>
      ) : loading ? (
        <p className="text-sm text-[#647b8d]">
          Memuat titik layanan dari database...
        </p>
      ) : (
        <>
          {/* Pencarian lokasi */}
          <div className="flex items-center gap-2 rounded border border-[#dce5eb] bg-white px-3 py-2">
            <Search
              size={17}
              className="text-[#647b8d]"
            />

            <input
              aria-label="Cari titik layanan"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, alamat, atau jenis layanan..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* Daftar lokasi */}
          {filtered.length === 0 ? (
            <div className="border border-dashed border-[#cbd9e2] p-8 text-center text-sm text-[#647b8d]">
              {error
                ? 'Daftar titik layanan belum dapat ditampilkan.'
                : 'Belum ada titik layanan yang sesuai.'}
            </div>
          ) : (
            <div className="divide-y divide-[#e6edf2] border border-[#dce5eb]">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-4 p-4"
                >
                  {/* Informasi lokasi */}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-[#193a52]">
                      <MapPin
                        size={16}
                        aria-hidden="true"
                      />
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm text-[#61798a]">
                      {item.address}
                    </p>

                    <p className="mt-2 text-xs text-[#647b8d]">
                      {locationTypes.find(
                        (option) => option.value === item.type
                      )?.label ?? item.type}
                      {' · '}
                      {item.operatingHours}
                    </p>

                    <p className="mt-1 text-xs text-[#647b8d]">
                      {item.phone}
                      {' · '}
                      {item.isPublished
                        ? 'Terbit'
                        : 'Belum terbit'}
                      {item.isMain
                        ? ' · Lokasi utama'
                        : ''}
                      {item.isDriveThru
                        ? ' · Drive Thru'
                        : ''}
                    </p>

                    {item.description && (
                      <p className="mt-2 whitespace-pre-wrap text-xs text-[#647b8d]">
                        {item.description}
                      </p>
                    )}

                    {/* Tautan Google Maps */}
                    <a
                      href={item.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#005BAC] hover:underline"
                    >
                      Buka Maps
                      <ExternalLink
                        size={13}
                        aria-hidden="true"
                      />
                    </a>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button type="button" disabled={saving || deletingId !== null}
                      onClick={() => void changePublication(item)}
                      className="min-h-9 rounded-lg border border-[#005BAC] px-3 text-xs font-semibold text-[#005BAC] hover:bg-[#eff6fb] disabled:opacity-50">
                      {item.isPublished ? 'Tarik Publikasi' : 'Publikasikan'}
                    </button>
                  </div>
                  {/* Edit dan Hapus */}
                  {!item.isPublished && (
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
                        onClick={() => deleteLocation(item)}
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

      {/* Keterangan */}
      <p className="text-xs text-[#647b8d]">
        Lokasi baru tersimpan sebagai belum terbit.
        Administrator dapat menerbitkan atau menarik lokasi tanpa menghapus datanya.
      </p>
    </div>
  );
}
