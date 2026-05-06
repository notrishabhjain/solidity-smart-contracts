import type { MantraChunk, PreprocessResult, ScriptType } from "@/types";
import { v4 as uuidv4 } from "uuid";

// IAST → pronunciation-friendly romanization
const IAST_MAP: Record<string, string> = {
  "ā": "aa", "Ā": "aa",
  "ī": "ee", "Ī": "ee",
  "ū": "oo", "Ū": "oo",
  "ṛ": "ri", "Ṛ": "ri",
  "ṝ": "ree", "Ṝ": "ree",
  "ḷ": "li", "Ḷ": "li",
  "ẽ": "e",
  "ṃ": "m",  "Ṃ": "m",
  "ḥ": "",   "Ḥ": "",    // visarga — silent or light breath
  "ñ": "ny", "Ñ": "ny",
  "ṅ": "ng", "Ṅ": "ng",
  "ṭ": "t",  "Ṭ": "t",
  "ḍ": "d",  "Ḍ": "d",
  "ṇ": "n",  "Ṇ": "n",
  "ś": "sh", "Ś": "sh",
  "ṣ": "sh", "Ṣ": "sh",
  "ḫ": "h",
  // Extended IAST
  "ṉ": "n",
  "ḻ": "l",
};

// Devanagari → phonetic romanization map
const DEVANAGARI_MAP: Record<string, string> = {
  "अ": "a",   "आ": "aa",  "इ": "i",   "ई": "ee",
  "उ": "u",   "ऊ": "oo",  "ऋ": "ri",  "ए": "e",
  "ऐ": "ai",  "ओ": "o",   "औ": "au",
  "क": "ka",  "ख": "kha", "ग": "ga",  "घ": "gha",
  "ङ": "nga", "च": "cha", "छ": "chha","ज": "ja",
  "झ": "jha", "ञ": "nya", "ट": "ta",  "ठ": "tha",
  "ड": "da",  "ढ": "dha", "ण": "na",  "त": "ta",
  "थ": "tha", "द": "da",  "ध": "dha", "न": "na",
  "प": "pa",  "फ": "pha", "ब": "ba",  "भ": "bha",
  "म": "ma",  "य": "ya",  "र": "ra",  "ल": "la",
  "व": "va",  "श": "sha", "ष": "sha", "स": "sa",
  "ह": "ha",
  // Matras (vowel diacritics)
  "ा": "aa",  "ि": "i",   "ी": "ee",  "ु": "u",
  "ू": "oo",  "ृ": "ri",  "े": "e",   "ै": "ai",
  "ो": "o",   "ौ": "au",  "ं": "m",   "ः": "",
  "्": "",    "ँ": "n",   "़": "",    "ऽ": "",
  // Numbers
  "०": "0",   "१": "1",   "२": "2",   "३": "3",
  "४": "4",   "५": "5",   "६": "6",   "७": "7",
  "८": "8",   "९": "9",
  // Special
  "ॐ": "Om",
};

// Common Sanskrit/Hindi word pronunciations
const PRONUNCIATION_FIXES: Record<string, string> = {
  "namah":    "namaH",
  "namaha":   "namaha",
  "pranaam":  "pranaam",
  "aum":      "Om",
  "shanti":   "shaanti",
  "om":       "Om",
  "OM":       "Om",
  "sri":      "shree",
  "shri":     "shree",
  "arham":    "arham",
  "namo":     "namo",
  "navkar":   "navkaar",
  "namokar":  "namokaar",
};

