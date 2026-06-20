import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";
import { SITE_NAME, SITE_DESCRIPTION, BASE_URL } from "@/lib/seo";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  verification: {
    google: "5aIAW2c6mcX-W8JPqSUQ_IGte85gz8KWwQ3HBVAabEE",
  },
  other: {
    "google-adsense-account": "ca-pub-4264146873118513",
  },
  title: {
    default: `${SITE_NAME} — Rekomendasi Bacaan Berkualitas`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
