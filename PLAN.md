# KignitAi — Architecture Plan

## What's done (Layer 1: Kiñit prompt builder)
- `src/lib/kignitPromptBuilder.ts` — maps each Kiñit mode to actual scale notes,
  melodic character, instrument descriptions, and timed song sections
- `src/hooks/useMusicGenerator.ts` — upgraded to accept GenerationParams

## What's next

### App.tsx update needed
Change `handleGenerate` to pass GenerationParams:
```ts
const params: GenerationParams = {
  kignit: selectedKignit, userPrompt: prompt,
  tempo: selectedTempo, instruments: selectedInstruments,
  vocalMode: selectedVocalMode, vocalGender: selectedGender,
  model: selectedModel, // "lyria-3-clip-preview" or "lyria-3-pro-preview"
};
const newTrack = await generate(params);
```

### New UI controls to add in App.tsx
- BPM slider (range 40-220, default from KIGNIT_CONFIGS)
- Instrument checkboxes (from KIGNIT_CONFIGS[mode].instruments)
- Vocal toggle: With vocals | Instrumental | Auto
- Model picker: Quick 30s | Full song ~3 min
- Scale variant selector (Major/Minor/Lydian per mode)

### Layer 2: Audio analyzer (ethio-kignet-autoresearch)
Pipeline: Reference MP3 → JSON profile
- CNN classifier → Kiñit mode
- librosa.pyin → tempo, pitch contour
- Spectral analysis → instrument detection
- Voiced frames → vocal style profile
Output feeds into prompt builder for "style cloning"

### Layer 3: Audio-to-prompt bridge (later)
Upload reference track → auto-populate all controls → generate in same style

## Testing
1. Go to https://aistudio.google.com/new_music
2. Select Lyria 3 Pro, paste a generated prompt
3. Listen — does it sound like authentic Tizita?
4. Key questions: Do scale notes constrain Lyria? Do timed sections work?
