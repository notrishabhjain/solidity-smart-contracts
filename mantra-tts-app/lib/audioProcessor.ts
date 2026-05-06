import { writeFile, unlink, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

const TEMP_DIR = process.env.TEMP_DIR || join(tmpdir(), "mantra-tts");

async function ensureTempDir(): Promise<void> {
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true });
  }
}

// Write base64 WAV to a temp file and return the path
async function writeTempWav(base64Data: string, id?: string): Promise<string> {
  await ensureTempDir();
  const filename = join(TEMP_DIR, `${id || uuidv4()}.wav`);
  const buffer   = Buffer.from(base64Data, "base64");
  await writeFile(filename, buffer);
  return filename;
}

// Concatenate WAV buffers by appending their PCM data
function concatWavBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) throw new Error("No audio buffers to concatenate");
  if (buffers.length === 1) return buffers[0];

  // All buffers should have the same format (24kHz, 16-bit, mono)
  const HEADER_SIZE = 44;
  const pcmChunks: Buffer[] = [];
  let totalPcmSize = 0;

  for (const buf of buffers) {
    const pcm = buf.slice(HEADER_SIZE);
    pcmChunks.push(pcm);
    totalPcmSize += pcm.length;
  }

  // Build combined WAV header based on first buffer's format
  const header = Buffer.from(buffers[0].slice(0, HEADER_SIZE));

  // Update file size and data chunk size
  header.writeUInt32LE(36 + totalPcmSize, 4);
  header.writeUInt32LE(totalPcmSize,      40);

  return Buffer.concat([header, ...pcmChunks]);
}

// Add silence gap between chunks (silence = zeros at 24kHz 16-bit mono)
function createSilence(durationMs: number): Buffer {
  const sampleRate    = 24000;
  const numSamples    = Math.floor((sampleRate * durationMs) / 1000);
  const silenceBuffer = Buffer.alloc(numSamples * 2, 0); // 16-bit = 2 bytes/sample

  // Wrap in WAV format
  const HEADER_SIZE = 44;
  const fileSize    = HEADER_SIZE + silenceBuffer.length;
  const header      = Buffer.alloc(HEADER_SIZE);
  let offset = 0;

  header.write("RIFF",                     offset); offset += 4;
  header.writeUInt32LE(fileSize - 8,        offset); offset += 4;
  header.write("WAVE",                     offset); offset += 4;
  header.write("fmt ",                     offset); offset += 4;
  header.writeUInt32LE(16,                 offset); offset += 4;
  header.writeUInt16LE(1,                  offset); offset += 2; // PCM
  header.writeUInt16LE(1,                  offset); offset += 2; // mono
  header.writeUInt32LE(sampleRate,         offset); offset += 4;
  header.writeUInt32LE(sampleRate * 2,     offset); offset += 4; // byteRate
  header.writeUInt16LE(2,                  offset); offset += 2; // blockAlign
  header.writeUInt16LE(16,                 offset); offset += 2; // bitsPerSample
  header.write("data",                     offset); offset += 4;
  header.writeUInt32LE(silenceBuffer.length, offset);

  return Buffer.concat([header, silenceBuffer]);
}

// Normalize PCM volume (simple peak normalization)
function normalizePCM(wavBuffer: Buffer, targetLevel: number = 0.85): Buffer {
  const HEADER_SIZE = 44;
  const header      = wavBuffer.slice(0, HEADER_SIZE);
  const pcmData     = wavBuffer.slice(HEADER_SIZE);

  // Find peak
  let peak = 0;
  for (let i = 0; i < pcmData.length - 1; i += 2) {
    const sample = Math.abs(pcmData.readInt16LE(i));
    if (sample > peak) peak = sample;
  }

  if (peak === 0) return wavBuffer;

  const gain = (targetLevel * 32767) / peak;

  const normalized = Buffer.alloc(pcmData.length);
  for (let i = 0; i < pcmData.length - 1; i += 2) {
    const sample  = pcmData.readInt16LE(i);
    const newVal  = Math.max(-32768, Math.min(32767, Math.round(sample * gain)));
    normalized.writeInt16LE(newVal, i);
  }

  return Buffer.concat([header, normalized]);
}

