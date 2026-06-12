// Seed script for SaranBaca database
// Run with: node prisma/seed.mjs

import bcrypt from "bcryptjs";

// Direct PostgreSQL connection via Prisma
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Use dynamic import for the generated Prisma client
const { PrismaClient } = await import("../src/generated/prisma/client.ts");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password: admin<123>admin[wasd]
  const hashedPassword = await bcrypt.hash("admin<123>admin[wasd]", 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Admin SaranBaca",
      slug: "admin-saranbaca",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
      bio: "Pengelola dan penulis utama di SaranBaca. Menghadirkan artikel berkualitas dan rekomendasi bacaan terbaik untuk pembaca Indonesia.",
      jobTitle: "Content Manager",
      expertise: ["Content Writing", "SEO", "Digital Marketing"],
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);

  // Create categories
  const categories = [
    {
      name: "Teknologi",
      slug: "teknologi",
      description:
        "Artikel seputar perkembangan teknologi terkini, gadget, software, dan inovasi digital.",
    },
    {
      name: "Bisnis",
      slug: "bisnis",
      description:
        "Tips bisnis, entrepreneurship, strategi pemasaran, dan perkembangan dunia usaha.",
    },
    {
      name: "Gaya Hidup",
      slug: "gaya-hidup",
      description:
        "Artikel tentang gaya hidup sehat, produktivitas, hobi, dan keseimbangan hidup.",
    },
    {
      name: "Pendidikan",
      slug: "pendidikan",
      description:
        "Informasi seputar dunia pendidikan, tips belajar, dan pengembangan diri.",
    },
    {
      name: "Kesehatan",
      slug: "kesehatan",
      description:
        "Artikel tentang kesehatan, nutrisi, olahraga, dan kesejahteraan mental.",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log(`✅ ${categories.length} categories created`);

  // Create some tags
  const tags = [
    { name: "Tips & Trik", slug: "tips-trik" },
    { name: "Tutorial", slug: "tutorial" },
    { name: "Review", slug: "review" },
    { name: "Opini", slug: "opini" },
    { name: "Berita", slug: "berita" },
    { name: "Panduan", slug: "panduan" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log(`✅ ${tags.length} tags created`);
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
