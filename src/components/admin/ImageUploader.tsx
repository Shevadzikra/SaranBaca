"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

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
      </div>
    );
  }

  return (
    <label
      className={`flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
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
          <span className="text-sm text-slate-400">
            Klik atau seret gambar ke sini
          </span>
          <span className="text-xs text-slate-600 mt-1">
            PNG, JPG, WebP (max 5MB)
          </span>
        </>
      )}
    </label>
  );
}
