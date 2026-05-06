"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, X, FileText, Hash } from "lucide-react";
import { useMantraStore } from "@/store/useMantraStore";
import { SAMPLE_MANTRAS, cn } from "@/lib/utils";

export function MantraInput() {
  const { inputText, mantraName, setInputText, setMantraName } = useMantraStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setInputText(text);
        const name = file.name.replace(/\.[^/.]+$/, "");
        setMantraName(name);
      };
      reader.readAsText(file, "utf-8");
      e.target.value = "";
    },
    [setInputText, setMantraName]
  );

  const loadSample = useCallback(
    (sample: typeof SAMPLE_MANTRAS[0]) => {
      setInputText(sample.text);
      setMantraName(sample.name);
    },
    [setInputText, setMantraName]
  );

  // Count words and detect script
  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = inputText.split("\n").filter(l => l.trim()).length;
  const isDevanagari = /[ऀ-ॿ]/.test(inputText);
  const isIAST       = /[āīūṛṝṃḥñṅṭḍṇśṣ]/i.test(inputText);

  return (
    <div className="space-y-4">
      {/* Mantra Name */}
      <div>
        <label className="block text-xs font-medium text-spiritual-subtle mb-1.5 uppercase tracking-widest">
          Mantra Name
        </label>
        <input
          type="text"
          value={mantraName}
          onChange={e => setMantraName(e.target.value)}
          placeholder="e.g. Navkar Mantra"
          className="w-full bg-spiritual-card border border-spiritual-border rounded-lg px-4 py-2.5
                     text-spiritual-text placeholder-spiritual-muted text-sm
                     focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500/30
                     transition-colors"
        />
      </div>

      {/* Main text area */}
      <div className="relative">
        <label className="block text-xs font-medium text-spiritual-subtle mb-1.5 uppercase tracking-widest">
          Sacred Text
        </label>

        {/* Script indicator */}
        <div className="absolute top-7 right-3 flex gap-1.5 z-10">
          {isDevanagari && (
            <span className="px-1.5 py-0.5 text-[10px] bg-saffron-900/50 text-saffron-300 rounded border border-saffron-800/50">
              देव
            </span>
          )}
          {isIAST && (
            <span className="px-1.5 py-0.5 text-[10px] bg-gold-900/30 text-gold-400 rounded border border-gold-800/30">
              IAST
            </span>
          )}
        </div>

        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`Paste your mantra, shloka, or stotra here...

Examples:
• Namo Arihantanam (Prakrit/Hinglish)
• Om Namah Shivaya
• ॐ भूर्भुवः स्वः (Devanagari)
• Oṃ bhūr bhuvaḥ svaḥ (IAST)`}
          rows={10}
          className={cn(
            "w-full bg-spiritual-card border border-spiritual-border rounded-lg px-4 py-3",
            "text-spiritual-text placeholder-spiritual-muted text-sm leading-relaxed",
            "focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500/30",
            "transition-colors resize-y min-h-[200px] font-devanagari",
            isDevanagari && "text-base leading-loose"
          )}
        />

        {/* Stats bar */}
        <div className="flex items-center justify-between mt-1.5 px-1">
          <div className="flex gap-3 text-xs text-spiritual-muted">
            <span className="flex items-center gap-1">
              <Hash size={10} />
              {wordCount} words
            </span>
            <span>{lineCount} lines</span>
            <span>{inputText.length} chars</span>
          </div>
          {inputText && (
            <button
              onClick={() => setInputText("")}
              className="flex items-center gap-1 text-xs text-spiritual-muted hover:text-red-400 transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Upload button */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-xs border border-spiritual-border
                     text-spiritual-subtle rounded-lg hover:border-saffron-600/50 hover:text-saffron-400
                     transition-colors"
        >
          <Upload size={13} />
          Upload .txt file
        </motion.button>
        <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
      </div>

      {/* Sample mantras */}
      <div>
        <label className="block text-xs font-medium text-spiritual-subtle mb-2 uppercase tracking-widest">
          Sample Mantras
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {SAMPLE_MANTRAS.map(sample => (
            <motion.button
              key={sample.id}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => loadSample(sample)}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-spiritual-card/50 border border-spiritual-border/50
                         hover:border-saffron-600/40 hover:bg-saffron-900/10 text-left transition-all group"
            >
              <FileText size={13} className="mt-0.5 text-spiritual-muted group-hover:text-saffron-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-spiritual-text group-hover:text-saffron-300 truncate">
                  {sample.name}
                </div>
                <div className="text-[10px] text-spiritual-muted truncate">{sample.description}</div>
              </div>
              <span className="shrink-0 text-[9px] text-spiritual-muted bg-spiritual-border/50 px-1.5 py-0.5 rounded ml-auto">
                {sample.language}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
