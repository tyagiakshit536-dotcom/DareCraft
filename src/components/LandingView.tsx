import React from 'react';

interface LandingViewProps {
  onStart: () => void;
}

export function LandingView({ onStart }: LandingViewProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center pt-8 md:pt-16 pb-24">
      {/* Hero Text */}
      <div
        className="text-center space-y-6 max-w-4xl mx-auto px-4 animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both"
      >
        <h1 className="text-5xl md:text-[80px] font-bold tracking-tight leading-[1.1]">
          Turn any goal into a{' '}
          <span 
            className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 inline-block animate-[pulse_2s_ease-in-out_infinite] drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
          >
            viral
          </span>
          <br />
          30-day dare in 15 seconds
        </h1>
        <p className="text-xl text-zinc-400 font-medium animate-in fade-in duration-700 delay-300 fill-mode-both">
          A product by <a href="https://detha.pages.dev" target="_blank" rel="noopener noreferrer" className="text-white hover:text-cyan-400 font-semibold underline decoration-cyan-500/30 underline-offset-4 transition-colors">Detha</a>. No sign-up. No tracking. Just a link that never dies.
        </p>
      </div>

      {/* Cards Showcase */}
      <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-6 relative w-full max-w-5xl px-4">
        {/* Left Card */}
        <div 
          className="hidden md:flex flex-col items-center w-[300px] h-[400px] rounded-[2rem] border border-white/10 bg-[#0a0f1a] overflow-hidden relative transform origin-bottom-right -rotate-6 opacity-60 hover:opacity-100 hover:rotate-0 hover:scale-95 hover:z-30 transition-all duration-500 ease-out animate-in slide-in-from-left-12 fade-in duration-700 delay-200 fill-mode-both"
        >
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/cyberpunk/400/600')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0f1a] block"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center w-full">
            <span className="px-4 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs font-medium mb-6 text-zinc-300 backdrop-blur-md">Cottagecore</span>
            <h3 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-pink-300 to-purple-600 drop-shadow-[0_0_25px_rgba(236,72,153,0.8)] font-['Space_Grotesk']">100</h3>
            <p className="text-3xl font-black text-cyan-300 mt-2 font-['Space_Grotesk'] leading-tight drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">PUSH-UPS<br/>EVERY DAY</p>
          </div>
        </div>

        {/* Center Card */}
        <div 
          className="flex flex-col items-center w-[340px] h-[460px] rounded-[2rem] border border-cyan-500/30 bg-[#0a0f1a] overflow-hidden relative shadow-[0_0_80px_rgba(34,211,238,0.15)] z-20 hover:scale-[1.02] hover:-translate-y-2 transition-all duration-500 ease-out animate-in slide-in-from-bottom-12 fade-in duration-700 delay-400 fill-mode-both"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-[#0a0f1a] to-purple-900/40"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center w-full pb-20">
            <span className="px-4 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs font-medium mb-8 text-zinc-300 backdrop-blur-md">Cyberpunk</span>
            <h3 className="text-xl font-bold text-cyan-400 font-['Space_Grotesk'] tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] uppercase opacity-80">30 DAY DARE</h3>
            <h2 className="text-5xl leading-tight font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] font-['Space_Grotesk'] my-4">I will code for 2 hours</h2>
            <h3 className="text-2xl font-black text-pink-400 font-['Space_Grotesk'] tracking-widest drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">every single day</h3>
          </div>
          
          {/* Floating CTA Button */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30">
            <button
              onClick={onStart}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-lg shadow-[0_0_40px_rgba(34,211,238,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(34,211,238,0.8)] active:scale-95 btn-shine"
            >
              Create Your Dare
            </button>
          </div>
          
          {/* Sparkles/Particles effect around button - simulated with CSS */}
          <div 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full h-20 bg-cyan-400/20 blur-2xl rounded-full pointer-events-none animate-[pulse_3s_ease-in-out_infinite]"
          />
        </div>

        {/* Right Card */}
        <div 
          className="hidden md:flex flex-col items-center w-[300px] h-[400px] rounded-[2rem] border border-white/10 bg-[#0a0f1a] overflow-hidden relative transform origin-bottom-left rotate-6 opacity-60 hover:opacity-100 hover:rotate-0 hover:scale-95 hover:z-30 transition-all duration-500 ease-out animate-in slide-in-from-right-12 fade-in duration-700 delay-600 fill-mode-both"
        >
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/fitness/400/600')] bg-cover bg-center opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/50 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center justify-end h-full p-6 text-center w-full pb-16">
            <h3 className="text-5xl font-black text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] font-['Space_Grotesk']">LIKE A</h3>
            <h3 className="text-5xl font-black text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] font-['Space_Grotesk']">VIKING</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
