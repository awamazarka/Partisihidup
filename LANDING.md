Tolong buatkan komponen Hero Section dan Feature Cards untuk landing page Next.js saya dengan gaya "Neo-Brutalism" yang sangat persis dengan referensi gambar.

Spesifikasi teknis:
1. Framework: Next.js 14 (App Router), Tailwind CSS, Lucide React Icons.
2. Warna Utama: Blue (#0066FF), Yellow (#FFDE03), Green (#00FF94), Pink (#FF007A).
3. Efek Visual: Semua elemen harus memiliki border hitam tebal (border-2 atau border-4) dengan bayangan tajam (shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]).

Detail Komponen:

A. Hero Section (Banner Atas):
- Background: Blue (#0066FF).
- Badge: Tampilkan box kecil kuning bertuliskan "🔥 HOT DEAL" dengan border hitam.
- Headline: Text besar miring (italic) tebal warna putih: "KOLEKSI LANGKA HARGA MIRING."
- Sub-headline: Deskripsi singkat tentang Hot Wheels, Mini GT, dan Tomica.
- CTA Button: Tombol besar warna Kuning (#FFDE03) bertuliskan "GASKEUN ->". 
  *PENTING*: Gunakan komponen <Link> dari 'next/link' yang mengarah ke "/store". Berikan efek hover: bergeser sedikit ke atas dan bayangan membesar.

B. Feature Cards (3 Kolom di Bawah):
1. Card Hijau: Icon Tag. Judul "GAK ADA HARGA GELAP." Link "LIHAT STORE ->".
2. Card Kuning: Icon Star. Judul "SESAMA DIECASTER." Link "JOIN SEKARANG ->".
3. Card Pink: Icon Truck. Judul "BLISTER UTUH SAMPAI TUJUAN." Link "ORDER SEKARANG ->".

Pastikan layout responsif (1 kolom di mobile, 3 kolom di desktop) dan menggunakan font Sans-serif yang tegas.

Lanjutkan pembuatan landing page dengan menambahkan section "Hero Header" dan "Brand Marquee" di atas section sebelumnya.

Spesifikasi detail:

A. Hero Header (Top Section):
- Background: Gambar mobil gelap/hitam (low exposure) sebagai overlay latar belakang.
- Elemen Teks: 
  1. Box Hijau Neon: Border hitam tebal, teks hitam "MARKETPLACE JUALAN DIECAST".
  2. Box Pink: Border hitam tebal, teks putih "ALA ONLY DIECASTER SANTUY." miring sedikit (tilt).
- Tombol (CTA):
  1. Tombol "GET STARTED": Warna Kuning, border hitam tebal, bayangan tajam. Menggunakan <Link> ke "/sign-in".
  2. Tombol "SHOWCASE": Warna Putih, border hitam tebal, bayangan tajam. Menggunakan <Link> ke "/collection".

B. Brand Marquee (Running Text):
- Buat sebuah bar kuning (#FFDE03) lebar penuh yang miring sedikit (skew/rotate sekitar -1 sampai -2 derajat) untuk memberikan kesan brutalism.
- Di dalamnya, buat teks bergerak otomatis (infinite marquee) menggunakan Framer Motion atau CSS Animation.
- Daftar Brand: "MAJORETTE", "AUTOART", "HOT WHEELS", "MATCHBOX", "TOMICA", "MINI GT", "TARMAC WORKS".
- Font: Bold, Italic, Sans-serif (seperti Archivo Black atau Impact), ukuran besar (text-2xl atau 3xl).
- Tambahkan dekorasi kecil seperti box "SPEED FORCE!!" warna pink di sudut kiri bawah bar kuning.

C. Section "Bukan Sekedar":
- Tambahkan box hitam kecil di atas headline: "WHY DIECASTER SANTUY?".
- Headline Utama: "BUKAN SEKEDAR" (Teks hitam) dan di bawahnya "JUAL BELI BIASA." (Box pink dengan teks putih, border hitam tebal).
- Tambahkan ilustrasi mobil kartun gaya neo-brutalism di sisi kiri dan kanan (seperti pada gambar).

Pastikan semua elemen memiliki 'hard shadow' hitam yang konsisten (shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]).