import { NextResponse } from "next/server";
import { GEMINI_VOICES, PRESET_DEFAULTS } from "@/lib/promptEngine";

export async function GET() {
  return NextResponse.json({
    voices:  GEMINI_VOICES,
    presets: PRESET_DEFAULTS,
  });
}
