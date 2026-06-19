"use client";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
export const NEXT_PUBLIC_HOSTNAME = new URL(SITE_URL).hostname;

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Save, Loader2, Plus, Trash2, Globe, Search, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown, Link2, Type, BookOpen } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import ImageUploader from "./ImageUploader";
import slugify from "slugify";

// --- Types ---

export type ParagraphSection = {
  type: "paragraph";
  id: string;
  content: string;
};

export type RelatedArticleSection = {
  type: "related_article";
  id: string;
  label: string; // e.g. "Baca juga:", customizable
  articleSlug: string;
  articleTitle: string;
};

export type BlockSection = ParagraphSection | RelatedArticleSection;

export type ArticleBlock = {
  id: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
  // Legacy field kept for backward compat parsing
  description?: string;
  // New dynamic sections
  sections: BlockSection[];
};


interface ArticleFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string | null;
    featuredImageAlt?: string | null;
    featuredImageCaption?: string | null;
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

// Helper: migrate old block format to new sections format
function migrateBlock(block: Record<string, unknown>): ArticleBlock {
  // Already has sections
  if (Array.isArray(block.sections) && block.sections.length > 0) {
    return block as unknown as ArticleBlock;
  }
  // Legacy: single description field
  const description = (block.description as string) || "";
  return {
    id: (block.id as string) || crypto.randomUUID(),
    subtitle: (block.subtitle as string) || "",
    image: (block.image as string) || "",
    imageAlt: (block.imageAlt as string) || "",
    imageCaption: (block.imageCaption as string) || "",
    sections: [
      {
        type: "paragraph" as const,
        id: crypto.randomUUID(),
        content: description,
      },
    ],
  };
}

function createEmptyBlock(): ArticleBlock {
  return {
    id: crypto.randomUUID(),
    subtitle: "",
    image: "",
    imageAlt: "",
    imageCaption: "",
    sections: [
      { type: "paragraph", id: crypto.randomUUID(), content: "" },
    ],
  };
}

