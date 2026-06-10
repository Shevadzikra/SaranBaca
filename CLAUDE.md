@AGENTS.md

# 🗞️ Prompt: Bangun Website Artikel Lengkap dengan Admin Panel (Next.js) + Full SEO, saya menyediakan file SETUP.md sebagai gambaran apa saja yang sudah saya install untuk Tech Stack yang bisa anda manfaatkan. Saya melabeli tiap poin dengan [DONE] sebagai tanda bahwa saya sudah melakukan installasi dan inisiasi di langkah tersebut.

---

## 🎯 Tujuan Proyek

Buat website artikel modern berbasis **Next.js (App Router)** yang dilengkapi:
- Halaman publik untuk membaca artikel (SEO-friendly)
- Halaman admin CRUD artikel (Create, Read, Update, Delete)
- Optimasi SEO teknis penuh agar mudah diindeks dan dijangkau pengguna di mesin pencari

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database:** PostgreSQL (via Prisma ORM) MENGGUNAKAN NEON
- **Auth Admin:** NextAuth.js (session-based, hanya untuk admin)
- **Editor Artikel:** TipTap
- **Styling:** Tailwind CSS
- **Image Upload:** Cloudinary
- **Slug Generator:** Otomatis dari judul artikel
- **Sitemap & SEO:** next-sitemap atau built-in Next.js metadata API
- **Deployment:** Vercel (rekomendasi)

---

## 📁 Struktur Folder

```
/app
  /(public)
    /page.tsx                    → Homepage (daftar artikel terbaru)
    /artikel/[slug]/page.tsx     → Halaman detail artikel
    /kategori/[slug]/page.tsx    → Halaman artikel per kategori
    /tag/[slug]/page.tsx         → Halaman artikel per tag
    /author/[slug]/page.tsx      → Halaman profil author (E-E-A-T)
    /sitemap.xml/route.ts        → Dynamic sitemap
    /robots.txt/route.ts         → Robots.txt
    /og/route.tsx                → Auto-generate OG Image (next/og)
  /(admin)
    /admin/login/page.tsx        → Halaman login admin
    /admin/dashboard/page.tsx    → Dashboard ringkasan
    /admin/artikel/page.tsx      → Daftar semua artikel
    /admin/artikel/baru/page.tsx → Form tambah artikel baru
    /admin/artikel/[id]/edit/page.tsx → Form edit artikel
    /admin/kategori/page.tsx     → Manajemen kategori
    /admin/media/page.tsx        → Manajemen gambar/media
    /admin/profil/page.tsx       → Edit profil author (bio, sosial, keahlian)

/components
  /public
    ArticleCard.tsx
    ArticleList.tsx
    ArticleFAQ.tsx
    AuthorCard.tsx
    Breadcrumb.tsx
    TableOfContents.tsx
    RelatedArticles.tsx
    ShareButtons.tsx
    Navbar.tsx
    Footer.tsx
  /admin
    ArticleForm.tsx
    RichTextEditor.tsx
    ImageUploader.tsx
    AdminSidebar.tsx

/lib
  prisma.ts / db.ts
  auth.ts
  seo.ts                         → Fungsi helper untuk metadata SEO
  slugify.ts

/prisma
  schema.prisma

/public
  /images
  robots.txt (fallback statis)
```

---

## 🗄️ Schema Database

### Tabel/Model: `Article`

