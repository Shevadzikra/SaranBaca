import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";

export default async function EditArtikelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      tags: true,
      faqs: { orderBy: { order: "asc" } },
    },
  });

  if (!article) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Artikel</h1>
        <p className="text-slate-400 mt-1">Ubah konten artikel yang sudah ada</p>
      </div>
      <ArticleForm
        mode="edit"
        initialData={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          featuredImage: article.featuredImage,
          featuredImageAlt: article.featuredImageAlt,
          status: article.status,
          categoryId: article.categoryId,
          tagIds: article.tags.map((t) => t.id),
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          canonicalUrl: article.canonicalUrl,
          noIndex: article.noIndex,
          focusKeyword: article.focusKeyword,
          schemaType: article.schemaType,
          faqs: article.faqs.map((f) => ({
            question: f.question,
            answer: f.answer,
          })),
        }}
      />
    </div>
  );
}
