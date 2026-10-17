\# API Backend UPPD Banyumas



Base URL lokal: http://localhost:4000/api/v1



Frontend yang diizinkan:

\- http://localhost:3000

\- http://localhost:3001



Backend dan PostgreSQL harus berjalan di laptop yang digunakan

untuk pengujian. localhost tidak mengarah ke laptop anggota lain.



\## Autentikasi



Autentikasi menggunakan cookie HttpOnly bernama uppd\_session.

Frontend wajib menggunakan credentials: 'include'.

Tidak perlu menyimpan token di localStorage.



\### POST /auth/login



Request:

```json

{

&#x20; "username": "admin.demo",

&#x20; "password": "<password demo lokal>"

}

```



Respons 200:

```json

{

&#x20; "message": "Login berhasil",

&#x20; "user": {

&#x20;   "username": "admin.demo",

&#x20;   "displayName": "Administrator Demo",

&#x20;   "role": "ADMINISTRATOR"

&#x20; }

}

```



Login gagal: 401.

Input tidak valid: 400.

Batas percobaan login: 10 request per 15 menit per IP;

setelah batas tercapai, respons 429.



\### GET /auth/me



Memerlukan sesi login. Respons 200 berisi:

\- user.id

\- user.username

\- user.displayName

\- user.role



Sesi tidak tersedia atau tidak valid: 401.



\### POST /auth/logout



Menghapus sesi saat ini dan membersihkan cookie.



Respons 200:

```json

{

&#x20; "message": "Logout berhasil"

}

```



\## Pegawai



Semua endpoint /users khusus ADMINISTRATOR.



Peran yang tersedia:

\- ADMINISTRATOR

\- OPERATOR

\- PENANGGUNG\_JAWAB



Pembagian jabatan dan kewenangan publikasi belum final.

Harus dikonfirmasi ke UPPD sebelum pengujian keseluruhan.



\### GET /users



Respons 200: { "users": \[...] }



Field setiap pengguna:

id, username, displayName, role, isActive, createdAt, updatedAt.



passwordHash tidak dikirim.



\### POST /users



Request:

```json

{

&#x20; "username": "operator.baru",

&#x20; "displayName": "Operator Baru",

&#x20; "password": "<password akun baru>",

&#x20; "role": "OPERATOR"

}

```



Ketentuan:

\- Username 3–100 karakter: a–z, angka, titik, \_ atau -.

\- Nama setelah trim: 2–100 karakter.

\- Password minimal 12 karakter, maksimal 256 karakter

&#x20; dan maksimal 72 byte UTF-8.

\- Role harus sesuai pilihan.



Respons 201: { "message": "...", "user": {...} }

Username sudah digunakan: 409.

Input tidak valid: 400.



\### PATCH /users/:id



Request parsial:

```json

{

&#x20; "displayName": "Nama Diperbarui",

&#x20; "isActive": false

}

```



Hanya displayName dan isActive yang boleh dikirim.

isActive harus boolean, bukan string.



Respons 200: { "message": "...", "user": {...} }

Akun tidak ditemukan: 404.

Menonaktifkan akun sendiri: 400.



Penonaktifan mencabut seluruh sesi akun tersebut.

Pengaktifan kembali tidak memulihkan sesi lama;

pengguna harus login kembali.



Perubahan username, role, dan password belum tersedia.



\## Draf Pengumuman



Semua endpoint /announcements memerlukan login.

Saat ini semua peran aktif dapat membuat draf.

Setiap pengguna hanya dapat membaca, mengubah,

dan menghapus draf miliknya sendiri.



\### GET /announcements



Respons 200:

```json

{

&#x20; "announcements": \[]

}

```



Mengembalikan maksimal 100 draf milik pengguna,

diurutkan berdasarkan waktu pembuatan terbaru.

Belum menyediakan pagination.



\### POST /announcements



Request:

```json

{

&#x20; "title": "Judul pengumuman",

&#x20; "date": "2026-10-17",

&#x20; "category": "Pelayanan",

&#x20; "shortDescription": "Ringkasan pengumuman.",

&#x20; "content": "Isi lengkap pengumuman.",

&#x20; "isNew": true,

&#x20; "isImportant": false

}

```



Field wajib:

\- title: 1–200 karakter setelah trim.

\- date: tanggal valid dengan format YYYY-MM-DD.

