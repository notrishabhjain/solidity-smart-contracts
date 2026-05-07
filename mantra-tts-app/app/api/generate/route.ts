import { NextRequest, NextResponse } from "next/server";
import { generateChunkAudio } from "@/lib/ttsClient";
import type { MantraChunk, VoiceConfig } from "@/types";

export const maxDuration = 60; // seconds

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      chunk,
      voiceConfig,
      isFirst     = false,
      isLast      = false,
      totalChunks = 1,
    }: {
      chunk:       MantraChunk;
      voiceConfig: VoiceConfig;
      isFirst:     boolean;
      isLast:      boolean;
      totalChunks: number;
    } = body;

    if (!chunk || !voiceConfig) {
      return NextResponse.json({ error: "chunk and voiceConfig are required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please set it in .env.local" },
        { status: 503 }
      );
    }

    const result = await generateChunkAudio(
      chunk,
      voiceConfig,
      isFirst,
      isLast,
      totalChunks
    );

    return NextResponse.json({
      chunkId:     chunk.id,
      chunkIndex:  chunk.index,
      audioBase64: result.audioBase64,
      duration:    result.duration,
    });
  } catch (err) {
    console.error("TTS generation error:", err);
    const message = err instanceof Error ? err.message : "TTS generation failed";

    // Provide helpful error messages
    if (message.includes("API key")) {
      return NextResponse.json({ error: "Invalid or missing Gemini API key" }, { status: 401 });
    }
    if (message.includes("quota") || message.includes("rate limit")) {
      return NextResponse.json({ error: "API rate limit exceeded. Please wait and retry." }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
