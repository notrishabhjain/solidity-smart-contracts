"use client";

import { useMantraStore } from "@/store/useMantraStore";
import { GEMINI_VOICES } from "@/lib/promptEngine";
import { cn } from "@/lib/utils";
import type { AdvancedMode } from "@/types";

interface SliderProps {
  label:    string;
  value:    number;
  min?:     number;
  max?:     number;
  step?:    number;
  onChange: (v: number) => void;
  unit?:    string;
  color?:   string;
}

function Slider({ label, value, min = 0, max = 100, step = 1, onChange, unit = "", color = "saffron" }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[11px] text-spiritual-subtle">{label}</label>
        <span className="text-[11px] font-mono text-saffron-400">
          {typeof value === "number" && step < 1 ? value.toFixed(2) : Math.round(value)}{unit}
        </span>
      </div>
      <div className="relative h-1.5 bg-spiritual-border rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-saffron-600 to-gold-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-saffron-400 shadow-lg border border-saffron-300
                     pointer-events-none"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
    </div>
  );
}

const ADVANCED_MODES: Array<{ id: AdvancedMode; label: string }> = [
  { id: "normal",               label: "Normal" },
  { id: "108-repetitions",      label: "108× Jaap" },
  { id: "slow-learning",        label: "Slow Learning" },
  { id: "pronunciation-training", label: "Pronunciation" },
];

export function VoiceControls() {
  const {
    voiceConfig,
    setVoiceConfig,
    advancedMode,
    setAdvancedMode,
    repeatCount,
    setRepeatCount,
    enhancement,
    setEnhancement,
  } = useMantraStore();

  return (
    <div className="space-y-5">
      {/* Voice selection */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-spiritual-subtle uppercase tracking-widest">
          Voice
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {GEMINI_VOICES.map(voice => (
            <button
              key={voice.name}
              onClick={() => setVoiceConfig({ voiceName: voice.name })}
              className={cn(
                "p-2 rounded-lg border text-left transition-all text-xs",
                voiceConfig.voiceName === voice.name
                  ? "border-saffron-500 bg-saffron-900/30 text-saffron-300"
                  : "border-spiritual-border bg-spiritual-card/50 text-spiritual-subtle hover:border-saffron-700/50"
              )}
            >
              <div className="font-medium text-[11px]">{voice.displayName}</div>
              <div className="text-[9px] opacity-70 truncate">{voice.character}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3 p-3 rounded-xl bg-spiritual-card/50 border border-spiritual-border/50">
        <div className="text-[10px] text-spiritual-muted uppercase tracking-widest mb-2">Voice Parameters</div>
        <Slider
          label="Chanting Pace"
          value={voiceConfig.pace}
          min={0.4} max={1.8} step={0.05}
          onChange={v => setVoiceConfig({ pace: v })}
        />
        <Slider
          label="Voice Depth"
          value={voiceConfig.depth}
          onChange={v => setVoiceConfig({ depth: v })}
        />
        <Slider
          label="Breathiness"
          value={voiceConfig.breathiness}
          onChange={v => setVoiceConfig({ breathiness: v })}
        />
        <Slider
          label="Resonance"
          value={voiceConfig.resonance}
          onChange={v => setVoiceConfig({ resonance: v })}
        />
        <Slider
          label="Warmth"
          value={voiceConfig.warmth}
          onChange={v => setVoiceConfig({ warmth: v })}
        />
        <Slider
          label="Reverb Amount"
          value={voiceConfig.reverb}
          onChange={v => setVoiceConfig({ reverb: v })}
        />
      </div>

      {/* Advanced Mode */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-spiritual-subtle uppercase tracking-widest">
          Chanting Mode
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {ADVANCED_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setAdvancedMode(mode.id)}
              className={cn(
                "py-2 px-3 rounded-lg border text-xs transition-all",
                advancedMode === mode.id
                  ? "border-saffron-500 bg-saffron-900/30 text-saffron-300"
                  : "border-spiritual-border text-spiritual-subtle hover:border-saffron-700/50"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {advancedMode === "108-repetitions" && (
          <div className="flex items-center gap-3 mt-2">
            <label className="text-xs text-spiritual-subtle">Repetitions:</label>
            {[9, 27, 54, 108].map(n => (
              <button
                key={n}
                onClick={() => setRepeatCount(n)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs border transition-all",
                  repeatCount === n
                    ? "border-saffron-500 bg-saffron-900/30 text-saffron-300"
                    : "border-spiritual-border text-spiritual-subtle hover:border-saffron-700/50"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Audio Enhancement */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-spiritual-subtle uppercase tracking-widest">
          Ambient Layers (coming soon)
        </label>
        <div className="grid grid-cols-2 gap-1.5 opacity-50 pointer-events-none">
          {[
            { key: "tanpuraDrone",      label: "🎵 Tanpura Drone" },
            { key: "templeBell",        label: "🔔 Temple Bell" },
            { key: "softReverb",        label: "🌀 Soft Reverb" },
            { key: "meditationAmbience",label: "🌿 Meditation" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setEnhancement({ [item.key]: !enhancement[item.key as keyof typeof enhancement] })}
              className={cn(
                "py-2 px-3 rounded-lg border text-xs transition-all text-left",
                enhancement[item.key as keyof typeof enhancement]
                  ? "border-saffron-500 bg-saffron-900/30 text-saffron-300"
                  : "border-spiritual-border text-spiritual-subtle"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
