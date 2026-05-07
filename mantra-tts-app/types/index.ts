export type ScriptType = "devanagari" | "iast" | "hinglish" | "mixed";

export type VoicePreset =
  | "jain-monk"
  | "temple-chant"
  | "deep-meditation"
  | "morning-stotra"
  | "slow-jaap"
  | "powerful-protective";

export type AdvancedMode =
  | "normal"
  | "108-repetitions"
  | "loop"
  | "call-and-response"
  | "slow-learning"
  | "pronunciation-training";

export interface VoiceConfig {
  voiceName: string;
  preset: VoicePreset;
  pace: number;       // 0.5–2.0
  depth: number;      // 0–100
  breathiness: number;// 0–100
  resonance: number;  // 0–100
  warmth: number;     // 0–100
  reverb: number;     // 0–100
}

export interface MantraChunk {
  id: string;
  text: string;
  preprocessedText: string;
  index: number;
  estimatedDuration: number; // seconds
  verseLine?: number;
}

export interface PreprocessResult {
  original: string;
  processedText: string;
  scriptType: ScriptType;
  chunks: MantraChunk[];
  totalEstimatedDuration: number;
  wordCount: number;
  syllableCount: number;
}

export interface GenerationState {
  status: "idle" | "preprocessing" | "generating" | "stitching" | "done" | "error";
  currentChunk: number;
  totalChunks: number;
  progress: number;
  error?: string;
  generatedChunks: GeneratedChunk[];
}

export interface GeneratedChunk {
  id: string;
  index: number;
  audioData: string; // base64 WAV
  duration: number;
  text: string;
}

export interface GenerationResult {
  id: string;
  mantraName: string;
  audioUrl: string;     // object URL
  audioBlob: Blob;
  duration: number;
  format: "wav" | "mp3";
  voiceConfig: VoiceConfig;
  createdAt: number;
  textPreview: string;
}

export interface GeminiVoice {
  name: string;
  displayName: string;
  gender: "male" | "female" | "neutral";
  character: string;
  bestFor: string[];
}

export interface SampleMantra {
  id: string;
  name: string;
  language: string;
  script: ScriptType;
  text: string;
  description: string;
  suggestedPreset: VoicePreset;
}

export interface AudioEnhancement {
  tanpuraDrone: boolean;
  templeBell: boolean;
  softReverb: boolean;
  meditationAmbience: boolean;
}

export interface ExportOptions {
  format: "wav" | "mp3";
  mantraName: string;
  includeMetadata: boolean;
}
