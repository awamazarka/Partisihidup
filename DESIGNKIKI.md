# Panduan Spesifikasi & Implementasi Desain  
# Halaman Home OnlyDiecast (Saweria Style)

Dokumen ini berisi spesifikasi teknis dan panduan implementasi penataan gaya (*styling*) untuk **Halaman Home OnlyDiecast** menggunakan arsitektur **Neo-Brutalisme (Saweria Style)**.

Dokumen ini fokus sepenuhnya pada seluruh elemen visual halaman utama dari Hero hingga Etalase Produk, termasuk integrasi latar belakang video secara mendalam, penggunaan asset final production, serta **mengecualikan komponen footer**.

---

# 1. Fondasi Desain & Sistem Token Warna

Estetika Neo-Brutalisme Saweria mengandalkan:

- Kontras ekstrem
- Border hitam pekat
- Hard shadow tanpa blur
- Typography kapital tebal miring
- Elemen rotasi asimetris
- Efek interaktif “fisik”
- Layer visual ala komik retro
- Warna pop culture yang agresif

---

# 2. Asset Final Production

## Asset Utama

| Fungsi | File |
|---|---|
| Hero Background Video | `/bg-racing.mp4` |
| CTA Comic Video | `/komikcta.mp4` |
| Logo Website | `/logobunta.png` |

---

## Struktur Folder Public

```bash
/public
│
├── bg-racing.mp4
├── komikcta.mp4
├── logobunta.png
│
├── products/
│   ├── skyline-r34.jpg
│   ├── supra-a80.jpg
│   └── rx7-fd.jpg
│
└── decor/
    ├── car-1.svg
    ├── car-2.svg
    └── car-3.svg
```

---

# 3. Palet Warna Utama (Tailwind CSS Hex Codes)

| Fungsi | Warna |
|---|---|
| Background Utama | `bg-[#FAF8F5]` |
| Kuning Utama | `bg-[#FDE047]` / `bg-[#FFD600]` |
| Hijau Mint | `bg-[#00FF9F]` / `bg-[#A3E635]` |
| Pink Accent | `bg-[#FF006E]` |
| Biru Accent | `bg-[#0066FF]` |
| Border & Teks | `#000000` |

---

# 4. Sistem Border & Hard Shadow

## Komponen Kecil

```html
border-[3px] border-black shadow-[4px_4px_0px_0px_#000]
```

---

## Tombol / Kartu Standar

```html
border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
```

---

## Spanduk / Kontainer Menengah

```html
border-[5px] border-black shadow-[10px_10px_0px_0px_#000]
```

---

## Mega Box Kontainer

```html
border-[8px] border-black shadow-[16px_16px_0px_0px_#000]
```

---

# 5. Typography System

## Retro Comic Title

```html
font-black uppercase italic tracking-tighter
```

---

## Text Selection

```html
selection:bg-[#FDE047] selection:text-black
```

---

# 6. Root Layout

```html
<div class="flex flex-col bg-[#FAF8F5] text-black selection:bg-[#FDE047] selection:text-black">
</div>
```

---

# 7. Hero Section + Racing Background Video

Hero section menggunakan:

- Fullscreen racing video
- Overlay gelap transparan
- Floating geometry
- Brutal typography
- Physical CTA interaction
- Logo besar di tengah Hero

---

## Struktur Hero Final

```html
<section class="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-0 text-white min-h-screen overflow-hidden">

  <!-- VIDEO BACKGROUND -->
  <div class="absolute inset-0 z-0">

    <video autoplay muted loop playsinline class="w-full h-full object-cover">
      <source src="/bg-racing.mp4" type="video/mp4" />
    </video>

    <div class="absolute inset-0 bg-zinc-950/70"></div>

  </div>

  <!-- FLOATING SHAPES -->
  <div class="absolute inset-0 z-[1] pointer-events-none">

    <div class="absolute top-[5%] left-[2%] w-32 h-32 bg-[#FF006E] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] rotate-6 animate-float"></div>

    <div class="absolute top-[40%] right-[-3%] w-48 h-48 bg-[#00FF9F] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] -rotate-12 animate-float" style="animation-delay: -1s;"></div>

    <div class="absolute top-[20%] right-[20%] w-16 h-16 bg-[#FDE047] border-[3px] border-black shadow-[6px_6px_0px_0px_#000] rotate-45 animate-bounce-subtle"></div>

  </div>

  <!-- CONTENT -->
  <div class="relative z-10 flex flex-col items-center gap-8 max-w-6xl">

    <!-- LOGO -->
    <img
      src="/logobunta.png"
      alt="OnlyDiecast"
      class="w-40 md:w-52 object-contain drop-shadow-[6px_6px_0px_#000]"
    />

    <!-- TITLE -->
    <h1 class="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[1.0] uppercase italic text-white drop-shadow-[6px_6px_0px_#000]">

      Build Your Own <br />

      <span class="bg-[#FDE047] px-5 py-2 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] text-black inline-block transform -rotate-3 hover:rotate-0 transition-transform duration-100 cursor-default rounded-[4px]">
        EMPIRE
      </span>

      <br />

      of DIECAST.

    </h1>

    <!-- SUBTEXT -->
    <div class="max-w-2xl space-y-3">

      <p class="text-lg md:text-2xl text-black font-black leading-tight bg-[#00FF9F] px-4 py-2 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] inline-block transform rotate-1 uppercase">
        MARKETPLACE JUALAN DIECAST
      </p>

      <p class="text-base md:text-xl text-white font-black leading-tight bg-[#FF006E] px-3 py-2 block border-[3px] border-black shadow-[6px_6px_0px_0px_#000] uppercase">
        Ala Only Diecaster Santuy.
      </p>

    </div>

    <!-- CTA -->
    <div class="flex flex-wrap items-center justify-center gap-5">

      <a href="/login" class="bg-[#FDE047] text-black font-black uppercase tracking-wider border-[3px] border-black shadow-[6px_6px_0px_0px_#000] px-8 py-4 inline-flex items-center justify-center transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_#000] text-lg rounded-[4px]">
        GET STARTED
      </a>

      <button class="bg-white text-black font-black uppercase tracking-wider border-[3px] border-black shadow-[6px_6px_0px_0px_#000] px-8 py-4 transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_#000] text-lg rounded-[4px]">
        SHOWCASE
      </button>

    </div>

  </div>

</section>
```

