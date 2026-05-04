"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Nav from "@/components/Nav";
import { Recipe } from "@/types";

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setRecipe(data);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this recipe?")) return;
    setDeleting(true);
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-dvh">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary)" }} />
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col min-h-dvh">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: "var(--text-muted)" }}>Recipe not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <Nav />
      <main className="flex-1 pb-24 max-w-2xl mx-auto w-full">
        {/* Photo / Header */}
        {recipe.photos.length > 0 ? (
          <div className="relative w-full aspect-[4/3] bg-gray-100">
            <Image
              src={recipe.photos[photoIdx]}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
            />
            {recipe.photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIdx((i) => (i - 1 + recipe.photos.length) % recipe.photos.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-1.5 text-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPhotoIdx((i) => (i + 1) % recipe.photos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-1.5 text-white"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {recipe.photos.map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full transition-colors"
                      style={{ background: i === photoIdx ? "white" : "rgba(255,255,255,0.5)" }}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <button
                onClick={() => router.back()}
                className="bg-black/30 rounded-full p-2 text-white backdrop-blur-sm"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex gap-2">
                <Link
                  href={`/recipes/${id}/edit`}
                  className="bg-black/30 rounded-full p-2 text-white backdrop-blur-sm"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-black/30 rounded-full p-2 text-white backdrop-blur-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl"
              style={{ background: "var(--card)", color: "var(--text)" }}
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex gap-2">
              <Link
                href={`/recipes/${id}/edit`}
                className="p-2 rounded-xl"
                style={{ background: "var(--card)", color: "var(--text)" }}
              >
                <Pencil size={18} />
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-xl"
                style={{ background: "var(--card)", color: "var(--text)" }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="px-4 py-5 space-y-6">
          {/* Title & meta */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-2xl font-bold leading-snug" style={{ color: "var(--text)" }}>
                {recipe.title}
              </h1>
              {recipe.type === "inspiration" && (
                <span
                  className="shrink-0 mt-1 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "var(--lavender-light)", color: "var(--lavender)" }}
                >
                  Inspiration
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs capitalize"
                style={{ background: "var(--border)", color: "var(--text-muted)" }}
              >
                {recipe.category}
              </span>
              {recipe.tags.map((t) => (
                <span key={t} className="text-xs" style={{ color: "var(--text-muted)" }}>
                  #{t}
                </span>
              ))}
            </div>

            {recipe.description && (
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {recipe.description}
              </p>
            )}

            {recipe.source_url && (
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 mt-3 text-sm"
                style={{ color: "var(--sky)" }}
              >
                <ExternalLink size={14} />
                {recipe.source_label || recipe.source_url}
              </a>
            )}
            {recipe.source_label && !recipe.source_url && (
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                From: {recipe.source_label}
              </p>
            )}
          </div>

          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>
                Ingredients
              </h2>
              <div
                className="rounded-2xl overflow-hidden border"
                style={{ borderColor: "var(--border)" }}
              >
                {recipe.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                    style={{
                      borderColor: "var(--border)",
                      background: i % 2 === 0 ? "var(--card)" : "var(--bg)",
                    }}
                  >
                    <span
                      className="text-sm font-medium w-16 shrink-0 text-right"
                      style={{ color: "var(--primary)" }}
                    >
                      {ing.amount} {ing.unit}
                    </span>
                    <span className="text-sm flex-1" style={{ color: "var(--text)" }}>
                      {ing.name}
                      {ing.note && (
                        <span className="ml-1 text-xs" style={{ color: "var(--text-muted)" }}>
                          ({ing.note})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {recipe.steps.length > 0 && (
            <div>
              <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>
                Instructions
              </h2>
              <div className="space-y-4">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                    >
                      {step.order}
                    </span>
                    <p className="text-sm leading-relaxed pt-0.5 flex-1" style={{ color: "var(--text)" }}>
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {recipe.notes && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--sky-light)" }}
            >
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
                Notes
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text)" }}>
                {recipe.notes}
              </p>
            </div>
          )}

          {/* My Notes */}
          {recipe.my_notes && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--neutral-light)" }}
            >
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
                ✏️ My notes & edits
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text)" }}>
                {recipe.my_notes}
              </p>
            </div>
          )}

          {/* Edit button */}
          <Link
            href={`/recipes/${id}/edit`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border text-sm font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--card)" }}
          >
            <Pencil size={15} /> Edit Recipe
          </Link>
        </div>
      </main>
    </div>
  );
}