```prisma
model Article {
  id              String    @id @default(cuid())
  title           String
  slug            String    @unique
  excerpt         String    // Deskripsi singkat (max 160 karakter, untuk meta description)
  content         String    // Konten HTML dari rich text editor
  featuredImage   String?   // URL gambar utama (Open Graph image)
  featuredImageAlt String?  // Alt text gambar utama (WAJIB untuk SEO & aksesibilitas)
  status          Status    @default(DRAFT) // DRAFT | PUBLISHED
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // SEO Fields
  metaTitle       String?   // Judul SEO kustom (max 60 karakter)
  metaDescription String?   // Deskripsi SEO kustom (max 160 karakter)
  canonicalUrl    String?   // Canonical URL kustom (opsional)
  noIndex         Boolean   @default(false) // noindex untuk halaman tertentu
  focusKeyword    String?   // Kata kunci utama

  // Schema.org / Structured Data
  schemaType      String?   @default("Article") // Article | NewsArticle | BlogPosting

  // Relasi
  categoryId      String?
  category        Category? @relation(fields: [categoryId], references: [id])
  tags            Tag[]     @relation("ArticleToTag")
  author          User      @relation(fields: [authorId], references: [id])
  authorId        String

  // Statistik
  viewCount       Int       @default(0)
  readingTime     Int?      // Estimasi menit membaca (auto-hitung)
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  metaTitle   String?
  metaDescription String?
  articles    Article[]
}

model Tag {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  articles Article[] @relation("ArticleToTag")
}

model User {
  id       String    @id @default(cuid())
  name     String
  email    String    @unique
  password String    // hashed
  role     Role      @default(ADMIN)
  articles Article[]
}

enum Status {
  DRAFT
  PUBLISHED
}

enum Role {
  ADMIN
  EDITOR
}
```

---

## 🌐 Fitur Halaman Publik

### 1. Homepage (`/`)
- Tampilkan daftar artikel terbaru (grid card) dengan pagination atau infinite scroll
- Filter cepat per kategori
- Section "Artikel Terpopuler" (berdasarkan `viewCount`)
- Breadcrumb tidak diperlukan di homepage

**SEO Homepage:**
```tsx
export const metadata: Metadata = {
  title: "Nama Website — Artikel Terkini Seputar [Topik]",
  description: "Deskripsi website max 160 karakter, mengandung kata kunci utama.",
  openGraph: {
    title: "...",
    description: "...",
    url: "https://domainanda.com",
    siteName: "Nama Website",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "...",
    description: "...",
    images: ["/og-default.jpg"],
  },
  alternates: {
    canonical: "https://domainanda.com",
  },
};
```

---

### 2. Halaman Detail Artikel (`/artikel/[slug]`)

**Komponen yang harus ada:**
- Judul artikel (`<h1>`)
- Breadcrumb navigasi (Home > Kategori > Judul Artikel)
- Featured image dengan `alt` text yang terisi
- Info penulis, tanggal publish, estimasi waktu baca
- Konten artikel (HTML dari editor, pastikan heading pakai `h2`, `h3` — bukan `h1`)
- Table of Contents (daftar isi otomatis dari heading dalam konten)
- Share buttons (WhatsApp, Twitter/X, Facebook, Copy Link)
- Artikel terkait (berdasarkan kategori/tag yang sama)
- Auto-increment `viewCount` saat artikel dibuka (server action atau API route)

**SEO Detail Artikel — generateMetadata:**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt;
  const imageUrl = article.featuredImage || "/og-default.jpg";

  return {
    title: `${title} — Nama Website`,
    description,
    keywords: article.focusKeyword,
    authors: [{ name: article.author.name }],
    openGraph: {
      title,
      description,
      url: `https://domainanda.com/artikel/${article.slug}`,
      siteName: "Nama Website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.featuredImageAlt || title,
        },
      ],
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author.name],
      section: article.category?.name,
      tags: article.tags.map((t) => t.name),
      locale: "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: article.canonicalUrl || `https://domainanda.com/artikel/${article.slug}`,
    },
    robots: article.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
