import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
      description: "Artikel seputar perkembangan teknologi terkini, gadget, software, dan inovasi digital.",
    },
    {
      name: "Bisnis",
      slug: "bisnis",
      description: "Tips bisnis, entrepreneurship, strategi pemasaran, dan perkembangan dunia usaha.",
    },
    {
      name: "Gaya Hidup",
      slug: "gaya-hidup",
      description: "Artikel tentang gaya hidup sehat, produktivitas, hobi, dan keseimbangan hidup.",
    },
    {
      name: "Pendidikan",
      slug: "pendidikan",
      description: "Informasi seputar dunia pendidikan, tips belajar, dan pengembangan diri.",
    },
    {
      name: "Kesehatan",
      slug: "kesehatan",
      description: "Artikel tentang kesehatan, nutrisi, olahraga, dan kesejahteraan mental.",
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

  // Create tag groups
  const tagGroupsData = [
    { name: "Bisnis", slug: "bisnis", order: 1 },
    { name: "Gaya Hidup", slug: "gaya-hidup", order: 2 },
    { name: "Kesehatan", slug: "kesehatan", order: 3 },
    { name: "Pendidikan", slug: "pendidikan", order: 4 },
    { name: "Teknologi", slug: "teknologi", order: 5 },
    { name: "Misc", slug: "misc", order: 99 },
  ];

  const tagGroups: Record<string, { id: string }> = {};

  for (const group of tagGroupsData) {
    const tg = await prisma.tagGroup.upsert({
      where: { slug: group.slug },
      update: { order: group.order },
      create: group,
    });
    tagGroups[group.name] = tg;
  }

  console.log(`✅ ${tagGroupsData.length} tag groups created`);

  // Create tags grouped by category
  const tagsByGroup: Record<string, { name: string; slug: string }[]> = {
    Bisnis: [
      { name: "Karier", slug: "karier" },
      { name: "Produktivitas", slug: "produktivitas" },
      { name: "Keuangan", slug: "keuangan" },
      { name: "Investasi", slug: "investasi" },
      { name: "Wirausaha", slug: "wirausaha" },
      { name: "UMKM", slug: "umkm" },
      { name: "Pemasaran", slug: "pemasaran" },
      { name: "Bisnis Online", slug: "bisnis-online" },
      { name: "Manajemen", slug: "manajemen" },
      { name: "Freelance", slug: "freelance" },
    ],
    "Gaya Hidup": [
      { name: "Pengembangan Diri", slug: "pengembangan-diri" },
      { name: "Kebiasaan Baik", slug: "kebiasaan-baik" },
      { name: "Mindfulness", slug: "mindfulness" },
      { name: "Motivasi", slug: "motivasi" },
      { name: "Manajemen Waktu", slug: "manajemen-waktu" },
      { name: "Minimalis", slug: "minimalis" },
      { name: "Hobi", slug: "hobi" },
      { name: "Travel", slug: "travel" },
      { name: "Keseimbangan Hidup", slug: "keseimbangan-hidup" },
      { name: "Rutinitas", slug: "rutinitas" },
    ],
    Kesehatan: [
      { name: "Diet", slug: "diet" },
      { name: "Nutrisi", slug: "nutrisi" },
      { name: "Olahraga", slug: "olahraga" },
      { name: "Kesehatan Mental", slug: "kesehatan-mental" },
      { name: "Tidur", slug: "tidur" },
      { name: "Makanan Sehat", slug: "makanan-sehat" },
      { name: "Kebugaran", slug: "kebugaran" },
      { name: "Vitamin", slug: "vitamin" },
      { name: "Hidup Sehat", slug: "hidup-sehat" },
      { name: "Manajemen Stres", slug: "manajemen-stres" },
    ],
    Pendidikan: [
      { name: "Belajar Efektif", slug: "belajar-efektif" },
      { name: "Produktivitas Belajar", slug: "produktivitas-belajar" },
      { name: "Mahasiswa", slug: "mahasiswa" },
      { name: "Pelajar", slug: "pelajar" },
      { name: "Beasiswa", slug: "beasiswa" },
      { name: "Literasi", slug: "literasi" },
      { name: "Skill", slug: "skill" },
      { name: "Bahasa Inggris", slug: "bahasa-inggris" },
      { name: "Ujian", slug: "ujian" },
      { name: "Belajar Mandiri", slug: "belajar-mandiri" },
    ],
    Teknologi: [
      { name: "AI", slug: "ai" },
      { name: "Kecerdasan Buatan", slug: "kecerdasan-buatan" },
      { name: "Aplikasi", slug: "aplikasi" },
      { name: "Gadget", slug: "gadget" },
      { name: "Software", slug: "software" },
      { name: "Internet", slug: "internet" },
      { name: "Keamanan Digital", slug: "keamanan-digital" },
      { name: "Media Sosial", slug: "media-sosial" },
      { name: "Coding", slug: "coding" },
      { name: "Produktivitas Digital", slug: "produktivitas-digital" },
    ],
    Misc: [
      { name: "Tips & Trik", slug: "tips-trik" },
      { name: "Tutorial", slug: "tutorial" },
      { name: "Review", slug: "review" },
      { name: "Opini", slug: "opini" },
      { name: "Berita", slug: "berita" },
      { name: "Panduan", slug: "panduan" },
    ],
  };

  let totalTags = 0;
  for (const [groupName, tags] of Object.entries(tagsByGroup)) {
    const groupId = tagGroups[groupName].id;
    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { slug: tag.slug },
        update: { tagGroupId: groupId },
        create: {
          name: tag.name,
          slug: tag.slug,
          tagGroupId: groupId,
        },
      });
      totalTags++;
    }
  }

  console.log(`✅ ${totalTags} tags created across ${Object.keys(tagsByGroup).length} groups`);
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
