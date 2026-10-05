import React from 'react';
import { Quest, Achievement } from '../../types';
import { CheckCircle2, Trophy, Zap, Sparkles, Gift } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface QuestsSectionProps {
  quests: Quest[];
  achievements: Achievement[];
  onClaimQuest: (questId: string) => void;
}

export const QuestsSection: React.FC<QuestsSectionProps> = ({
  quests,
  achievements,
  onClaimQuest
}) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <section id="quests" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold block mb-1">
            PLAYER PROGRESSION
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white">
            DAILY BOUNTIES & ACHIEVEMENTS
          </h2>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>TROPHIES UNLOCKED: </span>
          <span className="text-cyan-400 font-bold tabular-nums">
            {unlockedCount} / {achievements.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Daily Quests */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 fill-current" />
              DAILY BOUNTY MISSIONS
            </h3>
            <span className="text-xs text-slate-500 font-mono">Resets in 14h 22m</span>
          </div>

          <div className="space-y-4">
            {quests.map((q) => {
              const progressPct = Math.min(100, (q.current / q.target) * 100);

              return (
                <div
                  key={q.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
                        <span>{q.gameTitle}</span>
                        <span aria-hidden="true">·</span>
                        <span>Daily Bounty</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{q.title}</h4>
                      <p className="text-xs text-slate-400">{q.requirement}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400 block tabular-nums">
                        +{q.rewardXp} XP
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Claim Button */}
                  <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>Progress</span>
                        <span className="tabular-nums">
                          {q.current} / {q.target}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {q.completed ? (
                      q.claimed ? (
                        <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                          CLAIMED
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            soundEngine.playVictory();
                            onClaimQuest(q.id);
                          }}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          CLAIM XP
                        </button>
                      )
                    ) : (
                      <span className="text-xs font-mono text-slate-500">IN PROGRESS</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Hall of Trophies */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 fill-current" />
              HALL OF TROPHIES
            </h3>
            <span className="text-xs text-cyan-400 font-mono">
              {Math.round((unlockedCount / achievements.length) * 100)}% Completed
            </span>
          </div>

          <div className="space-y-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  ach.unlocked
                    ? 'bg-slate-950/80 border-amber-500/30'
                    : 'bg-slate-950/40 border-slate-850 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      ach.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{ach.title}</span>
                      {ach.unlocked && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{ach.description}</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-amber-400 shrink-0 tabular-nums">
                  +{ach.xpReward} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
