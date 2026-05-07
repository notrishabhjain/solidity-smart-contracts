"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Waves, Scissors, Mic } from "lucide-react";
import { useMantraStore } from "@/store/useMantraStore";
import { formatDuration } from "@/lib/utils";

const STATUS_ICONS = {
  preprocessing: { icon: Scissors, label: "Preprocessing mantra text…",   color: "text-blue-400" },
  generating:    { icon: Mic,      label: "Generating sacred audio…",      color: "text-saffron-400" },
  stitching:     { icon: Waves,    label: "Stitching audio seamlessly…",   color: "text-gold-400" },
  done:          { icon: CheckCircle2, label: "Generation complete!",       color: "text-emerald-400" },
  error:         { icon: XCircle,  label: "Generation failed",             color: "text-red-400" },
};

export function GenerationProgress() {
  const { generationState, preprocessResult } = useMantraStore();
  const { status, currentChunk, totalChunks, progress, error, generatedChunks } = generationState;

  if (status === "idle") return null;

  const statusInfo = STATUS_ICONS[status as keyof typeof STATUS_ICONS];
  const Icon       = statusInfo?.icon ?? Loader2;

  const completedDuration = generatedChunks.reduce((sum, c) => sum + c.duration, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-xl border border-spiritual-border bg-spiritual-card/80 p-4 space-y-4"
      >
        {/* Status header */}
        <div className="flex items-center gap-3">
          <div className={statusInfo?.color ?? "text-saffron-400"}>
            {status === "done" || status === "error" ? (
              <Icon size={18} />
            ) : (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                <Loader2 size={18} />
              </motion.div>
            )}
          </div>
          <div>
            <div className={`text-sm font-medium ${statusInfo?.color ?? "text-saffron-400"}`}>
              {statusInfo?.label ?? "Processing…"}
            </div>
            {status === "generating" && totalChunks > 0 && (
              <div className="text-xs text-spiritual-muted mt-0.5">
                Chunk {currentChunk} of {totalChunks}
                {completedDuration > 0 && ` · ${formatDuration(completedDuration)} generated`}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {status !== "error" && (
          <div className="space-y-1">
            <div className="h-2 bg-spiritual-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-saffron-600 via-gold-400 to-saffron-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-spiritual-muted">
              <span>{progress}%</span>
              {preprocessResult && (
                <span>~{formatDuration(preprocessResult.totalEstimatedDuration)} total</span>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {status === "error" && error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/20 border border-red-800/30">
            <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* Chunk details when generating */}
        {status === "generating" && generatedChunks.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-spiritual-muted uppercase tracking-widest mb-1">
              Generated Chunks
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {generatedChunks.map(chunk => (
                <div key={chunk.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span className="text-[11px] text-spiritual-subtle truncate max-w-[200px]">
                      {chunk.text.slice(0, 40)}…
                    </span>
                  </div>
                  <span className="text-[10px] text-spiritual-muted font-mono">
                    {formatDuration(chunk.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waveform animation while generating */}
        {(status === "generating" || status === "stitching") && (
          <div className="flex items-center justify-center gap-0.5 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-saffron-600 to-gold-400 rounded-full"
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.06,
                  ease: "easeInOut",
                }}
                style={{ height: "100%", originY: "bottom" }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
