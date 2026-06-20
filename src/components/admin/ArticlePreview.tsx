"use client";

import { useState, useEffect } from "react";
import { X, Eye, Monitor, Smartphone, Tablet, Clock, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArticleBlock, BlockSection } from "./ArticleForm";

interface ArticlePreviewProps {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  featuredImageCaption: string;
  blocks: ArticleBlock[];
  categoryName?: string;
  categorySlug?: string;
  tagNames: string[];
  faqs: { question: string; answer: string }[];
  authorName?: string;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

function addHeadingIdsPreview(html: string): string {
  return html.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, content) => {
    const text = content.replace(/<[^>]*>/g, "");
    const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
    if (attrs.includes("id=")) return match;
    return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
  });
}

export default function ArticlePreview({
  title,
  slug,
  excerpt,
  featuredImage,
  featuredImageAlt,
  featuredImageCaption,
  blocks,
  categoryName,
  categorySlug,
  tagNames,
  faqs,
  authorName,
}: ArticlePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate reading time & word count from blocks
  const allText = blocks.reduce((acc, block) => {
    const sectionText = block.sections
      .filter((s): s is Extract<BlockSection, { type: "paragraph" }> => s.type === "paragraph")
      .map((s) => s.content.replace(/<[^>]*>/g, ""))
      .join(" ");
    return acc + " " + (block.subtitle || "") + " " + sectionText;
  }, "");
  const wordCount = allText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Generate TOC from blocks
  const toc = blocks
    .filter((b) => b.subtitle)
    .map((b) => ({
      id: b.subtitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim(),
      text: b.subtitle,
    }));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      document.body.style.overflow = "";
      setIsAnimating(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile": return "max-w-[375px]";
      case "tablet": return "max-w-[768px]";
      default: return "max-w-full";
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Preview Toggle Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-white/10 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 hover:text-violet-300 rounded-xl h-11 gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/10"
      >
        <Eye className="w-4 h-4" />
        Preview Artikel
      </Button>

      {/* Fullscreen Preview Modal */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-[100] transition-all duration-300 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div
            className={`relative h-full flex flex-col bg-slate-950 transition-all duration-300 ${
              isAnimating ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]"
            }`}
          >
            {/* Toolbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/25">
                  <Eye className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                    Preview
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
                  <span>{wordCount.toLocaleString("id-ID")} kata</span>
                  <span className="mx-1">·</span>
                  <span>{readingTime} menit baca</span>
                </div>
              </div>

              {/* Viewport Switcher */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewport("desktop")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewport === "desktop"
                      ? "bg-violet-500/20 text-violet-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewport("tablet")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewport === "tablet"
                      ? "bg-violet-500/20 text-violet-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Tablet"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewport("mobile")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewport === "mobile"
                      ? "bg-violet-500/20 text-violet-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className={`mx-auto transition-all duration-300 ${getViewportWidth()}`}>
                {/* Simulated Article Page */}
                <article className="max-w-6xl mx-auto px-4 sm:px-6">
                  {/* Breadcrumb */}
                  <nav className="flex items-center gap-2 text-sm text-gray-400 py-6 overflow-x-auto">
                    <span className="hover:text-emerald-600 transition-colors shrink-0 cursor-default">
                      Beranda
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    {categoryName && (
                      <>
                        <span className="hover:text-emerald-600 transition-colors shrink-0 cursor-default">
                          {categoryName}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </>
                    )}
                    <span className="text-gray-600 truncate">
                      {title || "Judul Artikel"}
                    </span>
                  </nav>

                  {/* Header */}
                  <header className="max-w-3xl mb-8">
                    {categoryName && (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 mb-4">
                        {categoryName}
                      </span>
                    )}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
                      {title || "Judul Artikel Anda"}
                    </h1>
                    {excerpt && (
                      <p className="text-lg text-gray-500 leading-relaxed mb-6">
                        {excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      {/* Author */}
                      <span className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-medium">
                          {(authorName || "A")[0]}
                        </div>
                        <span className="font-medium text-gray-700">
                          {authorName || "Admin"}
                        </span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {readingTime} menit baca
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        0 views
                      </span>
                    </div>
                  </header>

                  {/* Featured Image */}
                  {featuredImage && (
                    <figure className="mb-10">
                      <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={featuredImage}
                          alt={featuredImageAlt || title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {featuredImageCaption && (
                        <figcaption className="text-left text-sm text-gray-500 mt-3">
                          {featuredImageCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  <div className="flex gap-10">
                    {/* Table of Contents - Desktop Sidebar */}
                    {toc.length > 0 && viewport === "desktop" && (
                      <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-24">
                          <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                            Daftar Isi
                          </h2>
                          <nav className="space-y-2 border-l-2 border-gray-100 pl-4">
                            {toc.map((item) => (
                              <span
                                key={item.id}
                                className="block text-sm text-gray-500 font-medium cursor-default"
                              >
                                {item.text}
                              </span>
                            ))}
                          </nav>
                        </div>
                      </aside>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 max-w-3xl">
                      <div className="prose-article">
                        {blocks.map((block, index) => {
                          const blockTocId = block.subtitle
                            ? block.subtitle
                                .toLowerCase()
                                .replace(/[^a-z0-9\s-]/g, "")
                                .replace(/\s+/g, "-")
                                .replace(/-+/g, "-")
                                .trim()
                            : "";

                          return (
                            <div key={block.id}>
                              {block.subtitle && (
                                <h2 id={blockTocId}>{block.subtitle}</h2>
                              )}

                              {block.image && (
                                <figure className="my-8">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={block.image}
                                    alt={block.imageAlt || block.subtitle || "Gambar artikel"}
                                    className="w-full h-auto rounded-2xl object-cover"
                                  />
                                  {block.imageCaption && (
                                    <figcaption className="text-left text-sm text-gray-500 mt-3">
                                      {block.imageCaption}
                                    </figcaption>
                                  )}
                                </figure>
                              )}

                              {block.sections ? (
                                block.sections.map((section) => {
                                  if (
                                    section.type === "paragraph" &&
                                    section.content
                                  ) {
                                    return (
                                      <div
                                        key={section.id}
                                        dangerouslySetInnerHTML={{
                                          __html: addHeadingIdsPreview(
                                            section.content
                                          ),
                                        }}
                                      />
                                    );
                                  }
                                  if (
                                    section.type === "related_article" &&
                                    section.articleSlug
                                  ) {
                                    return (
                                      <div
                                        key={section.id}
                                        className="my-6 p-4 bg-emerald-50/60 border-l-4 border-emerald-500 rounded-r-xl"
                                      >
                                        <p className="text-sm font-semibold text-gray-700 mb-1">
                                          {section.label || "Baca juga:"}
                                        </p>
                                        <span className="text-emerald-600 font-medium underline underline-offset-2 cursor-default">
                                          {section.articleTitle}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })
                              ) : block.description ? (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: addHeadingIdsPreview(
                                      block.description
                                    ),
                                  }}
                                />
                              ) : null}

                              {/* Mobile TOC after first block */}
                              {index === 0 &&
                                toc.length > 0 &&
                                viewport !== "desktop" && (
                                  <div className="my-8 p-6 bg-green-50/50 rounded-2xl border border-emerald-100/50">
                                    <p className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                                      Daftar Isi
                                    </p>
                                    <nav className="space-y-2.5 border-l-2 border-emerald-200/60 pl-4">
                                      {toc.map((item) => (
                                        <span
                                          key={item.id}
                                          className="block text-sm text-gray-800 font-medium cursor-default"
                                        >
                                          {item.text}
                                        </span>
                                      ))}
                                    </nav>
                                  </div>
                                )}

                              {index < blocks.length - 1 && (
                                <hr className="my-10 border-gray-100 border-dashed" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* FAQ Section */}
                      {faqs.length > 0 && (
                        <section className="mt-8 pt-8 border-t border-gray-100">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Pertanyaan Umum (FAQ)
                          </h2>
                          <div className="space-y-3">
                            {faqs
                              .filter((f) => f.question)
                              .map((faq, i) => (
                                <details
                                  key={i}
                                  className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
                                >
                                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors">
                                    {faq.question}
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                                  </summary>
                                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                                    {faq.answer}
                                  </div>
                                </details>
                              ))}
                          </div>
                        </section>
                      )}

                      {/* Tags */}
                      {tagNames.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
                          {tagNames.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 cursor-default"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Author Card */}
                      <div className="mt-12 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg font-semibold shrink-0">
                            {(authorName || "A")[0]}
                          </div>
                          <div>
                            <span className="text-base font-semibold text-gray-900">
                              {authorName || "Admin"}
                            </span>
                            <p className="text-sm text-gray-500 mt-2">
                              Penulis di SaranBaca
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Bottom padding */}
                <div className="h-20" />
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="sticky bottom-0 z-10 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-900/95 backdrop-blur-md border-t border-white/10">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>
                  URL: <span className="text-slate-400 font-mono">/artikel/{slug || "slug-artikel"}</span>
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">{wordCount.toLocaleString("id-ID")} kata</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">{readingTime} menit baca</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-amber-500/70 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Preview Mode
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
