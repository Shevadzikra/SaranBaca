"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2, Plus, Trash2, Globe, Search, CheckCircle2, AlertTriangle } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import ImageUploader from "./ImageUploader";
import slugify from "slugify";

interface ArticleFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string | null;
    featuredImageAlt?: string | null;
    status: "DRAFT" | "PUBLISHED";
    categoryId?: string | null;
    tagIds?: string[];
    metaTitle?: string | null;
    metaDescription?: string | null;
    canonicalUrl?: string | null;
    noIndex?: boolean;
    focusKeyword?: string | null;
    schemaType?: string | null;
    faqs?: { question: string; answer: string }[];
  };
  mode: "create" | "edit";
}

export default function ArticleForm({ initialData, mode }: ArticleFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Content tab
  const [title, setTitle] = useState(initialData?.title || "");
  const [articleSlug, setArticleSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featuredImageAlt || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initialData?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialData?.tagIds || []);

  // SEO tab
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || "");
  const [noIndex, setNoIndex] = useState(initialData?.noIndex || false);
  const [focusKeyword, setFocusKeyword] = useState(initialData?.focusKeyword || "");
  const [schemaType, setSchemaType] = useState(initialData?.schemaType || "Article");

  // FAQ
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(initialData?.faqs || []);

  // Data
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    fetch("/api/tags").then((r) => r.json()).then(setTags);
  }, []);

  // Auto-slug from title
  useEffect(() => {
    if (mode === "create" && title) {
      setArticleSlug(
        slugify(title, { lower: true, strict: true, trim: true })
      );
    }
  }, [title, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      title,
      slug: articleSlug,
      excerpt,
      content,
      featuredImage: featuredImage || null,
      featuredImageAlt: featuredImageAlt || null,
      status,
      categoryId: categoryId || null,
      tagIds: selectedTagIds,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      canonicalUrl: canonicalUrl || null,
      noIndex,
      focusKeyword: focusKeyword || null,
      schemaType,
      faqs,
    };

    try {
      const url = mode === "create"
        ? "/api/articles"
        : `/api/articles/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/admin/artikel");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan artikel");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  // SEO Checklist
  const seoChecks = [
    { label: "Judul mengandung focus keyword", pass: focusKeyword ? title.toLowerCase().includes(focusKeyword.toLowerCase()) : false },
    { label: "Meta description mengandung focus keyword", pass: focusKeyword ? (metaDescription || excerpt).toLowerCase().includes(focusKeyword.toLowerCase()) : false },
    { label: "Slug mengandung focus keyword", pass: focusKeyword ? articleSlug.toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, "-")) : false },
    { label: "Alt text gambar utama terisi", pass: !!featuredImageAlt },
    { label: "Konten minimal 300 kata", pass: content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length >= 300 },
    { label: "Ada subheading H2 di konten", pass: content.includes("<h2") },
    { label: "Meta description ≤ 160 karakter", pass: (metaDescription || excerpt).length <= 160 && (metaDescription || excerpt).length > 0, warn: (metaDescription || excerpt).length > 160 },
    { label: "Meta title ≤ 60 karakter", pass: (metaTitle || title).length <= 60 && (metaTitle || title).length > 0, warn: (metaTitle || title).length > 60 },
  ];

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <Tabs defaultValue="konten" className="space-y-6 flex flex-col">
            <div>
              <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
                <TabsTrigger value="konten" className="rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                  Konten
                </TabsTrigger>
                <TabsTrigger value="seo" className="rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                  SEO
                </TabsTrigger>
                <TabsTrigger value="faq" className="rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                  FAQ
                </TabsTrigger>
              </TabsList>
            </div>

            <div>
              {/* KONTEN */}
              <TabsContent value="konten" className="space-y-5">
                
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Judul Artikel</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul artikel yang menarik..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-lg text-lg" required />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Slug</label>
                  <Input value={articleSlug} onChange={(e) => setArticleSlug(e.target.value)} placeholder="slug-artikel"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg font-mono text-sm" required />
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Ringkasan / Excerpt</label>
                    <span className={`text-xs ${excerpt.length > 160 ? "text-red-400" : "text-slate-500"}`}>
                      {excerpt.length}/160
                    </span>
                  </div>
                  <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Deskripsi singkat artikel (maks 160 karakter)..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg resize-none" rows={3} required />
                </div>

                {/* Rich Text Editor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Konten Artikel</label>
                  <RichTextEditor content={content} onChange={setContent} />
                </div>

                {/* Featured Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Gambar Utama</label>
                  <ImageUploader value={featuredImage} onChange={setFeaturedImage} onRemove={() => setFeaturedImage("")} />
                </div>

                {/* Featured Image Alt */}
                {featuredImage && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Alt Text Gambar Utama</label>
                    <Input value={featuredImageAlt} onChange={(e) => setFeaturedImageAlt(e.target.value)} placeholder="Deskripsi gambar untuk aksesibilitas & SEO"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg" />
                  </div>
                )}
              </TabsContent>

              {/* SEO */}
              <TabsContent value="seo" className="space-y-5">
                {/* Focus Keyword */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Focus Keyword</label>
                  <Input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="Kata kunci utama artikel"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg" />
                </div>

                {/* Meta Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Meta Title</label>
                    <span className={`text-xs ${(metaTitle || title).length > 60 ? "text-red-400" : "text-slate-500"}`}>
                      {(metaTitle || title).length}/60
                    </span>
                  </div>
                  <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={title || "Meta title SEO..."}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg" />
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Meta Description</label>
                    <span className={`text-xs ${(metaDescription || excerpt).length > 160 ? "text-red-400" : "text-slate-500"}`}>
                      {(metaDescription || excerpt).length}/160
                    </span>
                  </div>
                  <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder={excerpt || "Meta description untuk mesin pencari..."}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg resize-none" rows={3} />
                </div>

                {/* SERP Preview */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Preview SERP Google
                  </label>
                  <div className="bg-white rounded-lg p-4 space-y-1">
                    <p className="text-sm text-green-700 truncate">
                      saranbaca.vercel.app › artikel › {articleSlug || "slug-artikel"}
                    </p>
                    <p className="text-lg text-blue-800 font-medium truncate hover:underline cursor-default">
                      {(metaTitle || title || "Judul Artikel Anda").slice(0, 60)}
                      {(metaTitle || title || "").length > 60 ? "..." : ""} — SaranBaca
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {(metaDescription || excerpt || "Deskripsi meta artikel Anda akan muncul di sini...").slice(0, 160)}
                      {(metaDescription || excerpt || "").length > 160 ? "..." : ""}
                    </p>
                  </div>
                </div>

                {/* Canonical URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Canonical URL <span className="text-slate-500 text-xs">(opsional)</span>
                  </label>
                  <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg" />
                </div>

                {/* Schema Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Schema Type</label>
                  <Select value={schemaType} onValueChange={setSchemaType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-slate-300 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Article">Article</SelectItem>
                      <SelectItem value="NewsArticle">NewsArticle</SelectItem>
                      <SelectItem value="BlogPosting">BlogPosting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* No Index */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500" />
                  <span className="text-sm text-slate-300">No Index — Jangan indeks halaman ini oleh mesin pencari</span>
                </label>
              </TabsContent>
                
              {/* FAQ */}
              <TabsContent value="faq" className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-300">FAQ (Pertanyaan Umum)</h3>
                    <p className="text-xs text-slate-500 mt-1">Maksimal 10 FAQ per artikel. Akan menghasilkan FAQPage schema.</p>
                  </div>
                  {faqs.length < 10 && (
                    <Button type="button" variant="secondary" size="sm"
                      onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
                      className="border-white/10 text-slate-900 hover:bg-white/10 hover:text-slate-300 rounded-lg">
                      <Plus className="w-4 h-4 mr-1" /> Tambah
                    </Button>
                  )}
                </div>
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">FAQ #{i + 1}</span>
                      <button type="button" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
                        className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input value={faq.question}
                      onChange={(e) => { const n = [...faqs]; n[i].question = e.target.value; setFaqs(n); }}
                      placeholder="Pertanyaan"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg" />
                    <Textarea value={faq.answer}
                      onChange={(e) => { const n = [...faqs]; n[i].answer = e.target.value; setFaqs(n); }}
                      placeholder="Jawaban"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg resize-none" rows={2} />
                  </div>
                ))}
                {faqs.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Belum ada FAQ. Klik tombol &quot;Tambah&quot; untuk menambahkan.
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-5">
          {/* Publish Settings */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Pengaturan</h3>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as "DRAFT" | "PUBLISHED")}>
                <SelectTrigger className="bg-white/5 border-white/10 text-slate-300 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Kategori</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-slate-300 rounded-xl">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Tag</label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag.id}
                    className={`cursor-pointer transition-all text-xs ${
                      selectedTagIds.includes(tag.id)
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                    }`}
                    onClick={() => toggleTag(tag.id)}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button type="submit" disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/25 h-11">
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> {mode === "create" ? "Simpan Artikel" : "Update Artikel"}</>
              )}
            </Button>
          </div>

          {/* SEO Checklist */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">SEO Checklist</h3>
            <div className="space-y-2">
              {seoChecks.map((check, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {check.pass ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : check.warn ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0 mt-0.5" />
                  )}
                  <span className={check.pass ? "text-emerald-400" : check.warn ? "text-amber-400" : "text-slate-500"}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
