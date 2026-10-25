import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { Search, Trash2, Mail } from 'lucide-react';

type Message = { id:string;name:string;email:string;phone:string|null;subject:string;message:string;createdAt:string;replyDraft?:string|null;replySentAt?:string|null;replyGmailId?:string|null;replyLastError?:string|null;status:'New'|'In Progress'|'Completed' };
const API='/api/v1/messages';
const statuses: Message['status'][]=['New','In Progress','Completed'];
export function AdminMessages({onChange}:{onChange?:(newCount:number)=>void}) {
  const [messages,setMessages]=useState<Message[]>([]);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('All');
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState<string|null>(null);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [drafts,setDrafts]=useState<Record<string,string>>({});
  async function reload() {
    const response=await apiRequest<{messages:Message[]}>(API);
    setMessages(response.messages);
    onChange?.(response.messages.filter(m=>m.status==='New').length);
  }
  useEffect(()=>{
    let active=true;
    apiRequest<{messages:Message[]}>(API).then(r=>{
      if(active){setMessages(r.messages);onChange?.(r.messages.filter(m=>m.status==='New').length);}
    }).catch(e=>{if(active)setError(e instanceof Error?e.message:'Tidak dapat mengambil pesan')})
    .finally(()=>{if(active)setLoading(false)});
    return()=>{active=false};
  },[onChange]);
  async function changeStatus(item:Message,status:Message['status']) {
    if(busy||status===item.status)return;
    setBusy(item.id);setError('');setNotice('');
    try {
      await apiRequest(`${API}/${encodeURIComponent(item.id)}`,'PATCH',{status});
      await reload();setNotice('Status penanganan pesan diperbarui.');
    } catch(e) {setError(e instanceof Error?e.message:'Gagal memperbarui status');}
    finally {setBusy(null);}
  }
  async function remove(item:Message){
    if(busy||!window.confirm('Hapus pesan dari '+item.name+' secara permanen?'))return;
    setBusy(item.id);setError('');setNotice('');
    try{
      await apiRequest(`${API}/${encodeURIComponent(item.id)}`,'DELETE');
      await reload();setNotice('Pesan berhasil dihapus.');
    }catch(e){setError(e instanceof Error?e.message:'Gagal menghapus pesan');}
    finally{setBusy(null);}
  }
  async function saveDraft(item:Message){
    const body=(drafts[item.id] ?? item.replyDraft ?? '').trim();
    setBusy(item.id);setError('');setNotice('');
    try {
      await apiRequest('/api/v1/message-replies/'+encodeURIComponent(item.id)+'/draft','POST',{body});
      await reload();setNotice('Draft tersimpan, status otomatis Dalam Proses.');
    } catch(e){setError(e instanceof Error?e.message:'Gagal menyimpan Draft');}
    finally{setBusy(null);}
  }
  async function sendReply(item:Message){
    if(!window.confirm('Kirim balasan ke '+item.email+' lewat Gmail sekarang?'))return;
    setBusy(item.id);setError('');setNotice('');
    try{
      await apiRequest('/api/v1/message-replies/'+encodeURIComponent(item.id)+'/send','POST');
      await reload();setNotice('Gmail API menerima email. Status otomatis Selesai.');
    }catch(e){setError(e instanceof Error?e.message:'Gagal mengirim balasan');}
    finally{setBusy(null);}
  }
  const templates = [
    {name:'Balasan umum',body:'Yth. Bapak/Ibu '+(messages[0]?.name ?? '')+',\\n\\nTerima kasih telah menghubungi layanan informasi UPPD Kabupaten Banyumas (prototipe).\\n\\n[Isi jawaban]\\n\\nHormat kami,\\nTim Demo Layanan Informasi UPPD Banyumas'},
    {name:'Memerlukan informasi tambahan',body:'Terima kasih atas pesan Anda. Untuk melanjutkan penanganan, mohon berikan informasi tambahan berikut: [rincian]. Jangan kirimkan OTP atau informasi sensitif.'},
    {name:'Informasi tindak lanjut',body:'Terima kasih sudah menghubungi layanan informasi. Pertanyaan Anda sedang ditinjau. Berikut informasi sementara: [rincian].'}
  ];
  const filtered=messages.filter(item=>(filter==='All'||item.status===filter)&&
    [item.name,item.email,item.subject,item.message].join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  return <section className="space-y-5">
    <header><h3 className="text-lg font-bold text-[#193a52]">Pesan Masyarakat</h3><p className="mt-1 text-xs leading-5 text-[#647b8d]">Pesan demonstrasi dari formulir Kontak. Tidak terkirim ke petugas instansi.</p></header>
    <div className="grid grid-cols-3 gap-3">{[
      ['Total',messages.length],['Baru',messages.filter(m=>m.status==='New').length],['Selesai',messages.filter(m=>m.status==='Completed').length]
    ].map(([label,value])=><div key={label} className="rounded-lg border border-[#dce5eb] bg-white p-4"><p className="text-xs text-[#647b8d]">{label}</p><p className="mt-2 text-2xl font-bold text-[#193a52]">{value}</p></div>)}</div>
    {error&&<p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice&&<p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    <div className="flex flex-wrap gap-3">
      <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-[#dce5eb] bg-white px-3"><Search size={16} className="text-[#7c90a0]"/><input aria-label="Cari pesan" className="h-11 w-full text-sm outline-none" placeholder="Cari nama, subjek, atau pesan..." value={search} onChange={e=>setSearch(e.target.value)}/></label>
      <select aria-label="Filter status pesan" className="rounded-lg border border-[#dce5eb] bg-white px-3 text-sm" value={filter} onChange={e=>setFilter(e.target.value)}><option value="All">Semua status</option>{statuses.map(s=><option key={s} value={s}>{s==='New'?'Baru':s==='In Progress'?'Dalam Proses':'Selesai'}</option>)}</select>
    </div>
    {loading?<p className="text-sm text-[#647b8d]">Memuat pesan...</p>:filtered.length===0?<p className="rounded-lg border border-[#dce5eb] bg-white p-8 text-center text-sm text-[#647b8d]">Tidak ada pesan sesuai filter.</p>:
    <div className="divide-y divide-[#e4eaf0] overflow-hidden rounded-xl border border-[#dce5eb] bg-white">{filtered.map(item=><article key={item.id} className="space-y-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h4 className="text-[15px] font-semibold text-[#193a52]">{item.subject}</h4><p className="mt-1 text-xs text-[#687f90]">{item.name} · {new Date(item.createdAt).toLocaleString('id-ID')}</p></div>
        <span className="rounded-full bg-[#edf3f8] px-3 py-1 text-[11px] font-semibold text-[#36546b]">{item.status==='New'?'Baru':item.status==='In Progress'?'Dalam Proses':'Selesai'}</span>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#385469]">{item.message}</p>
      <p className="flex flex-wrap items-center gap-3 text-xs text-[#61798a]"><span className="inline-flex items-center gap-1"><Mail size={13}/>{item.email}</span>{item.phone&&<span>Telepon: {item.phone}</span>}</p>
      <div className="rounded-lg border border-[#e3eaf0] bg-[#f8fafb] p-4">
        <label className="mb-2 block text-xs font-semibold text-[#385469]">Balasan melalui Gmail</label>
        {item.replySentAt ? <p className="text-xs text-green-800">Terkirim melalui Gmail API: {new Date(item.replySentAt).toLocaleString('id-ID')} · ID: {item.replyGmailId}</p> :
        <>
          <select aria-label="Template balasan" defaultValue="" className="mb-2 w-full rounded border border-[#cbd9e2] bg-white p-2 text-xs"
          onChange={e=>{const t=templates[Number(e.target.value)];if(t)setDrafts(d=>({...d,[item.id]:t.body.replace('Bapak/Ibu '+(messages[0]?.name ?? ''),'Bapak/Ibu '+item.name).replaceAll('\\n', String.fromCharCode(10))}));}}>
            <option value="" disabled>Pilih template balasan</option>
            {templates.map((t,i)=><option value={i} key={t.name}>{t.name}</option>)}
          </select>
          <textarea aria-label="Isi balasan Gmail" rows={5} maxLength={10000} className="w-full rounded border border-[#cbd9e2] bg-white p-3 text-sm"
            value={drafts[item.id] ?? item.replyDraft ?? ''} onChange={e=>setDrafts(d=>({...d,[item.id]:e.target.value}))}/>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={busy!==null} onClick={()=>void saveDraft(item)} className="rounded bg-[#edf4f9] px-3 py-2 text-xs font-semibold text-[#1b527c] disabled:opacity-50">Simpan Draft</button>
            <button type="button" disabled={busy!==null || !item.replyDraft} onClick={()=>void sendReply(item)} className="rounded bg-[#005BAC] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Kirim via Gmail</button>
          </div>
          {item.replyLastError&&<p className="mt-2 text-xs text-red-700">Pengiriman sebelumnya: {item.replyLastError}</p>}
          <p className="mt-2 text-xs text-[#6d8090]">Simpan Draft terlebih dahulu. Status otomatis berubah saat Draft disimpan dan saat Gmail API menerima pesan.</p>
        </>}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[#edf1f4] pt-3"><label className="text-xs font-semibold text-[#385469]">Status penanganan<select value={item.status} disabled={busy!==null} onChange={e=>void changeStatus(item,e.target.value as Message['status'])} className="ml-2 rounded-lg border border-[#d5e1e9] bg-white px-3 py-2 font-normal">{statuses.map(s=><option key={s} value={s}>{s==='New'?'Baru':s==='In Progress'?'Dalam Proses':'Selesai'}</option>)}</select></label>
      <button type="button" disabled={busy!==null} onClick={()=>void remove(item)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14}/>Hapus</button></div>
    </article>)}</div>}
  </section>;
}