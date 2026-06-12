import prisma from "@/lib/prisma";
import Link from "next/link";
import { FileText, Eye, FilePlus, TrendingUp, FileCheck, FileClock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalArticles, publishedArticles, draftArticles, totalViews, recentArticles] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          author: { select: { name: true } },
        },
      }),
    ]);

  const stats = [
    {
      label: "Total Artikel",
      value: totalArticles,
      icon: FileText,
      color: "from-blue-500 to-indigo-500",
      shadow: "shadow-blue-500/20",
    },
    {
      label: "Published",
      value: publishedArticles,
      icon: FileCheck,
      color: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "Draft",
      value: draftArticles,
      icon: FileClock,
      color: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    {
      label: "Total Views",
      value: totalViews._sum.viewCount || 0,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Selamat datang di panel admin SaranBaca
          </p>
        </div>
        <Link
          href="/admin/artikel/baru"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 text-sm"
        >
          <FilePlus className="w-4 h-4" />
          Tulis Artikel Baru
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{stat.label}</span>
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} shadow-lg flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {stat.value.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Articles */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Artikel Terbaru</h2>
        </div>
        {recentArticles.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Belum ada artikel</p>
            <Link
              href="/admin/artikel/baru"
              className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block"
            >
              Tulis artikel pertama →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/admin/artikel/${article.id}/edit`}
                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {article.category && (
                      <span className="text-xs text-slate-500">
                        {article.category.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-600">
                      {format(new Date(article.createdAt), "dd MMM yyyy", {
                        locale: id,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Eye className="w-3.5 h-3.5" />
                    {article.viewCount}
                  </div>
                  <Badge
                    variant={
                      article.status === "PUBLISHED" ? "default" : "secondary"
                    }
                    className={
                      article.status === "PUBLISHED"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                    }
                  >
                    {article.status === "PUBLISHED" ? "Published" : "Draft"}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
