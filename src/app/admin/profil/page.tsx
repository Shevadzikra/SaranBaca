"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Loader2, UserCircle } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface UserProfile {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  jobTitle: string | null;
  expertise: string[];
  websiteUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export default function ProfilPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [expertise, setExpertise] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/profile`)
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          setName(data.name || "");
          setBio(data.bio || "");
          setAvatar(data.avatar || "");
          setJobTitle(data.jobTitle || "");
          setExpertise(data.expertise?.join(", ") || "");
          setWebsiteUrl(data.websiteUrl || "");
          setTwitterUrl(data.twitterUrl || "");
          setLinkedinUrl(data.linkedinUrl || "");
          setInstagramUrl(data.instagramUrl || "");
          setMetaTitle(data.metaTitle || "");
          setMetaDescription(data.metaDescription || "");
          setLoading(false);
        });
    }
  }, [session]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        bio: bio || null,
        avatar: avatar || null,
        jobTitle: jobTitle || null,
        expertise: expertise.split(",").map((s) => s.trim()).filter(Boolean),
        websiteUrl: websiteUrl || null,
        twitterUrl: twitterUrl || null,
        linkedinUrl: linkedinUrl || null,
        instagramUrl: instagramUrl || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      }),
    });

    if (res.ok) {
      alert("Profil berhasil disimpan!");
    } else {
      alert("Gagal menyimpan profil");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profil Author</h1>
        <p className="text-slate-400 mt-1">Kelola informasi profil Anda untuk halaman author (E-E-A-T)</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
        {/* Avatar */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Foto Profil</label>
          <div className="max-w-xs">
            <ImageUploader value={avatar} onChange={setAvatar} onRemove={() => setAvatar("")} />
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Nama Lengkap</label>
          <Input value={name} onChange={(e) => setName(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Jabatan / Job Title</label>
          <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Content Writer, Editor, dll."
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Bio</label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ceritakan tentang diri Anda..."
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl resize-none" rows={4} />
        </div>

        {/* Expertise */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Keahlian <span className="text-slate-500">(pisahkan dengan koma)</span></label>
          <Input value={expertise} onChange={(e) => setExpertise(e.target.value)} placeholder="SEO, Content Writing, Digital Marketing"
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
        </div>

        <hr className="border-white/10" />

        {/* Social Links */}
        <h3 className="text-sm font-semibold text-white">Media Sosial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Website</label>
            <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Twitter/X</label>
            <Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/..."
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">LinkedIn</label>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..."
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Instagram</label>
            <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..."
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
          </div>
        </div>

        <hr className="border-white/10" />

        {/* SEO Meta */}
        <h3 className="text-sm font-semibold text-white">SEO Halaman Author</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Meta Title</label>
            <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Meta title halaman author"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Meta Description</label>
            <Input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Meta description halaman author"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25 h-11">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Profil
        </Button>
      </div>
    </div>
  );
}
