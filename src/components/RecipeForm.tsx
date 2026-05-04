"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  Link2,
  Type,
  Camera,
  Sparkles,
} from "lucide-react";
import { Recipe, RecipeCategory, RecipeType, Ingredient, Step, SourceType } from "@/types";
import PhotoUpload from "./PhotoUpload";
import TagInput from "./TagInput";

const CATEGORIES: RecipeCategory[] = [
  "breakfast", "lunch", "dinner", "dessert", "snack", "bread", "drinks", "other",
];

const TYPES: { value: RecipeType; label: string; desc: string }[] = [
  { value: "original", label: "My recipe", desc: "Something I created myself" },
  { value: "adapted", label: "Adapted", desc: "Based on another recipe with my changes" },
  { value: "reference", label: "Reference", desc: "A recipe I use as-is" },
  { value: "saved", label: "Saved", desc: "Saved for reading / inspiration" },
];

const TYPE_COLORS: Record<RecipeType, string> = {
  original: "var(--sage-light)",
  adapted: "var(--peach-light)",
  reference: "var(--sky-light)",
  saved: "var(--lavender-light)",
};

type ParseMode = "url" | "photo" | "text" | null;

interface Props {
  initial?: Partial<Recipe>;
  recipeId?: string;
}

const emptyIngredient = (): Ingredient => ({ amount: "", unit: "", name: "" });
const emptyStep = (order: number): Step => ({ order, text: "" });

