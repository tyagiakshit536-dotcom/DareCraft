import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '../lib/themes';
import { DareCard } from './DareCard';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { Download, Link as LinkIcon, RefreshCw, Twitter, Instagram, Users, Video } from 'lucide-react';

interface ResultsViewProps {
  key?: string;
  goal: string;
  duration: number;
  theme: Theme;
  twist: string;
  shareUrl: string;
  onReset: () => void;
  customBgUrl?: string;
}

export function ResultsView({
  goal,
  duration,
  theme,
  twist,
  shareUrl,
  onReset,
  customBgUrl,
}: ResultsViewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const copyResetTimerRef = useRef<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  const waitForCardImages = async (container: HTMLElement) => {
    const images = Array.from(container.querySelectorAll('img'));
    if (!images.length) return;

    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
          const timeoutId = window.setTimeout(() => resolve(), 5000);
          if (typeof img.decode === 'function') {
            img
              .decode()
              .catch(() => undefined)
              .finally(() => {
                window.clearTimeout(timeoutId);
                resolve();
              });
            return;
          }

          img.onload = () => {
            window.clearTimeout(timeoutId);
            resolve();
          };
          img.onerror = () => {
            window.clearTimeout(timeoutId);
            resolve();
          };
        });
      })
    );
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      await waitForCardImages(cardRef.current);

      const rect = cardRef.current.getBoundingClientRect();
      const scale = 2;
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      try {
        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: scale,
          canvasWidth: width * scale,
          canvasHeight: height * scale,
          backgroundColor: '#000000',
          skipFonts: true,
        });

        const link = document.createElement('a');
        link.download = `darecraft-${theme.id}-${duration}days.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch {
        // Fall back to html2canvas if html-to-image fails on a specific browser/device.
      }

      const canvas = await html2canvas(cardRef.current, {
        scale,
        useCORS: true,
        logging: false,
        imageTimeout: 15000,
        width,
        height,
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.download = `darecraft-${theme.id}-${duration}days.png`;

      if (canvas.toBlob) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/png')
        );
        if (blob) {
          const objectUrl = URL.createObjectURL(blob);
          link.href = objectUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
          return;
        }
      }

      const dataUrl = canvas.toDataURL('image/png');
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to generate image', e);
      alert('Download failed on this browser. Please try one more time or refresh and retry.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const onCopied = () => {
      setCopied(true);
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
      copyResetTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyResetTimerRef.current = null;
      }, 2000);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(onCopied)
        .catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          textArea.setAttribute('readonly', '');
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.select();
          const copiedViaExec = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (copiedViaExec) {
            onCopied();
            return;
          }
          alert('Could not copy automatically. Please copy the link manually from your browser address bar.');
        });
      return;
    }

    alert('Clipboard access is not available in this browser. Please copy the link from the address bar.');
  };

  const handleShareToX = () => {
    const text = `I just dared myself to ${goal} for ${duration} days 🔥 Join me →`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&via=DareCraftMe`;
    window.open(twitterUrl, '_blank');
  };

  const handleChallengeFriend = () => {
    const friendName = prompt("Enter your friend's name to challenge:") || 'Friend';
    const text = `Hey ${friendName}, I dare you to join me! Are you brave enough for the ${duration}-day challenge? 🔥`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 py-12 animate-in fade-in zoom-in duration-500"
    >
      <div className="text-center space-y-4">
        <h2 
          className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-in slide-in-from-top-4 duration-500 delay-200 fill-mode-both"
        >
          Your Dare is Ready
        </h2>
        <p 
          className="text-zinc-400 text-lg animate-in slide-in-from-top-2 duration-500 delay-300 fill-mode-both"
        >
          Screenshot, download, or share the link.
        </p>
      </div>

      <div 
        className="w-full max-w-[500px] shadow-2xl shadow-indigo-500/20 rounded-3xl overflow-hidden relative group animate-in slide-in-from-bottom-8 duration-700 delay-400 fill-mode-both"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative">
          <DareCard
            ref={cardRef}
            goal={goal}
            duration={duration}
            theme={theme}
            twist={twist}
            customBgUrl={customBgUrl}
          />
        </div>
      </div>

      <div 
        className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-500 delay-600 fill-mode-both px-4"
      >
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full sm:flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-white text-black font-bold py-4 px-6 rounded-2xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 relative overflow-hidden group animate-pulse btn-shine btn-ripple"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <Download className="w-5 h-5 relative z-10" />
          <span className="relative z-10">{isDownloading ? 'Generating...' : 'Download PNG'}</span>
        </button>
        
        <button
          onClick={handleCopyLink}
          className="w-full sm:flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-zinc-800 text-white font-bold py-4 px-6 rounded-2xl hover:bg-zinc-700 transition-all hover:scale-105 active:scale-95 border border-zinc-700 relative overflow-hidden group btn-shine btn-ripple"
        >
          <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <LinkIcon className="w-5 h-5 relative z-10" />
          <span className="relative z-10">{copied ? 'Copied!' : 'Copy Magic Link'}</span>
        </button>

        <button
          onClick={handleChallengeFriend}
          className="w-full sm:flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-2xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 relative overflow-hidden group btn-shine btn-ripple"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          <Users className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Challenge a Friend</span>
        </button>
      </div>

      <div className="flex justify-center gap-4 mt-2 animate-in slide-in-from-bottom-2 duration-500 delay-700 fill-mode-both px-4">
        <button
          onClick={handleShareToX}
          className="flex items-center justify-center gap-2 bg-zinc-900 text-white font-bold py-3 px-6 rounded-2xl hover:bg-black transition-all hover:scale-105 border border-zinc-800 btn-shine btn-ripple"
        >
          <Twitter className="w-4 h-4" />
          Post to X
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-3 px-6 rounded-2xl hover:opacity-90 transition-all hover:scale-105 btn-shine btn-ripple"
        >
          <Instagram className="w-4 h-4" />
          Stories
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-[#00f2fe] text-black font-bold py-3 px-6 rounded-2xl hover:bg-[#00f2fe]/80 transition-all hover:scale-105 btn-shine btn-ripple"
        >
          <Video className="w-4 h-4" />
          TikTok
        </button>
      </div>

      <button
        onClick={onReset}
        className="mt-6 flex items-center gap-2 text-zinc-500 transition-all hover:text-white hover:scale-105 active:scale-95 animate-in fade-in duration-500 delay-700 fill-mode-both"
      >
        <RefreshCw className="w-4 h-4" />
        Create Another Dare
      </button>
    </div>
  );
}