---

# 8. Marquee Brand Carousel

```html
<div class="relative z-10 w-full py-8 overflow-hidden border-y-[6px] border-black bg-[#FDE047] transform -rotate-2 scale-105 shadow-[0_8px_0px_#000]">

  <div class="flex animate-scroll gap-8 md:gap-16 items-center min-w-[200%]">

    <span class="text-2xl md:text-4xl font-black italic uppercase tracking-tighter whitespace-nowrap text-black">
      HOT WHEELS
    </span>

    <span class="text-2xl md:text-4xl font-black italic uppercase tracking-tighter whitespace-nowrap text-black">
      MATCHBOX
    </span>

    <span class="text-2xl md:text-4xl font-black italic uppercase tracking-tighter whitespace-nowrap text-black">
      TOMICA
    </span>

    <span class="text-2xl md:text-4xl font-black italic uppercase tracking-tighter whitespace-nowrap text-black">
      MINI GT
    </span>

    <span class="text-2xl md:text-4xl font-black italic uppercase tracking-tighter whitespace-nowrap text-black">
      INNO64
    </span>

  </div>

</div>
```

---

# 9. Comic Video Card

```html
<section class="w-full max-w-5xl py-8">

  <div class="relative border-[6px] border-black shadow-[14px_14px_0px_0px_#000] overflow-hidden bg-black">

    <video autoplay muted loop playsinline class="w-full aspect-video block object-cover">

      <source src="/komikcta.mp4" type="video/mp4" />

    </video>

    <div class="absolute top-4 left-4 z-20 transform rotate-[-2deg]">

      <span class="bg-[#FF006E] text-white font-black uppercase italic text-sm px-3 py-1 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] tracking-widest">
        SPEED FORCE!!
      </span>

    </div>

  </div>

</section>
```

---

# 10. Showcase Product Card

```html
<div class="bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_#000] relative overflow-hidden group/item hover:shadow-[8px_8px_0px_0px_#000] transition-all rounded-[4px]">

  <div class="aspect-square relative overflow-hidden bg-zinc-100">

    <img
      src="/products/skyline-r34.jpg"
      alt="Nissan Skyline GT-R R34"
      class="w-full h-full object-cover grayscale contrast-125 group-hover/item:grayscale-0 group-hover/item:contrast-100 transition-all duration-300"
    />

    <span class="absolute top-3 left-3 text-white bg-black px-3 py-1 font-black text-2xl italic border-[3px] border-white shadow-[4px_4px_0px_0px_#000]">
      #01
    </span>

  </div>

</div>
```

---

# 11. Placeholder Empty Grid

```html
<div class="aspect-square bg-zinc-100 border-[6px] border-black shadow-[12px_12px_0px_0px_#000] flex items-center justify-center rounded-[4px]">

  <span class="text-zinc-300 font-black text-4xl italic">
    #01
  </span>

</div>
```

---

# 12. Custom Animation Keyframes

```css
@keyframes scroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(6deg);
  }

  50% {
    transform: translateY(-12px) rotate(8deg);
  }
}

@keyframes bounceSubtle {
  0%, 100% {
    transform: translateY(0) rotate(45deg);
  }

  50% {
    transform: translateY(-8px) rotate(45deg);
  }
}

.animate-scroll {
  animation: scroll 25s linear infinite;
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.animate-bounce-subtle {
  animation: bounceSubtle 3s ease-in-out infinite;
}
```

---

# 13. Optimasi Asset

## bg-racing.mp4

Rekomendasi:

- Resolusi 1920x1080
- Format H264 MP4
- Loop 8–20 detik
- Size ideal < 8MB

---

## komikcta.mp4

Rekomendasi:

- Loop pendek
- Dynamic shot
- Size ideal < 5MB

---

## logobunta.png

Rekomendasi:

- PNG transparan
- Resolusi tinggi
- Background transparan

---

# 14. Kesimpulan Arsitektur Styling

Desain Home OnlyDiecast menggunakan pendekatan:

- Neo Brutalism
- Saweria-inspired layout
- Hard Shadow System
- Floating Comic Geometry
- Racing Video Hero
- Physical Interaction Buttons
- Comic Strip Aesthetic
- Brutal Typography
- Hover Motion System
- Diecast Collector Atmosphere

Seluruh tampilan dibuat untuk menghasilkan pengalaman:

- Enerjik
- Bold
- Retro-modern
- Komikal
- Interaktif
- Sangat kontras
- Responsif
- Kolektor-friendly

Footer sengaja tidak disertakan agar dokumentasi fokus penuh pada Home Page utama.