import type { Metadata } from "next";

export const SITE_NAME = "SaranBaca";
export const SITE_DESCRIPTION =
  "Temukan artikel terbaik dan rekomendasi bacaan berkualitas di SaranBaca";
export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://saranbaca.vercel.app";

export function generateArticleMetadata({
  title,
  description,
  slug,
  image,
  imageAlt,
  publishedTime,
  modifiedTime,
  authors,
  section,
  tags,
  noIndex,
  canonicalUrl,
}: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  imageAlt?: string | null;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
  section?: string | null;
  tags?: string[];
  noIndex?: boolean;
  canonicalUrl?: string | null;
}): Metadata {
  const ogImageUrl =
    image || generateOgImageUrl({ title, category: section, author: authors?.[0] });

  return {
    title,
    description,
    keywords: tags?.join(", "),
    authors: authors?.map((name) => ({ name })),
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/artikel/${slug}`,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt || title,
        },
      ],
      type: "article",
      publishedTime: publishedTime || undefined,
      modifiedTime: modifiedTime || undefined,
      authors: authors,
      section: section || undefined,
      tags: tags,
      locale: "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: canonicalUrl || `${BASE_URL}/artikel/${slug}`,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function generateOgImageUrl({
  title,
  category,
  author,
}: {
  title?: string | null;
  category?: string | null;
  author?: string | null;
}): string {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (category) params.set("category", category);
  if (author) params.set("author", author);
  return `${BASE_URL}/og?${params.toString()}`;
}
