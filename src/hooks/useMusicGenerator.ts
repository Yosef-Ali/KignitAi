/**
 * useMusicGenerator.ts — Lyria 3 with Kiñit-aware prompts
 */
import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { buildLyriaPrompt, type GenerationParams } from '../lib/kignitPromptBuilder';

export interface Track {
  id: string; title: string; prompt: string; fullPrompt: string;
  kignit: string; audioUrl: string; lyrics: string;
  createdAt: number; model: string; durationLabel: string;
}

export function useMusicGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (params: GenerationParams): Promise<Track | null> => {
    setIsGenerating(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const fullPrompt = buildLyriaPrompt(params);

      const wantsVocals = params.vocalMode === "with-vocals";

      const response = await ai.models.generateContentStream({
        model: params.model,
        contents: fullPrompt,
        config: {
          responseModalities: wantsVocals ? ["AUDIO", "TEXT"] : ["AUDIO"],
        },
      });

      let audioBase64 = "";
      let lyrics = "";
      let mimeType = "audio/wav";

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
            // Strip padding from each chunk before concatenating — intermediate = signs corrupt atob()
            audioBase64 += part.inlineData.data.replace(/=/g, "");
          }
          if (part.text && !lyrics) lyrics = part.text;
        }
      }

      if (!audioBase64) throw new Error("No audio generated. Try adjusting your prompt or Kiñit selection.");

      // Re-add padding after stripping from intermediate chunks
      const paddedBase64 = audioBase64 + "=".repeat((4 - audioBase64.length % 4) % 4);
      const binary = atob(paddedBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mimeType });
      const audioUrl = URL.createObjectURL(blob);
      const isClip = params.model === "lyria-3-clip-preview";

      return {
        id: crypto.randomUUID(),
        title: `${params.kignit} — ${params.userPrompt.substring(0, 30)}${params.userPrompt.length > 30 ? "…" : ""}`,
        prompt: params.userPrompt, fullPrompt, kignit: params.kignit,
        audioUrl, lyrics, createdAt: Date.now(),
        model: isClip ? "Clip (30s)" : "Pro (full)",
        durationLabel: isClip ? "30s" : "~3 min",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate music.";
      console.error("[KignitAI] Error:", err);
      setError(msg.includes("Requested entity was not found") ? "API Key error. Please re-select your API key." : msg);
      return null;
    } finally { setIsGenerating(false); }
  };

  return { generate, isGenerating, error, setError };
}
