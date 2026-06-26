import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const tagGroups = await prisma.tagGroup.findMany({
    include: {
      _count: { select: { tags: true } },
      tags: {
        include: { _count: { select: { articles: true } } },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(tagGroups);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Get the highest order to place new group at the end
    const maxOrder = await prisma.tagGroup.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const tagGroup = await prisma.tagGroup.create({
      data: {
        name: body.name,
        slug: body.slug || slugify(body.name),
        order: body.order ?? (maxOrder ? maxOrder.order + 1 : 1),
      },
    });

    return NextResponse.json(tagGroup, { status: 201 });
  } catch (error) {
    console.error("Create tag group error:", error);
    return NextResponse.json(
      { error: "Gagal membuat grup tag" },
      { status: 500 }
    );
  }
}