export function detectScript(text: string): ScriptType {
  const devanagariCount = (text.match(/[ऀ-ॿ]/g) || []).length;
  const iastCount = (text.match(/[āīūṛṝḷṃḥñṅṭḍṇśṣ]/gi) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

  if (devanagariCount > 5) return "devanagari";
  if (iastCount > 3)       return "iast";
  if (latinCount > 5)      return "hinglish";
  return "mixed";
}

function normalizeIAST(text: string): string {
  let result = text;
  for (const [iast, phonetic] of Object.entries(IAST_MAP)) {
    result = result.split(iast).join(phonetic);
  }
  return result;
}

function transliterateDevanagari(text: string): string {
  let result = "";
  for (const char of text) {
    result += DEVANAGARI_MAP[char] ?? char;
  }
  return result;
}

function cleanPunctuation(text: string): string {
  return text
    .replace(/[।॥]/g, " . ")           // Sanskrit dandas → pause
    .replace(/[|]/g,   " , ")           // pipe → short pause
    .replace(/[;:]/g,  " , ")
    .replace(/[!?]/g,  " . ")
    .replace(/["'"']/g, "")
    .replace(/[-–—]/g,  " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function applyPronunciationFixes(text: string): string {
  let result = text;
  for (const [wrong, correct] of Object.entries(PRONUNCIATION_FIXES)) {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    result = result.replace(regex, correct);
  }
  return result;
}

function addChantPacing(text: string): string {
  // Insert gentle pauses between compound words and verse feet
  return text
    .replace(/([aeiouAEIOU]{3,})/g, "$1")  // keep vowel clusters intact
    .replace(/([^\s,\.]{12,})/g, (match) => {
      // Break very long words at natural syllable boundaries
      return match.replace(/([aeiouAEIOU])([bcdfghjklmnpqrstvwxyz]{2,})/gi, "$1 $2");
    });
}

function estimateDuration(text: string, pace: number = 1.0): number {
  // Sanskrit chanting: ~60-80 syllables per minute at meditative pace
  const syllables = countSyllables(text);
  const syllablesPerSecond = (70 / 60) * pace;
  return syllables / syllablesPerSecond;
}

function countSyllables(text: string): number {
  const cleaned = text.replace(/[^a-zA-Z]/g, "").toLowerCase();
  const vowelGroups = cleaned.match(/[aeiou]+/g) || [];
  return Math.max(vowelGroups.length, 1);
}

export function preprocessMantra(text: string, scriptType?: ScriptType): string {
  const detected = scriptType || detectScript(text);
  let processed = text;

  if (detected === "devanagari") {
    processed = transliterateDevanagari(processed);
  } else if (detected === "iast") {
    processed = normalizeIAST(processed);
  } else if (detected === "mixed") {
    // Handle mixed scripts
    processed = transliterateDevanagari(processed);
    processed = normalizeIAST(processed);
  }

  processed = cleanPunctuation(processed);
  processed = applyPronunciationFixes(processed);
  processed = addChantPacing(processed);

  // Normalize whitespace
  return processed.replace(/\s+/g, " ").trim();
}

export function splitIntoChunks(
  text: string,
  pace: number = 1.0
): MantraChunk[] {
  const scriptType = detectScript(text);

  // Split at natural verse boundaries
  const verseLines = text
    .split(/\n+/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const chunks: MantraChunk[] = [];
  let currentLines: string[] = [];
  let currentDuration = 0;
  const TARGET_DURATION = 25; // seconds
  const MAX_DURATION    = 40;

  for (const line of verseLines) {
    const preprocessed  = preprocessMantra(line, scriptType);
    const lineDuration  = estimateDuration(preprocessed, pace);

    if (currentDuration + lineDuration > MAX_DURATION && currentLines.length > 0) {
      // Flush current chunk
      const chunkText  = currentLines.join("\n");
      const chunkProc  = preprocessMantra(chunkText, scriptType);
      chunks.push({
        id:               uuidv4(),
        text:             chunkText,
        preprocessedText: chunkProc,
        index:            chunks.length,
        estimatedDuration: currentDuration,
      });
      currentLines   = [line];
      currentDuration = lineDuration;
    } else {
      currentLines.push(line);
      currentDuration += lineDuration;

      if (currentDuration >= TARGET_DURATION) {
        const chunkText  = currentLines.join("\n");
        const chunkProc  = preprocessMantra(chunkText, scriptType);
        chunks.push({
          id:               uuidv4(),
          text:             chunkText,
          preprocessedText: chunkProc,
          index:            chunks.length,
          estimatedDuration: currentDuration,
        });
        currentLines    = [];
        currentDuration = 0;
      }
    }
  }

  // Flush remaining
  if (currentLines.length > 0) {
    const chunkText  = currentLines.join("\n");
    const chunkProc  = preprocessMantra(chunkText, scriptType);
    chunks.push({
      id:               uuidv4(),
      text:             chunkText,
      preprocessedText: chunkProc,
      index:            chunks.length,
      estimatedDuration: currentDuration,
    });
  }

  // If no line breaks found, split by words
  if (chunks.length === 0) {
    const words     = text.split(/\s+/);
    const WORDS_PER_CHUNK = 20;
    for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
      const slice     = words.slice(i, i + WORDS_PER_CHUNK).join(" ");
      const processed = preprocessMantra(slice, scriptType);
      chunks.push({
        id:               uuidv4(),
        text:             slice,
        preprocessedText: processed,
        index:            chunks.length,
        estimatedDuration: estimateDuration(processed, pace),
      });
    }
  }

  return chunks;
}

export function preprocessText(text: string, pace: number = 1.0): PreprocessResult {
  const scriptType   = detectScript(text);
  const processedText = preprocessMantra(text, scriptType);
  const chunks       = splitIntoChunks(text, pace);
  const totalDuration = chunks.reduce((sum, c) => sum + c.estimatedDuration, 0);
  const wordCount    = text.split(/\s+/).filter(w => w.length > 0).length;
  const syllableCount = countSyllables(processedText);

  return {
    original:               text,
    processedText,
    scriptType,
    chunks,
    totalEstimatedDuration: totalDuration,
    wordCount,
    syllableCount,
  };
}

export function generate108Repetitions(mantra: string): string {
  const processed = preprocessMantra(mantra);
  return Array(108).fill(processed).join(" ... ");
}
