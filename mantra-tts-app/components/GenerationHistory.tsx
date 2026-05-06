"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Trash2, Download, ChevronDown, ChevronUp, Clock, History } from "lucide-react";
import { useMantraStore } from "@/store/useMantraStore";
import { formatDuration, formatDate, downloadBlob, truncateText } from "@/lib/utils";

export function GenerationHistory() {
  const { results, removeResult, clearHistory, setCurrentAudioUrl } = useMantraStore();
  const [expanded, setExpanded] = useState(true);

  if (results.length === 0) return null;

  return (
    <div className="rounded-xl border border-spiritual-border bg-spiritual-card/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-spiritual-border/20 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-spiritual-subtle">
          <History size={14} />
          Generation History
          <span className="px-1.5 py-0.5 text-[10px] bg-saffron-900/50 text-saffron-400 rounded-full">
            {results.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {results.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); clearHistory(); }}
              className="text-[10px] text-spiritual-muted hover:text-red-400 transition-colors px-2 py-0.5 rounded"
            >
              Clear all
            </button>
          )}
          {expanded ? <ChevronUp size={14} className="text-spiritual-muted" /> : <ChevronDown size={14} className="text-spiritual-muted" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-spiritual-border/50 max-h-72 overflow-y-auto">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-spiritual-border/10 group transition-colors"
                >
                  {/* Play button */}
                  <button
                    onClick={() => setCurrentAudioUrl(result.audioUrl)}
                    className="w-8 h-8 rounded-full bg-saffron-900/40 border border-saffron-700/40
                               flex items-center justify-center shrink-0
                               hover:bg-saffron-800/60 transition-colors"
                  >
                    <Play size={12} className="text-saffron-400 fill-saffron-400 ml-0.5" />
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-spiritual-text truncate">
                      {result.mantraName}
                    </div>
                    <div className="text-[10px] text-spiritual-muted mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Clock size={9} />
                        {formatDuration(result.duration)}
                      </span>
                      <span>·</span>
                      <span>{result.voiceConfig.voiceName}</span>
                      <span>·</span>
                      <span>{formatDate(result.createdAt)}</span>
                    </div>
                    <div className="text-[10px] text-spiritual-muted/60 mt-0.5 truncate">
                      {truncateText(result.textPreview, 60)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => downloadBlob(result.audioBlob, `${result.mantraName.replace(/\s+/g,"_")}.wav`)}
                      className="p-1.5 rounded text-spiritual-muted hover:text-spiritual-text transition-colors"
                      title="Download"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={() => removeResult(result.id)}
                      className="p-1.5 rounded text-spiritual-muted hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
