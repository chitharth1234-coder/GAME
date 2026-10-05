import React from 'react';
import { Play, Trophy, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';
import { HERO_BANNER_IMAGE } from '../../data/games';
import { soundEngine } from '../../utils/audio';

interface HeroSectionProps {
  onPlayFeaturedGame: () => void;
  onExploreGames: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onPlayFeaturedGame,
  onExploreGames
}) => {
  return (
    <div className="relative w-full overflow-hidden border-b border-slate-800 bg-slate-950">
      {/* Background Hero Image with measured scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BANNER_IMAGE}
          alt="Cinematic sci-fi gaming key art with futuristic starfighter and hyper-drive portal"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-45 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090D16] via-[#090D16]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 flex flex-col justify-end">
        {/* Subtle Editorial Kicker */}
        <div className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold mb-3">
          Season 4 Live Platform · Zero Installs Required
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight text-white max-w-3xl leading-[1.05] mb-5 text-balance">
          THE FRONTIER OF BROWSER GAMING
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
          High-performance real-time arcade action, tactical card roguelikes, and resonant lattice puzzles.
          Engineered natively with 60 FPS canvas physics, procedural Web Audio, and verified global leaderboards.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 mb-12">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onPlayFeaturedGame();
            }}
            className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wide rounded-lg shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all text-sm flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            PLAY VOID RUNNER NOW
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onExploreGames();
            }}
            className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-medium rounded-lg border border-slate-700/80 hover:border-slate-600 transition-all text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            EXPLORE CATALOG
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Adjacent Proof Metrics */}
        <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-xs text-slate-400 mb-1">CONCURRENT PLAYERS</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">48,250+</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">TOURNAMENT PRIZE POOL</div>
            <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums">$15,000 USDC</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">FRAME RATE PERFORMANCE</div>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">60 FPS Hardware</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">ASSET OVERHEAD</div>
            <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">Instant Web Load</div>
          </div>
        </div>
      </div>
    </div>
  );
};
