# 🚀 Fitur Logout Pengguna (User Logout)

Dokumen ini berisi panduan tahap demi tahap (step-by-step) untuk mengimplementasikan fitur `Logout` guna mencabut sesi *user* menggunakan Bun, ElysiaJS, dan Drizzle ORM. Panduan ini dirancang dari tingkat tinggi (*high-level*) agar mudah dipahami setelah dikerjakan oleh Junior Programmer atau AI Assistant.

## 📌 1. Cara Kerja Fitur
Fitur API ini digunakan untuk mengakhiri jejak sesi login *user*. Apabila aplikasi *client* mengakses *endpoint* ini seraya menyisipkan Token absah, maka identitas/token di dalam rekam tabel `sessions` sistem (*database*) akan sepenuhnya dilenyapkan.

Metode pemanggilan proteksinya masih menggunakan skema **Bearer Token** pada HTTP Headers:
`Authorization: Bearer <token_uuid>`

## 📌 2. Implementasi Logika Bisnis (`users-service.ts`)
Fungsi independen ini bertugas memastikan token ada, lalu menghapus entri dari database.

**Tahapan Implementasi:**
1. Buka file `src/services/users-service.ts`.
2. Tambahkan deklarasi fungsi statis asinkronus baru bernama `logoutUser(token: string)`.
3. **Validasi Token Asli:** Lakukan verifikasi di *database* dengan mengeksekusi perintah kueri (*findFirst*) pada tabel `sessions` di Drizzle, pastikan mengincar kecocokan `eq(sessions.token, token)`.
4. Jika properti *session* gagal ditemukan, hal ini murni karena tidak ada yang berwujud token tersebut (mungkin asal sebut / sudah kedaluwarsa). Paksa program berhenti (*throw* eksepsi): `throw new Error("Unauthorized")`.
5. **Penghancuran Token/Sesi:** Bila *session* itu eksis valid, hancurkan entri tersebut dengan perintah Drizzle berupa eksekusi Delete. (Kira-kira `await db.delete(sessions).where(eq(sessions.token, token));`). Hal ini mencopot secara permanen keabshan *log* tokennya.
6. Berikan resi pengembalian (*return*) sebuah wujud string `"OK"`.

## 📌 3. Implementasi Routing API (`users-routes.ts`)
Tambahkan satu *endpoint* ber-metode `DELETE` untuk mengelola URI `/logout` ke susunan utama aplikasi.

**Tahapan Implementasi:**
1. Buka file *plugin* rute aplikasi di `src/routes/users-routes.ts`.
2. Di dalam rantai deklarasi *Elysia API* yang telah dibenihkan (*usersRoutes*), pelihara interkoneksi di ujung rentetan fungsi dengan deklarasi `.delete('/logout', async ({ headers, set }) => { ... })`.
3. **Membaca HTTP Authorization:** 
   - Tangkap parameter dari kamus *headers* milik konteks ElysiaJS, dengan mengambil nilai properti *header* autorisasi: `const authorization = headers.authorization;`.
   - Mengingat tata penulisan aman harus berawal konstan tulisan awalan `"Bearer "`, pertimbangkan blok eksekusi (*startsWith() / indexOf()*). Setelah yakin, pecahkan karakter (*split*) dengan penunjuk spasi `' '`, dan cabut indeks ke satu untuk memisahkan wujud `<Token_Teks>` intinya. (Atau jika di-substring silakan disesuaikan).
   - Apabila ada tahapan pecah logika di *header* tersebut yang mencurigakan (atau kosong), gembok resi status HTTP menjadi 401 (`set.status = 401`) lantas lemparkan interupsi *Error*.
4. **Terjemahkan ke Layanan:** Panggil perantara rutin layanan dari tahap 2 (`await UsersService.logoutUser(tokenString)`).
   - **Jika Sukses**, ubah objek penyajian agar literal JSON Object mereturnkan:
     ```json
     { "data" : "OK" }
     ```
   - **Jika Mendapati Error Toleran ("Unauthorized")**, gunakan tangkapan sekuens perulangan *try-catch*, ikat kembali nilai resi HTTP peramban senilai persis `401 Unauthorized` (`set.status = 401`), bersama hasil tangkapan wujud objek mutlaknya:
     ```json
     { "error" : "Unauthorized" }
     ```

## ✅ Pengujian Akhir
Terapkan tes QA fungsionalitas murni secara lokal pasca merekatkan kode:
- Panggil rute pengetesan *endpoint* `DELETE /api/users/logout` secara sengaja **tanpa* menggunakan properti otorisasi pada *header* peramban REST. Skema logik wajib mereplikakan balik string JSON `{ "error": "Unauthorized" }` dilengkapi balasan valid HTTP respon 401.
- Silakan dapatkan 1 cetak rekam sesi utuh dengan singgah dulu me-req ke `POST /api/users/login` lalu raih tokennya.
- Berangkat ke *REST-client* (misal Postman), terpa kembali `DELETE /api/users/logout` **memanfaatkan otorisasi *bearer* `Authorization: Bearer <Teks_Otentik_Token_Sesi>`**. Anda seyogyanya diberitahukan sebuah umpan balik JSON bernilai `{"data": "OK"}`.
- (Mekanika Kebenaran Kunci): Terjang kembali hit pengajuan parameter percis sama di urutan sebelumnya. Database seakan tidak mengenal relasi tersebut (karena usai di-delete), menjamin kembalinya sang properti awal yang gagal: `{"error": "Unauthorized"}`.
