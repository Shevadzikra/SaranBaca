import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateReadingTime } from "@/lib/reading-time";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status") as "DRAFT" | "PUBLISHED" | null;
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        tags: true,
        author: { select: { id: true, name: true, slug: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    articles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Get user ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(body.content || "");

    const article = await prisma.article.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        featuredImage: body.featuredImage || null,
        featuredImageAlt: body.featuredImageAlt || null,
        featuredImageCaption: body.featuredImageCaption || null,
        status: body.status || "DRAFT",
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
        categoryId: body.categoryId || null,
        authorId: user.id,
        readingTime,
        // SEO
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        canonicalUrl: body.canonicalUrl || null,
        noIndex: body.noIndex || false,
        focusKeyword: body.focusKeyword || null,
        schemaType: body.schemaType || "Article",
        // Tags
        tags: body.tagIds?.length
          ? { connect: body.tagIds.map((id: string) => ({ id })) }
          : undefined,
        // Related Articles (manual)
        relatedTo: body.relatedArticleIds?.length
          ? { connect: body.relatedArticleIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        category: true,
        tags: true,
        relatedTo: { select: { id: true, title: true, slug: true } },
        author: { select: { id: true, name: true, slug: true } },
      },
    });

    // Create FAQs if provided
    if (body.faqs?.length) {
      await prisma.fAQ.createMany({
        data: body.faqs.map(
          (faq: { question: string; answer: string }, index: number) => ({
            question: faq.question,
            answer: faq.answer,
            order: index,
            articleId: article.id,
          })
        ),
      });
    }

    // Revalidate sitemap and public pages when article is created
    revalidatePath("/sitemap.xml");
    revalidatePath("/");
    if (body.status === "PUBLISHED") {
      revalidatePath(`/artikel/${article.slug}`);
    }

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json(
      { error: "Gagal membuat artikel" },
      { status: 500 }
    );
  }
}