\- category: 1–100 karakter setelah trim.

\- shortDescription: 1–500 karakter setelah trim.

\- content: 1–50000 karakter setelah trim.



Field opsional:

\- isNew: boolean, default true.

\- isImportant: boolean, default false.



Field tambahan ditolak.

status dan createdById ditentukan server.



Respons 201:

{ "message": "...", "announcement": {...} }



Status awal selalu DRAFT.



\### PATCH /announcements/:id



Menerima satu atau beberapa field:

title, date, category, shortDescription, content,

isNew, isImportant.



Aturan validasi sama dengan pembuatan.

Request kosong dan field tambahan ditolak dengan 400.



Respons 200:

```json

{

&#x20; "message": "Draf berhasil diperbarui"

}

```



Draf tidak ditemukan, bukan milik pengguna,

atau statusnya bukan DRAFT: 404.



\### DELETE /announcements/:id



Hanya menghapus draf milik pengguna.



Respons 200:

```json

{

&#x20; "message": "Draf berhasil dihapus"

}

```



Draf tidak ditemukan, bukan milik pengguna,

atau statusnya bukan DRAFT: 404.



\### Format respons draf



Field:

id, title, date, category, shortDescription, content,

isNew, isImportant, status, createdById,

createdAt, updatedAt.



date dikembalikan sebagai ISO UTC,

contoh: 2026-10-17T00:00:00.000Z.

Untuk input tanggal, gunakan date.slice(0, 10).



Persetujuan, penolakan, dan publikasi belum tersedia.



\## Pengumuman Publik



\### GET /public/announcements



Tidak memerlukan login.



Hanya mengembalikan status PUBLISHED dengan

publishedAt yang tidak melewati waktu saat ini.



Respons 200:

```json

{

&#x20; "announcements": \[]

}

```



Field:

id, title, date, category, shortDescription,

content, isNew, isImportant.



date menggunakan YYYY-MM-DD.

Maksimal 100 pengumuman, tanggal terbaru terlebih dahulu.

Belum menyediakan pagination.



Daftar kosong adalah hasil normal jika belum ada konten terbit.

Jangan menggantinya dengan data contoh seolah-olah konten resmi.



Endpoint lama /api/content dan /api/admin/... belum disediakan

oleh backend PostgreSQL ini. Integrasi frontend perlu disesuaikan

per modul; jangan mengganti seluruh context dengan respons

pengumuman saja.



\## Contoh Fetch Frontend



```typescript

const API = 'http://localhost:4000/api/v1';



async function apiRequest(

&#x20; path: string,

&#x20; method = 'GET',

&#x20; body?: unknown

) {

&#x20; const response = await fetch(`${API}${path}`, {

&#x20;   method,

&#x20;   credentials: 'include',

&#x20;   ...(body !== undefined

&#x20;     ? {

&#x20;         headers: { 'Content-Type': 'application/json' },

&#x20;         body: JSON.stringify(body)

&#x20;       }

&#x20;     : {})

&#x20; });



&#x20; const data = await response.json();



&#x20; if (!response.ok) {

&#x20;   throw new Error(data.message ?? 'Permintaan gagal');

&#x20; }



&#x20; return data;

}



// Login melalui formulir; jangan hardcode password.

await apiRequest('/auth/login', 'POST', { username, password });



// Daftar pegawai.

const { users } = await apiRequest('/users');



// Draf sendiri.

const { announcements } = await apiRequest('/announcements');



// Pengumuman publik.

const publicData = await apiRequest('/public/announcements');

```



Sembunyikan menu berdasarkan role untuk membantu pengguna.

Backend tetap menjadi pihak yang memeriksa izin setiap request.

Isi pengumuman sebaiknya dirender sebagai teks;

HTML mentah memerlukan sanitasi tersendiri.



\## Pemeriksaan Server



GET /health

GET /health/db



/health/db yang berhasil mengembalikan:

status: ok, database: connected, totalUsers: jumlah akun.



\## Respons Error Umum



\- 400: input tidak valid.

\- 401: belum login atau sesi tidak valid.

\- 403: tidak memiliki hak akses.

\- 404: data tidak ditemukan atau tidak dapat diakses.

\- 409: username sudah digunakan.

\- 429: terlalu banyak percobaan login.

\- 500: kesalahan server.

\- 503: database tidak terhubung pada endpoint health/db.

