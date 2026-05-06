import type { VoiceConfig, VoicePreset, MantraChunk } from "@/types";

const MASTER_INSTRUCTION = `You are reciting an ancient sacred mantra in a calm devotional temple-style chanting voice. The chanting should sound:
- deeply spiritual and meditative
- natural and human, breath-driven
- reverential and serene
- like a real monk chanting in a sacred temple

Avoid:
- audiobook narration or dramatic acting
- robotic or mechanical speech
- conversational or casual tone
- rushed delivery

Maintain:
- steady sacred rhythm with natural breathing pauses
- low, measured tempo (meditative pace)
- smooth continuity between lines
- devotional sincerity`;

const PRESET_INSTRUCTIONS: Record<VoicePreset, string> = {
  "jain-monk": `You are a Jain monk chanting in a quiet dharmashala. Your voice carries decades of spiritual practice. Chant the Navkar Mantra or Jain stotra with:
- profound calmness and equanimity
- traditional Jain chanting cadence
- gentle nasal resonance on nasals (m, n, ng)
- measured pauses between each nama (obeisance)
- tone: deep, contemplative, non-attached`,

  "temple-chant": `You are leading temple worship, chanting Sanskrit shlokas before a sacred deity. Your voice resonates in a stone temple hall. Deliver with:
- full vocal resonance and devotional energy
- natural temple acoustics feel
- traditional Vedic chanting intonation
- rhythmic repetition honoring the sacred text
- tone: warm, reverential, uplifting`,

  "deep-meditation": `You are guiding a deep meditation session. Your voice is barely above a whisper, deeply calm. Speak mantras with:
- extremely slow, drawn-out syllables
- maximum breathiness and soft edges
- almost zero volume variation
- very long pauses between phrases
- tone: hypnotic, whispered, infinitely peaceful`,

  "morning-stotra": `You are performing morning prayers at sunrise. The energy is fresh, alert, and devotional. Chant with:
- clear, crisp pronunciation
- moderate pace, not too slow
- bright, awakened vocal quality
- gentle enthusiasm and faith
- tone: clear, bright, devotional`,

  "slow-jaap": `You are doing jaap (repetitive chanting) with a mala. Each repetition is identical, measured. Deliver with:
- perfectly consistent rhythm throughout
- metronome-like steadiness
- no variation in pace between repetitions
- gentle on every syllable
- tone: hypnotic, steady, constant`,

  "powerful-protective": `You are reciting a powerful protective mantra with full conviction. Your voice carries authority and sacred power. Chant with:
- strong, grounded voice
- clear and precise pronunciation
- confident, unwavering tone
- each syllable given full weight
- tone: powerful, clear, protective, commanding`,
};

const PACE_INSTRUCTIONS: Record<string, string> = {
  very_slow: "Chant extremely slowly. Double the normal pause between words. Each syllable should be fully elongated.",
  slow:      "Chant slowly and meditatively. Take generous pauses between phrases.",
  normal:    "Chant at a natural meditative pace. Comfortable, steady rhythm.",
  fast:      "Chant with brisk devotional energy while maintaining clarity.",
};

function getPaceInstruction(pace: number): string {
  if (pace < 0.6) return PACE_INSTRUCTIONS.very_slow;
  if (pace < 0.85) return PACE_INSTRUCTIONS.slow;
  if (pace < 1.3)  return PACE_INSTRUCTIONS.normal;
  return PACE_INSTRUCTIONS.fast;
}

function getBreathInstruction(breathiness: number): string {
  if (breathiness > 70) return "Breathe audibly between phrases, like a yogi in pranayama.";
  if (breathiness > 40) return "Natural breath is audible but gentle.";
  return "Minimal breath sounds, focused tone.";
}

function getResonanceInstruction(resonance: number): string {
  if (resonance > 70) return "Use deep chest resonance, like a temple bell ringing.";
  if (resonance > 40) return "Moderate chest resonance, grounded voice.";
  return "Light, head-resonant voice.";
}

function getWarmthInstruction(warmth: number): string {
  if (warmth > 70) return "Voice is warm, enveloping, like a loving guru.";
  if (warmth > 40) return "Gently warm, caring tone.";
  return "Neutral, pure, crystalline tone.";
}

