"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Tags,
  Loader2,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  GripVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import slugify from "slugify";

interface Tag {
  id: string;
  name: string;
  slug: string;
  tagGroupId: string | null;
  _count?: { articles: number };
}

interface TagGroup {
  id: string;
  name: string;
  slug: string;
  order: number;
  tags: Tag[];
  _count?: { tags: number };
}

export default function TagPage() {
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Collapse state for groups
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Tag Group form
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TagGroup | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupSlug, setGroupSlug] = useState("");
  const [savingGroup, setSavingGroup] = useState(false);

  // Tag form
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagSlug, setTagSlug] = useState("");
  const [tagGroupId, setTagGroupId] = useState("");
  const [savingTag, setSavingTag] = useState(false);

  // Add tag inline (per group)
  const [inlineAddGroup, setInlineAddGroup] = useState<string | null>(null);
  const [inlineTagName, setInlineTagName] = useState("");

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<{ type: "tag" | "group"; id: string; name: string } | null>(null);

  async function fetchTagGroups() {
    setLoading(true);
    const res = await fetch("/api/tag-groups");
    const data = await res.json();
    setTagGroups(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTagGroups();
  }, []);

  function toggleCollapse(groupId: string) {
    setCollapsed((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  // --- Tag Group CRUD ---
  function resetGroupForm() {
    setGroupName("");
    setGroupSlug("");
    setEditingGroup(null);
    setShowGroupForm(false);
  }

  function startEditGroup(group: TagGroup) {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupSlug(group.slug);
    setShowGroupForm(true);
  }

  async function handleSaveGroup() {
    setSavingGroup(true);
    const body = {
      name: groupName,
      slug: groupSlug || slugify(groupName, { lower: true, strict: true }),
    };

    const url = editingGroup ? `/api/tag-groups/${editingGroup.id}` : "/api/tag-groups";
    const method = editingGroup ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      resetGroupForm();
      fetchTagGroups();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan grup tag");
    }
    setSavingGroup(false);
  }

  // --- Tag CRUD ---
  function resetTagForm() {
    setTagName("");
    setTagSlug("");
    setTagGroupId("");
    setEditingTag(null);
    setShowTagForm(false);
  }

  function startEditTag(tag: Tag) {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagSlug(tag.slug);
    setTagGroupId(tag.tagGroupId || "");
    setShowTagForm(true);
  }

  async function handleSaveTag() {
    setSavingTag(true);
    const body = {
      name: tagName,
      slug: tagSlug || slugify(tagName, { lower: true, strict: true }),
      tagGroupId: tagGroupId || null,
    };

    const url = editingTag ? `/api/tags/${editingTag.id}` : "/api/tags";
    const method = editingTag ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      resetTagForm();
      fetchTagGroups();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menyimpan tag");
    }
    setSavingTag(false);
  }

  // Inline add tag to a group
  async function handleInlineAddTag(groupId: string) {
    if (!inlineTagName.trim()) return;
    setSavingTag(true);

    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: inlineTagName.trim(),
        slug: slugify(inlineTagName.trim(), { lower: true, strict: true }),
        tagGroupId: groupId,
      }),
    });

    if (res.ok) {
      setInlineTagName("");
      setInlineAddGroup(null);
      fetchTagGroups();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal menambah tag");
    }
    setSavingTag(false);
  }

  // Delete handler
  async function handleDelete() {
    if (!deleteTarget) return;
    const url =
      deleteTarget.type === "tag"
        ? `/api/tags/${deleteTarget.id}`
        : `/api/tag-groups/${deleteTarget.id}`;

    const res = await fetch(url, { method: "DELETE" });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Gagal menghapus");
    }

    setDeleteTarget(null);
    fetchTagGroups();
  }

  // Count total tags
  const totalTags = tagGroups.reduce((sum, g) => sum + g.tags.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tag</h1>
          <p className="text-slate-400 mt-1">
            Kelola tag artikel — {totalTags} tag dalam {tagGroups.length} grup
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              resetGroupForm();
              setShowGroupForm(true);
            }}
            variant="outline"
            className="rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <FolderPlus className="w-4 h-4 mr-2" /> Grup Baru
          </Button>
          <Button
            onClick={() => {
              resetTagForm();
              setShowTagForm(true);
            }}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
          >
            <Plus className="w-4 h-4 mr-2" /> Tag Baru
          </Button>
        </div>
      </div>

      {/* Tag Group Form */}
      {showGroupForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {editingGroup ? "Edit Grup Tag" : "Grup Tag Baru"}
            </h2>
            <button onClick={resetGroupForm} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Nama Grup</label>
              <Input
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  if (!editingGroup) setGroupSlug(slugify(e.target.value, { lower: true, strict: true }));
                }}
                placeholder="Nama grup tag"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Slug</label>
              <Input
                value={groupSlug}
                onChange={(e) => setGroupSlug(e.target.value)}
                placeholder="slug-grup"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl font-mono text-sm"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveGroup}
            disabled={savingGroup || !groupName}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
          >
            {savingGroup ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {editingGroup ? "Update" : "Simpan"}
          </Button>
        </div>
      )}

      {/* Tag Form (standalone) */}
      {showTagForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {editingTag ? "Edit Tag" : "Tag Baru"}
            </h2>
            <button onClick={resetTagForm} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Nama Tag</label>
              <Input
                value={tagName}
                onChange={(e) => {
                  setTagName(e.target.value);
                  if (!editingTag) setTagSlug(slugify(e.target.value, { lower: true, strict: true }));
                }}
                placeholder="Nama tag"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Slug</label>
              <Input
                value={tagSlug}
                onChange={(e) => setTagSlug(e.target.value)}
                placeholder="slug-tag"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Grup</label>
              <Select value={tagGroupId} onValueChange={setTagGroupId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-slate-300 rounded-xl">
                  <SelectValue placeholder="Pilih grup" />
                </SelectTrigger>
                <SelectContent>
                  {tagGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSaveTag}
            disabled={savingTag || !tagName}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
          >
            {savingTag ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {editingTag ? "Update" : "Simpan"}
          </Button>
        </div>
      )}

      {/* Tag Groups List */}
      {loading ? (
        <div className="p-10 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Memuat...
        </div>
      ) : tagGroups.length === 0 ? (
        <div className="p-10 text-center">
          <Tags className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Belum ada tag</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tagGroups.map((group) => {
            const isCollapsed = collapsed[group.id] ?? false;

            return (
              <div
                key={group.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <button
                    onClick={() => toggleCollapse(group.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <h3 className="text-sm font-semibold text-white">{group.name}</h3>
                      <Badge className="bg-white/10 text-slate-400 border-white/10 text-[10px] px-1.5 py-0">
                        {group.tags.length}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-600 font-mono">/{group.slug}</span>
                  </button>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => {
                        setInlineAddGroup(inlineAddGroup === group.id ? null : group.id);
                        setInlineTagName("");
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      title="Tambah tag ke grup ini"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEditGroup(group)}
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: "group", id: group.id, name: group.name })}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Add Tag */}
                {inlineAddGroup === group.id && (
                  <div className="px-5 pb-3 flex items-center gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                    <Input
                      value={inlineTagName}
                      onChange={(e) => setInlineTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleInlineAddTag(group.id);
                        if (e.key === "Escape") { setInlineAddGroup(null); setInlineTagName(""); }
                      }}
                      placeholder="Nama tag baru..."
                      className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 rounded-lg h-9 text-sm flex-1"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleInlineAddTag(group.id)}
                      disabled={savingTag || !inlineTagName.trim()}
                      className="rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 h-9 px-3"
                    >
                      {savingTag ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    </Button>
                    <button
                      onClick={() => { setInlineAddGroup(null); setInlineTagName(""); }}
                      className="p-2 text-slate-500 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Tags Grid */}
                {!isCollapsed && group.tags.length > 0 && (
                  <div className="px-5 pb-4 border-t border-white/5">
                    <div className="flex flex-wrap gap-2 pt-3">
                      {group.tags.map((tag) => (
                        <div
                          key={tag.id}
                          className="group/tag flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-all"
                        >
                          <span className="text-sm text-slate-300">{tag.name}</span>
                          <span className="text-[10px] text-slate-600 font-mono">
                            {tag._count?.articles || 0}
                          </span>
                          <div className="flex items-center gap-0 opacity-0 group-hover/tag:opacity-100 transition-opacity ml-1">
                            <button
                              onClick={() => startEditTag(tag)}
                              className="p-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: "tag", id: tag.id, name: tag.name })}
                              className="p-0.5 text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isCollapsed && group.tags.length === 0 && (
                  <div className="px-5 pb-4 border-t border-white/5">
                    <p className="text-xs text-slate-600 pt-3">Belum ada tag dalam grup ini.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Hapus {deleteTarget?.type === "group" ? "Grup Tag" : "Tag"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {deleteTarget?.type === "group"
                ? `Apakah Anda yakin ingin menghapus grup "${deleteTarget?.name}"? Tag di dalam grup ini akan menjadi tanpa grup.`
                : `Apakah Anda yakin ingin menghapus tag "${deleteTarget?.name}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-slate-700 text-slate-300">
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
