import React, { useState } from 'react';
import { GameItem, Achievement } from '../../types';
import { VoidRunnerGame } from './VoidRunnerGame';
import { NeonDeckGame } from './NeonDeckGame';
import { QuantumCoreGame } from './QuantumCoreGame';
import { X, Trophy, Keyboard, Info, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface GameModalProps {
  game: GameItem | null;
  onClose: () => void;
  onGameScoreUpdate: (gameId: string, score: number) => void;
  achievements: Achievement[];
}

export const GameModal: React.FC<GameModalProps> = ({
  game,
  onClose,
  onGameScoreUpdate,
  achievements
}) => {
  const [activeTab, setActiveTab] = useState<'game' | 'controls' | 'achievements'>('game');

  if (!game) return null;

  const relevantAchievements = achievements.filter(
    a => a.gameId === game.id || a.gameId === 'global'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold font-display text-white">{game.title}</span>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="text-cyan-400">{game.genre}</span>
              <span aria-hidden="true">·</span>
              <span>{game.difficulty}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  setActiveTab('game');
                }}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'game' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Play
              </button>
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  setActiveTab('controls');
                }}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'controls' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Controls & Lore
              </button>
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  setActiveTab('achievements');
                }}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'achievements' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Trophies
              </button>
            </div>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onClose();
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close (Esc)"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'game' && (
            <div className="w-full flex justify-center">
              {game.id === 'void-runner' && (
                <VoidRunnerGame
                  onGameOver={(score) => onGameScoreUpdate(game.id, score)}
                  onScoreUpdate={(score) => onGameScoreUpdate(game.id, score)}
                  onClose={onClose}
                />
              )}
              {game.id === 'neon-deck' && (
                <NeonDeckGame
                  onGameOver={(score) => onGameScoreUpdate(game.id, score)}
                  onVictory={(score) => onGameScoreUpdate(game.id, score)}
                  onClose={onClose}
                />
              )}
              {game.id === 'quantum-core' && (
                <QuantumCoreGame
                  onGameOver={(score) => onGameScoreUpdate(game.id, score)}
                  onClose={onClose}
                />
              )}
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="max-w-2xl mx-auto py-6 space-y-6">
              <div>
                <h4 className="text-sm uppercase tracking-wider text-cyan-400 font-mono font-semibold mb-2">
                  MISSION BRIEFING & LORE
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {game.description}
                </p>
                <div className="space-y-2">
                  {game.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-cyan-400 font-bold">›</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <h4 className="text-sm uppercase tracking-wider text-cyan-400 font-mono font-semibold mb-4 flex items-center gap-2">
                  <Keyboard className="w-4 h-4" />
                  KEYBOARD & MOUSE CONTROLS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {game.controls.map((ctrl, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex justify-between items-center text-xs"
                    >
                      <span className="font-mono text-cyan-300 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {ctrl.key}
                      </span>
                      <span className="text-slate-300">{ctrl.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="max-w-2xl mx-auto py-6 space-y-4">
              <h4 className="text-sm uppercase tracking-wider text-cyan-400 font-mono font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                GAME REWARDS & UNLOCKS
              </h4>
              <div className="space-y-3">
                {relevantAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`bg-slate-900 border rounded-xl p-4 flex items-center justify-between ${
                      ach.unlocked ? 'border-amber-500/40 shadow-sm shadow-amber-500/10' : 'border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ach.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{ach.title}</span>
                          {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <p className="text-xs text-slate-400">{ach.description}</p>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                      +{ach.xpReward} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
