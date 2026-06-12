import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  // Simple auth check via header
  const authHeader = request.headers.get("x-seed-key");
  if (authHeader !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    return NextResponse.json({
      success: true,
      admin: admin.email,
      categories: categories.length,
      tags: tags.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
