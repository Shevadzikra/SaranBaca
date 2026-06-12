"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Save, X, FolderOpen, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import slugify from "slugify";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  _count?: { articles: number };
}

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function resetForm() {
    setName("");
    setCatSlug("");
    setDescription("");
    setMetaTitle("");
    setMetaDescription("");
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setCatSlug(cat.slug);
    setDescription(cat.description || "");
    setMetaTitle(cat.metaTitle || "");
    setMetaDescription(cat.metaDescription || "");
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      name,
      slug: catSlug || slugify(name, { lower: true, strict: true }),
      description: description || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    };

    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      resetForm();
      fetchCategories();
    } else {
      alert("Gagal menyimpan kategori");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchCategories();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kategori</h1>
          <p className="text-slate-400 mt-1">Kelola kategori artikel</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {editing ? "Edit Kategori" : "Kategori Baru"}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Nama</label>
              <Input value={name} onChange={(e) => { setName(e.target.value); if (!editing) setCatSlug(slugify(e.target.value, { lower: true, strict: true })); }}
                placeholder="Nama kategori" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Slug</label>
              <Input value={catSlug} onChange={(e) => setCatSlug(e.target.value)}
                placeholder="slug-kategori" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl font-mono text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Deskripsi</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi kategori..." className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl resize-none" rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Meta Title (SEO)</label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Meta title" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Meta Description (SEO)</label>
              <Input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Meta description" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving || !name}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {editing ? "Update" : "Simpan"}
          </Button>
        </div>
      )}

      {/* List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Belum ada kategori</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">/{cat.slug} · {cat._count?.articles || 0} artikel</p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => startEdit(cat)} className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(cat.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Hapus Kategori</DialogTitle>
            <DialogDescription className="text-slate-400">
              Apakah Anda yakin? Artikel di kategori ini tidak akan terhapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="border-slate-700 text-slate-300">Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
