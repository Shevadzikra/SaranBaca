import ArticleForm from "@/components/admin/ArticleForm";

export default function ArtikelBaruPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tulis Artikel Baru</h1>
        <p className="text-slate-400 mt-1">Buat konten baru untuk pembaca SaranBaca</p>
      </div>
      <ArticleForm mode="create" />
    </div>
  );
}
