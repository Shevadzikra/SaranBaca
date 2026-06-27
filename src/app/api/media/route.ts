import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getImages, searchMediaImages, deleteImage, updateImageContext } from "@/lib/cloudinary";

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

    await updateImageContext(publicId, alt || "", caption || "");
    return NextResponse.json({ success: true });
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

    await deleteImage(publicId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
