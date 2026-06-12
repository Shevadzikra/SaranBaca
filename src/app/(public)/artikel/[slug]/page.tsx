import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { generateArticleMetadata, BASE_URL, SITE_NAME } from "@/lib/seo";
import { generateTableOfContents, addHeadingIds } from "@/lib/toc";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Clock, Eye, ChevronRight, Calendar } from "lucide-react";
import ArticleCard from "@/components/public/ArticleCard";
import ShareButtons from "@/components/public/ShareButtons";
import ReadingProgressBar from "@/components/public/ReadingProgressBar";
import ViewCounter from "@/components/public/ViewCounter";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      tags: true,
      author: { select: { name: true } },
    },
  });

  if (!article) return { title: "Artikel Tidak Ditemukan" };

  return generateArticleMetadata({
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    slug: article.slug,
    image: article.featuredImage,
    imageAlt: article.featuredImageAlt,
    publishedTime: article.publishedAt?.toISOString(),
    modifiedTime: article.updatedAt.toISOString(),
    authors: [article.author.name],
    section: article.category?.name,
    tags: article.tags.map((t) => t.name),
    noIndex: article.noIndex,
    canonicalUrl: article.canonicalUrl,
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      tags: true,
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
          bio: true,
          jobTitle: true,
        },
      },
      faqs: { orderBy: { order: "asc" } },
    },
  });

  if (!article) notFound();

  const toc = generateTableOfContents(article.content);
  const contentWithIds = addHeadingIds(article.content);

  // Related articles
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: article.id },
      OR: [
        { categoryId: article.categoryId || undefined },
        { tags: { some: { id: { in: article.tags.map((t) => t.id) } } } },
      ],
    },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  // JSON-LD Structured Data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": article.schemaType || "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage || undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name,
      url: `${BASE_URL}/author/${article.author.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/artikel/${article.slug}`,
    },
    wordCount: article.content.replace(/<[^>]*>/g, "").split(/\s+/).length,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: BASE_URL },
      ...(article.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: article.category.name,
              item: `${BASE_URL}/kategori/${article.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: article.category ? 3 : 2,
        name: article.title,
      },
    ],
  };

  const faqJsonLd =
    article.faqs.length > 0
      ? {
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
        }
      : null;

  return (
    <>
      <ReadingProgressBar />
      <ViewCounter articleId={article.id} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 py-6 overflow-x-auto">
          <Link href="/" className="hover:text-emerald-600 transition-colors shrink-0">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          {article.category && (
            <>
              <Link
                href={`/kategori/${article.category.slug}`}
                className="hover:text-emerald-600 transition-colors shrink-0"
              >
                {article.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </>
          )}
          <span className="text-gray-600 truncate">{article.title}</span>
        </nav>

        {/* Header */}
        <header className="max-w-3xl mb-8">
          {article.category && (
            <Link
              href={`/kategori/${article.category.slug}`}
              className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 mb-4 hover:bg-emerald-100 transition-colors"
            >
              {article.category.name}
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
            {article.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-6">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {/* Author */}
            <Link
              href={`/author/${article.author.slug}`}
              className="flex items-center gap-2 hover:text-gray-600 transition-colors"
            >
              {article.author.avatar ? (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-medium">
                  {article.author.name[0]}
                </div>
              )}
              <span className="font-medium text-gray-700">
                {article.author.name}
              </span>
            </Link>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(article.publishedAt), "dd MMMM yyyy", {
                  locale: idLocale,
                })}
              </span>
            )}
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            {article.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readingTime} menit baca
              </span>
            )}
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.viewCount.toLocaleString("id-ID")} views
            </span>
          </div>
        </header>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden mb-10">
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex gap-10">
          {/* Table of Contents - Desktop Sidebar */}
          {toc.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                  Daftar Isi
                </h4>
                <nav className="space-y-2 border-l-2 border-gray-100 pl-4">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm transition-colors hover:text-emerald-600 ${
                        item.level === 3
                          ? "pl-4 text-gray-400"
                          : "text-gray-500 font-medium"
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <div
              className="prose-article"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {/* FAQ Section */}
            {article.faqs.length > 0 && (
              <section className="mt-8 pt-8 border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Pertanyaan Umum (FAQ)
                </h2>
                <div className="space-y-3">
                  {article.faqs.map((faq) => (
                    <details
                      key={faq.id}
                      className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
                    >
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors">
                        {faq.question}
                        <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
                {article.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Bagikan Artikel
              </h4>
              <ShareButtons
                url={`${BASE_URL}/artikel/${article.slug}`}
                title={article.title}
              />
            </div>

            {/* Author Card */}
            <div className="mt-12 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-start gap-4">
                {article.author.avatar ? (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={56}
                    height={56}
                    className="rounded-full shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg font-semibold shrink-0">
                    {article.author.name[0]}
                  </div>
                )}
                <div>
                  <Link
                    href={`/author/${article.author.slug}`}
                    className="text-base font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                  >
                    {article.author.name}
                  </Link>
                  {article.author.jobTitle && (
                    <p className="text-sm text-emerald-600 mt-0.5">
                      {article.author.jobTitle}
                    </p>
                  )}
                  {article.author.bio && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                      {article.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Artikel Terkait
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
