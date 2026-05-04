import { getDb } from "./db";
import { Idea, Inspiration } from "@/types";
import { v4 as uuidv4 } from "uuid";

function parseIdea(row: Record<string, string>): Idea {
  return {
    ...row,
    links: JSON.parse(row.links || "[]"),
    photos: JSON.parse(row.photos || "[]"),
    tags: JSON.parse(row.tags || "[]"),
  } as unknown as Idea;
}

function parseInspiration(row: Record<string, string>): Inspiration {
  return {
    ...row,
    tags: JSON.parse(row.tags || "[]"),
  } as unknown as Inspiration;
}

export function listIdeas(opts?: { category?: string; search?: string }): Idea[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: string[] = [];

  if (opts?.search) {
    conditions.push("(title LIKE ? OR description LIKE ?)");
    const q = `%${opts.search}%`;
    params.push(q, q);
  }
  if (opts?.category) {
    conditions.push("category = ?");
    params.push(opts.category);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM ideas ${where} ORDER BY created_at DESC`)
    .all(...params) as Record<string, string>[];

  return rows.map(parseIdea);
}

export function createIdea(data: Omit<Idea, "id" | "created_at" | "updated_at">): Idea {
  const db = getDb();
  const now = new Date().toISOString();
  const id = uuidv4();
  const idea: Idea = { ...data, id, created_at: now, updated_at: now };

  db.prepare(
    `INSERT INTO ideas (id, title, description, category, links, photos, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    idea.id,
    idea.title,
    idea.description || null,
    idea.category,
    JSON.stringify(idea.links),
    JSON.stringify(idea.photos),
    JSON.stringify(idea.tags),
    idea.created_at,
    idea.updated_at
  );

  return idea;
}

export function updateIdea(
  id: string,
  data: Partial<Omit<Idea, "id" | "created_at">>
): Idea | null {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM ideas WHERE id = ?")
    .get(id) as Record<string, string> | undefined;
  if (!existing) return null;

  const updated: Idea = {
    ...parseIdea(existing),
    ...data,
    id,
    updated_at: new Date().toISOString(),
  };

  db.prepare(
    `UPDATE ideas SET title=?, description=?, category=?, links=?, photos=?, tags=?, updated_at=? WHERE id=?`
  ).run(
    updated.title,
    updated.description || null,
    updated.category,
    JSON.stringify(updated.links),
    JSON.stringify(updated.photos),
    JSON.stringify(updated.tags),
    updated.updated_at,
    id
  );

  return updated;
}

export function deleteIdea(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM ideas WHERE id = ?").run(id);
  return result.changes > 0;
}

export function listInspirations(opts?: { search?: string }): Inspiration[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: string[] = [];

  if (opts?.search) {
    conditions.push("(title LIKE ? OR notes LIKE ?)");
    const q = `%${opts.search}%`;
    params.push(q, q);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM inspirations ${where} ORDER BY created_at DESC`)
    .all(...params) as Record<string, string>[];

  return rows.map(parseInspiration);
}

export function createInspiration(
  data: Omit<Inspiration, "id" | "created_at">
): Inspiration {
  const db = getDb();
  const now = new Date().toISOString();
  const id = uuidv4();
  const insp: Inspiration = { ...data, id, created_at: now };

  db.prepare(
    `INSERT INTO inspirations (id, title, url, photo, notes, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    insp.id,
    insp.title,
    insp.url || null,
    insp.photo || null,
    insp.notes || null,
    JSON.stringify(insp.tags),
    insp.created_at
  );

  return insp;
}

export function deleteInspiration(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM inspirations WHERE id = ?").run(id);
  return result.changes > 0;
}
