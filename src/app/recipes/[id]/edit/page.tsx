"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Nav from "@/components/Nav";
import RecipeForm from "@/components/RecipeForm";
import { Recipe } from "@/types";

export default function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setRecipe(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-dvh">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--rose)" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <Nav />
      <main className="flex-1 px-4 py-5 pb-24 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl"
            style={{ background: "var(--card)", color: "var(--text)" }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text)" }}>
            Edit Recipe
          </h1>
        </div>
        {recipe && <RecipeForm initial={recipe} recipeId={id} />}
      </main>
    </div>
  );
}
