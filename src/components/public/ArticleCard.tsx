import Link from "next/link";
import Image from "next/image";
import { Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage?: string | null;
    featuredImageAlt?: string | null;
    readingTime?: number | null;
    viewCount: number;
    publishedAt?: Date | string | null;
    category?: { name: string; slug: string } | null;
  };
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <Link
      href={`/artikel/${article.slug}`}
      className={`group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 ${
        featured ? "md:flex" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-gray-100 ${
          featured ? "md:w-1/2 h-64 md:h-auto" : "h-48"
        }`}
      >
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.featuredImageAlt || article.title}
            fill
            priority={featured}
            loading={featured ? "eager" : "lazy"}
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "33vw"}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center">
            <span className="text-4xl opacity-30">📖</span>
          </div>
        )}
        {article.category && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-emerald-700 shadow-sm">
            {article.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`p-5 ${featured ? "md:w-1/2 md:p-6 md:flex md:flex-col md:justify-center" : ""}`}>
        <h1
          className={`font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 ${
            featured ? "text-xl md:text-2xl mb-3" : "text-lg mb-2"
          }`}
        >
          {article.title}
        </h1>
        <p className={`text-gray-500 line-clamp-2 ${featured ? "text-base mb-4" : "text-sm mb-3"}`}>
          {article.excerpt}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {article.publishedAt && (
            <span>
              {format(new Date(article.publishedAt), "dd MMM yyyy", { locale: id })}
            </span>
          )}
          {article.readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTime} menit
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
