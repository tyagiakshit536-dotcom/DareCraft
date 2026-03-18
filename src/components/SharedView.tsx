import React, { useEffect, useState } from 'react';
import { Theme } from '../lib/themes';
import { DareCard } from './DareCard';
import { cn } from '../lib/utils';
import { Play, Plus } from 'lucide-react';

interface SharedViewProps {
  key?: string;
  goal: string;
  duration: number;
  theme: Theme;
  twist: string;
  customBgUrl?: string;
  onJoin: () => void;
  onCreateOwn: () => void;
}

export function SharedView({
  goal,
  duration,
  theme,
  twist,
  customBgUrl,
  onJoin,
  onCreateOwn,
}: SharedViewProps) {
  const [progress, setProgress] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = () => {
    if (isAccepted) return;
    onJoin();
    setIsAccepted(true);
  };

  useEffect(() => {
    // Animate progress to 0 to show it's a new challenge
    const timer = setTimeout(() => setProgress(0), 500);
    return () => clearTimeout(timer);
  }, []);

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
            customBgUrl={customBgUrl}
          />
        </div>
      </div>

      <div className="relative -mt-6 z-20 animate-in fade-in zoom-in duration-500">
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center rounded-full bg-zinc-950/80 border border-white/15 backdrop-blur-md">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              className="opacity-20"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={2 * Math.PI * 45 * (1 - progress / duration)}
              className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-3xl md:text-4xl', theme.fontTitle)}>
              {progress}
            </span>
            <span className={cn('text-sm uppercase tracking-widest opacity-70', theme.fontBody)}>
              / {duration}
            </span>
          </div>
        </div>
      </div>

      <div 
        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl animate-in slide-in-from-bottom-4 duration-500 delay-600 fill-mode-both px-4"
      >
        <button
          onClick={handleAccept}
          disabled={isAccepted}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl py-5 px-8 rounded-2xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.4)] relative overflow-hidden group btn-shine animate-pulse disabled:opacity-85 disabled:cursor-default disabled:hover:scale-100"
        >
          <Play className="w-6 h-6 fill-current relative z-10" />
          <span className="relative z-10">{isAccepted ? 'Dare Accepted' : 'Accept the Dare'}</span>
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
