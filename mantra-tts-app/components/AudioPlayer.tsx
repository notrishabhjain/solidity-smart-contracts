"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, RotateCcw, Download, Volume2, VolumeX,
  Repeat, SkipBack, SkipForward,
} from "lucide-react";
import { useMantraStore } from "@/store/useMantraStore";
import { formatDuration, downloadBlob, cn } from "@/lib/utils";

export function AudioPlayer() {
  const { currentAudioUrl, results } = useMantraStore();

  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const [volume, setVolume]         = useState(0.85);
  const [isMuted, setIsMuted]       = useState(false);
  const [isLooping, setIsLooping]   = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentResult = results[0];

  // Generate mock waveform bars (real waveform would need Web Audio API analysis)
  useEffect(() => {
    const bars = Array.from({ length: 80 }, () => 0.1 + Math.random() * 0.9);
    setWaveformData(bars);
  }, [currentAudioUrl]);

  // Set up audio element
  useEffect(() => {
    if (!currentAudioUrl) return;

    const audio = new Audio(currentAudioUrl);
    audio.volume = volume;
    audio.loop   = isLooping;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      setCurrentTime(0);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [isPlaying]);

  const seek = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  }, [duration]);

  const restart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [isPlaying]);

  const handleDownload = useCallback(() => {
    if (!currentResult) return;
    const name = `${currentResult.mantraName.replace(/\s+/g, "_")}_${Date.now()}.wav`;
    downloadBlob(currentResult.audioBlob, name);
  }, [currentResult]);

  if (!currentAudioUrl) return null;

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-spiritual-border bg-gradient-to-br from-spiritual-card to-spiritual-bg p-5 space-y-4"
      >
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-spiritual-text">
              {currentResult?.mantraName ?? "Sacred Audio"}
            </div>
            <div className="text-xs text-spiritual-muted mt-0.5">
              {currentResult?.voiceConfig.preset.replace(/-/g, " ")} ·{" "}
              {currentResult?.voiceConfig.voiceName} voice
            </div>
          </div>
          <div className="text-xs font-mono text-saffron-400">
            {formatDuration(duration)}
          </div>
        </div>

        {/* Waveform visualization */}
        <div
          className="relative h-16 flex items-center gap-px cursor-pointer group"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - rect.left) / rect.width);
          }}
        >
          {waveformData.map((height, i) => {
            const barPct    = (i / waveformData.length) * 100;
            const isPast    = barPct < progressPct;
            const isCurrent = Math.abs(barPct - progressPct) < 2;
            return (
              <motion.div
                key={i}
                className={cn(
                  "flex-1 rounded-sm min-w-[2px] transition-all",
                  isPast
                    ? "bg-gradient-to-t from-saffron-600 to-gold-400"
                    : "bg-spiritual-border/60 group-hover:bg-spiritual-muted/30"
                )}
                style={{ height: `${height * 100}%` }}
                animate={isCurrent && isPlaying ? { scaleY: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            );
          })}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-saffron-400 pointer-events-none"
            style={{ left: `${progressPct}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-[10px] font-mono text-spiritual-muted -mt-2">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Volume */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-spiritual-muted hover:text-spiritual-text transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0} max={1} step={0.05}
              value={isMuted ? 0 : volume}
              onChange={e => { setVolume(+e.target.value); setIsMuted(false); }}
              className="w-16 h-1 accent-saffron-500"
            />
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={restart}
              className="text-spiritual-muted hover:text-spiritual-text transition-colors"
            >
              <RotateCcw size={16} />
            </button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                "bg-gradient-to-br from-saffron-500 to-gold-400 shadow-lg",
                isPlaying && "animate-pulse-gold"
              )}
            >
              {isPlaying
                ? <Pause size={20} className="text-spiritual-bg fill-spiritual-bg" />
                : <Play  size={20} className="text-spiritual-bg fill-spiritual-bg ml-0.5" />
              }
            </motion.button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={cn(
                "transition-colors",
                isLooping ? "text-saffron-400" : "text-spiritual-muted hover:text-spiritual-text"
              )}
            >
              <Repeat size={16} />
            </button>
          </div>

          {/* Download */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-spiritual-border/50
                       text-xs text-spiritual-subtle hover:text-spiritual-text hover:bg-spiritual-border
                       transition-all border border-spiritual-border"
          >
            <Download size={13} />
            WAV
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
