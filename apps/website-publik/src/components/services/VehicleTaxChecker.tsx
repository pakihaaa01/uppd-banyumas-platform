import React, { useState } from 'react';

type PlateColor = 'putih' | 'merah' | 'kuning';

type FeeDetails = {
  pkbPokok: number;
  pkbDenda: number;
  opsenPkbPokok: number;
  opsenPkbDenda: number;
  swdklljPokok: number;
  swdklljDenda: number;
  pnbpStnk: number;
  pnbpTnkb: number;
};

type DemoVehicle = {
  plate: string;
  color: PlateColor;
  brand: string;
  model: string;
  region: string;
  taxPeriod: string;
  stnkExpiry: string;
  ownerOrder: number;
  fees: FeeDetails;
};

// Semua data berikut FIKTIF untuk demo UI; tidak berasal dari sistem pemerintah.
const DEMO_VEHICLES: DemoVehicle[] = [
  {
    plate: 'R 1234 AB',
    color: 'putih',
    brand: 'HONDA',
    model: 'SCOOPY',
    region: 'BANYUMAS',
    taxPeriod: '21 Agu 2027 - 21 Agu 2028',
    stnkExpiry: '21 Agu 2028',
    ownerOrder: 1,
    fees: {
      pkbPokok: 161300,
      pkbDenda: 0,
      opsenPkbPokok: 106500,
      opsenPkbDenda: 0,
      swdklljPokok: 35000,
      swdklljDenda: 0,
      pnbpStnk: 0,
      pnbpTnkb: 0,
    },
  },
  {
    plate: 'R 5678 CD',
    color: 'merah',
    brand: 'TOYOTA',
    model: 'AVANZA',
    region: 'BANYUMAS',
    taxPeriod: '12 Sep 2026 - 12 Sep 2027',
    stnkExpiry: '12 Sep 2027',
    ownerOrder: 1,
    fees: {
      pkbPokok: 750000,
      pkbDenda: 0,
      opsenPkbPokok: 495000,
      opsenPkbDenda: 0,
      swdklljPokok: 143000,
      swdklljDenda: 0,
      pnbpStnk: 0,
      pnbpTnkb: 0,
    },
  },
  {
    plate: 'R 9090 EF',
    color: 'kuning',
    brand: 'SUZUKI',
    model: 'CARRY',
    region: 'BANYUMAS',
    taxPeriod: '08 Jun 2026 - 08 Jun 2027',
    stnkExpiry: '08 Jun 2027',
    ownerOrder: 2,
    fees: {
      pkbPokok: 290000,
      pkbDenda: 0,
      opsenPkbPokok: 191400,
      opsenPkbDenda: 0,
      swdklljPokok: 35000,
      swdklljDenda: 0,
      pnbpStnk: 0,
      pnbpTnkb: 0,
    },
  },
];

const plateThemes: Record<PlateColor, string> = {
  putih: 'bg-white text-[#161a20] border-[#161a20]',
  merah: 'bg-[#a8202a] text-white border-white/80',
  kuning: 'bg-[#f4cc44] text-[#161a20] border-[#161a20]',
};

const feeRows: { label: string; key: keyof FeeDetails }[] = [
  { label: 'PKB Pokok', key: 'pkbPokok' },
  { label: 'PKB Denda', key: 'pkbDenda' },
  { label: 'Opsen PKB Pokok', key: 'opsenPkbPokok' },
  { label: 'Opsen PKB Denda', key: 'opsenPkbDenda' },
  { label: 'SWDKLLJ Pokok', key: 'swdklljPokok' },
  { label: 'SWDKLLJ Denda', key: 'swdklljDenda' },
  { label: 'PNBP STNK', key: 'pnbpStnk' },
  { label: 'PNBP TNKB', key: 'pnbpTnkb' },
];

const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(value);
const SAKPOLE_URL = 'https://play.google.com/store/apps/details?id=com.jatengprov.bapenda.newsakpole&hl=id';
const SIGNAL_URL = 'https://play.google.com/store/apps/details?id=app.signal.id&hl=id';

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] leading-5 text-black">{title}</dt>
      <dd className="mt-1 break-words text-[13px] font-semibold leading-5 text-[#172c3d]">{children}</dd>
    </div>
  );
}