```

**JSON-LD Structured Data (Schema.org) — wajib ada di halaman artikel:**
```tsx
// Di dalam komponen halaman artikel
const jsonLd = {
  "@context": "https://schema.org",
  "@type": article.schemaType || "Article",
  headline: article.title,
  description: article.excerpt,
  image: article.featuredImage,
  datePublished: article.publishedAt,
  dateModified: article.updatedAt,
  author: {
    "@type": "Person",
    name: article.author.name,
  },
  publisher: {
    "@type": "Organization",
    name: "Nama Website",
    logo: {
      "@type": "ImageObject",
      url: "https://domainanda.com/logo.png",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://domainanda.com/artikel/${article.slug}`,
  },
  keywords: article.tags.map((t) => t.name).join(", "),
  articleSection: article.category?.name,
  wordCount: article.content.split(" ").length,
};

// Render di JSX:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

---

### 3. Halaman Kategori (`/kategori/[slug]`)
- Daftar artikel dalam kategori tertentu (dengan pagination)
- Deskripsi kategori di bagian atas
- Breadcrumb: Home > Kategori > [Nama Kategori]
- `generateMetadata` dengan title dan description dari data kategori

### 4. Halaman Tag (`/tag/[slug]`)
- Daftar artikel berdasarkan tag
- Metadata SEO per tag

---

## 🔒 Panel Admin

### Login Admin (`/admin/login`)
- Form email + password
- Auth via NextAuth.js dengan Credentials Provider
- Redirect ke `/admin/dashboard` jika berhasil
- Halaman admin seluruhnya di-protect dengan middleware

**Middleware proteksi:**
```ts
// middleware.ts
export { default } from "next-auth/middleware";
export const config = { matcher: ["/admin/:path*"] };
```

---

### Dashboard Admin (`/admin/dashboard`)
- Statistik ringkas: Total artikel, total published, total draft, total views
- Daftar 5 artikel terbaru
- Quick action: "Tulis Artikel Baru"

---

### CRUD Artikel Admin

#### Daftar Artikel (`/admin/artikel`)
- Tabel artikel: Judul, Kategori, Status, Tanggal, Views, Aksi (Edit/Hapus)
- Filter: Status (All/Published/Draft), Kategori, Pencarian judul
- Pagination server-side
- Tombol bulk delete (opsional)

#### Form Artikel — Tambah & Edit

Form artikel harus memiliki field berikut:

**Tab Konten:**
- [ ] `Judul Artikel` — input text (max 60-70 kata ideal)
- [ ] `Slug` — auto-generate dari judul, bisa diedit manual
- [ ] `Excerpt / Ringkasan` — textarea (max 160 karakter, tampilkan counter)
- [ ] `Konten` — Rich Text Editor (TipTap/Quill) dengan toolbar: Bold, Italic, Heading H2/H3, List, Link, Blockquote, Code Block, Image
- [ ] `Featured Image` — upload gambar (preview langsung)
- [ ] `Alt Text Gambar Utama` — input text (wajib diisi sebelum publish)
- [ ] `Kategori` — dropdown select
- [ ] `Tag` — multi-select / tag input
- [ ] `Status` — toggle: Draft / Published
- [ ] `Tanggal Publish` — date picker (bisa dijadwalkan)

**Tab SEO (Panel Terpisah):**
- [ ] `Focus Keyword` — kata kunci utama artikel
- [ ] `Meta Title` — input text, tampilkan counter (max 60 karakter), preview live
- [ ] `Meta Description` — textarea, tampilkan counter (max 160 karakter), preview live
- [ ] `Canonical URL` — input URL (opsional, untuk artikel sindikasi)
- [ ] `No Index` — toggle (centang jika halaman tidak ingin diindeks Google)
- [ ] `Schema Type` — dropdown: Article / NewsArticle / BlogPosting
- [ ] **Live SERP Preview** — tampilkan simulasi tampilan di Google:
  ```
  domainanda.com › artikel › slug-artikel
  Meta Title (maks 60 karakter)
  Meta Description (maks 160 karakter)...
  ```

**SEO Checklist Otomatis (tampil di sidebar form):**
- ✅ Judul mengandung focus keyword
- ✅ Meta description mengandung focus keyword
- ✅ Slug mengandung focus keyword
- ✅ Alt text gambar utama terisi
- ✅ Konten minimal 300 kata
- ✅ Ada minimal satu internal link di konten
- ✅ Ada subheading H2 di konten
- ⚠️ Meta description terlalu panjang (jika > 160 karakter)
- ⚠️ Meta title terlalu panjang (jika > 60 karakter)

---

## 🔍 SEO Teknis — Wajib Diimplementasikan

### 1. Sitemap Dinamis (`/sitemap.xml`)

```ts
// app/sitemap.ts
import { getAllPublishedArticles } from "@/lib/article";

export default async function sitemap() {
  const articles = await getAllPublishedArticles();

  const articleUrls = articles.map((a) => ({
    url: `https://domainanda.com/artikel/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://domainanda.com",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    ...articleUrls,
  ];
}
```

---

### 2. Robots.txt (`/robots.txt`)

```ts
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: "https://domainanda.com/sitemap.xml",
  };
}
```

---

### 3. Next.js Metadata Defaults (`layout.tsx`)

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://domainanda.com"),
  title: {
    default: "Nama Website",
    template: "%s — Nama Website",
  },
  description: "Deskripsi default website.",
  openGraph: {
    siteName: "Nama Website",
    locale: "id_ID",
    type: "website",
  },
  verification: {
    google: "GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

---

### 4. Canonical URL

Setiap halaman **wajib** memiliki canonical URL untuk mencegah duplicate content:
- Homepage: `https://domainanda.com/`
- Artikel: `https://domainanda.com/artikel/[slug]`
- Kategori: `https://domainanda.com/kategori/[slug]`
- Pagination: halaman 2+ gunakan canonical ke halaman utama atau self-referencing dengan `rel="prev"` / `rel="next"`

