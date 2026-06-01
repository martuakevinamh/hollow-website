# 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Hollow - Official Website & Admin Panel

Website resmi komunitas gangster GTA SA:MP (**The Hollow Block**) dan GTA FiveM (**The Hollow Northenwall**), lengkap dengan **Hollow Panel** (Admin Panel) berbasis Next.js App Router, Supabase, dan Firebase Authentication.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js (App Router, React 19)
*   **Database & Storage**: Supabase (PostgreSQL, Supabase Storage)
*   **Autentikasi**: Firebase Auth (dengan Custom Claims untuk Role Admin)
*   **Styling**: Pure CSS Modules (Premium Dark Theme, responsive)

---

## 🔑 Environment Variables (`.env.local`)

Buat file `.env.local` di root direktori dengan konfigurasi berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase Client SDK Configuration (untuk login admin panel)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin SDK Configuration (untuk API management admin)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

## 📦 Skema Database (Supabase)

Tabel-tabel database yang digunakan (skema lengkap berada di `supabase/schema.sql`):

1.  **`public.members`**: Menyimpan daftar anggota/gangster Hollow.
2.  **`public.news`**: Menyimpan artikel berita, changelog, dan pengumuman.
3.  **`public.gallery`**: Menyimpan arsip dokumentasi/foto Hollow.
4.  **`public.settings`**: Menyimpan pengaturan teks dinamis About Us dan 8 sosial media link website.

---

## 🔑 Hak Akses & Role Admin

Sistem administrasi panel menggunakan dual-role untuk tingkat keamanan optimal:
1.  **Admin Utama**: Memiliki hak akses penuh untuk mengelola konten dan membuat/mengedit/menghapus Admin Sekunder lainnya.
2.  **Admin Sekunder**: Dapat mengelola konten website (Members, Gallery, News, Settings) tetapi tidak dapat mengakses halaman manajemen admin (`/admin/users`).

*Role diatur menggunakan custom claims di Firebase Auth (`role: 'utama'` atau `role: 'sekunder'`).*

---

## 🚀 Panduan Menjalankan Project

### Mode Pengembangan (Development)
```bash
# Install dependensi
npm install

# Jalankan server lokal
npm run dev
```
Buka `http://localhost:3000` untuk melihat website publik dan `http://localhost:3000/admin` untuk masuk ke panel admin.

### Produksi (Production Build)
```bash
# Build aplikasi
npm run build

# Jalankan aplikasi hasil build
npm start
```
