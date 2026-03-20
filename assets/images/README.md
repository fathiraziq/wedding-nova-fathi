# Panduan Foto — Wedding Invitation

Undangan ini dioptimasi untuk **mobile-first**. Pastikan semua foto dikompresi sebelum digunakan agar loading cepat, terutama di jaringan 4G/3G.

---

## Struktur Folder

```
assets/images/
├── hero/         → Foto couple utama (card besar)
├── couple/       → Foto mempelai pria & wanita
├── gallery/      → Foto galeri (9 foto)
└── README.md     → File ini
```

---

## Spesifikasi Foto

### Cover (Foto Background — Halaman Buka Undangan)
| Item           | Nilai                          |
|----------------|--------------------------------|
| File           | `hero/cover.jpg`               |
| Orientasi      | Portrait (wajib)               |
| Rasio          | **9:16**                       |
| Resolusi       | 1080 × 1920 px                 |
| Maks ukuran    | **300 KB**                     |
| Format         | `.jpg` atau `.webp`            |
| Catatan        | Full body / setengah badan, wajah di **bagian atas 40%** foto agar tidak tertutup teks. Background agak gelap lebih baik. Saat ini menggunakan `cover-placeholder.svg`. |

### Hero (Foto Couple Utama)
| Item           | Nilai                          |
|----------------|--------------------------------|
| File           | `hero/couple.jpg`              |
| Orientasi      | Portrait                       |
| Rasio          | **4:5**                        |
| Resolusi       | 800 × 1000 px                  |
| Maks ukuran    | **250 KB**                     |
| Format         | `.jpg` atau `.webp`            |
| Catatan        | Foto berdua, crop close-up, wajah jelas |

### Mempelai (Foto Individual)
| Item           | Nilai                          |
|----------------|--------------------------------|
| File           | `couple/groom.jpg`, `couple/bride.jpg` |
| Orientasi      | Portrait                       |
| Rasio          | **4:5**                        |
| Resolusi       | 600 × 750 px                   |
| Maks ukuran    | **150 KB** per foto            |
| Format         | `.jpg` atau `.webp`            |
| Catatan        | Crop setengah badan ke atas, background bersih |

### Gallery (9 Foto)
| Item           | Nilai                          |
|----------------|--------------------------------|
| File           | `gallery/01.jpg` s/d `gallery/09.jpg` |
| Orientasi      | Lihat tabel di bawah           |
| Maks ukuran    | **150 KB** per foto            |
| Format         | `.jpg` atau `.webp`            |

**Layout gallery:**

| Foto   | Posisi         | Orientasi  | Rasio   | Resolusi          |
|--------|----------------|------------|---------|-------------------|
| 01     | Kiri (besar)   | Portrait   | 1:2     | 600 × 1200 px    |
| 02     | Kanan atas     | Kotak      | 1:1     | 600 × 600 px     |
| 03     | Kanan bawah    | Kotak      | 1:1     | 600 × 600 px     |
| 04     | Kiri atas      | Kotak      | 1:1     | 600 × 600 px     |
| 05     | Kanan (besar)  | Portrait   | 1:2     | 600 × 1200 px    |
| 06     | Kiri bawah     | Kotak      | 1:1     | 600 × 600 px     |
| 07     | Kiri (besar)   | Portrait   | 1:2     | 600 × 1200 px    |
| 08     | Kanan atas     | Kotak      | 1:1     | 600 × 600 px     |
| 09     | Kanan bawah    | Kotak      | 1:1     | 600 × 600 px     |

---

## Tips Kompresi

1. **Total semua foto** sebaiknya tidak lebih dari **1.5 MB** (ideal < 1 MB)
2. Gunakan tools gratis:
   - [TinyPNG](https://tinypng.com) — kompresi JPG/PNG online
   - [Squoosh](https://squoosh.app) — konversi ke WebP + kompresi
   - [iLoveIMG](https://www.iloveimg.com/compress-image) — batch compress
3. **Format WebP** lebih ringan 25-35% dari JPG dengan kualitas sama
4. Quality setting: **75-85%** sudah cukup untuk mobile
5. Hindari foto langsung dari kamera (biasanya 3-8 MB per foto!)

---

## Cara Pasang Foto

Setelah foto disiapkan, buka `index.html` dan ganti placeholder SVG dengan tag `<img>`:

```html
<!-- Contoh: Hero -->
<img src="assets/images/hero/couple.jpg" alt="Nova & Fathi" style="width:100%;height:100%;object-fit:cover;">

<!-- Contoh: Mempelai Pria -->
<img src="assets/images/couple/groom.jpg" alt="Fathi" style="width:100%;height:100%;object-fit:cover;">

<!-- Contoh: Gallery -->
<img src="assets/images/gallery/01.jpg" alt="Foto 01" style="width:100%;height:100%;object-fit:cover;">
```

Cari komentar `<!-- Replace with actual photo -->` atau `<!-- Ganti dengan -->` di HTML untuk menemukan lokasi penggantian.
