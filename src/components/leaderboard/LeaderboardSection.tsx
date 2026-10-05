import React, { useState } from 'react';
import { LeaderboardEntry, GameId } from '../../types';
import { Trophy, Medal, Flame } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface LeaderboardSectionProps {
  entries: LeaderboardEntry[];
  userScore: Record<string, number>;
  userTag: string;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  entries,
  userScore,
  userTag
}) => {
  const [selectedGame, setSelectedGame] = useState<GameId>('void-runner');
  const [timeframe, setTimeframe] = useState<'today' | 'alltime'>('alltime');

  const filteredEntries = entries.filter(e => e.gameId === selectedGame);

  return (
    <section id="leaderboards" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold block mb-1">
            VERIFIED RANKINGS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white">
            GLOBAL HIGH SCORES
          </h2>
        </div>

        {/* Game Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedGame('void-runner');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedGame === 'void-runner' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Void Runner
          </button>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedGame('neon-deck');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedGame === 'neon-deck' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Neon Deck
          </button>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedGame('quantum-core');
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedGame === 'quantum-core' ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quantum Core
          </button>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 w-16 text-center">Rank</th>
                <th className="py-4 px-6">Player</th>
                <th className="py-4 px-6">Division Title</th>
                <th className="py-4 px-6 text-right">Score</th>
                <th className="py-4 px-6 text-right">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filteredEntries.map((entry) => {
                const isTop3 = entry.rank <= 3;
                return (
                  <tr
                    key={`${entry.gameId}-${entry.rank}`}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-6 text-center">
                      {entry.rank === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono text-xs inline-flex items-center justify-center">
                          1
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-300/20 text-slate-200 font-bold font-mono text-xs inline-flex items-center justify-center">
                          2
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 font-bold font-mono text-xs inline-flex items-center justify-center">
                          3
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-slate-500 tabular-nums">
                          #{entry.rank}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{entry.avatar}</span>
                        <span className="font-bold text-white font-mono">{entry.username}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {entry.badge}
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-cyan-400 tabular-nums text-base">
                      {entry.score.toLocaleString()}
                    </td>

                    <td className="py-4 px-6 text-right text-xs text-slate-500 font-mono">
                      {entry.timeAgo}
                    </td>
                  </tr>
                );
              })}

              {/* Your Personal Row */}
              <tr className="bg-cyan-950/20 border-t-2 border-cyan-800/40">
                <td className="py-4 px-6 text-center font-mono text-xs text-cyan-400 font-bold">
                  YOU
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">⚡</span>
                    <span className="font-bold text-cyan-300 font-mono">{userTag}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-xs text-cyan-400 font-mono">
                  Rising Vanguard
                </td>
                <td className="py-4 px-6 text-right font-mono font-bold text-amber-400 tabular-nums text-base">
                  {(userScore[selectedGame] || 0).toLocaleString()}
                </td>
                <td className="py-4 px-6 text-right text-xs text-cyan-400 font-mono">
                  Personal Record
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
