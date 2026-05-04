"use client";

import { useState, useEffect, useCallback } from "react";
import Nav from "@/components/Nav";
import TagInput from "@/components/TagInput";
import { Idea, IdeaCategory } from "@/types";
import {
  Plus,
  X,
  ChevronDown,
  Lightbulb,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";

const CATEGORIES: { value: IdeaCategory | ""; label: string; color: string; bg: string }[] = [
  { value: "", label: "All", color: "var(--text-muted)", bg: "var(--border)" },
  { value: "flavor-combo", label: "Flavor combo", color: "#7055b0", bg: "var(--lavender-light)" },
  { value: "technique", label: "Technique", color: "#5a9a52", bg: "var(--sage-light)" },
  { value: "ingredient", label: "Ingredient", color: "#c07830", bg: "var(--peach-light)" },
  { value: "dish-idea", label: "Dish idea", color: "#c44070", bg: "var(--rose-light)" },
  { value: "other", label: "Other", color: "#4090b0", bg: "var(--sky-light)" },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

interface IdeaCardProps {
  idea: Idea;
  onEdit: (idea: Idea) => void;
  onDelete: (id: string) => void;
}

function IdeaCard({ idea, onEdit, onDelete }: IdeaCardProps) {
  const cat = CAT_MAP[idea.category] || CAT_MAP["other"];
  return (
    <div
      className="p-4 rounded-2xl border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: cat.bg, color: cat.color }}
            >
              {cat.label}
            </span>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
              {idea.title}
            </h3>
          </div>
          {idea.description && (
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {idea.description}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(idea)} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(idea.id)} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {idea.links.length > 0 && (
        <div className="mt-2 space-y-1">
          {idea.links.map((l, i) => (
            <a
              key={i}
              href={l}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs truncate"
              style={{ color: "var(--sky)" }}
            >
              {l}
            </a>
          ))}
        </div>
      )}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {idea.tags.map((t) => (
            <span key={t} className="text-xs" style={{ color: "var(--text-muted)" }}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface FormState {
  title: string;
  description: string;
  category: IdeaCategory;
  links: string;
  tags: string[];
}

const emptyForm = (): FormState => ({
  title: "",
  description: "",
  category: "dish-idea",
  links: "",
  tags: [],
});

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filterCat, setFilterCat] = useState<IdeaCategory | "">("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterCat) params.set("category", filterCat);
    const res = await fetch(`/api/ideas?${params}`);
    setIdeas(await res.json());
    setLoading(false);
  }, [filterCat]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (idea: Idea) => {
    setEditingId(idea.id);
    setForm({
      title: idea.title,
      description: idea.description || "",
      category: idea.category,
      links: idea.links.join("\n"),
      tags: idea.tags,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this idea?")) return;
    await fetch(`/api/ideas/${id}`, { method: "DELETE" });
    fetchIdeas();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const body = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      links: form.links.split("\n").map((l) => l.trim()).filter(Boolean),
      photos: [],
      tags: form.tags,
    };
    if (editingId) {
      await fetch(`/api/ideas/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setSaving(false);
    setShowForm(false);
    fetchIdeas();
  };

  const inputStyle = { borderColor: "var(--border)", background: "var(--card)", color: "var(--text)" };

  return (
    <div className="flex flex-col min-h-dvh">
      <Nav />
      <main className="flex-1 px-4 py-5 pb-24 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Ideas</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
            style={{ background: "var(--lavender)" }}
          >
            <Plus size={15} /> Add idea
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCat(c.value as IdeaCategory | "")}
              className="shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              style={{
                borderColor: filterCat === c.value ? "var(--lavender)" : "var(--border)",
                background: filterCat === c.value ? "var(--lavender-light)" : "var(--card)",
                color: filterCat === c.value ? "var(--text)" : "var(--text-muted)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <div
            className="rounded-2xl border p-4 mb-4"
            style={{ background: "var(--card)", borderColor: "var(--lavender)" }}
          >
            <form onSubmit={handleSave} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {editingId ? "Edit idea" : "New idea"}
                </span>
                <button type="button" onClick={() => setShowForm(false)}>
                  <X size={18} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Idea title..."
                required
                className="w-full text-sm px-3 py-2 rounded-xl border outline-none"
                style={inputStyle}
              />
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as IdeaCategory }))}
                  className="w-full text-sm px-3 py-2 pr-8 rounded-xl border appearance-none outline-none"
                  style={inputStyle}
                >
                  {CATEGORIES.filter((c) => c.value).map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              </div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description or notes..."
                rows={3}
                className="w-full text-sm px-3 py-2 rounded-xl border outline-none resize-none"
                style={inputStyle}
              />
              <textarea
                value={form.links}
                onChange={(e) => setForm((f) => ({ ...f, links: e.target.value }))}
                placeholder="Links (one per line)..."
                rows={2}
                className="w-full text-sm px-3 py-2 rounded-xl border outline-none resize-none"
                style={inputStyle}
              />
              <TagInput tags={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: "var(--lavender)" }}
              >
                {saving ? "Saving..." : editingId ? "Save changes" : "Add idea"}
              </button>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--border)" }} />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Lightbulb size={40} style={{ color: "var(--border)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No ideas yet. Start capturing your cooking inspiration!
            </p>
            <button
              onClick={openAdd}
              className="px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ background: "var(--lavender)" }}
            >
              Add an Idea
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
