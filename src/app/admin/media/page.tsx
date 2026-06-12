"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Copy, Trash2, ImageIcon, Loader2, Check } from "lucide-react";

interface MediaItem {
  url: string;
  publicId: string;
}

export default function MediaPage() {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Load from localStorage (simple solution without a full media table)
  useEffect(() => {
    const saved = localStorage.getItem("saranbaca_media");
    if (saved) setImages(JSON.parse(saved));
  }, []);

  function saveImages(items: MediaItem[]) {
    setImages(items);
    localStorage.setItem("saranbaca_media", JSON.stringify(items));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "saranbaca/media");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      saveImages([{ url: data.url, publicId: data.publicId }, ...images]);
    } catch {
      alert("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  }

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleDelete(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    saveImages(newImages);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Media</h1>
          <p className="text-slate-400 mt-1">Kelola gambar yang diupload ke Cloudinary</p>
        </div>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25 cursor-pointer transition-all hover:shadow-emerald-500/40 text-sm">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Mengupload..." : "Upload Gambar"}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
          <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Belum ada gambar</p>
          <p className="text-slate-500 text-sm mt-1">Upload gambar pertama Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div key={i} className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <Image src={img.url} alt={`Media ${i + 1}`} width={400} height={300} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => handleCopy(img.url)}
                  className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors" title="Copy URL">
                  {copied === img.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(i)}
                  className="p-2 rounded-lg bg-red-500/40 text-white hover:bg-red-500/60 transition-colors" title="Hapus">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
