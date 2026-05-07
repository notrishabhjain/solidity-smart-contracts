# 🕉️ Mantra TTS — Sacred Sanskrit Audio Generator

A complete production-ready web application for generating high-quality devotional audio from Sanskrit, Prakrit, and Hindi mantras using Google Gemini AI TTS.

## ✨ Features

- **Intelligent Mantra Preprocessing** — IAST, Devanagari, and Hinglish transliteration normalization
- **Anti-Robotic Chanting** — Devotional prompt engineering for natural human-like speech
- **Verse-Aware Chunking** — Smart splitting at natural verse/phrase boundaries
- **6 Voice Presets** — Jain Monk, Temple Chant, Deep Meditation, Morning Stotra, Slow Jaap, Powerful Protective
- **9 AI Voices** — Charon, Kore, Fenrir, Aoede, Puck, Orbit, Zephyr, Nova, Umbriel
- **108 Repetitions Mode** — Full mala jaap generation
- **Audio Stitching** — Seamless multi-chunk assembly with fade transitions
- **Waveform Player** — Visual audio playback with seek, loop, download
- **Generation History** — Track and re-download past generations
- **Responsive UI** — Dark saffron/gold spiritual aesthetic, mobile-friendly

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd mantra-tts-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free API key at: https://aistudio.google.com/app/apikey

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Animation | Framer Motion |
| State | Zustand |
| TTS API | Google Gemini 2.5 Flash Preview TTS |
| Audio | Web Audio API + custom WAV processing |
| Icons | Lucide React |

## 📁 Project Structure

```
mantra-tts-app/
├── app/
│   ├── api/
│   │   ├── generate/    # TTS generation endpoint
│   │   ├── preprocess/  # Text preprocessing endpoint
│   │   ├── stitch/      # Audio stitching endpoint
│   │   └── voices/      # Voice listing endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx         # Main app page
├── components/
│   ├── AudioPlayer.tsx         # Waveform player
│   ├── GenerationHistory.tsx   # History panel
│   ├── GenerationProgress.tsx  # Progress visualization
│   ├── MantraInput.tsx         # Text input + samples
│   ├── PresetModes.tsx         # Voice preset grid
│   └── VoiceControls.tsx       # Voice parameters
├── hooks/
│   └── useMantraGenerator.ts   # Main generation hook
├── lib/
│   ├── audioProcessor.ts  # WAV manipulation, stitching
│   ├── preprocessor.ts    # Sanskrit/Hindi text preprocessing
│   ├── promptEngine.ts    # Devotional prompt generation
│   ├── ttsClient.ts       # Gemini TTS API client
│   └── utils.ts           # Utilities + sample mantras
├── store/
│   └── useMantraStore.ts  # Zustand global state
└── types/
    └── index.ts           # TypeScript types
```

## 🎵 How It Works

### 1. Text Preprocessing
```
Input: "Pārśvanāthāya namaḥ"
      ↓ IAST normalization
      ↓ Punctuation cleaning
      ↓ Chant pacing
Output: "Parshvanaathaaya namaH"
```

### 2. Intelligent Chunking
- Splits at verse boundaries (`।`, `॥`, newlines)
- Targets 20-40 second segments
- Balances syllable count per chunk

### 3. Gemini Prompt Engineering
```
Master instruction: "You are reciting an ancient Jain mantra..."
+ Preset: "Jain Monk — deep, contemplative, equanimous..."
+ Pace/Breath/Resonance parameters
+ Continuity instructions between chunks
```

### 4. Audio Pipeline
```
Gemini API → Raw PCM (24kHz, 16-bit, mono)
           → WAV header addition
           → Volume normalization
           → Multi-chunk stitching
           → Fade in/out
           → Final WAV output
```

## 🔊 Voice Presets

| Preset | Voice | Best For |
|--------|-------|----------|
| Jain Monk | Charon | Navkar Mantra, Stotras |
| Temple Chant | Kore | Aarti, Puja mantras |
| Deep Meditation | Charon | Guided meditation |
| Morning Stotra | Aoede | Suprabhat, Dawn prayers |
| Slow Jaap | Fenrir | Mala repetition |
| Powerful Protective | Orbit | Kavach mantras |

## 🌍 Supported Languages

- **Sanskrit** — IAST and Devanagari
- **Prakrit** — Jain canonical texts
- **Hindi** — Devotional songs and mantras
- **Hinglish** — Romanized transliteration

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```
Set `GEMINI_API_KEY` in Vercel environment variables.

### Railway / Render
1. Connect your repository
2. Set environment variable `GEMINI_API_KEY`
3. Build command: `npm run build`
4. Start command: `npm run start`

## 🔐 Security

- API keys stored server-side only in environment variables
- Never exposed to frontend/client code
- All TTS generation happens server-side via API routes

## 📚 Sample Mantras Included

1. **Navkar Mantra** (Jain) — The supreme Jain salutation
2. **Gayatri Mantra** (Sanskrit/IAST) — Divine illumination
3. **Mahamrityunjaya** (Sanskrit) — Shiva's healing mantra
4. **Om Namah Shivaya** (Sanskrit) — Panchakshara mantra
5. **Shanti Mantra** (Sanskrit) — Universal peace

## 🤝 Contributing

PRs welcome! Focus areas:
- Additional language support (Tamil, Telugu, Gujarati)
- Real waveform visualization using Web Audio API
- Ambient audio layer implementation (tanpura, bells)
- SSML support for more precise chanting control

## 📄 License

MIT License — free for personal and commercial use.
