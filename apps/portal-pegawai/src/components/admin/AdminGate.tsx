
import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';

export type PortalUser = {
  id: string;
  username: string;
  displayName: string;
  role: 'ADMINISTRATOR';
};

export const AdminGate: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'login' | 'dashboard'>('loading');
  const [user, setUser] = useState<PortalUser | null>(null);

  useEffect(() => {
    let active = true;

    const refresh = () => { apiRequest<{ user: PortalUser }>('/api/v1/auth/me')
      .then((result) => {
        if (!active) return;
        setUser(result.user);
        setStatus('dashboard');
      })
      .catch(() => {
        if (active) setStatus('login');
      }); };
    refresh();
    window.addEventListener('uppd-auth-change', refresh);

    return () => {
      active = false;
      window.removeEventListener('uppd-auth-change', refresh);
    };
  }, []);

  const handleLoginSuccess = async () => {
    setStatus('loading');

    try {
      const result = await apiRequest<{ user: PortalUser }>(
        '/api/v1/auth/me'
      );

      setUser(result.user);
      setStatus('dashboard');
    } catch {
      setUser(null);
      setStatus('login');
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/v1/auth/logout', 'POST');
      setUser(null);
      setStatus('login');
    } catch {
      window.alert('Logout gagal. Silakan coba kembali.');
    }
  };

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fb]">
        <p className="text-sm text-[#36546b]">
          Memeriksa sesi pegawai...
        </p>
      </main>
    );
  }

  if (status === 'login' || !user) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  return (
    <AdminLayout
      user={user}
      onLogout={handleLogout}
    />
  );
};

