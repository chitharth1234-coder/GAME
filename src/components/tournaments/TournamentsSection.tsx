import React, { useState } from 'react';
import { Tournament } from '../../types';
import { Trophy, Users, Clock, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface TournamentsSectionProps {
  tournaments: Tournament[];
  onRegister: (tournamentId: string) => void;
  onPlayGame: (gameId: string) => void;
}

export const TournamentsSection: React.FC<TournamentsSectionProps> = ({
  tournaments,
  onRegister,
  onPlayGame
}) => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  return (
    <section id="tournaments" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold block mb-1">
          COMPETITIVE LADDERS
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white mb-2">
          SEASONAL ESPORTS TOURNAMENTS
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl">
          Compete in verified high-score brackets. Climb division qualifiers for guaranteed prize distributions.
        </p>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-lg"
          >
            <div>
              {/* Clean unboxed metadata */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-mono">
                <span className="text-cyan-400">{t.gameTitle}</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  {t.endsIn}
                </span>
              </div>

              <h3 className="text-xl font-bold font-display text-white mb-2 leading-snug">
                {t.title}
              </h3>

              <div className="my-5 p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Prize Pool</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">{t.prizePool}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Enrolled Players</span>
                  <span className="font-mono text-slate-300 tabular-nums">
                    {t.registeredCount} / {t.maxParticipants}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Entry Requirement</span>
                  <span className="font-mono text-emerald-400">{t.entryFee}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onRegister(t.id);
                }}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  t.isRegistered
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                {t.isRegistered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    REGISTERED FOR BRACKET
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4" />
                    REGISTER FREE ENTRY
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onPlayGame(t.gameId);
                }}
                className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Launch Qualifier Session
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
