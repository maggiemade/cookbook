import { NextRequest, NextResponse } from "next/server";
import { listRecipes, createRecipe } from "@/lib/recipes";
import { SortField, SortOrder } from "@/types";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const recipes = listRecipes({
    search: sp.get("search") || undefined,
    category: sp.get("category") || undefined,
    type: sp.get("type") || undefined,
    tag: sp.get("tag") || undefined,
    sortField: (sp.get("sortField") as SortField) || undefined,
    sortOrder: (sp.get("sortOrder") as SortOrder) || undefined,
  });
  return NextResponse.json(recipes);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const recipe = createRecipe(data);
  return NextResponse.json(recipe, { status: 201 });
}
