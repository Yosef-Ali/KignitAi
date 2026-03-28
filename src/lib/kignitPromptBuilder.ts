/**
 * kignitPromptBuilder.ts — Maps Ethiopian Kiñit theory to Lyria 3 prompts
 *
 * v3: Anti-drift targeting — verified which specific notes Lyria leaks
 * into (F and Bb for Tizita = Arabic maqam drift). Each scale now has
 * an antiDrift instruction targeting the worst offenders by name.
 */

export interface KignitConfig {
  id: string; nameAmharic: string; meaning: string;
  scales: { variant: string; notes: string; degrees: string; mood: string;
    forbiddenNotes: string; lyriaKey: string; antiDrift: string }[];
  melodicCharacter: string; defaultTempo: [number, number];
  instruments: InstrumentOption[]; vocalStyle: string;
}
export interface InstrumentOption {
  id: string; name: string; nameAmharic: string; lyriaDescription: string;
}
export interface GenerationParams {
  kignit: string; scaleVariant?: string; userPrompt: string;
  tempo?: number; instruments?: string[];
  vocalMode: "with-vocals" | "instrumental" | "auto";
  vocalGender?: "female" | "male" | "auto";
  model: "lyria-3-clip-preview" | "lyria-3-pro-preview";
  structure?: "auto" | "simple" | "full-song";
}

const INSTRUMENTS: Record<string, InstrumentOption> = {
  krar: { id: "krar", name: "Krar", nameAmharic: "ክራር",
    lyriaDescription: "African lyre with five or six metal strings, similar to a small harp but with a buzzy twangy resonance, plucked with a pick, dry warm tone with slight metallic buzz, pentatonic arpeggios, East African string instrument" },
  masinko: { id: "masinko", name: "Masinko", nameAmharic: "ማሲንቆ",
    lyriaDescription: "single-string bowed instrument like an African fiddle or rebab, raw earthy nasal tone, not a smooth Western violin, rough textured bowing with heavy ornamental slides, East African folk fiddle sound" },
  washint: { id: "washint", name: "Washint", nameAmharic: "ዋሽንት",
    lyriaDescription: "simple bamboo end-blown flute, breathy airy tone like a ney flute or shakuhachi, warm woody sound with breath noise, not a concert flute, folk flute with ornamental trills" },
  kebero: { id: "kebero", name: "Kebero", nameAmharic: "ከበሮ",
    lyriaDescription: "large African hand drum like a djembe, deep booming bass with sharp slaps, hand-struck goatskin, organic earthy percussion, not electronic drums" },
  begena: { id: "begena", name: "Begena", nameAmharic: "በገና",
    lyriaDescription: "large ten-string African lyre, deep buzzing resonant tone, meditative and sacred, slow deliberate plucking, each string buzzes against the bridge, drone-like quality" },
  saxophone: { id: "saxophone", name: "Saxophone", nameAmharic: "ሳክስፎን",
    lyriaDescription: "alto saxophone, Ethio-jazz style, warm breathy tone with expressive vibrato, pentatonic improvisation, similar to jazz saxophone but with Ethiopian ornamental bends" },
};

