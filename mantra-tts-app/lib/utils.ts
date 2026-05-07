import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href  = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + "…";
}

export const SAMPLE_MANTRAS = [
  {
    id: "navkar",
    name: "Navkar Mantra",
    language: "Prakrit",
    script: "hinglish" as const,
    text: `Namo Arihantanam
Namo Siddhanam
Namo Ayariyanam
Namo Uvajjhayanam
Namo Loe Savva Sahunam

Eso Panch Namokkaro
Savva Pavappanasano
Mangalanam Cha Savvesim
Padhamam Havai Mangalam`,
    description: "The supreme mantra of Jainism — salutation to the five supreme beings",
    suggestedPreset: "jain-monk" as const,
  },
  {
    id: "gayatri",
    name: "Gayatri Mantra",
    language: "Sanskrit",
    script: "iast" as const,
    text: `Oṃ bhūr bhuvaḥ svaḥ
Tat savitur vareṇyaṃ
Bhargo devasya dhīmahi
Dhiyo yo naḥ pracodayāt`,
    description: "The most revered Sanskrit mantra for divine illumination",
    suggestedPreset: "morning-stotra" as const,
  },
  {
    id: "mahamrityunjaya",
    name: "Mahamrityunjaya Mantra",
    language: "Sanskrit",
    script: "hinglish" as const,
    text: `Om Tryambakam Yajamahe
Sugandhim Pushtivardhanam
Urvarukamiva Bandhanan
Mrityor Mukshiya Mamritat`,
    description: "The great mantra of Shiva — for healing, liberation, and protection",
    suggestedPreset: "powerful-protective" as const,
  },
  {
    id: "om-namah-shivaya",
    name: "Om Namah Shivaya",
    language: "Sanskrit",
    script: "hinglish" as const,
    text: `Om Namah Shivaya
Om Namah Shivaya
Om Namah Shivaya
Om Namah Shivaya
Om Namah Shivaya`,
    description: "The Panchakshara mantra — five-syllable salutation to Shiva",
    suggestedPreset: "slow-jaap" as const,
  },
  {
    id: "om-shanti",
    name: "Shanti Mantra",
    language: "Sanskrit",
    script: "hinglish" as const,
    text: `Om Shanti Shanti Shanti
Sarvesham Svastir Bhavatu
Sarvesham Shantir Bhavatu
Sarvesham Poornam Bhavatu
Sarvesham Mangalam Bhavatu`,
    description: "Universal peace mantra for all beings",
    suggestedPreset: "deep-meditation" as const,
  },
];
