import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAvailableFormats } from "@/lib/cloudinary";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formats = await getAvailableFormats("saranbaca");
    return NextResponse.json({ formats });
  } catch (error) {
    console.error("Failed to fetch formats:", error);
    return NextResponse.json({ error: "Failed to fetch formats" }, { status: 500 });
  }
}
