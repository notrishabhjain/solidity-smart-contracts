import { NextRequest, NextResponse } from "next/server";
import { preprocessText } from "@/lib/preprocessor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, pace = 1.0 } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (text.length > 50000) {
      return NextResponse.json({ error: "Text too long (max 50,000 characters)" }, { status: 400 });
    }

    const result = preprocessText(text.trim(), pace);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Preprocess error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Preprocessing failed" },
      { status: 500 }
    );
  }
}