export default function RecipeForm({ initial, recipeId }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title || "");
  const [type, setType] = useState<RecipeType>(initial?.type || "original");
  const [category, setCategory] = useState<RecipeCategory>(initial?.category || "other");
  const [description, setDescription] = useState(initial?.description || "");
  const [sourceType, setSourceType] = useState<SourceType | "">(initial?.source_type || "");
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url || "");
  const [sourceLabel, setSourceLabel] = useState(initial?.source_label || "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients?.length ? initial.ingredients : [emptyIngredient()]
  );
  const [steps, setSteps] = useState<Step[]>(
    initial?.steps?.length ? initial.steps : [emptyStep(1)]
  );
  const [notes, setNotes] = useState(initial?.notes || "");
  const [myNotes, setMyNotes] = useState(initial?.my_notes || "");
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [photos, setPhotos] = useState<string[]>(initial?.photos || []);

  const [saving, setSaving] = useState(false);
  const [parseMode, setParseMode] = useState<ParseMode>(null);
  const [parseInput, setParseInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const parseRecipe = async (payload: Record<string, string>) => {
    setParsing(true);
    setParseError("");
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setParseError(data.error || "Failed to parse");
        return;
      }
      if (data.title && !title) setTitle(data.title);
      if (data.description && !description) setDescription(data.description);
      if (data.category) setCategory(data.category);
      if (data.ingredients?.length) setIngredients(data.ingredients);
      if (data.steps?.length) setSteps(data.steps);
      if (data.notes) setNotes(data.notes);
      setParseMode(null);
      setParseInput("");
    } catch {
      setParseError("Something went wrong");
    } finally {
      setParsing(false);
    }
  };

  const handleParseUrl = () => parseRecipe({ text: `Please parse this recipe from URL: ${parseInput}`, imageUrl: parseInput.match(/\.(jpg|jpeg|png|gif|webp)/i) ? parseInput : "" });
  const handleParseText = () => parseRecipe({ text: parseInput });
  const handleParsePhoto = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const mediaType = file.type;
      await parseRecipe({ imageBase64: base64, imageMediaType: mediaType });
    };
    reader.readAsDataURL(file);
  };

  const updateIngredient = (i: number, field: keyof Ingredient, val: string) => {
    setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  };
  const addIngredient = () => setIngredients((p) => [...p, emptyIngredient()]);
  const removeIngredient = (i: number) => setIngredients((p) => p.filter((_, idx) => idx !== i));

  const updateStep = (i: number, val: string) => {
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, text: val } : s));
  };
  const addStep = () => setSteps((p) => [...p, emptyStep(p.length + 1)]);
  const removeStep = (i: number) => setSteps((p) => p.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        type,
        category,
        description: description.trim() || undefined,
        source_type: sourceType || undefined,
        source_url: sourceUrl.trim() || undefined,
        source_label: sourceLabel.trim() || undefined,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.text.trim()).map((s, i) => ({ ...s, order: i + 1 })),
        notes: notes.trim() || undefined,
        my_notes: myNotes.trim() || undefined,
        tags,
        photos,
      };

      const url = recipeId ? `/api/recipes/${recipeId}` : "/api/recipes";
      const method = recipeId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      router.push(`/recipes/${data.id}`);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    borderColor: "var(--border)",
    background: "var(--card)",
    color: "var(--text)",
  };

  const labelStyle = { color: "var(--text-muted)" };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-8">
      {/* AI Parse section */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} style={{ color: "var(--rose)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Import with AI
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Upload a photo, paste a URL, or paste text to auto-fill the recipe fields.
          </p>
        </div>
        <div className="flex divide-x" style={{ borderColor: "var(--border)" }}>
          {(["photo", "url", "text"] as ParseMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setParseMode(parseMode === mode ? null : mode)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors"
              style={{
                background: parseMode === mode ? "var(--rose-light)" : "transparent",
                color: parseMode === mode ? "var(--text)" : "var(--text-muted)",
              }}
            >
              {mode === "photo" && <Camera size={16} />}
              {mode === "url" && <Link2 size={16} />}
              {mode === "text" && <Type size={16} />}
              {mode === "photo" ? "Photo" : mode === "url" ? "URL / Link" : "Paste text"}
            </button>
          ))}
        </div>

        {parseMode && (
          <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
            {parseMode === "photo" && (
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleParsePhoto(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={parsing}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  {parsing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  {parsing ? "Parsing..." : "Take photo or choose from library"}
                </button>
              </div>
            )}

            {(parseMode === "url" || parseMode === "text") && (
              <div className="space-y-2">
                {parseMode === "url" ? (
                  <input
                    value={parseInput}
                    onChange={(e) => setParseInput(e.target.value)}
                    placeholder="Paste a recipe URL or image URL..."
                    className="w-full text-sm px-3 py-2 rounded-xl border outline-none"
                    style={inputStyle}
                  />
                ) : (
                  <textarea
                    value={parseInput}
                    onChange={(e) => setParseInput(e.target.value)}
                    placeholder="Paste the recipe text here..."
                    rows={5}
                    className="w-full text-sm px-3 py-2 rounded-xl border outline-none resize-none"
                    style={inputStyle}
                  />
                )}
                {parseError && (
                  <p className="text-xs" style={{ color: "#e05050" }}>{parseError}</p>
                )}
                <button
                  type="button"
                  onClick={parseMode === "url" ? handleParseUrl : handleParseText}
                  disabled={parsing || !parseInput.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "var(--rose)" }}
                >
                  {parsing && <Loader2 size={14} className="animate-spin" />}
                  {parsing ? "Parsing..." : "Parse Recipe"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recipe type */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={labelStyle}>Recipe type</label>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className="text-left p-3 rounded-xl border transition-all"
              style={{
                borderColor: type === t.value ? "var(--rose)" : "var(--border)",
                background: type === t.value ? TYPE_COLORS[t.value] : "var(--card)",
              }}
            >
              <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{t.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium mb-1 block" style={labelStyle}>Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Recipe name"
          required
          className="w-full text-base px-3 py-2.5 rounded-xl border outline-none"
          style={inputStyle}
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={labelStyle}>Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="px-3 py-1 rounded-full text-xs font-medium border capitalize transition-colors"
              style={{
                borderColor: category === c ? "var(--rose)" : "var(--border)",
                background: category === c ? "var(--rose-light)" : "var(--card)",
                color: "var(--text)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium mb-1 block" style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
          rows={2}
          className="w-full text-sm px-3 py-2 rounded-xl border outline-none resize-none"
          style={inputStyle}
        />
      </div>

      {/* Source */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={labelStyle}>Source</label>
        <div className="flex gap-2 mb-2">
          {(["url", "manual"] as SourceType[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSourceType(sourceType === s ? "" : s)}
              className="px-3 py-1 rounded-full text-xs border"
              style={{
                borderColor: sourceType === s ? "var(--rose)" : "var(--border)",
                background: sourceType === s ? "var(--rose-light)" : "var(--card)",
                color: "var(--text)",
              }}
            >
              {s === "url" ? "URL / Link" : "Cookbook / Manual"}
            </button>
          ))}
        </div>
        {sourceType && (
          <div className="space-y-2">
            <input
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
              placeholder={sourceType === "url" ? "Label (e.g. NYT Cooking)" : "Book title / source name"}
              className="w-full text-sm px-3 py-2 rounded-xl border outline-none"
              style={inputStyle}
            />
            {sourceType === "url" && (
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                className="w-full text-sm px-3 py-2 rounded-xl border outline-none"
                style={inputStyle}
              />
            )}
          </div>
        )}
      </div>

      {/* Ingredients */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={labelStyle}>Ingredients</label>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <GripVertical size={14} style={{ color: "var(--border)" }} className="shrink-0" />
              <input
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                placeholder="Amt"
                className="w-14 text-sm px-2 py-2 rounded-lg border outline-none text-center"
                style={inputStyle}
              />
              <input
                value={ing.unit}
                onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                placeholder="Unit"
                className="w-16 text-sm px-2 py-2 rounded-lg border outline-none"
                style={inputStyle}
              />
              <input
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                placeholder="Ingredient"
                className="flex-1 text-sm px-2 py-2 rounded-lg border outline-none"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border w-full justify-center"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)", borderStyle: "dashed" }}
          >
            <Plus size={14} /> Add ingredient
          </button>
        </div>
      </div>

      {/* Steps */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={labelStyle}>Steps</label>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-2"
                style={{ background: "var(--rose-light)", color: "var(--rose)" }}
              >
                {i + 1}
              </span>
              <textarea
                value={step.text}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder={`Step ${i + 1}...`}
                rows={2}
                className="flex-1 text-sm px-3 py-2 rounded-xl border outline-none resize-none"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="mt-2 shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border w-full justify-center"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)", borderStyle: "dashed" }}
          >
            <Plus size={14} /> Add step
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium mb-1 block" style={labelStyle}>Recipe notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Yield, temperatures, tips from the original recipe..."
          rows={3}
          className="w-full text-sm px-3 py-2 rounded-xl border outline-none resize-none"
          style={inputStyle}
        />
      </div>

      {/* My Notes */}
      <div>
        <label className="text-xs font-medium mb-1 block" style={labelStyle}>
          My notes & edits
        </label>
        <textarea
          value={myNotes}
          onChange={(e) => setMyNotes(e.target.value)}
          placeholder="What I changed, what worked, what to try next time..."
          rows={3}
          className="w-full text-sm px-3 py-2 rounded-xl border outline-none resize-none"
          style={{ ...inputStyle, background: "var(--peach-light)" }}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs font-medium mb-1 block" style={labelStyle}>Tags</label>
        <TagInput tags={tags} onChange={setTags} placeholder="chocolate, gluten-free, quick..." />
      </div>

      {/* Photos */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={labelStyle}>Photos</label>
        <PhotoUpload photos={photos} onChange={setPhotos} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-50 transition-opacity"
        style={{ background: "var(--rose)" }}
      >
        {saving ? "Saving..." : recipeId ? "Save changes" : "Add recipe"}
      </button>
    </form>
  );
}