export function buildTTSPrompt(
  chunk: MantraChunk,
  voiceConfig: VoiceConfig,
  isFirstChunk: boolean = false,
  isLastChunk:  boolean = false,
  chunkIndex:   number = 0,
  totalChunks:  number = 1
): string {
  const presetInstructions = PRESET_INSTRUCTIONS[voiceConfig.preset];
  const paceInstruction    = getPaceInstruction(voiceConfig.pace);
  const breathInstruction  = getBreathInstruction(voiceConfig.breathiness);
  const resonanceInstr     = getResonanceInstruction(voiceConfig.resonance);
  const warmthInstruction  = getWarmthInstruction(voiceConfig.warmth);

  const continuityNote = totalChunks > 1
    ? `\n\nContinuity note: This is segment ${chunkIndex + 1} of ${totalChunks}. ${
        isFirstChunk
          ? "Begin with a gentle breath to start the chanting."
          : "Continue seamlessly from the previous segment — maintain the same rhythm and tone."
      } ${
        isLastChunk
          ? "After the final syllable, let the voice gently fade with a long exhale."
          : "End this segment so it flows naturally into the next."
      }`
    : "";

  return `${MASTER_INSTRUCTION}

${presetInstructions}

Pacing: ${paceInstruction}
Breath: ${breathInstruction}
Resonance: ${resonanceInstr}
Warmth: ${warmthInstruction}${continuityNote}

Now chant the following sacred text with full devotion:

${chunk.preprocessedText}`;
}

export function buildSimplePrompt(text: string, preset: VoicePreset = "temple-chant"): string {
  return `${MASTER_INSTRUCTION}\n\n${PRESET_INSTRUCTIONS[preset]}\n\nNow chant:\n\n${text}`;
}

export const GEMINI_VOICES: Array<{
  name: string;
  displayName: string;
  gender: "male" | "female" | "neutral";
  character: string;
  bestFor: string[];
}> = [
  { name: "Charon",  displayName: "Charon",  gender: "male",    character: "Deep, resonant, ancient",   bestFor: ["jain-monk", "deep-meditation", "powerful-protective"] },
  { name: "Kore",    displayName: "Kore",    gender: "female",  character: "Serene, ethereal, pure",     bestFor: ["morning-stotra", "temple-chant"] },
  { name: "Fenrir",  displayName: "Fenrir",  gender: "male",    character: "Strong, grounded, steady",   bestFor: ["slow-jaap", "powerful-protective"] },
  { name: "Aoede",   displayName: "Aoede",   gender: "female",  character: "Melodic, gentle, spiritual", bestFor: ["morning-stotra", "temple-chant"] },
  { name: "Puck",    displayName: "Puck",    gender: "neutral", character: "Clear, bright, versatile",   bestFor: ["morning-stotra"] },
  { name: "Orbit",   displayName: "Orbit",   gender: "male",    character: "Powerful, authoritative",    bestFor: ["powerful-protective"] },
  { name: "Zephyr",  displayName: "Zephyr",  gender: "neutral", character: "Light, airy, meditative",    bestFor: ["deep-meditation"] },
];

export const PRESET_DEFAULTS: Record<VoicePreset, Partial<VoiceConfig>> = {
  "jain-monk":          { voiceName: "Charon",  pace: 0.65, depth: 85, breathiness: 55, resonance: 75, warmth: 70, reverb: 40 },
  "temple-chant":       { voiceName: "Kore",    pace: 0.80, depth: 70, breathiness: 40, resonance: 80, warmth: 75, reverb: 55 },
  "deep-meditation":    { voiceName: "Charon",  pace: 0.50, depth: 90, breathiness: 80, resonance: 60, warmth: 85, reverb: 70 },
  "morning-stotra":     { voiceName: "Aoede",   pace: 0.90, depth: 55, breathiness: 30, resonance: 65, warmth: 80, reverb: 30 },
  "slow-jaap":          { voiceName: "Fenrir",  pace: 0.60, depth: 75, breathiness: 45, resonance: 70, warmth: 65, reverb: 35 },
  "powerful-protective":{ voiceName: "Orbit",   pace: 0.85, depth: 80, breathiness: 25, resonance: 90, warmth: 55, reverb: 50 },
};
