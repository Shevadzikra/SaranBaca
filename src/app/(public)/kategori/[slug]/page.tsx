import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ArticleCard from "@/components/public/ArticleCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_NAME, BASE_URL } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) return { title: "Kategori Tidak Ditemukan" };

  return {
    title: category.metaTitle || `${category.name} — ${SITE_NAME}`,
    description: category.metaDescription || category.description || `Artikel tentang ${category.name} di ${SITE_NAME}`,
    openGraph: {
      title: `${category.name} — ${SITE_NAME}`,
      description: category.description || `Artikel tentang ${category.name}`,
      url: `${BASE_URL}/kategori/${category.slug}`,
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${BASE_URL}/kategori/${category.slug}`,
    },
  };
}

export default async function KategoriPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", categoryId: category.id },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 py-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-lg text-gray-500 max-w-2xl">{category.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-2">{articles.length} artikel</p>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl mb-16">
          <p className="text-gray-400 text-lg">
            Belum ada artikel di kategori ini
          </p>
        </div>
      )}
    </div>
  );
}