// Apply linear fade-in to first N milliseconds of PCM audio
function applyFadeIn(wavBuffer: Buffer, fadeMs: number = 300): Buffer {
  const HEADER_SIZE = 44;
  const sampleRate  = 24000;
  const fadeSamples = Math.floor((sampleRate * fadeMs) / 1000);
  const header      = wavBuffer.slice(0, HEADER_SIZE);
  const pcm         = Buffer.from(wavBuffer.slice(HEADER_SIZE));

  for (let i = 0; i < Math.min(fadeSamples * 2, pcm.length - 1); i += 2) {
    const sampleIdx = i / 2;
    const gain      = sampleIdx / fadeSamples;
    const sample    = pcm.readInt16LE(i);
    pcm.writeInt16LE(Math.round(sample * gain), i);
  }

  return Buffer.concat([header, pcm]);
}

// Apply linear fade-out to last N milliseconds of PCM audio
function applyFadeOut(wavBuffer: Buffer, fadeMs: number = 500): Buffer {
  const HEADER_SIZE = 44;
  const sampleRate  = 24000;
  const fadeSamples = Math.floor((sampleRate * fadeMs) / 1000);
  const header      = wavBuffer.slice(0, HEADER_SIZE);
  const pcm         = Buffer.from(wavBuffer.slice(HEADER_SIZE));
  const totalSamples = pcm.length / 2;
  const fadeStart    = totalSamples - fadeSamples;

  for (let i = Math.max(0, fadeStart * 2); i < pcm.length - 1; i += 2) {
    const sampleIdx = i / 2;
    const fadePos   = sampleIdx - fadeStart;
    const gain      = 1 - fadePos / fadeSamples;
    const sample    = pcm.readInt16LE(i);
    pcm.writeInt16LE(Math.round(sample * Math.max(0, gain)), i);
  }

  return Buffer.concat([header, pcm]);
}

export interface StitchOptions {
  gapMs?:     number;   // silence between chunks
  normalize?: boolean;
  fadeIn?:    boolean;
  fadeOut?:   boolean;
}

export async function stitchAudioChunks(
  chunksBase64: string[],
  options: StitchOptions = {}
): Promise<Buffer> {
  const {
    gapMs     = 500,
    normalize = true,
    fadeIn    = true,
    fadeOut   = true,
  } = options;

  if (chunksBase64.length === 0) throw new Error("No audio chunks provided");

  const wavBuffers: Buffer[] = [];
  const silenceBuffer        = gapMs > 0 ? createSilence(gapMs) : null;

  for (let i = 0; i < chunksBase64.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wavBuf: any = Buffer.from(chunksBase64[i], "base64");

    if (normalize) {
      wavBuf = normalizePCM(wavBuf as Buffer);
    }

    wavBuffers.push(wavBuf);

    if (silenceBuffer && i < chunksBase64.length - 1) {
      wavBuffers.push(silenceBuffer);
    }
  }

  let combined = concatWavBuffers(wavBuffers);

  if (normalize)  combined = normalizePCM(combined);
  if (fadeIn)     combined = applyFadeIn(combined, 300);
  if (fadeOut)    combined = applyFadeOut(combined, 800);

  return combined;
}

export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  await Promise.allSettled(filePaths.map(p => unlink(p).catch(() => {})));
}

export function wavBufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

export function getDurationFromWav(wavBuffer: Buffer): number {
  // Read sample rate from WAV header (bytes 24-27)
  const sampleRate  = wavBuffer.readUInt32LE(24);
  const dataSize    = wavBuffer.readUInt32LE(40);
  const numChannels = wavBuffer.readUInt16LE(22);
  const bitDepth    = wavBuffer.readUInt16LE(34);
  return dataSize / (sampleRate * numChannels * (bitDepth / 8));
}
