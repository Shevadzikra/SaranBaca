import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ArticleCard from "@/components/public/ArticleCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_NAME, BASE_URL } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const tags = await prisma.tag.findMany({ select: { slug: true } });
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });

  if (!tag) return { title: "Tag Tidak Ditemukan" };

  return {
    title: `Tag: ${tag.name} — ${SITE_NAME}`,
    description: `Artikel dengan tag ${tag.name} di ${SITE_NAME}`,
    openGraph: {
      title: `Tag: ${tag.name} — ${SITE_NAME}`,
      url: `${BASE_URL}/tag/${tag.slug}`,
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: `${BASE_URL}/tag/${tag.slug}`,
    },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { status: "PUBLISHED" },
        include: { category: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!tag) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 py-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600">#{tag.name}</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          #{tag.name}
        </h1>
        <p className="text-sm text-gray-400">{tag.articles.length} artikel</p>
      </div>

      {tag.articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {tag.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl mb-16">
          <p className="text-gray-400 text-lg">Belum ada artikel dengan tag ini</p>
        </div>
      )}
    </div>
  );
}
