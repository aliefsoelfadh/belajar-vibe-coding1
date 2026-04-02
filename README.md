# Belajar Vibe Coding 1

Sebuah aplikasi RESTful API back-end sederhana untuk manajemen otentikasi user (Registrasi, Login, Profile, Logout) yang dibangun menggunakan environment eksekusi **Bun**, framework **ElysiaJS**, dan **Drizzle ORM** dengan database **MySQL**.

## 🏗️ Struktur Arsitektur dan Folder

Aplikasi ini menggunakan pola arsitektur *Service-Oriented* (atau Controller-Service pattern) untuk memisahkan logika bisnis dengan logika routing API.

Struktur folder utamanya adalah sebagai berikut:
- `src/` : Direktori utama kode sumber aplikasi.
  - `db/` : Konfigurasi koneksi database MySQL (`index.ts`) dan definisi skema Drizzle ORM (`schema.ts`).
  - `middleware/` : Berisi middleware aplikasi, misalnya `auth-middleware.ts` untuk memvalidasi token sesi pengguna.
  - `routes/` : Deklarasi rute/endpoint API (contoh: `users-routes.ts`).
  - `services/` : File untuk menangani logika bisnis (contoh: `users-service.ts`) seperti hashing password, logika pengecekan user, dsb.
  - `index.ts` : Titik masuk (*Entry Point*) aplikasi web ElysiaJS.
- `tests/` : Berisi file *Unit Test* menggunakan `Bun Test` untuk memastikan API berjalan dengan benar.

## 🚀 API yang Tersedia

Berikut adalah rute API yang tersedia (Prefixed dengan `/api/users`):

1. **POST `/api/users/` (Register User)**
   - Mendaftarkan user baru.
   - **Body (JSON):** `name`, `email`, `password`
2. **POST `/api/users/login` (Login User)**
   - Autentikasi user dan menghasilkan token sesi.
   - **Body (JSON):** `email`, `password`
3. **GET `/api/users/current` (Get Current User)**
   - Mendapatkan data user yang sedang login.
   - **Headers:** Membutuhkan autentikasi (token yang valid).
4. **DELETE `/api/users/logout` (Logout User)**
   - Menghapus sesi user (Logout).
   - **Headers:** Membutuhkan autentikasi (token yang valid).

## 🗄️ Schema Database

Aplikasi menggunakan Drizzle ORM yang mendefinisikan 2 tabel MySQL utama:

- **Tabel `users`**
  - `id` (INT, Primary Key, Auto Increment)
  - `name` (VARCHAR 255)
  - `email` (VARCHAR 255, Unique)
  - `password` (VARCHAR 255)
  - `createdAt` (TIMESTAMP, Default Now)

- **Tabel `sessions`**
  - `id` (INT, Primary Key, Auto Increment)
  - `token` (VARCHAR 255)
  - `userId` (INT, Foreign Key referencing `users.id`)
  - `createdAt` (TIMESTAMP, Default Now)

## 🛠️ Technology Stack & Library

**Stack Utama:**
- **Runtime:** [Bun](https://bun.sh/)
- **Language:** TypeScript
- **Web Framework:** [ElysiaJS](https://elysiajs.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** MySQL

**Library Tambahan yang Digunakan:**
- `@elysiajs/cors`: Untuk mengaktifkan dan mengelola CORS (Cross-Origin Resource Sharing).
- `bcrypt`: Library untuk melakukan hashing (enkripsi) password user secara aman.
- `mysql2`: Driver untuk koneksi ke database MySQL.
- `uuid`: Library untuk meng-generate string unik sebagai token sesi (Session Token).
- `dotenv`: Untuk memuat variabel environment (file `.env`).
- `drizzle-kit`: Tools utilitas (CLI) Drizzle untuk push & migrasi skema database.

## ⚙️ Cara Setup Project

1. Pastikan Anda telah menginstal **Bun** di komputer Anda. Referensi: [bun.sh](https://bun.sh/).
2. Clone atau unduh repositori ini.
3. Di dalam folder root, jalankan instalasi dependensi:
   ```bash
   bun install
   ```
4. Buat file `.env` di folder root, lalu masukkan konfigurasi koneksi database Anda (seperti `DATABASE_URL`).
5. Lakukan migrasi database atau push schema Drizzle ke database lokal MySQL Anda (menggunakan drizzle-kit).

## ▶️ Cara Run Aplikasi

Untuk menjalankan server di lingkungan pengembangan/development:

```bash
bun run src/index.ts
```
Server akan berjalan di port `3000`. Cek console log (`🦊 Elysia is running at localhost:3000`).

## 🧪 Cara Test Aplikasi

Proyek ini telah dilengkapi dengan Unit Test komprehensif menggunakan *test runner* bawaan dari Bun. 

Untuk menjalankan seluruh test (memastikan fungsionalitas Register, Login, Authentication Profile, Logout berjalan), eksekusi command berikut:

```bash
bun test
```