export const VehicleTaxChecker: React.FC = () => {
  const [color, setColor] = useState<PlateColor>('putih');
  const [prefix, setPrefix] = useState('');
  const [number, setNumber] = useState('');
  const [suffix, setSuffix] = useState('');
  const [humanChecked, setHumanChecked] = useState(false);
  const [challenge, setChallenge] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<DemoVehicle | 'not-found' | null>(null);
  const [processTime, setProcessTime] = useState('');

  const scrollToChecker = () => {
    window.requestAnimationFrame(() => {
      document.getElementById('cek-pajak')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const setPlate = (plate: string, plateColor: PlateColor) => {
    const [newPrefix, newNumber, newSuffix] = plate.split(' ');
    setPrefix(newPrefix);
    setNumber(newNumber);
    setSuffix(newSuffix);
    setColor(plateColor);
    setResult(null);
    setError('');
  };

  const findTax = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setResult(null);
    if (!/^[A-Z]{1,2}$/.test(prefix) || !/^\d{1,4}$/.test(number) || !/^[A-Z]{1,3}$/.test(suffix)) {
      setError('Isi nomor polisi dengan format huruf wilayah, 1–4 angka, dan huruf belakang.');
      return;
    }
    if (!humanChecked || challenge.trim() !== '7') {
      setError('Lengkapi konfirmasi dan pertanyaan verifikasi simulasi terlebih dahulu.');
      return;
    }
    const key = `${prefix} ${number} ${suffix}`;
    const matching = DEMO_VEHICLES.find((item) => item.plate === key && item.color === color);
    setResult(matching ?? 'not-found');
    if (matching) {
      setProcessTime(new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      scrollToChecker();
    }
  };

  // Hasil pencarian menggunakan tata letak tiga panel seperti contoh pengguna.
  // Panel data tidak menampilkan data real maupun menyediakan pembayaran langsung.
  if (result && result !== 'not-found') {
    const fees = result.fees;
    const total = feeRows.reduce((sum, row) => sum + fees[row.key], 0);
    return (
      <section aria-labelledby="tax-result-heading" className="border border-[#dce5eb] bg-white p-5 sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="tax-result-heading" className="text-[22px] font-bold leading-tight text-[#1d2937]">Detail Kendaraan Anda</h2>
            <p className="mt-2 text-[12px] leading-5 text-[#8b5d22]">Data contoh (dummy) untuk pratinjau, bukan tagihan pajak atau data kendaraan resmi.</p>
          </div>
          <span className="border border-[#d6e1ea] bg-[#f5f8fb] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-black">Simulasi</span>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
          <section aria-labelledby="result-vehicle-title" className="min-h-[310px] rounded-xl border border-[#e2e8f0] bg-white p-4 sm:p-5">
            <h3 id="result-vehicle-title" className="text-[15px] font-bold text-[#1e293b]">Informasi Kendaraan</h3>
            <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4">
              <Field title="Nomor Polisi">{result.plate}</Field>
              <Field title="Warna KB">{result.color.toUpperCase()}</Field>
              <Field title="Merek">{result.brand}</Field>
              <Field title="Model">{result.model}</Field>
              <Field title="Wilayah">{result.region}</Field>
            </dl>
          </section>

          <section aria-labelledby="result-tax-title" className="min-h-[310px] rounded-xl border border-[#e2e8f0] bg-white p-4 sm:p-5">
            <h3 id="result-tax-title" className="text-[15px] font-bold text-[#1e293b]">Informasi Pajak dan PNBP</h3>
            <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4">
              <Field title="MS. Berlaku Pajak">{result.taxPeriod}</Field>
              <Field title="Tgl. Akhir STNK">{result.stnkExpiry}</Field>
              <Field title="Tgl. Proses">{processTime}</Field>
              <Field title="Milik Ke-">{result.ownerOrder}</Field>
            </dl>
          </section>

          <section aria-labelledby="result-fee-title" className="min-h-[310px] rounded-xl border border-[#e2e8f0] bg-white p-4 sm:p-5 md:col-span-2 lg:col-span-1">
            <h3 id="result-fee-title" className="text-[15px] font-bold text-[#1e293b]">Informasi Biaya</h3>
            <div className="mt-4 space-y-3.5 text-[12px] leading-5 text-[#1f2937]">
              {feeRows.map((row) => (
                <div key={row.key} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(55px,auto)] gap-2">
                  <span>{row.label}</span>
                  <span className="whitespace-nowrap">: Rp</span>
                  <span className="text-right tabular-nums">{formatNumber(fees[row.key])}</span>
                </div>
              ))}
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(55px,auto)] gap-2 border-t border-[#e5e7eb] pt-3 font-bold">
                <span>Total</span><span className="whitespace-nowrap">: Rp</span><span className="text-right tabular-nums">{formatNumber(total)}</span>
              </div>
            </div>
          </section>
        </div>

        <button
          type="button"
          onClick={() => { setResult(null); setHumanChecked(false); setChallenge(''); setError(''); scrollToChecker(); }}
          className="mt-5 min-h-11 w-full rounded-lg border border-[#8ec79d] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#245b35] transition-colors hover:bg-[#f0f9f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]"
        >
          Kembali
        </button>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="rounded-lg border border-[#a6bdf6] bg-[#e9f0ff] px-4 py-3 text-[12px] leading-6 text-[#29456d]">
            Untuk memperoleh informasi pembayaran dan kode bayar, gunakan kanal resmi <strong>New SAKPOLE</strong> atau <strong>SIGNAL</strong>. Nominal dan periode di atas hanya data simulasi.
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={SAKPOLE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#1c3447] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#2e5169] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]" aria-label="Buka New SAKPOLE di Google Play (tab baru)">
              New SAKPOLE · Google Play
            </a>
            <a href={SIGNAL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#1c3447] px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#2e5169] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]" aria-label="Buka SIGNAL di Google Play (tab baru)">
              SIGNAL · Google Play
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="vehicle-tax-heading" className="border border-[#dce5eb] bg-white p-5 sm:p-7">
      <div className="mb-6 border-b border-[#e2e9ef] pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#005BAC]">Simulasi pengecekan</p>
        <h2 id="vehicle-tax-heading" className="mt-2 text-[25px] font-bold leading-tight text-[#1e3b51] sm:text-[30px]">Info Kendaraan Bermotor</h2>
        <p className="mt-3 text-[14px] leading-7 text-black">Masukkan nomor polisi dan pilih warna TNKB. Pengecekan sementara menggunakan data contoh, bukan database pajak kendaraan sebenarnya.</p>
      </div>

      <form onSubmit={findTax} noValidate>
        <fieldset>
          <legend className="mb-3 text-[13px] font-semibold text-[#334e61]">Nomor polisi kendaraan</legend>
          <div className={`rounded-lg border-[7px] border-[#101010] p-1 shadow-sm ${plateThemes[color]}`}>
            <div className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)_minmax(0,1.25fr)] gap-2 rounded-md border px-2 py-6 sm:gap-4 sm:px-4 sm:py-9 ${color === 'merah' ? 'border-white/60' : 'border-black/35'}`}>
              <label className="min-w-0">
                <span className="sr-only">Huruf depan pelat nomor, satu atau dua huruf</span>
                <input aria-label="Huruf depan nomor polisi" autoComplete="off" spellCheck={false} value={prefix} maxLength={2} onChange={(e) => { setPrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, '')); setResult(null); }} placeholder="XX" className="w-full min-w-0 bg-transparent text-center font-mono text-[clamp(1.5rem,4.8vw,3.5rem)] font-bold tracking-[-0.06em] outline-none placeholder:opacity-55 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current" />
              </label>
              <label className="min-w-0">
                <span className="sr-only">Angka nomor polisi, satu sampai empat digit</span>
                <input aria-label="Angka nomor polisi" inputMode="numeric" autoComplete="off" value={number} maxLength={4} onChange={(e) => { setNumber(e.target.value.replace(/\D/g, '')); setResult(null); }} placeholder="XXXX" className="w-full min-w-0 bg-transparent text-center font-mono text-[clamp(1.5rem,4.8vw,3.5rem)] font-bold tracking-[-0.06em] outline-none placeholder:opacity-55 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current" />
              </label>
              <label className="min-w-0">
                <span className="sr-only">Huruf belakang nomor polisi, satu sampai tiga huruf</span>
                <input aria-label="Huruf belakang nomor polisi" autoComplete="off" spellCheck={false} value={suffix} maxLength={3} onChange={(e) => { setSuffix(e.target.value.toUpperCase().replace(/[^A-Z]/g, '')); setResult(null); }} placeholder="XXX" className="w-full min-w-0 bg-transparent text-center font-mono text-[clamp(1.5rem,4.8vw,3.5rem)] font-bold tracking-[-0.06em] outline-none placeholder:opacity-55 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current" />
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-[13px] font-semibold text-[#334e61]">Pilih warna TNKB</legend>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Warna pelat kendaraan">
            {(['putih', 'merah', 'kuning'] as const).map((option) => (
              <button key={option} type="button" aria-pressed={color === option} onClick={() => { setColor(option); setResult(null); }} className={`min-h-10 rounded-md border px-4 py-2 text-[13px] font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC] ${color === option ? 'border-[#005BAC] bg-[#e8f2fa] text-[#005BAC]' : 'border-[#d9e2ea] bg-[#f7f9fb] text-black hover:border-[#8fb3d0]'}`}>
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 border border-[#d9e3eb] bg-[#fafcfd] p-4 sm:p-5">
          <h3 className="text-[13px] font-semibold text-[#27455b]">Verifikasi bukan robot — demonstrasi</h3>
          <p className="mt-1 text-[12px] leading-5 text-black">Ini hanya simulasi tampilan, bukan reCAPTCHA atau perlindungan bot yang sebenarnya.</p>
          <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm font-medium text-[#304d62]">
            <input type="checkbox" checked={humanChecked} onChange={(event) => { setHumanChecked(event.target.checked); setResult(null); }} className="h-5 w-5 accent-[#005BAC]" />
            Saya bukan robot (simulasi)
          </label>
          <label htmlFor="vehicle-human-answer" className="mt-4 block text-[12px] font-semibold text-black">Untuk melanjutkan, berapa hasil 3 + 4?</label>
          <input id="vehicle-human-answer" inputMode="numeric" type="text" autoComplete="off" value={challenge} maxLength={2} onChange={(event) => { setChallenge(event.target.value.replace(/\D/g, '')); setResult(null); }} placeholder="Jawaban" className="mt-2 w-28 rounded-md border border-[#cbd8e2] bg-white px-3 py-2 text-sm text-[#203b51] outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#e5eff8]" />
        </div>

        <div className="mt-6 border-l-[3px] border-[#c08c33] bg-[#fff9ed] px-4 py-3 text-[12px] leading-6 text-[#725929]">
          Data demonstrasi tersedia untuk tiga contoh nomor polisi. Tidak ada permintaan data kendaraan atau pemilik ke layanan pemerintah.
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO_VEHICLES.map((sample) => (
              <button key={sample.plate} type="button" onClick={() => setPlate(sample.plate, sample.color)} className="rounded border border-[#d6c7a9] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#6c5225] hover:bg-[#fff6e4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]">Coba {sample.plate}</button>
            ))}
          </div>
        </div>

        {error && <p role="alert" className="mt-4 border-l-[3px] border-[#b54b47] bg-[#fff3f2] px-4 py-3 text-[13px] leading-6 text-[#8c3935]">{error}</p>}
        <button type="submit" className="mt-5 min-h-12 w-full rounded-md bg-[#005BAC] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#004983] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]">Lihat Info Kendaraan</button>
      </form>
      {result === 'not-found' && (
        <div role="status" aria-live="polite" className="mt-6 border border-[#dce5eb] bg-[#f8fbfd] p-5 sm:p-6">
          <h3 className="text-[18px] font-bold text-[#213b51]">Tidak ditemukan dalam data contoh</h3>
          <p className="mt-2 text-sm leading-7 text-black">Nomor yang dimasukkan tidak termasuk tiga data dummy. Ini tidak berarti kendaraan atau pajak sebenarnya tidak terdaftar.</p>
        </div>
      )}
    </section>
  );
};

