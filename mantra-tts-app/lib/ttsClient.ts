import { GoogleGenAI } from "@google/genai";
import type { MantraChunk, VoiceConfig } from "@/types";
import { buildTTSPrompt } from "./promptEngine";

const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

// Convert raw LINEAR16 PCM bytes to a valid WAV file buffer
export function pcmToWav(pcmBase64: string, sampleRate: number = 24000): Buffer {
  const pcmBuffer     = Buffer.from(pcmBase64, "base64");
  const numChannels   = 1;
  const bitsPerSample = 16;
  const byteRate      = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign    = numChannels * (bitsPerSample / 8);
  const dataSize      = pcmBuffer.length;
  const headerSize    = 44;
  const fileSize      = headerSize + dataSize;

  const header = Buffer.alloc(headerSize);
  let offset   = 0;

  header.write("RIFF",                   offset); offset += 4;
  header.writeUInt32LE(fileSize - 8,     offset); offset += 4;
  header.write("WAVE",                   offset); offset += 4;
  header.write("fmt ",                   offset); offset += 4;
  header.writeUInt32LE(16,               offset); offset += 4; // chunk size
  header.writeUInt16LE(1,                offset); offset += 2; // PCM format
  header.writeUInt16LE(numChannels,      offset); offset += 2;
  header.writeUInt32LE(sampleRate,       offset); offset += 4;
  header.writeUInt32LE(byteRate,         offset); offset += 4;
  header.writeUInt16LE(blockAlign,       offset); offset += 2;
  header.writeUInt16LE(bitsPerSample,    offset); offset += 2;
  header.write("data",                   offset); offset += 4;
  header.writeUInt32LE(dataSize,         offset);

  return Buffer.concat([header, pcmBuffer]);
}

export async function generateChunkAudio(
  chunk:       MantraChunk,
  voiceConfig: VoiceConfig,
  isFirst:     boolean,
  isLast:      boolean,
  totalChunks: number,
  retries:     number = 3
): Promise<{ audioBase64: string; duration: number }> {
  const ai     = getClient();
  const prompt = buildTTSPrompt(chunk, voiceConfig, isFirst, isLast, chunk.index, totalChunks);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model:    GEMINI_TTS_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceConfig.voiceName,
              },
            },
          },
        },
      });

      const part      = response?.candidates?.[0]?.content?.parts?.[0];
      const audioData = (part as any)?.inlineData?.data as string | undefined;

      if (!audioData) {
        throw new Error("No audio data in Gemini TTS response");
      }

      // Gemini TTS returns raw LINEAR16 PCM — wrap in WAV header
      const wavBuffer    = pcmToWav(audioData);
      const wavBase64    = wavBuffer.toString("base64");
      const durationSecs = (wavBuffer.length - 44) / (24000 * 2); // 24kHz 16-bit mono

      return { audioBase64: wavBase64, duration: durationSecs };
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError ?? new Error("TTS generation failed after all retries");
}

export async function listAvailableVoices(): Promise<string[]> {
  return ["Charon", "Kore", "Fenrir", "Aoede", "Puck", "Orbit", "Zephyr", "Nova", "Umbriel"];
}
