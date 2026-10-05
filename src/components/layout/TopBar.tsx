import React from 'react';
import { Volume2, VolumeX, User, Gamepad2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { UserProfile } from '../../types';

interface TopBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  onOpenProfile,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            soundEngine.playUiClick();
            onSelectTab('games');
          }}
          className="text-2xl font-bold font-display tracking-wider text-white hover:text-cyan-400 transition-colors shrink-0"
        >
          VORTEX
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onSelectTab('games');
            }}
            className={`transition-colors hover:text-white pb-1 relative cursor-pointer ${
              activeTab === 'games' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            Games
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onSelectTab('tournaments');
            }}
            className={`transition-colors hover:text-white pb-1 relative cursor-pointer ${
              activeTab === 'tournaments' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            Tournaments
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onSelectTab('leaderboards');
            }}
            className={`transition-colors hover:text-white pb-1 relative cursor-pointer ${
              activeTab === 'leaderboards' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            Leaderboards
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onSelectTab('quests');
            }}
            className={`transition-colors hover:text-white pb-1 relative cursor-pointer ${
              activeTab === 'quests' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            Quests & XP
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onSelectTab('news');
            }}
            className={`transition-colors hover:text-white pb-1 relative cursor-pointer ${
              activeTab === 'news' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            News & Patches
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Mute Game Audio' : 'Unmute Game Audio'}
            aria-label="Toggle Audio"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onOpenProfile();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-xs font-bold text-cyan-400 font-mono">
              {userProfile.avatar}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-200 block leading-tight font-mono">
                {userProfile.gamerTag}
              </span>
              <span className="text-[11px] text-cyan-400 font-mono tabular-nums leading-tight">
                LVL {userProfile.level} · {userProfile.xp} XP
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
