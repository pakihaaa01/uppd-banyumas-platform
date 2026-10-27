export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'ApiError'; }
}

/** Cookie sesi dikelola browser; respons dinamis tidak disimpan dalam cache. */
export async function apiRequest<T>(url: string, method = 'GET', data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method, credentials: 'same-origin', cache: 'no-store',
    headers: {'X-Requested-With':'UPPD-Portal', ...(data === undefined ? {} : {'Content-Type':'application/json'})},
    ...(data === undefined ? {} : {body:JSON.stringify(data)}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(result?.message || result?.error || `Permintaan gagal (${response.status}).`, response.status);
  if (result === null) throw new ApiError('Respons belum dapat dibaca. Silakan coba lagi.', response.status);
  return result as T;
}
