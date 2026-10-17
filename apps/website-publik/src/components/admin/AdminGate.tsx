import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';

export const AdminGate: React.FC = () => {
  const [auth,setAuth]=useState<'loading'|'yes'|'no'>('loading');
  useEffect(()=>{
    let active=true;
    apiRequest('/api/auth/me').then(()=>{if(active)setAuth('yes');}).catch(()=>{if(active)setAuth('no');});
    return()=>{active=false;};
  },[]);
  if(auth==='loading')return <main className="flex min-h-screen items-center justify-center bg-[#f7f9fb] text-sm text-[#36546b]">Memeriksa sesi admin...</main>;
  if(auth==='no')return <AdminLogin onSuccess={()=>{setAuth('yes');window.dispatchEvent(new Event('uppd-auth-change'));}} />;
  return <AdminLayout onLogout={async()=>{
    try{await apiRequest('/api/auth/logout','POST');}
    catch { /* bahkan jika permintaan gagal, sesi diperiksa ulang */ }
    setAuth('no');window.dispatchEvent(new Event('uppd-auth-change'));
    window.history.pushState({},'', '/admin');
  }} />;
};