export const KIGNIT_CONFIGS: Record<string, KignitConfig> = {
  Tizita: {
    id: "Tizita", nameAmharic: "ትዝታ", meaning: "Nostalgia, longing",
    scales: [
      { variant: "Major", notes: "C D E G A", degrees: "1 2 3 5 6",
        mood: "warm, peaceful, consonant",
        forbiddenNotes: "NEVER play F, Bb, or B — these create an Arabic/maqam sound that is NOT Ethiopian. Also avoid Eb, Ab, Db, F#.",
        lyriaKey: "C major pentatonic",
        antiDrift: "This is NOT Arabic maqam. Do not add F or Bb passing tones. When the melody moves from E to G, skip directly — do not pass through F. When moving from A to C, skip directly — do not pass through Bb or B." },
      { variant: "Minor", notes: "C D Eb G Ab", degrees: "1 2 b3 5 b6",
        mood: "dark, solemn, stereotypically Ethiopian",
        forbiddenNotes: "ABSOLUTELY FORBIDDEN NOTES: Bb, F, and Db. These three notes are the #1 problem — they turn Ethiopian music into Arabic maqam. Also forbidden: E natural, A natural, B, F#. The ONLY notes allowed are C D Eb G Ab.",
        lyriaKey: "C minor",
        antiDrift: "VERIFIED PROBLEM: Lyria keeps adding Bb (13% of notes), F (11%), and Db (6%) as passing tones. This makes the music sound Arabic/Middle Eastern instead of Ethiopian. FIX: The intervals Eb→G and Ab→C are WIDE GAPS (major 3rds). These gaps are the defining sound of Tizita Minor. NEVER fill them with passing tones. When the melody goes from Eb to G, JUMP directly — never pass through F. When going from Ab up to C, JUMP directly — never pass through Bb. When going from C to D, STEP directly — never insert Db as an ornament. Every ornament and trill must only move between adjacent scale notes: C↔D, D↔Eb, Eb↔G (jump), G↔Ab, Ab↔C (jump)." },
    ],
    melodicCharacter: "STRICTLY five notes only, no exceptions. The gaps between scale degrees are WIDE — do not fill them. Ornaments and trills only between adjacent scale tones. Static harmony on one root. Each phrase should have a different melodic contour — mix small steps with wide leaps. This is the Ethiopian third way of melodic development. Do not repeat the same interval pattern. Sound like classic Ethiopiques recordings by Mulatu Astatke, not generic or East Asian pentatonic. Sweet, ringing, crystalline tone with warm overtones. Let notes ring and sustain. Space between phrases.",
    defaultTempo: [60, 90],
    instruments: [INSTRUMENTS.krar, INSTRUMENTS.masinko, INSTRUMENTS.washint, INSTRUMENTS.begena, INSTRUMENTS.saxophone],
    vocalStyle: "Ethiopian vocal, melismatic ornamentation, heavy vibrato, emotional yearning, Amharic lyrics",
  },
  Bati: {
    id: "Bati", nameAmharic: "ባቲ", meaning: "Hope, devotion",
    scales: [
      { variant: "Minor", notes: "C Eb F G Bb", degrees: "1 b3 4 5 b7",
        mood: "distinct Ethiopian feel, rhythmic energy",
        forbiddenNotes: "NEVER play D, E natural, A, or B. These break the Bati Minor feel. Also avoid Ab, Db, F#.",
        lyriaKey: "C minor pentatonic",
        antiDrift: "Do not add D or A passing tones. The gap from C to Eb is a minor 3rd — jump it directly. The gap from Bb to C is a whole step — do not insert B natural." },
      { variant: "Major", notes: "C E F G B", degrees: "1 3 4 5 7",
        mood: "angular, bright, exotic, mystical",
        forbiddenNotes: "NEVER play D, Eb, Ab, A, Bb, F#, or Db. ONLY use C E F G B.",
        lyriaKey: "C major",
        antiDrift: "The wide gaps (C-E and G-B) are major 3rds — do not fill them with passing tones. No D between C and E. No A or Bb between G and B." },
    ],
    melodicCharacter: "Rhythmic and energetic. Ethiopian ornamentation strictly within the five pentatonic tones. No chromatic passing tones. Uplifting and hopeful.",
    defaultTempo: [90, 130],
    instruments: [INSTRUMENTS.krar, INSTRUMENTS.kebero, INSTRUMENTS.masinko, INSTRUMENTS.saxophone],
    vocalStyle: "Ethiopian vocal, energetic rhythmic delivery, call-and-response, devotional tone, Amharic lyrics",
  },
  Ambassel: {
    id: "Ambassel", nameAmharic: "አምባሳል", meaning: "Heroism, storytelling",
    scales: [
      { variant: "Minor", notes: "C D F G Ab", degrees: "1 2 4 5 b6",
        mood: "open, melancholy, unresolved, thirdless",
        forbiddenNotes: "NEVER play E, Eb, A natural, Bb, B, or F#. No third of any kind — this scale deliberately has no 3rd. ONLY use C D F G Ab.",
        lyriaKey: "Ab major",
        antiDrift: "This scale has NO THIRD — no E and no Eb. This is intentional and characteristic. Do not add a 3rd to 'complete' the scale. Resolve melodies to C or G (tonic and 5th), never to a 3rd. The gap from D to F is a minor 3rd — jump directly, no Eb." },
    ],
    melodicCharacter: "Thirdless — deliberately no 3rd, creating open ambiguous sound. Melodies resolve only to tonic C and fifth G. Dramatic pauses and storytelling phrasing. Strictly five notes.",
    defaultTempo: [70, 110],
    instruments: [INSTRUMENTS.masinko, INSTRUMENTS.washint, INSTRUMENTS.begena, INSTRUMENTS.krar],
    vocalStyle: "Ethiopian vocal, storytelling with dramatic pauses, open resonant tone, heroic, Amharic lyrics",
  },
  Anchihoye: {
    id: "Anchihoye", nameAmharic: "አንቺሆዬ", meaning: "Tension, dissonance",
    scales: [
      { variant: "Traditional", notes: "C Db F Gb A", degrees: "1 b2 4 b5 6",
        mood: "tense, angular, non-diatonic, tritone",
        forbiddenNotes: "NEVER play D natural, E, Eb, G natural, Ab, Bb, or B. ONLY use C Db F Gb A. This is a non-diatonic scale — do not try to make it fit a standard key.",
        lyriaKey: "Db major",
        antiDrift: "This scale has a tritone (C to Gb) and minor 2nds (C-Db and F-Gb). These dissonances are intentional and characteristic. Do not resolve them. Do not add G natural to 'fix' the Gb. The arpeggio-like wide intervals are the defining feature." },
    ],
    melodicCharacter: "Minor-2nd intervals and tritone create intentional tension. Three wide intervals push melodies toward arpeggios. Angular and tense but compelling. Strictly five non-diatonic notes.",
    defaultTempo: [80, 120],
    instruments: [INSTRUMENTS.krar, INSTRUMENTS.kebero, INSTRUMENTS.masinko, INSTRUMENTS.saxophone],
    vocalStyle: "Ethiopian vocal, tense angular delivery, sharp ornamental phrases, Amharic lyrics",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getScale(config: KignitConfig, variant?: string) {
  return (variant ? config.scales.find(s => s.variant === variant) : null) ?? config.scales[0];
}
function pickTempo(config: KignitConfig, userTempo?: number): number {
  if (userTempo) return Math.max(40, Math.min(220, userTempo));
  const [min, max] = config.defaultTempo;
  return Math.round(min + (max - min) / 2);
}
function buildInstrumentLine(config: KignitConfig, selectedIds?: string[]): string {
  const matched = selectedIds?.length
    ? config.instruments.filter(i => selectedIds.includes(i.id))
    : [];
  const selected = matched.length ? matched : config.instruments.slice(0, 2);
  return selected.map(i => i.lyriaDescription).join(". ");
}
function buildVocalLine(config: KignitConfig, mode: GenerationParams["vocalMode"], gender?: GenerationParams["vocalGender"]): string {
  if (mode === "instrumental") return "Instrumental only, no vocals, no singing, no humming.";
  const g = gender === "female" ? "female" : gender === "male" ? "male" : "Ethiopian";
  return `${g} ${config.vocalStyle}`;
}

// ---------------------------------------------------------------------------
// Scale constraint — the core anti-drift mechanism
// ---------------------------------------------------------------------------

function buildScaleConstraint(config: KignitConfig, scale: KignitConfig["scales"][0]): string {
  // Use MUSICAL DIRECTION language, not prohibitions — Lyria turns "DO NOT" into lyrics
  return [
    `Ethiopian ${config.id} ${scale.variant} pentatonic mode.`,
    `Key: ${scale.lyriaKey}. Pentatonic scale: ${scale.notes}.`,
    `Melodic movement: mix stepwise motion with wide pentatonic leaps. Each phrase a different shape.`,
    `Sound: sweet, warm, ringing tone with natural reverb. Like classic Ethiopiques recordings.`,
  ].join("\n");
}

/** Injected into every timed section to prevent mid-song drift */
function scaleReminder(scale: KignitConfig["scales"][0]): string {
  return `Pentatonic ${scale.notes}.`;
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildClipPrompt(params: GenerationParams): string {
  const config = KIGNIT_CONFIGS[params.kignit];
  const scale = getScale(config, params.scaleVariant);
  const tempo = pickTempo(config, params.tempo);
  return [
    buildScaleConstraint(config, scale),
    `Tempo: ${tempo} BPM.`,
    buildInstrumentLine(config, params.instruments),
    buildVocalLine(config, params.vocalMode, params.vocalGender),
    "",
    `The melody breathes with space between phrases. Notes ring and decay naturally. Gentle vibrato on sustained notes. Delicate ornamental trills. Each phrase has a unique contour.`,
    "",
    params.userPrompt,
  ].join("\n");
}

function buildProPrompt(params: GenerationParams, structure: "simple" | "full-song"): string {
  const config = KIGNIT_CONFIGS[params.kignit];
  const scale = getScale(config, params.scaleVariant);
  const tempo = pickTempo(config, params.tempo);
  const instruments = buildInstrumentLine(config, params.instruments);
  const vocals = buildVocalLine(config, params.vocalMode, params.vocalGender);
  const isInst = params.vocalMode === "instrumental";
  const primary = (params.instruments?.[0] && INSTRUMENTS[params.instruments[0]]?.lyriaDescription)
    ?? config.instruments[0].lyriaDescription;
  const r = scaleReminder(scale);

  const preamble = [
    buildScaleConstraint(config, scale),
    `Tempo: ${tempo} BPM. ${instruments}.`,
    vocals,
    `Sweet, warm tone. Notes ring with natural reverb. Varied melodic shapes. Space between phrases.`,
    "",
    params.userPrompt,
  ].join("\n");

  if (structure === "simple") {
    return [preamble, "",
      `[0:00-0:20] Intro: Solo ${config.instruments[0].name}, gentle opening`,
      `[0:20-1:00] Main melody: ${isInst ? "Full ensemble" : "Vocal melody"}, flowing pentatonic phrases`,
      `[1:00-1:30] Development: More elaborate ornamental passages, building`,
      `[1:30-2:00] Resolution: Winding down, peaceful, fade`,
    ].join("\n");
  }

  return [preamble, "",
    `[0:00-0:15] Intro: ${primary} solo. Gentle, sweet, establishing the mood`,
    isInst
      ? `[0:15-0:50] Section A: Full ensemble. ${instruments}. Flowing melody with ornamental trills`
      : `[0:15-0:50] Verse 1: Singing in Amharic. ${vocals}. Sparse accompaniment`,
    `[0:50-1:20] ${isInst ? "Section B" : "Chorus"}: Kebero drums join, emotional peak, full ensemble`,
    isInst
      ? `[1:20-1:50] Solo: Beautiful pentatonic improvisation, expressive and varied`
      : `[1:20-1:50] Verse 2: Deeper, more ornamented vocal. Building intensity`,
    `[1:50-2:15] Bridge: ${config.instruments.length > 2 ? config.instruments[2].name : config.instruments[0].name} solo. Sparse, meditative`,
    `[2:15-2:45] Final ${isInst ? "section" : "chorus"}: All instruments, emotional climax`,
    `[2:45-3:00] Outro: Solo ${config.instruments[0].name}, fading gently`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function buildLyriaPrompt(params: GenerationParams): string {
  if (params.model === "lyria-3-clip-preview") return buildClipPrompt(params);
  const s = params.structure === "simple" ? "simple" : "full-song";
  return buildProPrompt(params, s);
}

export { INSTRUMENTS };