// --- Related Article Search Component ---
function RelatedArticleSearch({
  onSelect,
  currentSlug,
}: {
  onSelect: (slug: string, title: string) => void;
  currentSlug: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ slug: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(
        (data.articles || [])
          .filter((a: { slug: string }) => a.slug !== currentSlug)
          .map((a: { slug: string; title: string }) => ({ slug: a.slug, title: a.title }))
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentSlug]);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Cari artikel untuk ditautkan..."
          className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-lg pl-9 h-9 text-sm"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
      </div>
      {results.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-black/30">
          {results.map((article) => (
            <button
              key={article.slug}
              type="button"
              onClick={() => {
                onSelect(article.slug, article.title);
                setQuery("");
                setResults([]);
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors border-b border-white/5 last:border-0"
            >
              {article.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main Component ---
export default function ArticleForm({ initialData, mode }: ArticleFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Content tab
  const [title, setTitle] = useState(initialData?.title || "");
  const [articleSlug, setArticleSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  
  const [blocks, setBlocks] = useState<ArticleBlock[]>(() => {
    if (!initialData?.content) return [createEmptyBlock()];
    try {
      const parsed = JSON.parse(initialData.content);
      if (Array.isArray(parsed)) return parsed.map(migrateBlock);
    } catch {
      // Legacy HTML parsing fallback
    }
    return [
      {
        ...createEmptyBlock(),
        sections: [{ type: "paragraph", id: crypto.randomUUID(), content: initialData.content }],
      },
    ];
  });

  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featuredImageAlt || "");
  const [featuredImageCaption, setFeaturedImageCaption] = useState(initialData?.featuredImageCaption || "");
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

  // --- Section helpers ---
  function addSection(blockId: string, type: "paragraph" | "related_article") {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId) return b;
      const newSection: BlockSection = type === "paragraph"
        ? { type: "paragraph", id: crypto.randomUUID(), content: "" }
        : { type: "related_article", id: crypto.randomUUID(), label: "Baca juga:", articleSlug: "", articleTitle: "" };
      return { ...b, sections: [...b.sections, newSection] };
    }));
  }

  function updateSection(blockId: string, sectionId: string, updates: Record<string, unknown>) {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId) return b;
      return {
        ...b,
        sections: b.sections.map(s => s.id === sectionId ? { ...s, ...updates } as BlockSection : s),
      };
    }));
  }

  function removeSection(blockId: string, sectionId: string) {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId) return b;
      // Prevent removing last section
      if (b.sections.length <= 1) return b;
      return { ...b, sections: b.sections.filter(s => s.id !== sectionId) };
    }));
  }

  function moveSection(blockId: string, index: number, direction: "up" | "down") {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId) return b;
      if (direction === "up" && index === 0) return b;
      if (direction === "down" && index === b.sections.length - 1) return b;
      const newSections = [...b.sections];
      const swapIdx = direction === "up" ? index - 1 : index + 1;
      [newSections[index], newSections[swapIdx]] = [newSections[swapIdx], newSections[index]];
      return { ...b, sections: newSections };
    }));
  }

  // --- Block helpers ---
  function addBlock() {
    setBlocks([...blocks, createEmptyBlock()]);
  }

  function updateBlock(id: string, updates: Partial<ArticleBlock>) {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  }

  function removeBlock(id: string) {
    if (blocks.length === 1) return;
    setBlocks(blocks.filter(b => b.id !== id));
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + (direction === 'up' ? -1 : 1)];
    newBlocks[index + (direction === 'up' ? -1 : 1)] = temp;
    setBlocks(newBlocks);
  }

  // --- Compute total content for SEO checks ---
  const allTextContent = blocks.reduce((acc, block) => {
    const sectionText = block.sections
      .filter((s): s is ParagraphSection => s.type === "paragraph")
      .map(s => s.content.replace(/<[^>]*>/g, ""))
      .join(" ");
    return acc + " " + sectionText;
  }, "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body = {
      title,
      slug: articleSlug,
      excerpt,
      content: JSON.stringify(blocks),
      featuredImage: featuredImage || null,
      featuredImageAlt: featuredImageAlt || null,
      featuredImageCaption: featuredImageCaption || null,
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
    { label: "Konten minimal 300 kata", pass: allTextContent.split(/\s+/).filter(Boolean).length >= 300 },
    { label: "Ada subheading H2 di konten", pass: blocks.some(b => b.subtitle) || allTextContent.includes("<h2") },
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

                {/* Featured Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Gambar Utama (Maksimal 4.5MB)</label>
                  <ImageUploader value={featuredImage} onChange={setFeaturedImage} onRemove={() => setFeaturedImage("")} />
                </div>
                {/* Featured Image Alt & Caption */}
                {featuredImage && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Alt Text Gambar Utama</label>
                      <Input value={featuredImageAlt} onChange={(e) => setFeaturedImageAlt(e.target.value)} placeholder="Deskripsi gambar untuk aksesibilitas & SEO"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Caption Gambar Utama</label>
                      <Input value={featuredImageCaption} onChange={(e) => setFeaturedImageCaption(e.target.value)} placeholder="Sumber/Caption gambar utama"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg" />
                    </div>
                  </div>
                )}

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

                {/* Blocks Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Konten Artikel</label>
                  </div>
                  
                  {blocks.map((block, i) => (
                    <div key={block.id} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Blok #{i + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveBlock(i, 'up')} disabled={i === 0}
                            className="p-1.5 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors">
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => moveBlock(i, 'down')} disabled={i === blocks.length - 1}
                            className="p-1.5 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors">
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => removeBlock(block.id)} disabled={blocks.length === 1}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors ml-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-400">Sub Title (Opsional)</label>
                          <Input value={block.subtitle} onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })} placeholder="Judul sub-bagian..."
                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-lg h-10" />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-400">Gambar Blok (Opsional)</label>
                          <ImageUploader value={block.image} onChange={(url) => updateBlock(block.id, { image: url })} onRemove={() => updateBlock(block.id, { image: "" })} />
                        </div>

                        {block.image && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-400">Alt Text Gambar</label>
                              <Input value={block.imageAlt} onChange={(e) => updateBlock(block.id, { imageAlt: e.target.value })} placeholder="Deskripsi gambar..."
                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-400">Caption Gambar</label>
                              <Input value={block.imageCaption} onChange={(e) => updateBlock(block.id, { imageCaption: e.target.value })} placeholder="Sumber: Dokumentasi Pribadi"
                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-lg" />
                            </div>
                          </div>
                        )}

                        {/* Dynamic Sections */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-slate-400">Konten & Internal Link</label>
                          
                          {block.sections.map((section, sIdx) => (
                            <div key={section.id} className="relative">
                              {section.type === "paragraph" ? (
                                // --- Paragraph Section ---
                                <div className="rounded-lg border border-white/5 bg-black/10 overflow-hidden">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5">
                                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                                      <Type className="w-3 h-3" />
                                      Paragraf #{sIdx + 1}
                                    </span>
                                    <div className="flex items-center gap-0.5">
                                      <button type="button" onClick={() => moveSection(block.id, sIdx, "up")} disabled={sIdx === 0}
                                        className="p-1 text-slate-500 hover:text-white rounded disabled:opacity-20 transition-colors">
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button type="button" onClick={() => moveSection(block.id, sIdx, "down")} disabled={sIdx === block.sections.length - 1}
                                        className="p-1 text-slate-500 hover:text-white rounded disabled:opacity-20 transition-colors">
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button type="button" onClick={() => removeSection(block.id, section.id)} disabled={block.sections.length <= 1}
                                        className="p-1 text-red-400/60 hover:text-red-400 rounded disabled:opacity-20 transition-colors ml-1">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <RichTextEditor
                                    content={section.content}
                                    onChange={(content) => updateSection(block.id, section.id, { content })}
                                  />
                                </div>
                              ) : (
                                // --- Related Article Section ---
                                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400 uppercase tracking-wider">
                                      <Link2 className="w-3 h-3" />
                                      Internal Link
                                    </span>
                                    <div className="flex items-center gap-0.5">
                                      <button type="button" onClick={() => moveSection(block.id, sIdx, "up")} disabled={sIdx === 0}
                                        className="p-1 text-slate-500 hover:text-white rounded disabled:opacity-20 transition-colors">
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button type="button" onClick={() => moveSection(block.id, sIdx, "down")} disabled={sIdx === block.sections.length - 1}
                                        className="p-1 text-slate-500 hover:text-white rounded disabled:opacity-20 transition-colors">
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button type="button" onClick={() => removeSection(block.id, section.id)} disabled={block.sections.length <= 1}
                                        className="p-1 text-red-400/60 hover:text-red-400 rounded disabled:opacity-20 transition-colors ml-1">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Custom Label */}
                                  <div className="space-y-1">
                                    <label className="text-xs text-slate-500">Teks Label (bisa diubah sesuai keinginan)</label>
                                    <Input
                                      value={section.label}
                                      onChange={(e) => updateSection(block.id, section.id, { label: e.target.value })}
                                      placeholder="Baca juga:"
                                      className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-lg h-8 text-sm"
                                    />
                                  </div>

                                  {/* Article Picker */}
                                  {section.articleSlug ? (
                                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                      <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                                      <span className="text-sm text-emerald-300 flex-1 truncate">
                                        {section.articleTitle}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                        /artikel/{section.articleSlug}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => updateSection(block.id, section.id, { articleSlug: "", articleTitle: "" })}
                                        className="p-1 text-red-400/60 hover:text-red-400 rounded transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <RelatedArticleSearch
                                      currentSlug={articleSlug}
                                      onSelect={(slug, title) => updateSection(block.id, section.id, { articleSlug: slug, articleTitle: title })}
                                    />
                                  )}

                                  {/* Preview */}
                                  {section.articleSlug && (
                                    <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
                                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Preview</p>
                                      <div className="text-sm">
                                        <p className="text-slate-300"><strong>{section.label || "Baca juga:"}</strong></p>
                                        <span className="text-emerald-400 underline underline-offset-2">{section.articleTitle}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Add Section Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => addSection(block.id, "paragraph")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-white/15 text-xs text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
                            >
                              <Type className="w-3 h-3" />
                              Tambah Paragraf
                            </button>
                            <button
                              type="button"
                              onClick={() => addSection(block.id, "related_article")}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-blue-500/30 text-xs text-blue-400/70 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                            >
                              <Link2 className="w-3 h-3" />
                              Tambah Internal Link
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addBlock}
                    className="w-full border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl h-12">
                    <Plus className="w-5 h-5 mr-2" /> Tambah Blok Konten
                  </Button>
                </div>
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
                      {NEXT_PUBLIC_HOSTNAME} › artikel › {articleSlug || "slug-artikel"}
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
                <><Save className="w-4 h-4 mr-2" /> {mode === "create" ? "Simpan Artikel" : "Perbarui Artikel"}</>
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
