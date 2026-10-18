import { useState } from 'react';
import {
  LayoutDashboard,
  Megaphone,
  MapPin,
  CircleHelp,
  Images,
  ClipboardCheck,
  History,
} from 'lucide-react';
import type { PortalUser } from './AdminGate';
import { OperatorAnnouncements } from './OperatorAnnouncements';

type Props = {
  user: PortalUser;
};

export function RoleWorkspace({ user }: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  const operatorMenus = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Ringkasan pekerjaan pengelolaan konten.'
    },
    {
      id: 'announcements',
      label: 'Pengumuman',
      icon: Megaphone,
      description: 'Pengelolaan pengumuman dan berita.'
    },
    {
      id: 'locations',
      label: 'Titik Layanan',
      icon: MapPin,
      description: 'Informasi lokasi dan jadwal pelayanan.'
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: CircleHelp,
      description: 'Pengelolaan pertanyaan dan jawaban.'
    },
    {
      id: 'media',
      label: 'Media',
      icon: Images,
      description: 'Pengelolaan foto dan dokumentasi.'
    }
  ];

  const reviewerMenus = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Ringkasan pekerjaan pemeriksaan konten.'
    },
    {
      id: 'approvals',
      label: 'Antrean Persetujuan',
      icon: ClipboardCheck,
      description: 'Permintaan persetujuan sesuai bidang tugas.'
    },
    {
      id: 'history',
      label: 'Riwayat Keputusan',
      icon: History,
      description: 'Riwayat konten yang pernah diperiksa.'
    }
  ];

  const isOperator = user.role === 'OPERATOR';
  const menus = isOperator ? operatorMenus : reviewerMenus;
  const selected = menus.find(item => item.id === activeTab) ?? menus[0];

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-8 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">

        <aside className="self-start border border-[#dce5eb] bg-white p-4">
          <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-wide text-[#647b8d]">
            Menu Pegawai
          </p>

          <nav aria-label="Navigasi Portal Pegawai" className="space-y-1">
            {menus.map(item => {
              const Icon = item.icon;
              const selectedTab = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={selectedTab ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded px-3 py-3 text-left text-[13px] font-medium transition-colors ${
                    selectedTab
                      ? 'bg-[#e8f1f9] text-[#005BAC]'
                      : 'text-[#36546b] hover:bg-[#f1f5f8]'
                  }`}
                >
                  <Icon size={17} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 space-y-5">
          <section className="border border-[#dce5eb] bg-white p-6">
            <p className="text-xs font-semibold text-[#005BAC]">
              PORTAL PEGAWAI UPPD BANYUMAS
            </p>

            <h1 className="mt-3 text-2xl font-bold text-[#193a52]">
              {selected.label}
            </h1>

            <p className="mt-2 text-sm text-[#61798a]">
              {selected.description}
            </p>
          </section>

          <section className="border border-[#dce5eb] bg-white p-6">
            {isOperator && activeTab === 'announcements' ? (
              <OperatorAnnouncements />
            ) : activeTab === 'overview' ? (
              <>
                <h2 className="text-lg font-semibold text-[#193a52]">
                  Selamat datang, {user.displayName}
                </h2>
                <p className="mt-3 text-sm text-[#61798a]">
                  Anda masuk sebagai {
                    isOperator ? 'Operator' : 'Penanggung Jawab'
                  }.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-[#193a52]">
                  {selected.label}
                </h2>
                <p className="mt-3 text-sm text-[#61798a]">
                  Tampilan modul ini sedang disiapkan.
                  Integrasi data akan dilakukan setelah API tersedia.
                </p>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}