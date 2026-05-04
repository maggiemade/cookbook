import { NextRequest, NextResponse } from "next/server";
import { listInspirations, createInspiration } from "@/lib/ideas";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const items = listInspirations({
    search: sp.get("search") || undefined,
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const item = createInspiration(data);
  return NextResponse.json(item, { status: 201 });
}
