# 📦 Order Management Specification (OnlyDiecast)

## 1. Feature Overview
Sistem pengelolaan pesanan yang menghubungkan data inventory dengan transaksi penjualan, memungkinkan pemotongan stok otomatis dan pelacakan status pengiriman.

## 2. Technical Logic
- **Order ID Generation:** `AB-YYMMDDHHMM` (Auto-generated).
- **Stock Validation:** Sistem harus mengecek `Stock` di inventory sebelum mengizinkan `Quantity` diinput (Max Qty = Available Stock).
- **Stock Deduction:** Saat tombol "Buat Pesanan" diklik, fungsi harus mengurangi jumlah stok di database inventory secara otomatis.

## 3. UI/UX Component (Saweria Style)
- **Border:** `4px solid #000000`
- **Shadow:** `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- **Transitions:** Hover effect `translate-x-[2px] translate-y-[2px] shadow-none`
- **WA Integration:** Auto-encode URI untuk template pesan: 
  `Halo kak [Nama], update kiriman [Item] dengan No Resi [ID] saat ini berstatus: [Status]`

## 4. Status Workflow
1. **Process** (Default) -> Pembayaran dikonfirmasi.
2. **Packed** -> Barang sudah dibungkus.
3. **Shipped** -> Kurir sudah mengambil barang.
4. **Delivered** -> Barang sampai di tujuan.

Context:
"Saya ingin membangun halaman Order Management & Tracking untuk aplikasi web Next.js 'OnlyDiecast'. Desain harus mengikuti tema Neo-Brutalism (Saweria style): border hitam 4px, shadow kaku (solid), dan warna kontras. Gunakan Tailwind CSS dan Lucide React untuk ikon."

Feature Requirements (Base on my Streamlit Logic):

Section 1: Input Penjualan Baru (Form)

Buat komponen Card dengan border tebal.

Fields: Nama Customer, Pilih Produk (Dropdown), Nomor WhatsApp, Quantity (dengan validasi stok maksimal), Harga Satuan, dan Sales Channel (WhatsApp, Tokopedia, Shopee, dll).

Logic UI: Tampilkan "Total Bayar" secara real-time (Unit Price * Qty) di dalam box berwarna kuning terang (#FFD600).

Submit Button: Tombol besar "🚀 Buat Pesanan & Potong Stok" dengan efek shadow saat di-hover.

Section 2: Order Tracking View (List)

Fitur search bar untuk mencari berdasarkan No. Resi atau Nama Customer.

Tampilkan list pesanan dalam bentuk Timeline Cards.

Setiap card memiliki indikator warna status di border sebelah kiri:

Process: Orange, Packed: Blue, Shipped: Purple, Delivered: Green, Canceled: Red.

Informasi yang ditampilkan: No Resi, Status (Badge), Tanggal, Nama Penerima, Item (beserta Qty), dan Alamat.

Section 3: Action Controls

Di setiap card order, tambahkan deretan tombol aksi (Neo-brutalist style buttons):

📦 Packed, 🚚 Shipped, ✅ Delivered.

💬 Chat WA: Tombol yang secara otomatis meng-generate link wa.me dengan template pesan dinamis berisi info resi dan status.

🗑️ Delete: Tombol hapus dengan ikon sampah.

Styling Notes:

Gunakan font Inter atau Montserrat.

Pastikan UI adaptif (Dark/Light mode) dengan tetap mempertahankan border hitam yang tegas.

Card background menggunakan warna transparan halus rgba(125, 125, 125, 0.1) agar terlihat modern.

Semua terhubung ke database supabase dengan env yang telah terkoneksi, pertahankan style bawaan saat ini. dan pastikan fungsi validasi stock dan potongan otomatis yang berhubungan dengan halaman inventory.
