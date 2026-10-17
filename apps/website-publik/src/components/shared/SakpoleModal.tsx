import React from 'react';
import {
  X,
  Download,
  ShieldCheck,
  ExternalLink,
  ListChecks,
  AlertTriangle
} from 'lucide-react';
import { useSamsat } from '../../context/SamsatContext';

const steps = [
  {
    title: 'Buka Google Play Store',
    desc: "Pada HP Android Anda, buka aplikasi Google Play Store lalu ketik 'Sekpole Jawa Tengah' pada kolom pencarian."
  },
  {
    title: 'Pilih Aplikasi Resmi Bapenda Jateng',
    desc: 'Pastikan memilih aplikasi Sekpole dengan pengembang resmi Bapenda Provinsi Jawa Tengah agar terhindar dari aplikasi tiruan.'
  },
  {
    title: 'Unduh & Pasang Aplikasi',
    desc: "Ketuk tombol 'Install' dan tunggu proses unduhan selesai, lalu buka aplikasi setelah terpasang di perangkat."
  },
  {
    title: 'Daftar / Masuk dengan NIK',
    desc: 'Lakukan registrasi menggunakan NIK KTP dan nomor polisi kendaraan untuk mulai mengecek nominal pajak kendaraan.'
  },
  {
    title: 'Cek Estimasi Pajak & Kode Bayar',
    desc: 'Lihat estimasi nominal PKB, status tunggakan, dan buat kode bayar E-Samsat untuk dibayarkan di ATM, Bank, atau BUMDes terdekat.'
  }
];

export const SakpoleModal: React.FC = () => {
  const { closeSakpoleModal, trackAppDownload } = useSamsat();

  const handleDownloadClick = () => {
    trackAppDownload('sekpole');
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={closeSakpoleModal}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-[#005BAC] text-white relative">
          <button
            onClick={closeSakpoleModal}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Logo menggunakan path /images/new_sakpole.jpeg */}
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg p-1.5 flex items-center justify-center border border-white/20 mb-3 shrink-0 overflow-hidden">
            <img
              src="/images/new_sakpole.jpeg"
              alt="Logo New Sakpole"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <h3 className="text-xl font-extrabold leading-tight pr-8">Cek Pajak Kendaraan via Sekpole</h3>
          <p className="text-xs text-blue-100 mt-1">
            Aplikasi resmi Bapenda Provinsi Jawa Tengah untuk mengecek estimasi pajak kendaraan Anda secara online.
          </p>
        </div>

        {/* Body: Steps */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ListChecks className="w-4 h-4 text-[#005BAC]" />
            <span>Tata Cara Mengunduh & Memasang Sekpole</span>
          </div>

          <ol className="space-y-3">
            {steps.map((s, idx) => (
              <li key={s.title} className="flex items-start gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-blue-50 text-[#005BAC] text-[11px] font-black flex items-center justify-center border border-blue-100">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">{s.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Sekpole hanya digunakan untuk mengecek estimasi pajak dan membuat kode bayar. Pembayaran tetap dilakukan
              melalui ATM, Bank, QRIS, atau loket SAMSAT / BUMDes terdekat.
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Aplikasi resmi & gratis — tidak dipungut biaya apapun.</span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-6 pt-0 space-y-2">
          <a
            href="https://play.google.com/store/apps/search?q=sekpole%20jawa%20tengah"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDownloadClick}
            className="w-full px-5 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Buka & Unduh Sekpole di Google Play</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={closeSakpoleModal}
            className="w-full px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};