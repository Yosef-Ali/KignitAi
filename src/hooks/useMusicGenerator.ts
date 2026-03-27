import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

export interface Track {
  id: string;
  title: string;
  prompt: string;
  kignit: string;
  audioUrl: string;
  lyrics: string;
  createdAt: number;
}

export function useMusicGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (prompt: string, kignit: string): Promise<Track | null> => {
    setIsGenerating(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const fullPrompt = `Generate a full-length Ethiopian music track in the ${kignit} kignit (scale). The song should be about: ${prompt}. Incorporate traditional Ethiopian instruments like the Masenqo, Krar, or Washint if possible, blended with modern production. The lyrics should reflect the mood of the ${kignit} scale.`;

      const response = await ai.models.generateContentStream({
        model: "lyria-3-pro-preview",
        contents: fullPrompt,
      });

      let audioBase64 = "";
      let lyrics = "";
      let mimeType = "audio/wav";

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (!audioBase64) {
        throw new Error("No audio generated. Please try again.");
      }

      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const audioUrl = URL.createObjectURL(blob);

      const newTrack: Track = {
        id: Math.random().toString(36).substring(7),
        title: `${kignit} - ${prompt.substring(0, 20)}...`,
        prompt,
        kignit,
        audioUrl,
        lyrics,
        createdAt: Date.now(),
      };

      return newTrack;
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found")) {
         setError("API Key error. Please re-select your API key.");
      } else {
         setError(err.message || "Failed to generate music.");
      }
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating, error, setError };
}
