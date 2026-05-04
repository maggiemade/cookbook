import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PARSE_PROMPT = `You are a helpful recipe assistant. Parse the following recipe content and return it as structured JSON.

Return ONLY valid JSON with this exact structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "category": one of: "breakfast"|"lunch"|"dinner"|"dessert"|"snack"|"bread"|"drinks"|"other",
  "ingredients": [
    { "amount": "1", "unit": "cup", "name": "flour", "note": "sifted (optional)" }
  ],
  "steps": [
    { "order": 1, "text": "Step description" }
  ],
  "notes": "Any tips, yield, temp, time, etc."
}

For amounts, use fractions like "1/2" rather than decimals. If an ingredient has no unit, leave unit as "".
Parse all information you can find. If the content is an image description, extract what's visible.`;

const VALID_MEDIA_TYPES: ImageMediaType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function isValidMediaType(t: string): t is ImageMediaType {
  return VALID_MEDIA_TYPES.includes(t as ImageMediaType);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, imageUrl, imageBase64, imageMediaType } = body;

  if (!text && !imageUrl && !imageBase64) {
    return NextResponse.json({ error: "No content provided" }, { status: 400 });
  }

  try {
    type ContentBlock =
      | Anthropic.TextBlockParam
      | Anthropic.ImageBlockParam;

    const content: ContentBlock[] = [];

    if (imageBase64 && imageMediaType && isValidMediaType(imageMediaType)) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: imageMediaType, data: imageBase64 },
      });
    } else if (imageUrl) {
      content.push({
        type: "image",
        source: { type: "url", url: imageUrl },
      });
    }

    content.push({
      type: "text",
      text: text
        ? `${PARSE_PROMPT}\n\nRecipe content:\n${text}`
        : `${PARSE_PROMPT}\n\nPlease parse the recipe from the image above.`,
    });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse recipe" }, { status: 422 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Parse error:", err);
    return NextResponse.json({ error: "Failed to parse recipe" }, { status: 500 });
  }
}
