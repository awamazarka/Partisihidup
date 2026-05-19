# Content for design.md focusing on Neo-Brutalism (Saweria style) for OnlyDiecast
content = """# Design Specification: OnlyDiecast (Saweria Style)

## 1. Design Concept: Neo-Brutalism
Gaya desain ini mengadopsi estetika **Saweria** yang menonjolkan elemen grafis berani, kontras tinggi, dan kesan "playful" namun tetap fungsional.

### Core Principles:
- **High Contrast:** Penggunaan garis tepi (border) hitam yang tebal.
- **Hard Shadows:** Bayangan tajam tanpa blur (solid color) untuk memberikan efek kedalaman 2D yang unik.
- **Vibrant Palette:** Warna-warna pastel yang cerah dan "pop".
- **Typography:** Font Sans-Serif yang tebal (Bold) untuk hierarki informasi yang jelas.

---

## 2. Visual Identity (Branding)

### Color Palette:
- **Primary (Yellow):** `#FFD600` (Main background for cards/buttons)
- **Secondary (Mint):** `#A3E635` (Accent for success/available items)
- **Accent (Orange):** `#FB923C` (Used for "Hot" or "JDM" items)
- **Background:** `#FAF8F5` (Off-white agar tidak terlalu menyilaukan)
- **Stroke/Text:** `#000000` (Pure Black untuk border dan tulisan)

### Typography:
- **Headings:** `Montserrat` atau `Archivo Black` (Extra Bold)
- **Body:** `Inter` atau `Poppins` (Medium)

---

## 3. UI Components (Tailwind CSS Specs)

### A. The "Saweria" Card
Kartu produk diecast harus terlihat menonjol dengan efek bayangan kaku.
```html
<div class="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 rounded-xl">
  </div>