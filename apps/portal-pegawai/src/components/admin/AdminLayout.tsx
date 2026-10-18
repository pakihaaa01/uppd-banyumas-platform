import React, { useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import type { PortalUser } from './AdminGate';
import { AdminDashboard } from './AdminDashboard';
import { RoleWorkspace } from './RoleWorkspace';

type Props = {
  user: PortalUser;
  onLogout: () => void;
};

export const AdminLayout: React.FC<Props> = ({ onLogout, user }) => {
  const [confirmLogout, setConfirmLogout] = useState(false);

  const returnToSite = () => { window.location.href = '/'; };

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-sans text-[#23394b]">
      <header className="sticky top-0 z-40 border-b border-[#dce5eb] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/logo-bapenda.png" alt="Bapenda Jawa Tengah" className="h-11 w-auto max-w-[124px] object-contain" />
            <span className="h-9 w-px shrink-0 bg-[#dce5eb]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[13px] font-bold leading-5 text-[#193a52] sm:text-[15px]">UPPD Kabupaten Banyumas</p>
              <p className="text-[11px] leading-4 text-[#647b8d]">Panel pengelolaan website · Prototipe</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={returnToSite} className="inline-flex min-h-10 items-center gap-1.5 rounded border border-[#cfdae2] px-3 py-2 text-xs font-semibold text-[#284b63] hover:bg-[#f0f5f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]">
              <ArrowLeft size={15} aria-hidden="true" /> <span className="hidden min-[410px]:inline">Situs Publik</span><span className="min-[410px]:hidden">Kembali</span>
            </button>
            {!confirmLogout ? (
              <button type="button" onClick={() => setConfirmLogout(true)} className="inline-flex min-h-10 items-center gap-1.5 rounded border border-[#cfdae2] px-3 py-2 text-xs font-semibold text-[#344c5b] hover:bg-[#f0f5f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]">
                <LogOut size={15} aria-hidden="true" /> Keluar
              </button>
            ) : (
              <div role="group" aria-label="Konfirmasi keluar" className="flex items-center gap-1.5">
                <button type="button" onClick={onLogout} className="min-h-10 rounded bg-[#a33c33] px-3 text-xs font-semibold text-white hover:bg-[#822b25]">Ya, keluar</button>
                <button type="button" onClick={() => setConfirmLogout(false)} className="min-h-10 rounded border border-[#cfdae2] px-3 text-xs font-semibold text-[#344c5b]">Batal</button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {user.role === 'ADMINISTRATOR' ? (
        <AdminDashboard />
      ) : (
        <RoleWorkspace user={user} />
      )}

    </div>
  );
};