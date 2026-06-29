import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getImages, searchMediaImages, deleteImage, updateImageContext } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") || "saranbaca";
  const nextCursor = searchParams.get("nextCursor") || undefined;
  const search = searchParams.get("search") || undefined;
  const format = searchParams.get("format") || undefined;
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  
  try {
    // Use advanced search when any filter/search/sort is active
    const hasFilters = search || format || sortOrder || dateFrom || dateTo;

    if (hasFilters) {
      const data = await searchMediaImages({
        query: search,
        folder,
        format,
        dateFrom,
        dateTo,
        sortOrder,
        maxResults: 30,
        nextCursor,
      });
      return NextResponse.json(data);
    }

    // Default: simple listing (no filters)
    const data = await getImages(folder, 10, nextCursor);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch media:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { publicId, alt, caption } = body;

    if (!publicId) {
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }

    // 1. Update Cloudinary contextual metadata
    await updateImageContext(publicId, alt || "", caption || "");

    // 2. Sync alt/caption to all articles that reference this image
    const affectedArticles = await prisma.article.findMany({
      where: {
        OR: [
          { featuredImage: { contains: publicId } },
          { content: { contains: publicId } },
        ],
      },
    });

    for (const article of affectedArticles) {
      const updates: Record<string, unknown> = {};

      // Sync featured image alt/caption
      if (article.featuredImage && article.featuredImage.includes(publicId)) {
        updates.featuredImageAlt = alt || null;
        updates.featuredImageCaption = caption || null;
      }

      // Sync block images in content JSON
      if (article.content && article.content.includes(publicId)) {
        try {
          const blocks = JSON.parse(article.content);
          if (Array.isArray(blocks)) {
            let contentChanged = false;
            for (const block of blocks) {
              if (block.image && block.image.includes(publicId)) {
                block.imageAlt = alt || "";
                block.imageCaption = caption || "";
                contentChanged = true;
              }
            }
            if (contentChanged) {
              updates.content = JSON.stringify(blocks);
            }
          }
        } catch {
          // Content JSON parsing failed, skip
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.article.update({
          where: { id: article.id },
          data: updates,
        });
        revalidatePath(`/artikel/${article.slug}`);
      }
    }

    if (affectedArticles.length > 0) {
      revalidatePath("/");
    }

    return NextResponse.json({ success: true, syncedArticles: affectedArticles.length });
  } catch (error) {
    console.error("Failed to update media context:", error);
    return NextResponse.json({ error: "Failed to update media context" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }

    // 1. Delete from Cloudinary
    await deleteImage(publicId);

    // 2. Clean up references in articles that used this image
    const affectedArticles = await prisma.article.findMany({
      where: {
        OR: [
          { featuredImage: { contains: publicId } },
          { content: { contains: publicId } },
        ],
      },
    });

    for (const article of affectedArticles) {
      const updates: Record<string, unknown> = {};

      // Clear featured image if it matches the deleted image
      if (article.featuredImage && article.featuredImage.includes(publicId)) {
        updates.featuredImage = null;
        updates.featuredImageAlt = null;
        updates.featuredImageCaption = null;
      }

      // Clear block images in content JSON
      if (article.content && article.content.includes(publicId)) {
        try {
          const blocks = JSON.parse(article.content);
          if (Array.isArray(blocks)) {
            let contentChanged = false;
            for (const block of blocks) {
              if (block.image && block.image.includes(publicId)) {
                block.image = "";
                block.imageAlt = "";
                block.imageCaption = "";
                contentChanged = true;
              }
            }
            if (contentChanged) {
              updates.content = JSON.stringify(blocks);
            }
          }
        } catch {
          // Content JSON parsing failed, skip
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.article.update({
          where: { id: article.id },
          data: updates,
        });
        revalidatePath(`/artikel/${article.slug}`);
      }
    }

    if (affectedArticles.length > 0) {
      revalidatePath("/");
    }

    return NextResponse.json({ success: true, syncedArticles: affectedArticles.length });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
