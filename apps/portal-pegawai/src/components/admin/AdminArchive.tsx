import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest } from '../../lib/api';
import { Plus, Pencil, Trash2, X, ExternalLink } from 'lucide-react';

type Item = { id:string; title:string; description:string; image:string; isPublished:boolean };
const images = [
  ['/images/maklumat.jpeg', 'Maklumat Pelayanan'],
  ['/images/sop1.jpg', 'SOP 1'],
  ['/images/sop2.jpg', 'SOP 2'],
  ['/images/sipp1.jpg', 'SIPP 1'],
  ['/images/sipp2.jpg', 'SIPP 2']
] as const;
const empty = () => ({ title:'', description:'', image:images[0][0] as string });
const input = 'w-full rounded-lg border border-[#cbd9e2] bg-white px-3 py-2 text-sm text-[#233e52] outline-none focus:border-[#005BAC]';
const action = 'rounded-lg border border-[#cbd9e2] px-3 py-2 text-xs font-semibold text-[#36546b] hover:bg-[#eef5fa] disabled:opacity-50';
export function AdminArchive({onChange}: {onChange?: (count:number)=>void}) {
  const [items,setItems]=useState<Item[]>([]);
  const [form,setForm]=useState(empty);
  const [editId,setEditId]=useState<string|null>(null);
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [loading,setLoading]=useState(true);
  useEffect(()=>{onChange?.(items.length)},[items,onChange]);
  useEffect(()=>{
    let active=true;
    apiRequest<{archive:Item[]}>('/api/v1/archive').then(r=>{if(active)setItems(r.archive)})
      .catch(e=>{if(active)setError(e instanceof Error?e.message:'Gagal memuat dokumentasi')})
      .finally(()=>{if(active)setLoading(false)});
    return ()=>{active=false};
  },[]);
  async function reload(){const r=await apiRequest<{archive:Item[]}>('/api/v1/archive');setItems(r.archive)}
  function create(){setForm(empty());setEditId(null);setOpen(true);setNotice('');setError('')}
  function edit(item:Item){if(item.isPublished)return;setForm({title:item.title,description:item.description,image:item.image});setEditId(item.id);setOpen(true);setNotice('');setError('')}
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;setBusy(true);setError('');
    try {
      if(editId)await apiRequest('/api/v1/archive/'+encodeURIComponent(editId),'PATCH',form);
      else await apiRequest('/api/v1/archive','POST',form);
      await reload();setOpen(false);setNotice('Dokumentasi tersimpan sebagai Draft.');
    }catch(e){setError(e instanceof Error?e.message:'Gagal menyimpan')}finally{setBusy(false)}
  }
  async function toggle(item:Item){
    if(busy)return;setBusy(true);setError('');
    try{await apiRequest('/api/v1/archive/'+encodeURIComponent(item.id)+'/'+(item.isPublished?'unpublish':'publish'),'POST');await reload();setNotice(item.isPublished?'Publikasi ditarik.':'Gambar diterbitkan.')}
    catch(e){setError(e instanceof Error?e.message:'Gagal memperbarui status')}finally{setBusy(false)}
  }
  async function remove(item:Item){
    if(busy||item.isPublished||!window.confirm('Hapus Draft "'+item.title+'"?'))return;
    setBusy(true);setError('');
    try{await apiRequest('/api/v1/archive/'+encodeURIComponent(item.id),'DELETE');await reload();setNotice('Draft dihapus.')}
    catch(e){setError(e instanceof Error?e.message:'Gagal menghapus')}finally{setBusy(false)}
  }
  return <section className="space-y-5">
    <header className="flex flex-wrap justify-between gap-3"><div><h3 className="text-lg font-bold text-[#193a52]">Dokumentasi Pelayanan</h3><p className="mt-1 text-xs text-[#6c8090]">Gunakan gambar yang tersedia di folder public/images.</p></div>{!open&&<button type="button" onClick={create} className="inline-flex items-center gap-2 rounded-lg bg-[#005BAC] px-4 py-2 text-xs font-semibold text-white"><Plus size={15}/>Tambah Gambar</button>}</header>
    {error&&<p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice&&<p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {open?<form onSubmit={submit} className="space-y-4 rounded-xl border border-[#dce5eb] bg-white p-5">
      <div className="flex justify-between"><h4 className="font-semibold text-[#193a52]">{editId?'Edit Draft':'Tambah Dokumentasi'}</h4><button type="button" onClick={()=>setOpen(false)} disabled={busy} aria-label="Tutup"><X size={18}/></button></div>
      <label className="block text-xs font-semibold text-[#385469]">Judul<input required maxLength={200} className={input+' mt-2'} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label className="block text-xs font-semibold text-[#385469]">Deskripsi<textarea rows={3} maxLength={3000} className={input+' mt-2'} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      <label className="block text-xs font-semibold text-[#385469]">Pilih Gambar<select value={form.image} onChange={e=>setForm({...form,image:e.target.value})} className={input+' mt-2'}>{images.map(([path,label])=><option key={path} value={path}>{label} ({path})</option>)}</select></label>
      <div className="rounded-lg border border-[#e0e8ee] bg-[#f7fafc] p-3"><p className="mb-2 text-xs text-[#647b8d]">Pratinjau gambar asli</p><img src={form.image} alt="Pratinjau dokumentasi" className="max-h-64 w-full object-contain"/></div>
      <div className="flex justify-end gap-2"><button type="button" disabled={busy} onClick={()=>setOpen(false)} className={action}>Batal</button><button disabled={busy} type="submit" className="rounded-lg bg-[#005BAC] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Simpan Draft</button></div>
    </form>:
    loading?<p className="text-sm text-[#647b8d]">Memuat dokumentasi...</p>:
    <div className="grid gap-4 md:grid-cols-2">{items.length?items.map(item=><article key={item.id} className="overflow-hidden rounded-xl border border-[#dce5eb] bg-white">
      <div className="flex h-44 items-center justify-center bg-[#f3f6f8] p-3"><img src={item.image} alt={item.title} className="h-full w-full object-contain"/></div>
      <div className="space-y-3 p-4"><span className={'inline-block rounded-full px-2 py-1 text-[11px] font-semibold '+(item.isPublished?'bg-green-50 text-green-800':'bg-slate-100 text-slate-600')}>{item.isPublished?'Dipublikasikan':'Draft'}</span><h4 className="font-semibold text-[#193a52]">{item.title}</h4><p className="text-xs leading-5 text-[#667e8c]">{item.description}</p><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void toggle(item)} className={action}>{item.isPublished?'Tarik Publikasi':'Publikasikan'}</button>{!item.isPublished&&<><button type="button" disabled={busy} onClick={()=>edit(item)} className={action}><Pencil size={13}/></button><button type="button" disabled={busy} onClick={()=>void remove(item)} className={action}><Trash2 size={13}/></button></>}<a href={item.image} target="_blank" rel="noopener noreferrer" className={action}><ExternalLink size={13}/></a></div></div>
    </article>):<p className="text-sm text-[#647b8d]">Belum ada dokumentasi di PostgreSQL.</p>}</div>}
  </section>;
}
