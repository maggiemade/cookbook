"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/Nav";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  BookOpen,
} from "lucide-react";
import { Recipe, RecipeCategory, SortField, SortOrder } from "@/types";

const CATEGORIES: { value: RecipeCategory | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "dessert", label: "Dessert" },
  { value: "snack", label: "Snack" },
  { value: "bread", label: "Bread" },
  { value: "drinks", label: "Drinks" },
  { value: "other", label: "Other" },
];

const CATEGORY_EMOJI: Record<RecipeCategory, string> = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍽️",
  dessert: "🍰",
  snack: "🍿",
  bread: "🍞",
  drinks: "☕",
  other: "🍴",
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<RecipeCategory | "">("");
  const [showInspiration, setShowInspiration] = useState(false);
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (showInspiration) params.set("type", "inspiration");
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    const res = await fetch(`/api/recipes?${params}`);
    const data = await res.json();
    setRecipes(data);
    setLoading(false);
  }, [search, category, showInspiration, sortField, sortOrder]);

  useEffect(() => {
    const t = setTimeout(fetchRecipes, 200);
    return () => clearTimeout(t);
  }, [fetchRecipes]);

  const hasFilters = !!(search || category || showInspiration || sortField !== "updated_at");
  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setShowInspiration(false);
    setSortField("updated_at");
    setSortOrder("desc");
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <Nav />
      <main className="flex-1 px-4 py-5 pb-24 max-w-2xl mx-auto w-full">
        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border"
            style={{ borderColor: "var(--border)", background: "var(--card)" }}
          >
            <Search size={16} style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes..."
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: "var(--text)" }}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} style={{ color: "var(--text-muted)" }} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors"
            style={{
              borderColor: showFilters ? "var(--primary)" : "var(--border)",
              background: showFilters ? "var(--primary-light)" : "var(--card)",
              color: "var(--text)",
            }}
          >
            <SlidersHorizontal size={15} />
            Filter
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value as RecipeCategory | "")}
              className="shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              style={{
                borderColor: category === c.value ? "var(--primary)" : "var(--border)",
                background: category === c.value ? "var(--primary-light)" : "var(--card)",
                color: category === c.value ? "var(--text)" : "var(--text-muted)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div
            className="rounded-xl p-4 mb-4 space-y-3 border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
                  Sort by
                </label>
                <div className="relative">
                  <select
                    value={`${sortField}:${sortOrder}`}
                    onChange={(e) => {
                      const [f, o] = e.target.value.split(":");
                      setSortField(f as SortField);
                      setSortOrder(o as SortOrder);
                    }}
                    className="w-full text-sm px-3 py-2 pr-8 rounded-lg border appearance-none outline-none"
                    style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
                  >
                    <option value="updated_at:desc">Recently updated</option>
                    <option value="created_at:desc">Newest first</option>
                    <option value="created_at:asc">Oldest first</option>
                    <option value="title:asc">A → Z</option>
                    <option value="title:desc">Z → A</option>
                    <option value="category:asc">Category</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                </div>
              </div>
              <button
                onClick={() => setShowInspiration(!showInspiration)}
                className="px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                style={{
                  borderColor: showInspiration ? "var(--lavender)" : "var(--border)",
                  background: showInspiration ? "var(--lavender-light)" : "var(--bg)",
                  color: "var(--text)",
                }}
              >
                Inspiration only
              </button>
            </div>
          </div>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={12} /> Clear filters
          </button>
        )}

        {/* Recipe list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl animate-pulse"
                style={{ background: "var(--border)" }}
              />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <BookOpen size={40} style={{ color: "var(--border)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {hasFilters ? "No recipes match your filters." : "No recipes yet. Add your first one!"}
            </p>
            <Link
              href="/recipes/new"
              className="px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ background: "var(--primary)" }}
            >
              Add a Recipe
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="flex gap-3 p-3 rounded-2xl border transition-shadow hover:shadow-sm active:scale-[0.99]"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                {recipe.photos[0] ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <Image src={recipe.photos[0]} alt={recipe.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: "var(--neutral-light)" }}
                  >
                    {CATEGORY_EMOJI[recipe.category]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-snug" style={{ color: "var(--text)" }}>
                      {recipe.title}
                    </h3>
                    {recipe.type === "inspiration" && (
                      <span
                        className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: "var(--lavender-light)", color: "var(--lavender)" }}
                      >
                        Inspiration
                      </span>
                    )}
                  </div>
                  {recipe.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                      {recipe.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background: "var(--border)", color: "var(--text-muted)" }}
                    >
                      {recipe.category}
                    </span>
                    {recipe.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-xs" style={{ color: "var(--text-muted)" }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
