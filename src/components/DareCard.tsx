import React, { forwardRef } from 'react';
import { Theme } from '../lib/themes';
import { cn } from '../lib/utils';

interface DareCardProps {
  goal: string;
  duration: number;
  theme: Theme;
  twist: string;
  isShared?: boolean;
  progress?: number;
  customBgUrl?: string;
}

export const DareCard = forwardRef<HTMLDivElement, DareCardProps>(
  ({ goal, duration, theme, twist, isShared = false, progress = 0, customBgUrl }, ref) => {
    const titleText = `${duration} DAY ${theme.name} DARE`;
    const displayGoal = goal.trim() || 'Do something amazing';

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full aspect-square max-w-[600px] mx-auto overflow-hidden rounded-3xl border flex flex-col justify-between p-8 md:p-12 transition-all duration-500',
          theme.bgClass,
          theme.textClass
        )}
      >
        {customBgUrl && (
          <img src={customBgUrl} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="AI Generated Background" />
        )}

        {/* Header */}
        <div className="relative z-10 text-center space-y-2">
          <h2 
            className={cn('text-xl md:text-2xl opacity-80', theme.fontBody)}
          >
            {titleText.toUpperCase()}
          </h2>
          <h1
            className={cn(
              'text-4xl md:text-6xl leading-tight break-words',
              theme.fontTitle
            )}
          >
            I will {displayGoal}
            {twist && (
              <span 
                className="block text-2xl md:text-4xl mt-2 opacity-90"
              >
                {twist}
              </span>
            )}
          </h1>
        </div>

        {/* Middle: Progress or Quote */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 my-8">
          {isShared ? (
            <div 
              className="flex flex-col items-center"
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
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
          ) : (
            <div 
              className={cn('text-center max-w-[80%] italic text-lg md:text-xl opacity-80', theme.fontBody)}
            >
              {theme.quote}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="relative z-10 flex items-center justify-between pt-6 border-t border-current/20"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className={cn('font-bold tracking-tight', theme.fontBody)}>
              DareCraft.me
            </span>
          </div>
          <div className={cn('text-sm opacity-80 font-medium', theme.fontBody)}>
            Made with ❤️ on DareCraft.me
          </div>
        </div>
      </div>
    );
  }
);

DareCard.displayName = 'DareCard';
