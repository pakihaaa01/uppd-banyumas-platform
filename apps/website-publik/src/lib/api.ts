/** Permintaan API pada server lokal. Cookie sesi hanya ditangani browser (HttpOnly). */
export async function apiRequest<T>(url: string, method = 'GET', data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'UPPD-Portal',
      ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Permintaan gagal (${response.status}).`);
  return result as T;
}
export async function uploadFile(file: File): Promise<{url:string;fileSize:string;fileType:string}> {
  const response=await fetch('/api/admin/upload',{
    method:'POST', credentials:'same-origin',
    headers:{'X-Requested-With':'UPPD-Portal','Content-Type':file.type},
    body:file,
  });
  const result=await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(result.error || 'Unggah file gagal.');
  return result;
}
