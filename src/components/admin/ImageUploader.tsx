"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CloudinaryImage {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  context?: {
    custom?: {
      alt?: string;
      caption?: string;
    };
  };
}

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export default function ImageUploader({
  value,
  onChange,
  onRemove,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaImages, setMediaImages] = useState<CloudinaryImage[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMedia = useCallback(async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch("/api/media?folder=saranbaca");
      if (res.ok) {
        const data = await res.json();
        setMediaImages(data.images || []);
        setNextCursor(data.nextCursor || null);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoadingMedia(false);
    }
  }, []);

  useEffect(() => {
    if (showMediaModal && mediaImages.length === 0) {
      fetchMedia();
    }
  }, [showMediaModal, mediaImages.length, fetchMedia]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/media?folder=saranbaca&nextCursor=${nextCursor}`);
      if (res.ok) {
        const data = await res.json();
        setMediaImages(prev => [...prev, ...(data.images || [])]);
        setNextCursor(data.nextCursor || null);
      }
    } catch (error) {
      console.error("Failed to fetch more media:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "saranbaca/articles");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        onChange(data.url);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Gagal mengupload gambar. Silakan coba lagi.");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  }

  function handleSelectMedia(url: string) {
    onChange(url);
    setShowMediaModal(false);
  }

  // Extracted to avoid duplication
  const MediaModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" /> Pilih dari Media Cloudinary
          </h3>
          <button type="button" onClick={() => setShowMediaModal(false)} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loadingMedia ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : mediaImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
              <p>Belum ada media di Cloudinary.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaImages.map((img) => (
                  <div key={img.publicId} 
                    className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors"
                    onClick={() => handleSelectMedia(img.url)}
                  >
                    <div className="relative aspect-square">
                      <Image 
                        src={img.url} 
                        alt={img.context?.custom?.alt || "Media"} 
                        fill 
                        sizes="(max-width: 768px) 50vw, 20vw" 
                        className="object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                          Pilih Gambar
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-white/[0.02] border-t border-white/5">
                      <p className="text-[10px] text-slate-400 uppercase">{img.format}</p>
                      <p className="text-xs text-slate-300 truncate mt-0.5">
                        {img.context?.custom?.alt || "Tanpa Alt"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {nextCursor && (
                <div className="flex justify-center pt-4 pb-8">
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
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-white/10 group">
        <Image
          src={value}
          alt="Featured"
          width={800}
          height={420}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm hover:bg-white/30 transition-colors">
            Ganti
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowMediaModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/80 text-white text-sm hover:bg-emerald-500 transition-colors"
          >
            Pilih Media
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg bg-red-500/50 text-white hover:bg-red-500/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Render Media Modal Even When Image is Selected to allow changing from media */}
        {showMediaModal && <MediaModal />}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label
        className={`flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          dragOver
            ? "border-emerald-400 bg-emerald-500/10"
            : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/[0.07]"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
            <span className="text-sm text-slate-400">Mengupload...</span>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-slate-500 mb-2" />
            <span className="text-sm text-slate-400 font-medium">
              Upload dari Device (Klik / Seret)
            </span>
            <span className="text-xs text-slate-500 mt-1">
              PNG, JPG, WebP (max 4.5MB)
            </span>
          </>
        )}
      </label>
      
      <div className="flex items-center gap-4">
        <div className="h-px bg-white/10 flex-1"></div>
        <span className="text-xs text-slate-500 font-medium uppercase">Atau</span>
        <div className="h-px bg-white/10 flex-1"></div>
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={() => setShowMediaModal(true)}
        className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
      >
        <Search className="w-4 h-4 mr-2" /> Pilih dari Media Cloudinary
      </Button>

      {showMediaModal && <MediaModal />}
    </div>
  );
}
