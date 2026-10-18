import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../../lib/api';

type Props = { onSuccess: () => void };

export const AdminLogin: React.FC<Props> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await apiRequest('/api/v1/auth/login', 'POST', { username: username.trim(), password });
      setPassword('');
      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login gagal.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f8fa]">
      <header className="border-b border-[#dce5eb] bg-white">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo-bapenda.png" alt="Bapenda Jawa Tengah" className="h-10 w-auto max-w-[120px] object-contain" />
            <div className="border-l border-[#dce5eb] pl-3">
              <p className="text-sm font-bold text-[#193a52]">UPPD Kabupaten Banyumas</p>
              <p className="text-[11px] text-[#647b8d]">Administrasi Website · Prototipe</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => { window.location.href = 'http://127.0.0.1:3000/'; }} 
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#355b76] hover:underline"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Kembali ke situs
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-14">
        <div className="w-full max-w-[440px] border border-[#d9e3e9] bg-white p-7 shadow-[0_8px_32px_rgba(20,52,76,0.045)] sm:p-9">
          <div className="mb-7 border-b border-[#e4ebef] pb-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.10em] text-[#005BAC]">Panel Administrasi</p>
            <h1 className="text-[27px] font-bold tracking-[-0.02em] text-[#1d3b52]">Masuk ke Dashboard</h1>
            <p className="mt-2 text-sm leading-6 text-[#5d7384]">Gunakan akun admin yang terdaftar pada sistem PostgreSQL untuk mengelola layanan.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="demo-admin-user" className="block text-xs font-semibold text-[#365165]">Username</label>
              <input 
                id="demo-admin-user" 
                autoComplete="username" 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="mt-2 w-full rounded border border-[#cbd9e2] bg-white px-4 py-3 text-sm outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#dfedf9]" 
                placeholder="Masukkan username" 
              />
            </div>

            <div>
              <label htmlFor="demo-admin-password" className="block text-xs font-semibold text-[#365165]">Kata sandi</label>
              <div className="relative mt-2">
                <input 
                  id="demo-admin-password" 
                  autoComplete="current-password" 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full rounded border border-[#cbd9e2] bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-[#dfedf9]" 
                  placeholder="Masukkan kata sandi" 
                />
                <button 
                  type="button" 
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-2 flex w-9 items-center justify-center text-[#5e7688] hover:text-[#005BAC]"
                >
                  {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && <p role="alert" className="border-l-[3px] border-[#b74c3b] bg-[#fff5f3] px-3 py-2 text-xs text-[#8f3326]">{error}</p>}
            
            <button 
              type="submit" 
              disabled={busy} 
              className="min-h-12 w-full rounded bg-[#005BAC] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#004783] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005BAC]"
            >
              {busy ? 'Memeriksa...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-7 border-t border-[#e4ebef] pt-5">
            <p className="text-xs font-semibold text-[#365165]">Akun untuk demonstrasi</p>
            <p className="mt-2 text-xs leading-6 text-[#61798a]">Gunakan akun <code>admin.demo</code> atau akun pegawai yang tersimpan di database PostgreSQL.</p>
            <p className="mt-2 text-[11px] leading-5 text-[#798b98]">Login diverifikasi oleh backend PostgreSQL. Versi ini untuk demonstrasi internal pegawai.</p>
          </div>
        </div>
      </div>
    </main>
  );
};