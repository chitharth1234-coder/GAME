import React from 'react';
import { Gamepad2, Shield, Heart } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="w-full bg-[#060910] border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="md:col-span-1">
            <span className="text-xl font-bold font-display text-white tracking-wider block mb-3">
              VORTEX
            </span>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Next-generation browser gaming platform. Native canvas physics, procedural synthesized audio, and competitive esports ladders.
            </p>
            <div className="text-xs font-mono text-slate-500">
              © 2026 Vortex Platform Inc.
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block mb-3">
              TITLES & ARENAS
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('games')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Cyber Strike: Void Runner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('games')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Neon Deck: Rogue Ascent
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('games')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Gridlock: Quantum Core
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block mb-3">
              COMPETITIVE HUB
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('tournaments')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Interstellar Circuit 2026
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('leaderboards')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Global Hall of Fame
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('quests')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Daily Bounties & Trophies
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block mb-3">
              SYSTEM ARCHITECTURE
            </span>
            <div className="space-y-1.5 text-xs text-slate-500 font-mono">
              <div>Runtime: 60 FPS HTML5 Canvas</div>
              <div>Audio Engine: Web Audio API Oscillator</div>
              <div>Persistence: Local Storage State</div>
              <div>Latency: 0ms Network Free Play</div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>Built for gamers with low-latency responsive architecture.</div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>Fair Play Certified</span>
            <span aria-hidden="true">·</span>
            <span>WCAG AA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