---

### 5. Pagination SEO-friendly

Gunakan URL parameter: `/artikel?page=2` atau `/kategori/teknologi?page=2`  
Tambahkan `rel="prev"` dan `rel="next"` di `<head>`:

```tsx
alternates: {
  canonical: `https://domainanda.com/artikel?page=${currentPage}`,
}
// Dan tambahkan link prev/next secara manual di head jika perlu
```

---

### 6. Image Optimization

- Selalu gunakan komponen `<Image>` dari `next/image` (bukan `<img>`)
- Wajib isi `alt` prop setiap gambar
- Gunakan format WebP atau AVIF
- Ukuran gambar featured image: 1200x630px (ratio Open Graph)
- Tambahkan `priority` prop pada featured image di atas fold

```tsx
<Image
  src={article.featuredImage}
  alt={article.featuredImageAlt}
  width={1200}
  height={630}
  priority
  className="w-full h-auto rounded-lg"
/>
```

---

### 7. Core Web Vitals — Optimasi

- **LCP (Largest Contentful Paint):** Tambahkan `priority` pada featured image, gunakan `preload` untuk font
- **CLS (Cumulative Layout Shift):** Selalu set `width` dan `height` pada `<Image>`, hindari skeleton yang menggeser layout
- **FID/INP (Interaction):** Hindari JavaScript berat di client, gunakan Server Components sebanyak mungkin

---

### 8. Breadcrumb dengan Schema.org

```tsx
// BreadcrumbList JSON-LD
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://domainanda.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: article.category?.name,
      item: `https://domainanda.com/kategori/${article.category?.slug}`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: article.title,
      item: `https://domainanda.com/artikel/${article.slug}`,
    },
  ],
};
```

---

### 9. Internal Linking

- Setiap artikel wajib ada minimal **2-3 link ke artikel lain** di konten (bisa manual melalui editor atau otomatis dari "Artikel Terkait")
- Komponen `RelatedArticles` tampilkan 3-5 artikel berdasarkan kategori/tag yang sama
- Navbar dan Footer berisi link ke semua halaman kategori utama

---

### 10. Performance & Teknis Lainnya

- Aktifkan **Static Generation** (`generateStaticParams`) untuk halaman artikel yang sudah published:
  ```tsx
  export async function generateStaticParams() {
    const articles = await getAllPublishedSlugs();
    return articles.map((a) => ({ slug: a.slug }));
  }
  ```
- Gunakan **Incremental Static Regeneration (ISR)** untuk menjaga konten tetap fresh:
  ```tsx
  export const revalidate = 3600; // Revalidasi setiap 1 jam
  ```
- Pastikan website **mobile-responsive** (Google menggunakan mobile-first indexing)
- Aktifkan **HTTPS** (wajib di Vercel)
- Tambahkan **`lang="id"`** di tag `<html>` jika konten berbahasa Indonesia:
  ```tsx
  // app/layout.tsx
  <html lang="id">
  ```
- **Hreflang** (jika ada versi multi-bahasa di masa depan):
  ```tsx
  alternates: { languages: { "id": "/id", "en": "/en" } }
  ```

---

### 11. FAQ Schema Builder (FAQPage Structured Data)

Setiap artikel dapat dilengkapi blok FAQ yang secara otomatis menghasilkan JSON-LD `FAQPage`. Ini meningkatkan peluang artikel muncul sebagai **Rich Result** di Google (accordion FAQ langsung di SERP).

#### Database — Tambah model `FAQ`

```prisma
model FAQ {
  id        String  @id @default(cuid())
  question  String
  answer    String  // Bisa berisi HTML sederhana
  order     Int     @default(0) // Urutan tampil
  articleId String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
}

