import React, { useState } from 'react';
import { UserProfile, GameItem } from '../../types';
import { X, User, Edit2, Check, Shield, Trophy, Gamepad2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  games: GameItem[];
}

const AVATAR_OPTIONS = ['⚡', '🚀', '🎯', '🃏', '🗡️', '💎', '👾', '🛰️', '🔥', '🛡️'];

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  games
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempTag, setTempTag] = useState<string>(profile.gamerTag);

  if (!isOpen) return null;

  const handleSaveTag = () => {
    soundEngine.playUiClick();
    if (tempTag.trim()) {
      onUpdateProfile({ gamerTag: tempTag.trim() });
    }
    setIsEditing(false);
  };

  const handleSelectAvatar = (av: string) => {
    soundEngine.playUiClick();
    onUpdateProfile({ avatar: av });
  };

  const xpProgress = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full flex flex-col justify-between overflow-y-auto p-6 shadow-2xl animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <span className="text-sm uppercase tracking-wider text-cyan-400 font-mono font-semibold">
              PILOT DOSSIER
            </span>
            <button
              onClick={() => {
                soundEngine.playUiClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Identity Card */}
          <div className="my-6 p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-cyan-950 border-2 border-cyan-500/50 flex items-center justify-center text-4xl mb-3 shadow-lg shadow-cyan-500/10">
              {profile.avatar}
            </div>

            {/* Editable Gamer Tag */}
            {isEditing ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={tempTag}
                  onChange={(e) => setTempTag(e.target.value)}
                  className="bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-sm font-mono text-white text-center focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveTag}
                  className="p-1 bg-cyan-500 text-slate-950 rounded hover:bg-cyan-400 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold font-mono text-white">{profile.gamerTag}</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-slate-500 hover:text-cyan-400 p-1 cursor-pointer"
                  title="Edit Call Sign"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <span className="text-xs font-mono text-cyan-400 mb-4">{profile.title}</span>

            {/* Level & XP Bar */}
            <div className="w-full space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 font-bold">LEVEL {profile.level}</span>
                <span className="text-cyan-300 tabular-nums">
                  {profile.xp} / {profile.xpToNextLevel} XP
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Change Avatar Grid */}
          <div className="mb-6">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono block mb-2">
              SELECT CALLSIGN EMBLEM
            </span>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  onClick={() => handleSelectAvatar(av)}
                  className={`h-11 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                    profile.avatar === av
                      ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Game Records Showcase */}
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono block mb-2">
              PERSONAL HIGH SCORES
            </span>
            <div className="space-y-2">
              {games.map((g) => {
                const s = profile.highScores[g.id] || 0;
                return (
                  <div
                    key={g.id}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{g.title}</span>
                      <span className="text-slate-500 font-mono">{g.genre}</span>
                    </div>
                    <span className="font-mono font-bold text-cyan-400 text-sm tabular-nums">
                      {s > 0 ? s.toLocaleString() : 'Unplayed'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
          VORTEX ARCHIVE · PILOT UID #9840
        </div>
      </div>
    </div>
  );
};
