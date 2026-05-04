"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Nav from "@/components/Nav";
import RecipeForm from "@/components/RecipeForm";

export default function NewRecipePage() {
  const router = useRouter();
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
            New Recipe
          </h1>
        </div>
        <RecipeForm />
      </main>
    </div>
  );
}
