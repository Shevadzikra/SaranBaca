import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        tagGroupId: body.tagGroupId !== undefined ? body.tagGroupId : undefined,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Update tag error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate tag" },
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
    // Check if tag is used by articles
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (tag && tag._count.articles > 0) {
      return NextResponse.json(
        { error: `Tag ini digunakan oleh ${tag._count.articles} artikel. Hapus relasi terlebih dahulu.` },
        { status: 400 }
      );
    }

    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete tag error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus tag" },
      { status: 500 }
    );
  }
}
