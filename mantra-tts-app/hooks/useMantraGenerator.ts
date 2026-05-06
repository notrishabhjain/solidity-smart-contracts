"use client";

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMantraStore } from "@/store/useMantraStore";
import { base64ToBlob } from "@/lib/utils";
import type { GeneratedChunk, GenerationResult } from "@/types";

async function apiCall<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export function useMantraGenerator() {
  const {
    inputText,
    mantraName,
    voiceConfig,
    advancedMode,
    repeatCount,
    updateGeneration,
    resetGeneration,
    addResult,
    setPreprocessResult,
    setCurrentAudioUrl,
  } = useMantraStore();

  const generate = useCallback(async () => {
    if (!inputText.trim()) return;

    resetGeneration();
    updateGeneration({ status: "preprocessing", progress: 5 });

    try {
      // Step 1: Preprocess and chunk
      let textToProcess = inputText.trim();

      if (advancedMode === "108-repetitions") {
        const singleLine = textToProcess.split("\n").find(l => l.trim()) || textToProcess;
        textToProcess = Array(repeatCount).fill(singleLine.trim()).join("\n");
      }

      const preprocessResult = await apiCall<any>("/api/preprocess", {
        text: textToProcess,
        pace: voiceConfig.pace,
      });

      setPreprocessResult(preprocessResult);
      const { chunks } = preprocessResult;

      if (!chunks || chunks.length === 0) {
        throw new Error("No text chunks generated from preprocessing");
      }

      updateGeneration({
        status:      "generating",
        totalChunks: chunks.length,
        progress:    10,
      });

      // Step 2: Generate TTS for each chunk sequentially
      const generatedChunks: GeneratedChunk[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        updateGeneration({
          currentChunk: i + 1,
          progress:     10 + Math.round((i / chunks.length) * 70),
        });

        const result = await apiCall<{
          chunkId:     string;
          chunkIndex:  number;
          audioBase64: string;
          duration:    number;
        }>("/api/generate", {
          chunk,
          voiceConfig,
          isFirst:     i === 0,
          isLast:      i === chunks.length - 1,
          totalChunks: chunks.length,
        });

        generatedChunks.push({
          id:        result.chunkId,
          index:     result.chunkIndex,
          audioData: result.audioBase64,
          duration:  result.duration,
          text:      chunk.text,
        });

        updateGeneration({ generatedChunks: [...generatedChunks] });
      }

      // Step 3: Stitch all chunks
      updateGeneration({ status: "stitching", progress: 85 });

      let finalAudioBase64: string;
      let finalDuration:    number;

      if (generatedChunks.length === 1) {
        finalAudioBase64 = generatedChunks[0].audioData;
        finalDuration    = generatedChunks[0].duration;
      } else {
        const stitched = await apiCall<{
          audioBase64: string;
          duration:    number;
        }>("/api/stitch", {
          chunks:  generatedChunks.map(c => c.audioData),
          gapMs:   600,
          fadeIn:  true,
          fadeOut: true,
        });
        finalAudioBase64 = stitched.audioBase64;
        finalDuration    = stitched.duration;
      }

      // Step 4: Create result
      const audioBlob = base64ToBlob(finalAudioBase64, "audio/wav");
      const audioUrl  = URL.createObjectURL(audioBlob);

      const result: GenerationResult = {
        id:          uuidv4(),
        mantraName,
        audioUrl,
        audioBlob,
        duration:    finalDuration,
        format:      "wav",
        voiceConfig: { ...voiceConfig },
        createdAt:   Date.now(),
        textPreview: inputText.slice(0, 100),
      };

      addResult(result);
      setCurrentAudioUrl(audioUrl);

      updateGeneration({ status: "done", progress: 100 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      console.error("Generation error:", err);
      updateGeneration({ status: "error", error: message });
    }
  }, [
    inputText, mantraName, voiceConfig, advancedMode, repeatCount,
    resetGeneration, updateGeneration, addResult, setPreprocessResult, setCurrentAudioUrl,
  ]);

  return { generate };
}
