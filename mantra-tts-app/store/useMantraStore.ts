"use client";

import { create } from "zustand";
import type {
  VoiceConfig,
  VoicePreset,
  GenerationState,
  GenerationResult,
  PreprocessResult,
  AudioEnhancement,
  AdvancedMode,
} from "@/types";
import { PRESET_DEFAULTS } from "@/lib/promptEngine";

interface MantraStore {
  // Input
  inputText:    string;
  mantraName:   string;
  setInputText: (text: string) => void;
  setMantraName:(name: string) => void;

  // Voice config
  voiceConfig:     VoiceConfig;
  setVoiceConfig:  (config: Partial<VoiceConfig>) => void;
  applyPreset:     (preset: VoicePreset) => void;

  // Advanced mode
  advancedMode:    AdvancedMode;
  setAdvancedMode: (mode: AdvancedMode) => void;
  repeatCount:     number;
  setRepeatCount:  (n: number) => void;

  // Audio enhancement
  enhancement:    AudioEnhancement;
  setEnhancement: (e: Partial<AudioEnhancement>) => void;

  // Preprocessing result
  preprocessResult: PreprocessResult | null;
  setPreprocessResult: (r: PreprocessResult | null) => void;

  // Generation state
  generationState: GenerationState;
  updateGeneration:(state: Partial<GenerationState>) => void;
  resetGeneration: () => void;

  // Results history
  results:      GenerationResult[];
  addResult:    (r: GenerationResult) => void;
  removeResult: (id: string) => void;
  clearHistory: () => void;

  // Current playing
  currentAudioUrl: string | null;
  setCurrentAudioUrl: (url: string | null) => void;
}

const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  voiceName:   "Charon",
  preset:      "jain-monk",
  pace:        0.65,
  depth:       85,
  breathiness: 55,
  resonance:   75,
  warmth:      70,
  reverb:      40,
};

const DEFAULT_GENERATION_STATE: GenerationState = {
  status:          "idle",
  currentChunk:    0,
  totalChunks:     0,
  progress:        0,
  generatedChunks: [],
};

export const useMantraStore = create<MantraStore>((set, get) => ({
  inputText:    "",
  mantraName:   "My Mantra",
  setInputText: (text) => set({ inputText: text }),
  setMantraName:(name) => set({ mantraName: name }),

  voiceConfig:    DEFAULT_VOICE_CONFIG,
  setVoiceConfig: (partial) =>
    set(state => ({ voiceConfig: { ...state.voiceConfig, ...partial } })),
  applyPreset: (preset) => {
    const defaults = PRESET_DEFAULTS[preset];
    set(state => ({
      voiceConfig: { ...state.voiceConfig, ...defaults, preset },
    }));
  },

  advancedMode:    "normal",
  setAdvancedMode: (mode) => set({ advancedMode: mode }),
  repeatCount:     108,
  setRepeatCount:  (n)    => set({ repeatCount: n }),

  enhancement: {
    tanpuraDrone:     false,
    templeBell:       false,
    softReverb:       false,
    meditationAmbience: false,
  },
  setEnhancement: (partial) =>
    set(state => ({ enhancement: { ...state.enhancement, ...partial } })),

  preprocessResult:    null,
  setPreprocessResult: (r) => set({ preprocessResult: r }),

  generationState: DEFAULT_GENERATION_STATE,
  updateGeneration: (partial) =>
    set(state => ({ generationState: { ...state.generationState, ...partial } })),
  resetGeneration: () => set({ generationState: DEFAULT_GENERATION_STATE }),

  results:   [],
  addResult: (r) => set(state => ({ results: [r, ...state.results].slice(0, 20) })),
  removeResult: (id) =>
    set(state => ({ results: state.results.filter(r => r.id !== id) })),
  clearHistory: () => set({ results: [] }),

  currentAudioUrl:    null,
  setCurrentAudioUrl: (url) => set({ currentAudioUrl: url }),
}));