// Tambahkan relasi di model Article:
// faqs   FAQ[]
```

#### Admin — Form FAQ di halaman edit artikel

Tambahkan panel **"FAQ"** di bawah rich text editor:
- Tombol **"+ Tambah Pertanyaan"**
- Setiap FAQ item memiliki:
  - [ ] `Pertanyaan` — input text
  - [ ] `Jawaban` — textarea (boleh HTML singkat: `<strong>`, `<a>`, `<ul>`)
  - [ ] Tombol hapus & drag-to-reorder
- Maksimal 10 FAQ per artikel (lebih dari itu tidak direkomendasikan Google)

#### Render FAQ di halaman artikel (publik)

```tsx
// components/public/ArticleFAQ.tsx
export function ArticleFAQ({ faqs }: { faqs: FAQ[] }) {
  if (!faqs.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">Pertanyaan yang Sering Diajukan</h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <details key={faq.id} className="border rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">{faq.question}</summary>
            <div
              className="mt-2 text-gray-700"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </details>
        ))}
      </div>
    </section>
  );
}
```

#### JSON-LD FAQPage — otomatis dari data FAQ

Tambahkan di halaman artikel, **setelah** Article JSON-LD yang sudah ada:

```tsx
// Di dalam komponen halaman artikel, setelah jsonLd Article
{article.faqs?.length > 0 && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }),
    }}
  />
)}
```

> **Catatan:** Google hanya menampilkan FAQ Rich Result jika jawaban bersifat informatif dan tidak promosional. Pastikan setiap jawaban minimal 1 kalimat lengkap.

---

### 12. Auto Generate OG Image

Gunakan **Next.js ImageResponse** (`next/og`) untuk membuat gambar Open Graph secara otomatis berdasarkan data artikel — tanpa perlu upload gambar OG secara manual.

#### Buat route OG Image dinamis

```ts
// app/og/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") ?? "Artikel Terbaru";
  const category = searchParams.get("category") ?? "";
  const author = searchParams.get("author") ?? "Admin";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo / Nama Website */}
        <div style={{ color: "#94a3b8", fontSize: "20px", marginBottom: "16px" }}>
          domainanda.com
        </div>

        {/* Badge Kategori */}
        {category && (
          <div
            style={{
              background: "#3b82f6",
              color: "white",
              padding: "6px 16px",
              borderRadius: "999px",
              fontSize: "16px",
              width: "fit-content",
              marginBottom: "20px",
            }}
          >
            {category}
          </div>
        )}

        {/* Judul Artikel */}
        <div
          style={{
            color: "white",
            fontSize: title.length > 60 ? "40px" : "52px",
            fontWeight: "bold",
            lineHeight: 1.2,
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Author */}
        <div style={{ color: "#94a3b8", fontSize: "18px", marginTop: "24px" }}>
          Oleh {author}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

#### Integrasi ke generateMetadata artikel

Ubah `imageUrl` di `generateMetadata` agar menggunakan OG Image otomatis jika artikel tidak memiliki featured image:

```tsx
// Di dalam generateMetadata halaman artikel
const ogImageUrl = article.featuredImage
  ? article.featuredImage
  : `https://domainanda.com/og?title=${encodeURIComponent(article.metaTitle || article.title)}&category=${encodeURIComponent(article.category?.name ?? "")}&author=${encodeURIComponent(article.author.name)}`;

// Gunakan ogImageUrl menggantikan imageUrl di openGraph.images dan twitter.images
openGraph: {
  images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
  ...
},
twitter: {
  images: [ogImageUrl],
  ...
},
```

#### Integrasi ke Author Page & Kategori

Buat OG Image otomatis juga untuk halaman author dan kategori dengan parameter berbeda:

```
/og?title=Artikel+oleh+%5BNama+Author%5D&category=Author
/og?title=Kategori%3A+%5BNama+Kategori%5D&category=Kategori
```

> **Tips:** Tambahkan parameter `?v=[updatedAt timestamp]` pada URL OG Image agar cache sosial media ter-refresh saat artikel diperbarui.

---

### 13. Author Page (E-E-A-T Google)

Halaman author adalah sinyal **E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)** yang sangat penting di mata Google, terutama untuk konten YMYL (kesehatan, keuangan, hukum, dll).

#### Database — Perluas model `User`

```prisma
model User {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique // Contoh: "budi-santoso"
  email       String    @unique
  password    String
  role        Role      @default(ADMIN)

  // Profil Author (E-E-A-T)
  bio         String?   // Biografi singkat (tampil di halaman author & di bawah artikel)
  avatar      String?   // URL foto profil
  jobTitle    String?   // Contoh: "Jurnalis Teknologi", "Dokter Umum"
  expertise   String[]  // Array bidang keahlian, contoh: ["AI", "Machine Learning"]

  // Social & Kredensial (sinyal kepercayaan)
  websiteUrl      String?
  twitterUrl      String?
  linkedinUrl     String?
  instagramUrl    String?
  googleScholarUrl String? // Untuk penulis akademis

  // Metadata SEO Author Page
  metaTitle       String?
  metaDescription String?

  articles    Article[]
}
```

#### Halaman Publik Author (`/author/[slug]`)

```
/app/(public)/author/[slug]/page.tsx
```

**Konten halaman author:**
- Foto profil (avatar) dengan nama lengkap (`<h1>`)
- Job title & badge keahlian
- Biografi penulis (min. 2-3 paragraf)
- Link sosial media & website
- Daftar semua artikel yang ditulis (dengan pagination)
- Statistik: total artikel, total views semua artikel

**generateMetadata Author Page:**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const author = await getAuthorBySlug(params.slug);
  const title = author.metaTitle || `${author.name} — Penulis di Nama Website`;
  const description =
    author.metaDescription ||
    `${author.bio?.slice(0, 155)}...` ||
    `Baca semua artikel yang ditulis oleh ${author.name} di Nama Website.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://domainanda.com/author/${author.slug}`,
      images: author.avatar
        ? [{ url: author.avatar, width: 400, height: 400, alt: author.name }]
        : undefined,
      type: "profile",
    },
    alternates: {
      canonical: `https://domainanda.com/author/${author.slug}`,
    },
  };
}
```

**JSON-LD `Person` Schema — wajib ada di halaman author:**
```tsx
const authorJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: author.name,
  url: `https://domainanda.com/author/${author.slug}`,
  image: author.avatar,
  jobTitle: author.jobTitle,
  description: author.bio,
  sameAs: [
    author.websiteUrl,
    author.twitterUrl,
    author.linkedinUrl,
    author.googleScholarUrl,
  ].filter(Boolean), // Hanya URL yang terisi
  knowsAbout: author.expertise,
  worksFor: {
    "@type": "Organization",
    name: "Nama Website",
    url: "https://domainanda.com",
  },
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }}
/>
```

#### Tambahkan Author Card di bawah setiap artikel

```tsx
// components/public/AuthorCard.tsx
// Tampilkan di bawah konten artikel, sebelum "Artikel Terkait"
export function AuthorCard({ author }) {
  return (
    <div className="flex gap-4 p-6 bg-gray-50 rounded-xl mt-10">
      <Image
        src={author.avatar || "/default-avatar.png"}
        alt={author.name}
        width={72}
        height={72}
        className="rounded-full"
      />
      <div>
        <p className="text-sm text-gray-500">Ditulis oleh</p>
        <a href={`/author/${author.slug}`} className="font-bold text-lg hover:underline">
          {author.name}
        </a>
        {author.jobTitle && (
          <p className="text-sm text-blue-600">{author.jobTitle}</p>
        )}
        {author.bio && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{author.bio}</p>
        )}
      </div>
    </div>
  );
}
```

#### Update JSON-LD Article — sertakan data author lengkap

Perbarui `author` di JSON-LD Article yang sudah ada agar menyertakan URL profil author:

```tsx
author: {
  "@type": "Person",
  name: article.author.name,
  url: `https://domainanda.com/author/${article.author.slug}`,
  image: article.author.avatar,
  jobTitle: article.author.jobTitle,
},
```

#### Admin — Halaman Manajemen Profil Author

Tambahkan halaman `/admin/profil` untuk author mengedit profilnya sendiri:
- [ ] Upload/ganti foto profil
- [ ] Edit bio, job title, bidang keahlian
- [ ] Isi link sosial media
- [ ] Edit meta title & meta description untuk halaman author

#### Update Sitemap — sertakan halaman author

```ts
// Di app/sitemap.ts, tambahkan:
const authors = await getAllAuthors();
const authorUrls = authors.map((a) => ({
  url: `https://domainanda.com/author/${a.slug}`,
  lastModified: a.updatedAt,
  changeFrequency: "monthly" as const,
  priority: 0.6,
}));

