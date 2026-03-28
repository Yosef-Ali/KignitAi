# Anti-Drift Workflow

## The problem
Lyria generates amazing Ethiopian-sounding instruments but drifts out of 
the Kiñit pentatonic scale — adding F and Bb passing tones that make 
it sound Arabic/maqam instead of Ethiopian.

## The solution: detect → target → enforce

### Step 1: Generate a track
Use KignitAi app with the v3 prompt builder (kignitPromptBuilder.ts).
The prompt now includes:
- Forbidden notes list ("NEVER play F, Bb...")
- Anti-drift instructions ("Do not add F passing tone between E and G")
- Scale reminder in every timed section

### Step 2: Verify with the scale checker
```bash
cd ~/ethio-kignet-autoresearch
source .venv/bin/activate
python3 verify_kignit_scale.py path/to/output.wav --kignit Tizita --variant Minor
```

The report shows:
- Overall adherence % (target: >85%)
- Exactly which wrong notes appear and how often
- Drift zones: timestamps where it goes out of scale
- A suggested prompt fix targeting the worst offenders

### Step 3: Feed the fix back into the prompt
If the verifier says "Lyria keeps playing F (38% of violations)",
you add that specific note to the antiDrift field in kignitPromptBuilder.ts.

### Step 4: Regenerate and verify again
Repeat until adherence is above 85-90%.

## Files
- `KignitAi/src/lib/kignitPromptBuilder.ts` — v3 with antiDrift
- `KignitAi/src/hooks/useMusicGenerator.ts` — calls Lyria with built prompt
- `ethio-kignet-autoresearch/verify_kignit_scale.py` — pitch verification tool

## Note on "pure" pentatonic
Even real Ethiopian recordings (Mulatu Astatke) are only ~60% pure 
pentatonic — Ethio-jazz naturally extends. For AI generation, 85%+ 
adherence will sound convincingly Ethiopian without being robotic.
