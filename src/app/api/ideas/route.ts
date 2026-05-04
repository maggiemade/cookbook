import { NextRequest, NextResponse } from "next/server";
import { listIdeas, createIdea } from "@/lib/ideas";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ideas = listIdeas({
    search: sp.get("search") || undefined,
    category: sp.get("category") || undefined,
  });
  return NextResponse.json(ideas);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const idea = createIdea(data);
  return NextResponse.json(idea, { status: 201 });
}
