"use client";

import { motion } from "framer-motion";
import { useMantraStore } from "@/store/useMantraStore";
import { cn } from "@/lib/utils";
import type { VoicePreset } from "@/types";

const PRESETS: Array<{
  id: VoicePreset;
  name: string;
  emoji: string;
  description: string;
  color: string;
}> = [
  {
    id: "jain-monk",
    name: "Jain Monk",
    emoji: "🙏",
    description: "Deep devotional chanting",
    color: "from-amber-900/40 to-orange-900/20 border-amber-700/40 hover:border-amber-500/60",
  },
  {
    id: "temple-chant",
    name: "Temple Chant",
    emoji: "🛕",
    description: "Resonant temple worship",
    color: "from-yellow-900/40 to-amber-900/20 border-yellow-700/40 hover:border-yellow-500/60",
  },
  {
    id: "deep-meditation",
    name: "Deep Meditation",
    emoji: "🧘",
    description: "Whispered meditative trance",
    color: "from-indigo-900/40 to-purple-900/20 border-indigo-700/40 hover:border-indigo-500/60",
  },
  {
    id: "morning-stotra",
    name: "Morning Stotra",
    emoji: "🌅",
    description: "Bright dawn prayers",
    color: "from-orange-900/40 to-yellow-900/20 border-orange-700/40 hover:border-orange-500/60",
  },
  {
    id: "slow-jaap",
    name: "Slow Jaap",
    emoji: "📿",
    description: "Steady mala repetition",
    color: "from-rose-900/40 to-red-900/20 border-rose-700/40 hover:border-rose-500/60",
  },
  {
    id: "powerful-protective",
    name: "Powerful Chant",
    emoji: "⚡",
    description: "Strong protective energy",
    color: "from-red-900/40 to-orange-900/20 border-red-700/40 hover:border-red-500/60",
  },
];

export function PresetModes() {
  const { voiceConfig, applyPreset } = useMantraStore();

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-spiritual-subtle uppercase tracking-widest">
        Chanting Preset
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map(preset => (
          <motion.button
            key={preset.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => applyPreset(preset.id)}
            className={cn(
              "relative p-3 rounded-xl border bg-gradient-to-br text-left transition-all",
              preset.color,
              voiceConfig.preset === preset.id
                ? "ring-2 ring-saffron-500/60 ring-offset-1 ring-offset-spiritual-bg"
                : ""
            )}
          >
            {voiceConfig.preset === preset.id && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
            )}
            <div className="text-xl mb-1">{preset.emoji}</div>
            <div className="text-xs font-semibold text-spiritual-text">{preset.name}</div>
            <div className="text-[10px] text-spiritual-subtle mt-0.5 leading-tight">{preset.description}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
