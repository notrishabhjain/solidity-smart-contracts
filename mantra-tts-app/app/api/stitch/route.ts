import { NextRequest, NextResponse } from "next/server";
import { stitchAudioChunks, getDurationFromWav } from "@/lib/audioProcessor";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      chunks,       // array of base64 WAV strings
      gapMs  = 600,
      fadeIn = true,
      fadeOut= true,
    }: {
      chunks:   string[];
      gapMs?:   number;
      fadeIn?:  boolean;
      fadeOut?: boolean;
    } = body;

    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json({ error: "chunks array is required" }, { status: 400 });
    }

    const stitched = await stitchAudioChunks(chunks, {
      gapMs,
      normalize: true,
      fadeIn,
      fadeOut,
    });

    const duration      = getDurationFromWav(stitched);
    const audioBase64   = stitched.toString("base64");

    return NextResponse.json({ audioBase64, duration, format: "wav" });
  } catch (err) {
    console.error("Stitch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Audio stitching failed" },
      { status: 500 }
    );
  }
}
