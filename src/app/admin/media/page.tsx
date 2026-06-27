"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Copy, Trash2, ImageIcon, Loader2, Check, Edit2, X, Search, ArrowUp, ArrowDown, Calendar, Filter, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CloudinaryImage {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
  context?: {
    custom?: {
      alt?: string;
      caption?: string;
    };
  };
}

export default function MediaPage() {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Edit modal state
  const [editingImage, setEditingImage] = useState<CloudinaryImage | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Upload modal state
  const [uploadModalFile, setUploadModalFile] = useState<File | null>(null);
  const [uploadModalPreview, setUploadModalPreview] = useState<string | null>(null);
  const [uploadModalAlt, setUploadModalAlt] = useState("");
  const [uploadModalCaption, setUploadModalCaption] = useState("");

  // --- Search & Filter state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filterFormat, setFilterFormat] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [availableFormats, setAvailableFormats] = useState<string[]>([]);
  const [loadingFormats, setLoadingFormats] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Check if any filter is active
  const hasActiveFilters = activeSearch || filterFormat || filterDateFrom || filterDateTo || sortOrder !== "desc";

  // --- Fetch available formats on mount ---
  useEffect(() => {
    fetchFormats();
  }, []);

  async function fetchFormats() {
    setLoadingFormats(true);
    try {
      const res = await fetch("/api/media/formats");
      if (res.ok) {
        const data = await res.json();
        setAvailableFormats(data.formats || []);
      }
    } catch (error) {
      console.error("Failed to fetch formats:", error);
    } finally {
      setLoadingFormats(false);
    }
  }

  // --- Build fetch URL with all filter params ---
  const buildFetchUrl = useCallback((cursor?: string) => {
    const params = new URLSearchParams();
    params.set("folder", "saranbaca");
    if (cursor) params.set("nextCursor", cursor);
    if (activeSearch.trim()) params.set("search", activeSearch.trim());
    if (filterFormat) params.set("format", filterFormat);
    if (filterDateFrom) params.set("dateFrom", filterDateFrom);
    if (filterDateTo) params.set("dateTo", filterDateTo);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    return `/api/media?${params.toString()}`;
  }, [activeSearch, filterFormat, filterDateFrom, filterDateTo, sortOrder]);

  // --- Fetch media with current filters ---
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(buildFetchUrl());
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
        setNextCursor(data.nextCursor || null);
        setTotalCount(data.totalCount ?? null);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  }, [buildFetchUrl]);

  // Load on mount and when filters change
  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(buildFetchUrl(nextCursor));
      if (res.ok) {
        const data = await res.json();
        setImages(prev => [...prev, ...(data.images || [])]);
        setNextCursor(data.nextCursor || null);
      }
    } catch (error) {
      console.error("Failed to fetch more media:", error);
    } finally {
      setLoadingMore(false);
    }
  }

  // --- Debounced search ---
  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setActiveSearch(value);
    }, 400);
  }

  // --- Filter handlers ---
  function handleFormatChange(value: string) {
    setFilterFormat(value === "all" ? "" : value);
  }

  function handleSortToggle() {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  }

  function resetAllFilters() {
    setSearchQuery("");
    setActiveSearch("");
    setFilterFormat("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSortOrder("desc");
  }

  // --- Upload handlers ---
  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const previewUrl = URL.createObjectURL(file);
    setUploadModalFile(file);
    setUploadModalPreview(previewUrl);
    setUploadModalAlt("");
    setUploadModalCaption("");
  }

  function closeUploadModal() {
    if (uploadModalPreview) {
      URL.revokeObjectURL(uploadModalPreview);
    }
    setUploadModalFile(null);
    setUploadModalPreview(null);
    setUploadModalAlt("");
    setUploadModalCaption("");
  }

  async function handleUploadConfirm() {
    if (!uploadModalFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadModalFile);
      formData.append("folder", "saranbaca/media");
      if (uploadModalAlt.trim()) formData.append("alt", uploadModalAlt.trim());
      if (uploadModalCaption.trim()) formData.append("caption", uploadModalCaption.trim());

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");

      closeUploadModal();

      // Refresh both media list and format options
      await Promise.all([fetchMedia(), fetchFormats()]);
    } catch {
      alert("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  }

  // --- Copy, Delete, Edit handlers ---
  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleDelete(publicId: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus gambar ini?")) return;

    try {
      const res = await fetch(`/api/media?publicId=${encodeURIComponent(publicId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setImages(images.filter((img) => img.publicId !== publicId));
        fetchFormats();
      } else {
        alert("Gagal menghapus gambar");
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
  }

  function openEditModal(img: CloudinaryImage) {
    setEditingImage(img);
    setEditAlt(img.context?.custom?.alt || "");
    setEditCaption(img.context?.custom?.caption || "");
  }

  async function handleSaveEdit() {
    if (!editingImage) return;

    setSavingEdit(true);
    try {
      const res = await fetch("/api/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId: editingImage.publicId,
          alt: editAlt,
          caption: editCaption,
        }),
      });

      if (res.ok) {
        setImages(images.map(img => {
          if (img.publicId === editingImage.publicId) {
            return {
              ...img,
              context: {
                custom: {
                  ...img.context?.custom,
                  alt: editAlt,
                  caption: editCaption
                }
              }
            };
          }
          return img;
        }));
        setEditingImage(null);
      } else {
        alert("Gagal menyimpan metadata gambar");
      }
    } catch (error) {
      console.error("Failed to update media context:", error);
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Media</h1>
          <p className="text-slate-400 mt-1">Kelola gambar yang diupload ke Cloudinary</p>
        </div>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25 cursor-pointer transition-all hover:shadow-emerald-500/40 text-sm">
          <Upload className="w-4 h-4" />
          Upload Gambar
          <input type="file" accept="image/*" onChange={handleFileSelected} className="hidden" />
        </label>
      </div>

      {/* Search & Filters */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari berdasarkan caption, alt text, atau tags..."
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-lg pl-10 pr-10 h-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Format Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <Select value={filterFormat || "all"} onValueChange={handleFormatChange}>
              <SelectTrigger className="bg-white/5 border-white/10 text-slate-300 rounded-lg h-9 w-[140px] text-sm">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Format</SelectItem>
                {availableFormats.map((fmt) => (
                  <SelectItem key={fmt} value={fmt}>
                    {fmt.toUpperCase()}
                  </SelectItem>
                ))}
                {loadingFormats && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div className="relative">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="bg-white/5 border border-white/10 text-slate-300 rounded-lg h-9 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 [color-scheme:dark]"
                title="Dari tanggal"
              />
            </div>
            <span className="text-xs text-slate-600">&mdash;</span>
            <div className="relative">
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="bg-white/5 border border-white/10 text-slate-300 rounded-lg h-9 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 [color-scheme:dark]"
                title="Sampai tanggal"
              />
            </div>
          </div>

          {/* Sort Toggle */}
          <button
            type="button"
            onClick={handleSortToggle}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            title={sortOrder === "desc" ? "Terbaru dahulu" : "Terlama dahulu"}
          >
            {sortOrder === "desc" ? (
              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
            )}
            {sortOrder === "desc" ? "Terbaru" : "Terlama"}
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-red-500/20 bg-red-500/5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Active Filters Summary & Result Count */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {activeSearch && (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px] px-2 py-0.5 gap-1">
                  Cari: &quot;{activeSearch}&quot;
                  <button type="button" onClick={() => { setSearchQuery(""); setActiveSearch(""); }} className="hover:text-white ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filterFormat && (
                <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20 text-[10px] px-2 py-0.5 gap-1">
                  {filterFormat.toUpperCase()}
                  <button type="button" onClick={() => setFilterFormat("")} className="hover:text-white ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {(filterDateFrom || filterDateTo) && (
                <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/20 text-[10px] px-2 py-0.5 gap-1">
                  {filterDateFrom || "..."} &mdash; {filterDateTo || "..."}
                  <button type="button" onClick={() => { setFilterDateFrom(""); setFilterDateTo(""); }} className="hover:text-white ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {sortOrder === "asc" && (
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-[10px] px-2 py-0.5 gap-1">
                  Terlama dahulu
                  <button type="button" onClick={() => setSortOrder("desc")} className="hover:text-white ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
            {!loading && (
              <p className="text-xs text-slate-500 shrink-0 ml-4">
                {totalCount !== null ? `${totalCount} gambar ditemukan` : `${images.length} gambar`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
          <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">
            {hasActiveFilters ? "Tidak ada gambar yang cocok" : "Belum ada gambar"}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {hasActiveFilters ? "Coba ubah filter atau kata kunci pencarian" : "Upload gambar pertama Anda"}
          </p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={resetAllFilters}
              className="mt-4 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reset Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div key={img.publicId} className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                <div className="relative aspect-video">
                  <Image src={img.url} alt={img.context?.custom?.alt || "Media"} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge className="bg-black/60 text-white backdrop-blur-md border-white/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">
                      {img.format}
                    </Badge>
                    {img.format === 'webp' && (
                      <Badge className="bg-emerald-500/80 text-white backdrop-blur-md border-emerald-400/30 px-2 py-0.5 text-[10px] font-mono tracking-wider">
                        OPTIMAL
                      </Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button onClick={() => handleCopy(img.url)}
                      className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors" title="Copy URL">
                      {copied === img.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEditModal(img)}
                      className="p-2 rounded-lg bg-blue-500/40 text-white hover:bg-blue-500/60 transition-colors" title="Edit Metadata">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(img.publicId)}
                      className="p-2 rounded-lg bg-red-500/40 text-white hover:bg-red-500/60 transition-colors" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-white/[0.02] border-t border-white/5 space-y-1.5 flex-1 flex flex-col justify-center">
                  {img.context?.custom?.alt ? (
                    <p className="text-xs text-slate-300 font-medium truncate" title={img.context.custom.alt}>
                      Alt: {img.context.custom.alt}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Tanpa Alt Text</p>
                  )}
                  
                  {img.context?.custom?.caption ? (
                    <p className="text-[10px] text-slate-400 truncate" title={img.context.custom.caption}>
                      Caption: {img.context.custom.caption}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-600 italic">Tanpa Caption</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {nextCursor && (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={loadMore} 
                disabled={loadingMore}
                variant="outline"
                className="bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 min-w-[160px]"
              >
                {loadingMore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Edit Metadata Gambar</h3>
              <button onClick={() => setEditingImage(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
                <Image src={editingImage.url} alt="Preview" fill className="object-cover" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Alt Text</label>
                <Input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} placeholder="Deskripsi gambar untuk SEO & Aksesibilitas"
                  className="bg-black/20 border-white/10 text-white placeholder:text-slate-500" />
                <p className="text-[10px] text-slate-500">Penting untuk mesin pencari dan screen reader.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Caption</label>
                <Input value={editCaption} onChange={(e) => setEditCaption(e.target.value)} placeholder="Teks yang akan muncul di bawah gambar"
                  className="bg-black/20 border-white/10 text-white placeholder:text-slate-500" />
                <p className="text-[10px] text-slate-500">Keterangan atau sumber gambar.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-white/5">
              <Button type="button" variant="ghost" onClick={() => setEditingImage(null)} className="text-slate-300 hover:text-white hover:bg-white/10">
                Batal
              </Button>
              <Button type="button" onClick={handleSaveEdit} disabled={savingEdit}
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                {savingEdit ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalFile && uploadModalPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" /> Upload Gambar Baru
              </h3>
              <button onClick={closeUploadModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Preview */}
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uploadModalPreview} alt="Preview" className="w-full h-full object-contain" />
              </div>

              {/* File info */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono uppercase">
                  {uploadModalFile.name.split('.').pop()}
                </span>
                <span>{(uploadModalFile.size / 1024).toFixed(1)} KB</span>
                <span className="truncate flex-1 text-slate-600">{uploadModalFile.name}</span>
              </div>

              {/* Alt Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Alt Text</label>
                <Input value={uploadModalAlt} onChange={(e) => setUploadModalAlt(e.target.value)} placeholder="Deskripsi gambar untuk SEO & Aksesibilitas"
                  className="bg-black/20 border-white/10 text-white placeholder:text-slate-500" />
                <p className="text-[10px] text-slate-500">Penting untuk mesin pencari dan screen reader.</p>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Caption</label>
                <Input value={uploadModalCaption} onChange={(e) => setUploadModalCaption(e.target.value)} placeholder="Teks yang akan muncul di bawah gambar"
                  className="bg-black/20 border-white/10 text-white placeholder:text-slate-500" />
                <p className="text-[10px] text-slate-500">Keterangan atau sumber gambar.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-white/5">
              <Button type="button" variant="ghost" onClick={closeUploadModal} className="text-slate-300 hover:text-white hover:bg-white/10">
                Batal
              </Button>
              <Button type="button" onClick={handleUploadConfirm} disabled={uploading}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? "Mengupload..." : "Upload ke Cloudinary"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
