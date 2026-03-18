import React, { useState } from 'react';
import { THEMES, Theme } from '../lib/themes';
import { cn } from '../lib/utils';
import { Wand2 } from 'lucide-react';
import { generateAIBackground } from '../lib/gemini';

interface DareFormProps {
  goal: string;
  setGoal: (val: string) => void;
  duration: number;
  setDuration: (val: number) => void;
  theme: Theme;
  setTheme: (val: Theme) => void;
  twist: string;
  setTwist: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  customBgUrl?: string;
  setCustomBgUrl: (val: string | undefined) => void;
}

const DURATIONS = [7, 14, 30, 60, 90, 100];

export function DareForm({
  goal,
  setGoal,
  duration,
  setDuration,
  theme,
  setTheme,
  twist,
  setTwist,
  onGenerate,
  isGenerating,
  customBgUrl,
  setCustomBgUrl,
}: DareFormProps) {
  const [focusedInput, setFocusedInput] = useState<'goal' | 'twist' | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [showErrorShake, setShowErrorShake] = useState(false);

  const handleGenerateImage = async () => {
    if (!goal.trim()) {
      alert("Please enter a goal first!");
      return;
    }
    setIsGeneratingImg(true);
    try {
      const prompt = `Theme: ${theme.name}, Goal: ${goal}, Twist: ${twist || 'None'}`;
      const url = await generateAIBackground(prompt);
      setCustomBgUrl(url);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to generate AI background image.';
      console.error('AI image generation failed:', message);
      if (message.toLowerCase().includes('leaked')) {
        alert('Gemini API key is blocked as leaked. Create a new API key in Google AI Studio and update your .env, then restart the dev server.');
      } else {
        alert(`Failed to generate AI background image: ${message}`);
      }
    } finally {
      setIsGeneratingImg(false);
    }
  };

  return (
    <div className={cn("w-full max-w-xl mx-auto space-y-8 p-6 bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl transition-transform", showErrorShake && 'animate-shake border-red-500/60')}>
      <div className="space-y-4 relative pt-6">
        <label 
          className={cn(
            "absolute left-6 top-10 text-xl font-bold tracking-tight origin-left transition-all duration-300 pointer-events-none z-20",
            focusedInput === 'goal' || goal ? "-translate-y-8 scale-75" : "translate-y-0 scale-100",
            focusedInput === 'goal' ? "text-indigo-400" : "text-zinc-500"
          )}
        >
          I will...
        </label>
        <div className="relative">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onFocus={() => setFocusedInput('goal')}
            onBlur={() => setFocusedInput(null)}
            className="w-full bg-black/50 border border-white/20 rounded-2xl px-6 py-4 pt-6 text-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all relative z-10"
            maxLength={60}
          />
          {focusedInput === 'goal' && (
            <div
              className="absolute inset-0 -z-0 bg-indigo-500/20 blur-xl rounded-2xl animate-in fade-in zoom-in duration-300"
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-xl font-bold text-white tracking-tight">
          Duration
        </label>
        <div className="flex flex-wrap gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={cn(
                'px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95',
                duration === d
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              )}
            >
              {d} days
            </button>
          ))}
          <div className="relative flex items-center">
            <input
              type="number"
              min="1"
              max="365"
              placeholder="Custom"
              value={!DURATIONS.includes(duration) && duration > 0 ? duration : ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) setDuration(val);
              }}
              className={cn(
                'w-24 px-4 py-3 rounded-xl font-medium outline-none transition-all duration-300',
                !DURATIONS.includes(duration) && duration > 0
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] placeholder-black/50'
                  : 'bg-zinc-800 text-zinc-400 border border-transparent focus:border-white/20 focus:bg-zinc-800 focus:text-white placeholder-zinc-500'
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-xl font-bold text-white tracking-tight">
          Style / Flavor
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={cn(
                'px-4 py-3 rounded-xl font-medium text-sm transition-all duration-400 border relative overflow-hidden group hover:scale-[1.03] hover:-translate-y-0.5 active:scale-95 btn-ripple',
                theme.id === t.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.6)] theme-selected animate-neon-pulse'
                  : 'bg-zinc-800/50 border-white/10 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-white/30'
              )}
            >
              <span className="relative z-10">{t.name}</span>
              {theme.id === t.id && (
                <div
                  className="absolute inset-0 bg-white/10 z-0 animate-in fade-in duration-300"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 relative pt-6">
        <label 
          className={cn(
            "absolute left-6 top-10 text-xl font-bold tracking-tight origin-left transition-all duration-300 pointer-events-none z-20",
            focusedInput === 'twist' || twist ? "-translate-y-8 scale-75" : "translate-y-0 scale-100",
            focusedInput === 'twist' ? "text-indigo-400" : "text-zinc-500"
          )}
        >
          Add a twist <span className="text-zinc-500 text-sm font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={twist}
            onChange={(e) => setTwist(e.target.value)}
            onFocus={() => setFocusedInput('twist')}
            onBlur={() => setFocusedInput(null)}
            className="w-full bg-black/50 border border-white/20 rounded-2xl px-6 py-4 pt-6 text-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all relative z-10"
            maxLength={40}
          />
          {focusedInput === 'twist' && (
            <div
              className="absolute inset-0 -z-0 bg-indigo-500/20 blur-xl rounded-2xl animate-in fade-in zoom-in duration-300"
            />
          )}
        </div>
      </div>
      
      <div className="pt-2">
        <button
          onClick={handleGenerateImage}
          disabled={!goal.trim() || isGeneratingImg}
          className={cn(
            "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 btn-shine btn-ripple",
            goal.trim() && !isGeneratingImg
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-[1.02] shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95 btn-shine"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          )}
        >
          <Wand2 className={cn("w-5 h-5", isGeneratingImg && "animate-spin")} />
          {isGeneratingImg ? "Generating Custom Background..." : "AI Generate Custom Background"}
        </button>
        {customBgUrl && (
          <p className="text-center text-xs text-green-400 mt-2">✨ Custom background applied successfully!</p>
        )}
      </div>

      <button
        onClick={() => {
          if (!goal.trim() || isGenerating) {
            setShowErrorShake(true);
            window.setTimeout(() => setShowErrorShake(false), 420);
            return;
          }
          onGenerate();
        }}
        disabled={!goal.trim() || isGenerating}
        className={cn(
          'w-full py-5 rounded-2xl text-xl font-black tracking-tight uppercase transition-all duration-200 relative overflow-hidden btn-generate btn-shine btn-ripple',
          goal.trim() && !isGenerating
            ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] hover:scale-105 active:scale-95 animate-neon-pulse'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        )}
      >
        <span className="block relative z-10">
          {isGenerating ? 'Crafting...' : 'Generate My Dare'}
        </span>
        
        {isGenerating && (
          <div
            className="absolute inset-0 bg-white/20 animate-shimmer"
          />
        )}
      </button>
    </div>
  );
}
