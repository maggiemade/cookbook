import { getDb } from "./db";
import { Recipe, SortField, SortOrder } from "@/types";
import { v4 as uuidv4 } from "uuid";

function parseRecipe(row: Record<string, string>): Recipe {
  return {
    ...row,
    ingredients: JSON.parse(row.ingredients || "[]"),
    steps: JSON.parse(row.steps || "[]"),
    tags: JSON.parse(row.tags || "[]"),
    photos: JSON.parse(row.photos || "[]"),
  } as unknown as Recipe;
}

export function listRecipes(opts: {
  search?: string;
  category?: string;
  type?: string;
  tag?: string;
  sortField?: SortField;
  sortOrder?: SortOrder;
}): Recipe[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: string[] = [];

  if (opts.search) {
    conditions.push("(title LIKE ? OR description LIKE ? OR notes LIKE ?)");
    const q = `%${opts.search}%`;
    params.push(q, q, q);
  }
  if (opts.category) {
    conditions.push("category = ?");
    params.push(opts.category);
  }
  if (opts.type) {
    conditions.push("type = ?");
    params.push(opts.type);
  }
  if (opts.tag) {
    conditions.push("tags LIKE ?");
    params.push(`%"${opts.tag}"%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const field = opts.sortField || "updated_at";
  const order = opts.sortOrder || "desc";
  const rows = db
    .prepare(`SELECT * FROM recipes ${where} ORDER BY ${field} ${order}`)
    .all(...params) as Record<string, string>[];

  return rows.map(parseRecipe);
}

export function getRecipe(id: string): Recipe | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM recipes WHERE id = ?")
    .get(id) as Record<string, string> | undefined;
  return row ? parseRecipe(row) : null;
}

export function createRecipe(
  data: Omit<Recipe, "id" | "created_at" | "updated_at">
): Recipe {
  const db = getDb();
  const now = new Date().toISOString();
  const id = uuidv4();
  const recipe: Recipe = {
    ...data,
    id,
    created_at: now,
    updated_at: now,
  };

  db.prepare(
    `INSERT INTO recipes (id, title, type, category, description, source_type, source_url, source_label, ingredients, steps, notes, my_notes, tags, photos, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    recipe.id,
    recipe.title,
    recipe.type,
    recipe.category,
    recipe.description || null,
    recipe.source_type || null,
    recipe.source_url || null,
    recipe.source_label || null,
    JSON.stringify(recipe.ingredients),
    JSON.stringify(recipe.steps),
    recipe.notes || null,
    recipe.my_notes || null,
    JSON.stringify(recipe.tags),
    JSON.stringify(recipe.photos),
    recipe.created_at,
    recipe.updated_at
  );

  return recipe;
}

export function updateRecipe(
  id: string,
  data: Partial<Omit<Recipe, "id" | "created_at">>
): Recipe | null {
  const db = getDb();
  const existing = getRecipe(id);
  if (!existing) return null;

  const updated: Recipe = {
    ...existing,
    ...data,
    id,
    updated_at: new Date().toISOString(),
  };

  db.prepare(
    `UPDATE recipes SET title=?, type=?, category=?, description=?, source_type=?, source_url=?, source_label=?, ingredients=?, steps=?, notes=?, my_notes=?, tags=?, photos=?, updated_at=? WHERE id=?`
  ).run(
    updated.title,
    updated.type,
    updated.category,
    updated.description || null,
    updated.source_type || null,
    updated.source_url || null,
    updated.source_label || null,
    JSON.stringify(updated.ingredients),
    JSON.stringify(updated.steps),
    updated.notes || null,
    updated.my_notes || null,
    JSON.stringify(updated.tags),
    JSON.stringify(updated.photos),
    updated.updated_at,
    id
  );

  return updated;
}

export function deleteRecipe(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM recipes WHERE id = ?").run(id);
  return result.changes > 0;
}
