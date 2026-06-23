import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateReadingTime } from "@/lib/reading-time";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      tags: true,
      author: { select: { id: true, name: true, slug: true, avatar: true, bio: true, jobTitle: true } },
      faqs: { orderBy: { order: "asc" } },
    },
  });

  if (!article) {
    return NextResponse.json(
      { error: "Artikel tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json(article);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const readingTime = calculateReadingTime(body.content || "");

    // Determine publishedAt
    const existing = await prisma.article.findUnique({ where: { id } });
    let publishedAt = existing?.publishedAt;
    if (body.status === "PUBLISHED" && !existing?.publishedAt) {
      publishedAt = new Date();
    } else if (body.status === "DRAFT") {
      publishedAt = null;
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        featuredImage: body.featuredImage || null,
        featuredImageAlt: body.featuredImageAlt || null,
        featuredImageCaption: body.featuredImageCaption || null,
        status: body.status || "DRAFT",
        publishedAt,
        categoryId: body.categoryId || null,
        readingTime,
        // SEO
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        canonicalUrl: body.canonicalUrl || null,
        noIndex: body.noIndex || false,
        focusKeyword: body.focusKeyword || null,
        schemaType: body.schemaType || "Article",
        // Tags — disconnect all then reconnect
        tags: {
          set: [],
          connect: body.tagIds?.map((tagId: string) => ({ id: tagId })) || [],
        },
        // Related Articles — disconnect all then reconnect
        relatedTo: {
          set: [],
          connect: body.relatedArticleIds?.map((id: string) => ({ id })) || [],
        },
      },
      include: {
        category: true,
        tags: true,
        relatedTo: { select: { id: true, title: true, slug: true } },
        author: { select: { id: true, name: true, slug: true } },
      },
    });

    // Update FAQs — delete all then recreate
    await prisma.fAQ.deleteMany({ where: { articleId: id } });
    if (body.faqs?.length) {
      await prisma.fAQ.createMany({
        data: body.faqs.map(
          (faq: { question: string; answer: string }, index: number) => ({
            question: faq.question,
            answer: faq.answer,
            order: index,
            articleId: id,
          })
        ),
      });
    }

    // Revalidate sitemap and public pages when article is updated
    revalidatePath("/sitemap.xml");
    revalidatePath("/");
    revalidatePath(`/artikel/${article.slug}`);

    return NextResponse.json(article);
  } catch (error) {
    console.error("Update article error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate artikel" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.article.delete({ where: { id } });

    // Revalidate sitemap and homepage when article is deleted
    revalidatePath("/sitemap.xml");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete article error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus artikel" },
      { status: 500 }
    );
  }
}
