# BERIKUT adalah beberapa Setup Website Artikel Next.js + PostgreSQL + Prisma + SEO yang sudah saya lakukan sebelumnya sehingga anda sudah disiapkan Tech Stack yang siap pakai beberapa di antaranya:

## 1. Membuat Project Next.js [DONE]

```bash
npx create-next-app@latest web-artikel
```

Konfigurasi project:

```text
✔ TypeScript      Yes
✔ ESLint          Yes
✔ Tailwind CSS    Yes
✔ App Router      Yes
✔ src directory   Yes
✔ Import Alias    Yes (@/*)
```

# 2. Inisialisasi Shadcn UI [DONE]

```bash
npx shadcn@latest init
```

Install komponen dasar:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add textarea
npx shadcn@latest add tabs
npx shadcn@latest add sheet
npx shadcn@latest add badge
```

---

# 3. Install Prisma & PostgreSQL [DONE]

```bash
npm install prisma @prisma/client
```

Inisialisasi Prisma:

```bash
npx prisma init
```

Generate Prisma Client:

```bash
npx prisma generate
```

---

# 4. Authentication (Admin Login) [DONE]

```bash
npm install next-auth
```

---

# 5. Form Validation [DONE]

```bash
npm install zod react-hook-form @hookform/resolvers
```

---

# 6. Rich Text Editor (TipTap) [DONE]

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-text-align
```

---

# 7. Upload Gambar (Cloudinary) [DONE]

```bash
npm install cloudinary next-cloudinary
```

---

# 8. SEO [DONe]

### Sitemap

```bash
npm install next-sitemap
```

---

### Slug Generator

```bash
npm install slugify
```

---

### Reading Time

```bash
npm install reading-time
```

---

### HTML Sanitizer (Anti XSS)

```bash
npm install isomorphic-dompurify
```

---

### Table of Contents Generator

```bash
npm install cheerio
```

---

# 9. Security [DONE]

### Password Hashing

```bash
npm install bcryptjs
```

---

# 10. Utilities [DONE]

### Date Formatting

```bash
npm install date-fns
```

---

# 11. Analytics [DONE]

Google Analytics Support:

```bash
npm install @next/third-parties
```

---

# 12. Environment Validation

```bash
npm install dotenv
```

---

# 13. Optional: React Query

Jika nanti dashboard mulai kompleks:

```bash
npm install @tanstack/react-query
```

---

# 14. Optional: React Compiler

Jika menggunakan React Compiler:

```bash
npm install babel-plugin-react-compiler
```

---

# 15. Setup Database Neon

Buat akun di:

https://neon.tech

Lalu salin connection string ke:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

---

# 16. Jalankan Migration Pertama

```bash
npx prisma migrate dev --name init
```

Generate ulang Prisma Client:

```bash
npx prisma generate
```

---

# 17. Menjalankan Project

```bash
npm run dev
```

Akses:

```text
http://localhost:3000
```

---

# 18. Build Production Test

```bash
npm run build
npm run start
```

---

# 20. Ringkasan Tech Stack

| Kebutuhan       | Package               |
| --------------- | --------------------- |
| Database        | PostgreSQL (Neon)     |
| ORM             | Prisma                |
| Authentication  | NextAuth              |
| UI              | Shadcn UI             |
| Styling         | Tailwind CSS          |
| Editor Artikel  | TipTap                |
| Upload Gambar   | Cloudinary            |
| SEO             | next-sitemap          |
| Form Validation | Zod + React Hook Form |
| Password Hash   | bcryptjs              |
| Date Utility    | date-fns              |
| TOC Generator   | Cheerio               |
| Sanitizer       | DOMPurify             |
| Slug            | slugify               |
| Reading Time    | reading-time          |

---