import { useEffect, useMemo, useRef, useState } from 'react';
import { useSamsat } from '../../context/SamsatContext';
import type { ChatbotFAQ } from '../../types';
const empty = { question: '', answer: '', keywords: '', category: 'Umum' };
const field = 'mt-2 w-full rounded-md border border-[#cbd9e2] bg-white px-3 py-2.5 text-sm text-black focus:border-[#005BAC] focus:outline-none focus:ring-2 focus:ring-blue-100';
const button = 'inline-flex min-h-9 shrink-0 items-center justify-center rounded-md border border-[#cbd9e2] px-3 py-2 text-xs font-semibold text-black hover:bg-blue-50 disabled:opacity-50';
export function AdminChatbot() {
  const { chatbotFaqs, addChatbotFaq, updateChatbotFaq, toggleChatbotFaqStatus, deleteChatbotFaq } = useSamsat();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false); busyRef.current = busy;
  const firstInput = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLFormElement>(null);
  const rows = useMemo(() => chatbotFaqs.filter(item => `${item.question} ${item.answer} ${item.category} ${item.keywords.join(' ')}`.toLowerCase().includes(search.trim().toLowerCase())), [chatbotFaqs, search]);
  const edit = (item?: ChatbotFAQ) => {
    previousFocus.current = document.activeElement as HTMLElement;
    setEditId(item?.id ?? null);
    setForm(item ? { question: item.question, answer: item.answer, category: item.category, keywords: item.keywords.join(', ') } : empty);
    setOpen(true);
  };
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; firstInput.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busyRef.current) setOpen(false);
      if (e.key === 'Tab') {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, textarea');
        if (!nodes?.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKey); previousFocus.current?.focus(); };
  }, [open]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (busy) return; setBusy(true);
    const data = { ...form, keywords: form.keywords.split(',').map(v => v.trim()).filter(Boolean), isEnabled: false };
    try { const ok = editId ? await updateChatbotFaq(editId, data) : await addChatbotFaq(data); if (ok) setOpen(false); }
    finally { setBusy(false); }
  };
  const act = async (item: ChatbotFAQ, remove = false) => {
    if (busy || (remove && !window.confirm(`Hapus jawaban "${item.question}"?`))) return;
    setBusy(true);
    try { if (remove) await deleteChatbotFaq(item.id); else await toggleChatbotFaqStatus(item.id); }
    finally { setBusy(false); }
  };
  return <section className="rounded-lg border border-[#dce5eb] bg-white p-5 text-black sm:p-6">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dce5eb] pb-5">
      <label className="w-full text-sm sm:max-w-xs">Cari jawaban<input type="search" className={field} value={search} onChange={e => setSearch(e.target.value)} placeholder="Pertanyaan, kategori, atau kata kunci" /></label>
      <button type="button" onClick={() => edit()} className="min-h-10 rounded-md bg-[#005BAC] px-4 py-2 text-sm font-semibold text-white">Tambah jawaban</button>
    </div>
    <p className="mt-4 text-xs">{rows.length} jawaban ditampilkan. Nonaktifkan jawaban sebelum mengedit atau menghapusnya.</p>
    <div className="divide-y divide-[#e7edf1]">{rows.map(item => <article key={item.id} className="flex flex-col justify-between gap-4 py-5 xl:flex-row xl:items-center">
      <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[#005BAC]">{item.category} · {item.isEnabled ? 'Aktif' : 'Nonaktif'}</p><h3 className="mt-1 text-sm font-semibold">{item.question}</h3><p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6">{item.answer}</p><p className="mt-2 text-xs leading-5">Kata kunci: {item.keywords.join(', ')}</p></div>
      <div className="flex flex-wrap items-center gap-2 self-start xl:self-center">
        <button type="button" disabled={busy} onClick={() => void act(item)} className={button}>{item.isEnabled ? 'Nonaktifkan' : 'Aktifkan'}</button>
        {!item.isEnabled && <><button type="button" disabled={busy} onClick={() => edit(item)} className={button}>Edit</button><button type="button" disabled={busy} onClick={() => void act(item, true)} className={button + ' border-red-200 text-red-800'}>Hapus</button></>}
      </div>
    </article>)}</div>
    {!rows.length && <p className="py-8 text-sm">Belum ada jawaban yang sesuai.</p>}
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="chatbot-edit-title" onSubmit={save} className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h3 id="chatbot-edit-title" className="text-lg font-semibold">{editId ? 'Edit jawaban chatbot' : 'Tambah jawaban chatbot'}</h3>
        <div className="mt-5 space-y-4">
          <label className="block text-sm">Pertanyaan<input ref={firstInput} required maxLength={500} className={field} value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} /></label>
          <label className="block text-sm">Jawaban<textarea required maxLength={20000} rows={6} className={field} value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} /></label>
          <label className="block text-sm">Kategori<input required maxLength={100} className={field} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></label>
          <label className="block text-sm">Kata kunci, pisahkan dengan koma<input required className={field} value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} /></label>
        </div>
        <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={busy} onClick={() => setOpen(false)} className={button}>Batal</button><button type="submit" disabled={busy} className="rounded-md bg-[#005BAC] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Menyimpan…' : 'Simpan'}</button></div>
      </form>
    </div>}
  </section>;
}
