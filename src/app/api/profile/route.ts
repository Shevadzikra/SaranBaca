import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      avatar: true,
      jobTitle: true,
      expertise: true,
      websiteUrl: true,
      twitterUrl: true,
      linkedinUrl: true,
      instagramUrl: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name: body.name,
      bio: body.bio,
      avatar: body.avatar,
      jobTitle: body.jobTitle,
      expertise: body.expertise || [],
      websiteUrl: body.websiteUrl,
      twitterUrl: body.twitterUrl,
      linkedinUrl: body.linkedinUrl,
      instagramUrl: body.instagramUrl,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
    },
  });

  return NextResponse.json(user);
}
