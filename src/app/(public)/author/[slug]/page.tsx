import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import ArticleCard from "@/components/public/ArticleCard";
import { SITE_NAME, BASE_URL } from "@/lib/seo";
import { ChevronRight, Globe, Send, ExternalLink, Focus } from "lucide-react";

export const revalidate = 3600;

export async function generateStaticParams() {
  const users = await prisma.user.findMany({ select: { slug: true } });
  return users.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await prisma.user.findUnique({ where: { slug } });

  if (!author) return { title: "Author Tidak Ditemukan" };

  return {
    title: author.metaTitle || `${author.name} — ${SITE_NAME}`,
    description: author.metaDescription || author.bio || `Profil penulis ${author.name} di ${SITE_NAME}`,
    openGraph: {
      title: `${author.name} — ${SITE_NAME}`,
      description: author.bio || `Profil penulis ${author.name}`,
      url: `${BASE_URL}/author/${author.slug}`,
      siteName: SITE_NAME,
      images: author.avatar ? [{ url: author.avatar }] : undefined,
    },
    alternates: {
      canonical: `${BASE_URL}/author/${author.slug}`,
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const author = await prisma.user.findUnique({
    where: { slug },
  });

  if (!author) notFound();

  const articles = await prisma.article.findMany({
    where: { authorId: author.id, status: "PUBLISHED" },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0);

  // JSON-LD Person
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.jobTitle,
    description: author.bio,
    image: author.avatar,
    url: `${BASE_URL}/author/${author.slug}`,
    sameAs: [author.websiteUrl, author.twitterUrl, author.linkedinUrl, author.instagramUrl].filter(Boolean),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 py-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600">{author.name}</span>
      </nav>

      {/* Author Profile */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-10 mb-10">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt={author.name}
              width={120}
              height={120}
              className="rounded-2xl shrink-0"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-emerald-200 flex items-center justify-center text-emerald-800 text-4xl font-bold shrink-0">
              {author.name[0]}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {author.name}
            </h1>
            {author.jobTitle && (
              <p className="text-emerald-600 font-medium mb-3">
                {author.jobTitle}
              </p>
            )}
            {author.bio && (
              <p className="text-gray-600 leading-relaxed mb-4 max-w-2xl">
                {author.bio}
              </p>
            )}
            {author.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {author.expertise.map((exp) => (
                  <span
                    key={exp}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/80 text-emerald-700 border border-emerald-200"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              {author.websiteUrl && (
                <a href={author.websiteUrl} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/80 text-gray-500 hover:text-emerald-600 transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {author.instagramUrl && (
                <a href={author.instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/80 text-gray-500 hover:text-emerald-600 transition-colors">
                  <Focus className="w-4 h-4" />
                </a>
              )}
              {author.twitterUrl && (
                <a href={author.twitterUrl} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/80 text-gray-500 hover:text-sky-500 transition-colors">
                  <Send className="w-4 h-4" />
                </a>
              )}
              {author.linkedinUrl && (
                <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/80 text-gray-500 hover:text-blue-600 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          {/* Stats */}
          <div className="flex md:flex-col gap-6 md:gap-4 md:text-right">
            <div>
              <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
              <p className="text-xs text-gray-500">Artikel</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString("id-ID")}</p>
              <p className="text-xs text-gray-500">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Artikel oleh {author.name}
        </h2>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-400">Belum ada artikel</p>
          </div>
        )}
      </div>
    </div>
  );
}
