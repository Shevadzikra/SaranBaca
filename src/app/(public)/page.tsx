import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import ArticleCard from "@/components/public/ArticleCard";
import Link from "next/link";
import { BookOpen, TrendingUp, ArrowRight } from "lucide-react";
import { SITE_NAME, SITE_DESCRIPTION, BASE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Rekomendasi Bacaan Berkualitas`,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: `${SITE_NAME} — Rekomendasi Bacaan Berkualitas`,
    description: SITE_DESCRIPTION,
    url: BASE_URL,
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export const revalidate = 3600;

export default async function HomePage() {
  const [latestArticles, popularArticles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: 7,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { viewCount: "desc" },
      take: 4,
    }),
    prisma.category.findMany({
      include: { _count: { select: { articles: { where: { status: "PUBLISHED" } } } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const featuredArticle = latestArticles[0];
  const restArticles = latestArticles.slice(1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <section className="py-12 md:py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
          <BookOpen className="w-4 h-4" />
          Rekomendasi Bacaan Berkualitas
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-5">
          Temukan Artikel{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Terbaik
          </span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {SITE_DESCRIPTION}
        </p>
      </section>

      {/* Categories Quick Filter */}
      <section className="pb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href="/"
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-emerald-600 text-white shadow-sm"
          >
            Semua
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              {cat.name}
              <span className="ml-1.5 text-gray-400 text-xs">
                {cat._count.articles}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="pb-10">
          <ArticleCard article={featuredArticle} featured />
        </section>
      )}

      {/* Latest Articles */}
      <section className="pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Artikel Terbaru</h2>
        </div>
        {restArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Belum ada artikel. Segera hadir!
            </p>
          </div>
        )}
      </section>

      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <section className="pb-16">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-2xl font-bold text-gray-900">Paling Populer</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
