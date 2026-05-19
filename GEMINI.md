# Blueprint Proyek: AditBunta Diecaster v2.0

## 📌 Konteks Proyek
Saya ingin membangun ulang web app full-stack bernama **"AditBunta Diecaster"**, sebuah aplikasi *inventory management* & *business intelligence dashboard* khusus untuk kolektor dan reseller car diecast. Didalamnya ada fitur-fitur seperti : Mainpage menampilkan koleksi-koleksi diecast, halaman Dashboard untuk melihat busimess summary, inventory manager untuk maintain keseluruhan asset, Online Store untuk berjualan koleksi, profit calculator menghitung profit, Order tracker untuk melakukan pencatatan dan pelacakan order transaksi, Analytic untuk insight, dan lainnya untuk mendukung website saya.
- **Tech Stack Utama:** Next.js (App Router), React, Tailwind CSS, Shadcn UI, dan Supabase.
- **UI/UX Design Language:** Gaya modern Gen-Z. Harus menggunakan *dark mode* sebagai default, mengimplementasikan efek *glassmorphism* (latar belakang semi-transparan dengan *blur*), menggunakan border dengan sudut membulat (`rounded-2xl`), serta palet warna dengan aksen neon/vibrant (misal: ungu/cyan bercahaya).

## 🔑 Environment Variables
Gunakan kredensial berikut untuk pengaturan Supabase Client:
```env
NEXT_PUBLIC_SUPABASE_URL=[https://hoghglmqthnuqrtfpagp.supabase.co](https://hoghglmqthnuqrtfpagp.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_KpJjxV79L1rMj0b5yjzZOw_G5eRYL1m