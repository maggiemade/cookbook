"use client";

import { useState, useEffect, useCallback } from "react";
import Nav from "@/components/Nav";
import TagInput from "@/components/TagInput";
import { Inspiration } from "@/types";
import { Plus, X, Bookmark, ExternalLink, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import PhotoUpload from "@/components/PhotoUpload";

interface FormState {
  title: string;
  url: string;
  notes: string;
  tags: string[];
  photo: string;
}

const emptyForm = (): FormState => ({
  title: "",
  url: "",
  notes: "",
  tags: [],
  photo: "",
});

export default function InspirationPage() {
  const [items, setItems] = useState<Inspiration[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [photoArr, setPhotoArr] = useState<string[]>([]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/inspirations?${params}`);
    setItems(await res.json());
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 200);
    return () => clearTimeout(t);
  }, [fetchItems]);

  const openAdd = () => {
    setForm(emptyForm());
    setPhotoArr([]);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this saved item?")) return;
    await fetch(`/api/inspirations/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const body = {
      title: form.title.trim(),
      url: form.url.trim() || undefined,
      photo: photoArr[0] || undefined,
      notes: form.notes.trim() || undefined,
      tags: form.tags,
    };
    await fetch("/api/inspirations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setShowForm(false);
    fetchItems();
  };

  const inputStyle = { borderColor: "var(--border)", background: "var(--card)", color: "var(--text)" };

  return (
    <div className="flex flex-col min-h-dvh">
      <Nav />
      <main className="flex-1 px-4 py-5 pb-24 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Saved</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
            style={{ background: "var(--sky)" }}
          >
            <Plus size={15} /> Save
          </button>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border mb-4"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved items..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: "var(--text)" }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>

        {/* Add form */}
        {showForm && (
          <div
            className="rounded-2xl border p-4 mb-4"
            style={{ background: "var(--card)", borderColor: "var(--sky)" }}
          >
            <form onSubmit={handleSave} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Save something</span>
                <button type="button" onClick={() => setShowForm(false)}>
                  <X size={18} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Title or description..."
                required
                className="w-full text-sm px-3 py-2 rounded-xl border outline-none"
                style={inputStyle}
              />
              <input
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="URL (optional)..."
                type="url"
                className="w-full text-sm px-3 py-2 rounded-xl border outline-none"
                style={inputStyle}
              />
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Notes about why you saved this..."
                rows={2}
                className="w-full text-sm px-3 py-2 rounded-xl border outline-none resize-none"
                style={inputStyle}
              />
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Photo (optional)</p>
                <PhotoUpload photos={photoArr} onChange={setPhotoArr} maxPhotos={1} />
              </div>
              <TagInput tags={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: "var(--sky)" }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--border)" }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Bookmark size={40} style={{ color: "var(--border)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Save links, social posts, or photos of recipes you want to explore.
            </p>
            <button
              onClick={openAdd}
              className="px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ background: "var(--sky)" }}
            >
              Save Something
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 rounded-2xl border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                {item.photo ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <Image src={item.photo} alt={item.title} fill className="object-cover" />
                  </div>
                ) : item.url ? (
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--sky-light)" }}
                  >
                    <ExternalLink size={20} style={{ color: "var(--sky)" }} />
                  </div>
                ) : (
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--lavender-light)" }}
                  >
                    <ImageIcon size={20} style={{ color: "var(--lavender)" }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-snug" style={{ color: "var(--text)" }}>
                      {item.title}
                    </h3>
                    <button onClick={() => handleDelete(item.id)} className="shrink-0 p-1">
                      <Trash2 size={14} style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>
                  {item.notes && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                      {item.notes}
                    </p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs mt-1 truncate"
                      style={{ color: "var(--sky)" }}
                    >
                      <ExternalLink size={11} />
                      {item.url}
                    </a>
                  )}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.tags.map((t) => (
                        <span key={t} className="text-xs" style={{ color: "var(--text-muted)" }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