// Sertakan authorUrls di array return sitemap
```

> **Mengapa Author Page penting untuk E-E-A-T?**
> Google menilai kredibilitas konten berdasarkan siapa yang menulisnya. Author page yang lengkap dengan bio, keahlian, dan profil sosial memberi sinyal bahwa konten ditulis oleh seseorang yang benar-benar ahli di bidangnya — bukan konten anonim atau AI tanpa konteks.

---

## 📊 Fitur Tambahan WAJIB (SANGAT Direkomendasikan)

| Fitur | Kegunaan SEO |
|---|---|
| FAQ Schema Builder | Rich Result FAQ di SERP Google, meningkatkan CTR |
| Auto Generate OG Image | Setiap artikel punya gambar sosial media tanpa upload manual |
| Author Page + Person Schema | Sinyal E-E-A-T, membangun kredibilitas penulis |
| Reading Progress Bar | Meningkatkan engagement (dwell time) |
| Estimated Reading Time | UX lebih baik, user lebih lama di halaman |
| Related Articles | Internal linking otomatis |
| Table of Contents | Mempermudah navigasi, Google sering tampilkan sebagai sitelink |
| Share Buttons | Potensi backlink organik |
| Last Updated Date | Google lebih percaya konten yang diperbarui |
| View Count | Sosial proof, bisa jadi sinyal CTR |
| Search Internal (`/search?q=`) | Meningkatkan page per session |
| RSS Feed (`/feed.xml`) | Mudah di-crawl oleh agregator berita |

---

## ✅ Checklist Sebelum Deploy

- [ ] `metadataBase` diisi dengan domain production
- [ ] Google Search Console token verifikasi diisi
- [ ] Semua gambar menggunakan `<Image>` dengan `alt` yang bermakna
- [ ] Sitemap dapat diakses di `https://domainanda.com/sitemap.xml`
- [ ] Robots.txt dapat diakses dan tidak memblokir halaman publik
- [ ] JSON-LD structured data valid (cek dengan [Rich Results Test Google](https://search.google.com/test/rich-results))
- [ ] FAQ JSON-LD (`FAQPage`) muncul di Rich Results Test jika artikel memiliki FAQ
- [ ] OG Image auto-generate dapat diakses di `/og?title=Test`
- [ ] Halaman author tersedia dan JSON-LD `Person` schema terisi lengkap
- [ ] Author card muncul di bawah setiap artikel dengan link ke halaman author
- [ ] Sitemap menyertakan URL halaman author
- [ ] Open Graph gambar berukuran minimal 1200x630px
- [ ] Tidak ada halaman publik yang ter-set `noIndex: true` secara tidak sengaja
- [ ] Canonical URL benar di setiap halaman
- [ ] Mobile-responsive (cek dengan [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly))
- [ ] PageSpeed Insights score minimal 80 (mobile) ([cek di sini](https://pagespeed.web.dev/))
- [ ] Submit sitemap ke Google Search Console setelah deploy
- [ ] Register website di Google Search Console dan Bing Webmaster Tools

---

*Prompt ini dibuat untuk proyek website artikel Next.js dengan optimasi SEO penuh. Sesuaikan nama domain, nama website, dan topik konten dengan kebutuhan aktual proyek Anda.*
