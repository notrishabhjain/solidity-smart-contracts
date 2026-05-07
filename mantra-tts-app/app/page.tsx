"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Settings, ChevronRight, ChevronDown,
  Mic, BookOpen, Info,
} from "lucide-react";
import { MantraInput }          from "@/components/MantraInput";
import { PresetModes }          from "@/components/PresetModes";
import { VoiceControls }        from "@/components/VoiceControls";
import { GenerationProgress }   from "@/components/GenerationProgress";
import { AudioPlayer }          from "@/components/AudioPlayer";
import { GenerationHistory }    from "@/components/GenerationHistory";
import { useMantraStore }       from "@/store/useMantraStore";
import { useMantraGenerator }   from "@/hooks/useMantraGenerator";
import { cn }                   from "@/lib/utils";

function OmSymbol() {
  return (
    <div className="om-symbol text-4xl select-none" aria-hidden>
      ॐ
    </div>
  );
}

export default function HomePage() {
  const { inputText, generationState } = useMantraStore();
  const { generate }                   = useMantraGenerator();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab]       = useState<"input" | "voice">("input");

  const isGenerating = ["preprocessing", "generating", "stitching"].includes(generationState.status);
  const canGenerate  = inputText.trim().length > 0 && !isGenerating;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-spiritual-border/50 bg-spiritual-bg/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OmSymbol />
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-saffron-400 to-gold-400 bg-clip-text text-transparent">
                Mantra TTS
              </h1>
              <p className="text-[10px] text-spiritual-muted">Sacred Audio Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs border border-spiritual-border
                         rounded-lg text-spiritual-subtle hover:border-saffron-600/50 hover:text-saffron-400
                         transition-colors"
            >
              <Sparkles size={12} />
              Get API Key
            </a>
            <div className="px-2 py-1 text-[10px] bg-saffron-900/30 text-saffron-400 rounded border border-saffron-800/40">
              Gemini TTS
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Tab navigation */}
            <div className="flex border-b border-spiritual-border">
              {[
                { id: "input" as const, label: "Sacred Text",    icon: BookOpen },
                { id: "voice" as const, label: "Voice & Preset", icon: Settings },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors",
                    activeTab === tab.id
                      ? "border-saffron-500 text-saffron-400 font-medium"
                      : "border-transparent text-spiritual-muted hover:text-spiritual-subtle"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === "input" ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <MantraInput />
                </motion.div>
              ) : (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <PresetModes />
                  <VoiceControls />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate button */}
            <motion.button
              whileHover={canGenerate ? { scale: 1.02 } : {}}
              whileTap={canGenerate ? { scale: 0.98 } : {}}
              onClick={generate}
              disabled={!canGenerate}
              className={cn(
                "w-full py-4 rounded-xl font-semibold text-sm transition-all relative overflow-hidden",
                canGenerate
                  ? "bg-gradient-to-r from-saffron-600 to-gold-400 text-spiritual-bg shadow-lg hover:shadow-saffron-500/25 hover:shadow-2xl"
                  : "bg-spiritual-card border border-spiritual-border text-spiritual-muted cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    ✦
                  </motion.div>
                  Generating Sacred Audio…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Mic size={16} />
                  Generate Mantra Audio
                  <ChevronRight size={16} />
                </span>
              )}

              {/* Shimmer effect */}
              {canGenerate && !isGenerating && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.button>

            {/* API key notice */}
            {!process.env.NEXT_PUBLIC_HAS_API_KEY && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-900/20 border border-amber-800/30">
                <Info size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300">
                  Add your{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-200"
                  >
                    Gemini API key
                  </a>{" "}
                  to <code className="font-mono text-amber-200">.env.local</code> as{" "}
                  <code className="font-mono text-amber-200">GEMINI_API_KEY</code> to enable audio generation.
                </p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Generation Progress */}
            <GenerationProgress />

            {/* Audio Player */}
            <AudioPlayer />

            {/* Generation History */}
            <GenerationHistory />

            {/* Feature highlights (shown when no audio yet) */}
            {generationState.status === "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-spiritual-border/50 bg-spiritual-card/30 p-5 space-y-4"
              >
                <div className="text-center">
                  <div className="text-5xl om-symbol mb-2">ॐ</div>
                  <h2 className="text-sm font-semibold text-spiritual-text">Sacred Audio Generation</h2>
                  <p className="text-xs text-spiritual-muted mt-1">
                    AI-powered devotional chanting for mantras, stotras & shlokas
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { icon: "🙏", title: "Devotional Voice", desc: "Temple-quality chanting with natural breath" },
                    { icon: "📜", title: "All Scripts",      desc: "Devanagari, IAST, Hinglish & mixed" },
                    { icon: "✂️",  title: "Smart Chunking",  desc: "Verse-aware intelligent segmentation" },
                    { icon: "🎵", title: "Audio Stitching",  desc: "Seamless multi-chunk audio assembly" },
                    { icon: "📿", title: "108 Repetitions",  desc: "Full mala jaap generation mode" },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3">
                      <span className="text-base mt-0.5">{item.icon}</span>
                      <div>
                        <div className="text-xs font-medium text-spiritual-text">{item.title}</div>
                        <div className="text-[10px] text-spiritual-muted">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Preprocessor info (when processing is done) */}
            <AnimatePresence>
              {generationState.status === "done" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-spiritual-border/50
                               text-xs text-spiritual-muted hover:border-spiritual-muted/30 transition-colors"
                  >
                    <span>Technical Details</span>
                    {showAdvanced ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-3 rounded-xl border border-spiritual-border/30 text-xs space-y-1.5"
                      >
                        {[
                          ["Model",    "Gemini 2.5 Flash Preview TTS"],
                          ["Format",   "WAV · 24kHz · 16-bit · Mono"],
                          ["Chunks",   `${generationState.totalChunks} segments`],
                          ["Processing","Intelligent verse-aware chunking"],
                          ["Pipeline", "Preprocess → TTS → Normalize → Stitch"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-spiritual-muted">{k}</span>
                            <span className="text-spiritual-subtle font-mono text-[10px]">{v}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-spiritual-border/30 mt-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-[10px] text-spiritual-muted">
          <span>Mantra TTS · Powered by Gemini AI</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sanskrit · Prakrit · Hindi
          </span>
        </div>
      </footer>
    </div>
  );
}
