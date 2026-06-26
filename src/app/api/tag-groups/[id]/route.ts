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

    const tagGroup = await prisma.tagGroup.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        order: body.order,
      },
    });

    return NextResponse.json(tagGroup);
  } catch (error) {
    console.error("Update tag group error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate grup tag" },
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
    // Move orphaned tags to null group before deleting
    await prisma.tag.updateMany({
      where: { tagGroupId: id },
      data: { tagGroupId: null },
    });

    await prisma.tagGroup.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete tag group error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus grup tag" },
      { status: 500 }
    );
  }
}
