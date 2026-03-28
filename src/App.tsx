import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Loader2, Sparkles, Key, AlertCircle, Menu, X, Disc3, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { useApiKey } from './hooks/useApiKey';
import { useMusicGenerator, Track } from './hooks/useMusicGenerator';
import { KIGNIT_CONFIGS, INSTRUMENTS } from './lib/kignitPromptBuilder';

const KIGNITS = [
  { id: 'Tizita', name: 'Tizita', desc: 'Nostalgic, Longing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30' },
  { id: 'Bati', name: 'Bati', desc: 'Love, Praise', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30' },
  { id: 'Ambassel', name: 'Ambassel', desc: 'Historical, Storytelling', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30' },
  { id: 'Anchihoye', name: 'Anchihoye', desc: 'Wedding, Joyous', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' },
];

export default function App() {
  const { hasKey, isChecking, selectKey, setHasKey } = useApiKey();
  const { generate, isGenerating, error, setError } = useMusicGenerator();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [prompt, setPrompt] = useState('');
  const [selectedKignit, setSelectedKignit] = useState(KIGNITS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [vocalMode, setVocalMode] = useState<'auto' | 'instrumental' | 'with-vocals'>('instrumental');
  const [selectedModel, setSelectedModel] = useState<'lyria-3-pro-preview' | 'lyria-3-clip-preview'>('lyria-3-pro-preview');
  const [tempo, setTempo] = useState(75);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(['krar']);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (error && error.includes('API Key error')) {
      setHasKey(false);
    }
  }, [error, setHasKey]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    
    const newTrack = await generate({
      kignit: selectedKignit,
      userPrompt: prompt,
      vocalMode: vocalMode,
      model: selectedModel,
      tempo: tempo,
      instruments: selectedInstruments,
    });
    if (newTrack) {
      setTracks(prev => {
        const updated = [newTrack, ...prev];
        // Cap at 20 tracks and revoke URLs for dropped entries to free memory
        if (updated.length > 20) {
          const dropped = updated.splice(20);
          dropped.forEach(t => URL.revokeObjectURL(t.audioUrl));
        }
        return updated;
      });
      setCurrentTrack(newTrack);
      setIsPlaying(true);
      setPrompt('');
    }
  };

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!currentTrack || tracks.length <= 1) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const playPrev = () => {
    if (!currentTrack || tracks.length <= 1) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
    setIsPlaying(true);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#141414] border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 font-serif">Welcome to Kignit AI</h1>
          <p className="text-gray-400 mb-8">
            To generate full-length Ethiopian music tracks using Lyria Pro, you need to select a paid Gemini API key.
          </p>
          <button
            onClick={selectKey}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Select API Key
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden">
      {/* Top Navigation */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-6 shrink-0 z-20 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-500">
            <Disc3 className="w-6 h-6" />
            <span className="text-xl font-bold font-serif tracking-tight text-white">Kignit<span className="text-amber-500">AI</span></span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={selectKey}
            className="text-xs font-medium text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Key className="w-3 h-3" />
            Change Key
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute lg:relative z-10 w-72 h-full bg-[#141414] border-r border-white/10 flex flex-col shrink-0"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold text-gray-200">Library</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-md lg:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {tracks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                    <Music className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No tracks generated yet.</p>
                  </div>
                ) : (
                  tracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group",
                        currentTrack?.id === track.id 
                          ? "bg-amber-500/10 text-amber-500" 
                          : "hover:bg-white/5 text-gray-300"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        currentTrack?.id === track.id ? "bg-amber-500/20" : "bg-white/10 group-hover:bg-white/20"
                      )}>
                        {currentTrack?.id === track.id && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-4">
                            <motion.div animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-amber-500 rounded-full" />
                            <motion.div animate={{ height: ["8px", "16px", "8px"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-amber-500 rounded-full" />
                            <motion.div animate={{ height: ["4px", "10px", "4px"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-amber-500 rounded-full" />
                          </div>
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{track.title}</p>
                        <p className="text-xs opacity-60 truncate">{new Date(track.createdAt).toLocaleDateString()}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
          
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              
              {/* Generator Section */}
              <section className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-blue-500" />
                
                <h2 className="text-2xl font-serif font-bold mb-6">Create a Track</h2>
                
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Select Kignit (Scale)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {KIGNITS.map(kignit => (
                        <button
                          key={kignit.id}
                          type="button"
                          onClick={() => setSelectedKignit(kignit.id)}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all",
                            selectedKignit === kignit.id 
                              ? kignit.color + " ring-2 ring-white/20" 
                              : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                          )}
                        >
                          <div className="font-bold mb-1">{kignit.name}</div>
                          <div className="text-xs opacity-80">{kignit.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Options</label>
                    <div className="flex flex-wrap gap-3">
                      {/* Model picker */}
                      <div className="flex rounded-lg border border-white/10 overflow-hidden">
                        <button type="button" onClick={() => setSelectedModel('lyria-3-clip-preview')}
                          className={cn("px-3 py-2 text-xs font-medium transition-colors",
                            selectedModel === 'lyria-3-clip-preview' ? "bg-amber-500/20 text-amber-400" : "text-gray-500 hover:text-gray-300"
                          )}>Quick 30s</button>
                        <button type="button" onClick={() => setSelectedModel('lyria-3-pro-preview')}
                          className={cn("px-3 py-2 text-xs font-medium transition-colors",
                            selectedModel === 'lyria-3-pro-preview' ? "bg-amber-500/20 text-amber-400" : "text-gray-500 hover:text-gray-300"
                          )}>Full Song</button>
                      </div>
                      {/* Vocal mode */}
                      <div className="flex rounded-lg border border-white/10 overflow-hidden">
                        {(['auto', 'instrumental', 'with-vocals'] as const).map(mode => (
                          <button key={mode} type="button" onClick={() => setVocalMode(mode)}
                            className={cn("px-3 py-2 text-xs font-medium transition-colors capitalize",
                              vocalMode === mode ? "bg-amber-500/20 text-amber-400" : "text-gray-500 hover:text-gray-300"
                            )}>{mode === 'with-vocals' ? 'Vocals' : mode === 'instrumental' ? 'No Vocals' : 'Auto'}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Tempo: {tempo} BPM</label>
                    <input
                      type="range" min={40} max={180} value={tempo}
                      onChange={(e) => setTempo(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Slow 40</span><span>Medium 100</span><span>Fast 180</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Instruments</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(INSTRUMENTS).map(inst => {
                        const isSelected = selectedInstruments.includes(inst.id);
                        return (
                          <button key={inst.id} type="button"
                            onClick={() => setSelectedInstruments(prev =>
                              isSelected ? prev.filter(id => id !== inst.id) : [...prev, inst.id]
                            )}
                            className={cn(
                              "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                              isSelected
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            )}
                          >
                            {inst.name} <span className="opacity-60">{inst.nameAmharic}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Song Description</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the song, mood, and instruments..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none h-24"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-start gap-2 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white font-semibold py-3 px-8 rounded-full transition-all flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Create
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>

              {/* Current Track Details */}
              {currentTrack && (
                <section className="space-y-6 pb-24">
                  <div className="flex items-end gap-6">
                    <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-gray-800 to-black rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center shrink-0 relative overflow-hidden">
                      <Disc3 className="w-16 h-16 text-white/20" />
                      {isPlaying && (
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                          className="absolute inset-0 border-[20px] border-black/40 rounded-full m-4"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-gray-300 mb-3">
                        {currentTrack.kignit} Kignit
                      </div>
                      <h1 className="text-3xl md:text-5xl font-bold font-serif mb-2 truncate">{currentTrack.title}</h1>
                      <p className="text-gray-400 text-sm md:text-base line-clamp-2">{currentTrack.prompt}</p>
                    </div>
                  </div>

                  {currentTrack.lyrics && (
                    <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Music className="w-5 h-5 text-amber-500" />
                        Lyrics
                      </h3>
                      <div className="prose prose-invert max-w-none">
                        <pre className="font-sans text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                          {currentTrack.lyrics}
                        </pre>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Player */}
      <div className={cn(
        "h-24 bg-[#141414] border-t border-white/10 px-4 lg:px-6 flex items-center justify-between z-30 transition-transform duration-300",
        currentTrack ? "translate-y-0" : "translate-y-full absolute bottom-0 w-full"
      )}>
        {currentTrack && (
          <>
            <div className="flex items-center gap-4 w-1/3 min-w-0">
              <div className="w-12 h-12 bg-white/10 rounded-md flex items-center justify-center shrink-0">
                <Music className="w-6 h-6 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{currentTrack.title}</p>
                <p className="text-xs text-gray-400 truncate">{currentTrack.kignit}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-1/3 max-w-md">
              <div className="flex items-center gap-6 mb-2">
                <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                </button>
                <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
              <div className="w-full flex items-center gap-3 text-xs text-gray-400 font-mono">
                <span>{formatTime(progress)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end w-1/3 gap-4">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                defaultValue={1}
                onChange={(e) => {
                  if (audioRef.current) audioRef.current.volume = Number(e.target.value);
                }}
                className="w-24 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
              />
            </div>

            <audio
              ref={audioRef}
              src={currentTrack.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onLoadedMetadata={handleTimeUpdate}
            />
          </>
        )}
      </div>
    </div>
  );
}
