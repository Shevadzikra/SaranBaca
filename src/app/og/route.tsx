import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
export const NEXT_PUBLIC_HOSTNAME = new URL(SITE_URL).hostname;

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "SaranBaca";
  const category = searchParams.get("category") || "";
  const author = searchParams.get("author") || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)",
          padding: "60px 80px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Top */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #34d399, #14b8a6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "white",
            }}
          >
            📖
          </div>
          <span style={{ fontSize: "24px", color: "#94a3b8", fontWeight: 600 }}>
            SaranBaca
          </span>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {category && (
            <span
              style={{
                fontSize: "18px",
                color: "#34d399",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {category}
            </span>
          )}
          <h1
            style={{
              fontSize: title.length > 60 ? "42px" : "56px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {author && (
            <span style={{ fontSize: "18px", color: "#94a3b8" }}>
              oleh {author}
            </span>
          )}
          <span style={{ fontSize: "16px", color: "#475569" }}>
            {NEXT_PUBLIC_HOSTNAME}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
