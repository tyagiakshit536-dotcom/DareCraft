import React, { useState, useEffect, useRef } from 'react';
import { LandingView } from './components/LandingView';
import { DareForm } from './components/DareForm';
import { DareCard } from './components/DareCard';
import { ResultsView } from './components/ResultsView';
import { SharedView } from './components/SharedView';
import { THEMES, Theme } from './lib/themes';
import { encodeDare, decodeDare, generateSeed } from './lib/utils';
import confetti from 'canvas-confetti';
import { Zap } from 'lucide-react';

type ViewState = 'home' | 'result' | 'shared';
const MAX_SHARE_URL_LENGTH = 3000;

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(30);
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [twist, setTwist] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [fakeCounter, setFakeCounter] = useState(2847391);
  const [displayCounter, setDisplayCounter] = useState(0);
  const [customBgUrl, setCustomBgUrl] = useState<string | undefined>(undefined);
  const [showMagicFlash, setShowMagicFlash] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  // Parse URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('d');
    if (d) {
      const decoded = decodeDare(d);
      if (decoded) {
        setGoal(decoded.g || '');
        setDuration(decoded.d || 30);
        const foundTheme = THEMES.find((t) => t.id === decoded.t);
        if (foundTheme) setTheme(foundTheme);
        setTwist(decoded.tw || '');
        setCustomBgUrl(decoded.bg || undefined);
        setView('shared');
        setShowMagicFlash(true);
        window.setTimeout(() => setShowMagicFlash(false), 720);
        confetti({ particleCount: 180, spread: 75, origin: { y: 0.58 } });
      }
    }

    // Fake counter logic
    const savedCounter = localStorage.getItem('dareCounter');
    if (savedCounter) {
      const parsedCounter = Number.parseInt(savedCounter, 10);
      if (Number.isFinite(parsedCounter)) {
        setFakeCounter(parsedCounter);
      }
    }
    const interval = setInterval(() => {
      setFakeCounter((prev) => {
        const next = prev + Math.floor(Math.random() * 3);
        try {
          localStorage.setItem('dareCounter', next.toString());
        } catch {
          // Ignore storage write errors to avoid breaking counter animation.
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const start = 0;
    const end = fakeCounter;
    const durationMs = 900;
    const started = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - started) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayCounter(Math.floor(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fakeCounter]);

  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;

    let isDisposed = false;

    const tryPlay = async () => {
      if (isDisposed) return;
      try {
        video.muted = true;
        video.defaultMuted = true;
        await video.play();
      } catch {
        // Some browsers block autoplay until first user interaction.
      }
    };

    const onFirstInteraction = () => {
      void tryPlay();
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && video.paused) {
        void tryPlay();
      }
    };

    void tryPlay();
    window.setTimeout(() => void tryPlay(), 400);
    window.addEventListener('pointerdown', onFirstInteraction, { passive: true });
    window.addEventListener('touchstart', onFirstInteraction, { passive: true });
    window.addEventListener('keydown', onFirstInteraction);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      isDisposed = true;
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate generation delay for effect
    setTimeout(() => {
      const data = {
        g: goal,
        d: duration,
        t: theme.id,
        tw: twist,
        bg: customBgUrl,
        s: generateSeed(goal + duration + theme.id),
      };
      
      const encoded = encodeDare(data);
      if (!encoded) {
        alert('Failed to prepare share link. Please try again.');
        setIsGenerating(false);
        return;
      }

      const url = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
      if (url.length > MAX_SHARE_URL_LENGTH) {
        alert('Your dare is too long to share as a link. Please shorten your goal or twist.');
        setIsGenerating(false);
        return;
      }
      setShareUrl(url);
      
      // Update URL without reloading
      window.history.pushState({}, '', url);
      
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b'],
      });
      
      setView('result');
      setIsGenerating(false);
      
      // Increment counter locally
      setFakeCounter((prev) => prev + 1);
    }, 600);
  };

  const handleReset = () => {
    window.history.pushState({}, '', window.location.pathname);
    setGoal('');
    setTwist('');
    setView('home');
  };

  const handleJoin = () => {
    try {
      // Save to local storage.
      const raw = localStorage.getItem('myDares');
      const parsed = raw ? JSON.parse(raw) : [];
      const dares = Array.isArray(parsed) ? parsed : [];

      dares.push({
        goal,
        duration,
        themeId: theme.id,
        twist,
        startedAt: new Date().toISOString(),
      });

      localStorage.setItem('myDares', JSON.stringify(dares));
    } catch (error) {
      console.error('Failed to save dare to local storage', error);
      alert('Could not save your dare locally. Please try again.');
      return;
    }
    
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
    
    alert('Dare accepted! Check back tomorrow to mark your progress. (Local storage feature coming soon)');
  };

  const handlePreviewTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handlePreviewTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const dx = endX - touchStartX;
    if (Math.abs(dx) < 40) return;

    const currentIdx = THEMES.findIndex((t) => t.id === theme.id);
    const nextIdx = dx < 0
      ? (currentIdx + 1) % THEMES.length
      : (currentIdx - 1 + THEMES.length) % THEMES.length;
    setTheme(THEMES[nextIdx]);
    setTouchStartX(null);
  };

  const scrollToCreator = () => {
    document.getElementById('creator-tool')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative isolate min-h-screen bg-transparent text-white overflow-x-hidden font-sans selection:bg-indigo-500/30">
      <video
        ref={bgVideoRef}
        className="fixed inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 0 }}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => {
          const v = bgVideoRef.current;
          if (v && v.paused) {
            void v.play().catch(() => undefined);
          }
        }}
      >
        <source src="/RealBackground.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-black/55 pointer-events-none" style={{ zIndex: 1 }} />

      {showMagicFlash && (
        <div className="fixed inset-0 z-[70] pointer-events-none bg-gradient-to-b from-white/70 via-white/20 to-transparent animate-magic-flash" />
      )}
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-50 relative">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={handleReset}
        >
          <div className="w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">DareCraft</span>
        </div>
        
        <div className="hidden md:flex items-center gap-3 bg-zinc-900/40 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md shadow-lg shadow-black/20 hover:bg-zinc-800/60 transition-all cursor-default">
          <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-white text-sm font-bold tracking-wider font-['Space_Grotesk']">
            {displayCounter.toLocaleString()} <span className="text-zinc-400 font-medium">DARES CREATED</span>
          </span>
        </div>

        <button className="px-5 py-2 rounded-full border border-white/20 bg-zinc-900/50 text-sm font-medium hover:bg-zinc-800 transition-colors">
          Trending Dares
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-6 pb-24 pt-4 md:pt-8 relative z-10">
        {view === 'home' && (
          <div
            key="home"
            className="flex flex-col gap-24 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <LandingView onStart={scrollToCreator} />
            
            <div id="creator-tool" className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-24 items-start scroll-mt-24">
              {/* Left Column: Form */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-zinc-500">
                    Craft your challenge.
                  </h2>
                  <p className="text-xl text-zinc-400 font-medium">
                    Personalize every detail. Preview instantly.
                  </p>
                </div>
                
                <DareForm
                  goal={goal}
                  setGoal={setGoal}
                  duration={duration}
                  setDuration={setDuration}
                  theme={theme}
                  setTheme={setTheme}
                  twist={twist}
                  setTwist={setTwist}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  customBgUrl={customBgUrl}
                  setCustomBgUrl={setCustomBgUrl}
                />
              </div>

              {/* Right Column: Live Preview */}
              <div className="lg:sticky lg:top-24 flex flex-col items-center justify-center">
                <div className="w-full max-w-[500px] relative group" onTouchStart={handlePreviewTouchStart} onTouchEnd={handlePreviewTouchEnd}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative shadow-2xl shadow-black/50 rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
                    <DareCard
                      key={theme.id}
                      goal={goal}
                      duration={duration}
                      theme={theme}
                      twist={twist}
                      customBgUrl={customBgUrl}
                    />
                    {isGenerating && (
                      <div className="absolute inset-0 z-50 pointer-events-none animate-shimmer"></div>
                    )}
                  </div>
                </div>
                <p className="mt-6 text-zinc-500 text-sm font-medium tracking-widest uppercase">Live Preview</p>
              </div>
            </div>
          </div>
        )}

        {view === 'result' && (
          <ResultsView
            key="result"
            goal={goal}
            duration={duration}
            theme={theme}
            twist={twist}
            shareUrl={shareUrl}
            onReset={handleReset}
            customBgUrl={customBgUrl}
          />
        )}

        {view === 'shared' && (
          <SharedView
            key="shared"
            goal={goal}
            duration={duration}
            theme={theme}
            twist={twist}
            customBgUrl={customBgUrl}
            onJoin={handleJoin}
            onCreateOwn={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col items-center justify-center text-zinc-500 relative z-10">
        <p className="text-sm">
          A product of <a href="https://detha.pages.dev" target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-400 font-semibold transition-colors">Detha</a>
        </p>
      </footer>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]"></div>
      </div>
    </div>
  );
}
