import React, { useEffect, useState } from 'react';
import { Theme } from '../lib/themes';
import { DareCard } from './DareCard';
import { Play, Plus } from 'lucide-react';

interface SharedViewProps {
  key?: string;
  goal: string;
  duration: number;
  theme: Theme;
  twist: string;
  onJoin: () => void;
  onCreateOwn: () => void;
}

export function SharedView({
  goal,
  duration,
  theme,
  twist,
  onJoin,
  onCreateOwn,
}: SharedViewProps) {
  const [progress, setProgress] = useState(0);
  const [filledBoxes, setFilledBoxes] = useState(0);
  const boxCount = Math.min(duration, 30);

  useEffect(() => {
    // Animate progress to 0 to show it's a new challenge
    const timer = setTimeout(() => setProgress(0), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let current = 0;
    const interval = window.setInterval(() => {
      current += 1;
      setFilledBoxes(current);
      if (current >= boxCount) {
        window.clearInterval(interval);
      }
    }, 90);

    return () => window.clearInterval(interval);
  }, [boxCount]);

  return (
    <div
      className="w-full max-w-4xl mx-auto flex flex-col items-center gap-12 py-12 animate-in fade-in zoom-in duration-500"
    >
      <div className="text-center space-y-4">
        <h2 
          className="text-3xl md:text-5xl font-black tracking-tighter text-white animate-in slide-in-from-top-4 duration-500 delay-200 fill-mode-both"
        >
          Someone dared you to join this challenge.
        </h2>
        <p 
          className="text-zinc-400 text-lg animate-in slide-in-from-top-2 duration-500 delay-300 fill-mode-both"
        >
          Are you ready to commit?
        </p>
      </div>

      <div 
        className="w-full max-w-[500px] shadow-2xl shadow-indigo-500/20 rounded-3xl overflow-hidden relative group animate-card-pop"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative">
          <DareCard
            goal={goal}
            duration={duration}
            theme={theme}
            twist={twist}
            isShared={true}
            progress={progress}
          />
        </div>
      </div>

      <div className="w-full max-w-[640px] px-4 animate-lift-in" style={{ animationDelay: '220ms' }}>
        <p className="text-center text-zinc-400 text-sm uppercase tracking-[0.2em] mb-3">Challenge Progress Preview</p>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: boxCount }).map((_, idx) => {
            const isFilled = idx < filledBoxes;
            return (
              <div
                key={idx}
                className={[
                  'h-6 rounded-md border flex items-center justify-center text-[10px] font-bold transition-all duration-300',
                  isFilled
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 border-emerald-300 text-white shadow-[0_0_12px_rgba(16,185,129,0.45)] animate-check-pop'
                    : 'bg-zinc-900/80 border-zinc-700 text-zinc-500',
                ].join(' ')}
              >
                {isFilled ? '✓' : idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      <div 
        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl animate-in slide-in-from-bottom-4 duration-500 delay-600 fill-mode-both px-4"
      >
        <button
          onClick={onJoin}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl py-5 px-8 rounded-2xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.4)] relative overflow-hidden group btn-shine animate-pulse"
        >
          <Play className="w-6 h-6 fill-current relative z-10" />
          <span className="relative z-10">Accept the Dare</span>
        </button>
        
        <button
          onClick={onCreateOwn}
          className="w-full sm:flex-1 sm:max-w-[200px] flex items-center justify-center gap-2 bg-zinc-800 text-white font-bold py-5 px-8 rounded-2xl hover:bg-zinc-700 transition-all hover:scale-105 active:scale-95 border border-zinc-700 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <Plus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Create My Own</span>
        </button>
      </div>
    </div>
  );
}
